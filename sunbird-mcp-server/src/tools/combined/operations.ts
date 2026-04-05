/**
 * Domain operations that combine dcTrack + Power IQ data.
 *
 * Pure business logic lives here, decoupled from MCP tool plumbing.
 */

import { z } from 'zod';
import { dctrackClient, poweriqClient } from '../../lib/clients/index.js';
import * as schemas from './schemas.js';

// ---------------------------------------------------------------------------
// Rack Summary
// ---------------------------------------------------------------------------

export async function getRackSummary(args: { cabinetId?: number; cabinetName?: string }) {
  let cabinet: any;
  let cabinetId: number | undefined;

  if (args.cabinetId) {
    cabinet = await dctrackClient.getCabinet(args.cabinetId);
    cabinetId = args.cabinetId;
  } else if (args.cabinetName) {
    const cabinets = await dctrackClient.listCabinets({});
    cabinet = cabinets.find((c: any) => (c.tiName ?? c.name ?? '').toLowerCase() === args.cabinetName!.toLowerCase());
    if (cabinet) cabinetId = Number(cabinet.id);
  }

  if (!cabinet || !cabinetId) throw new Error('Cabinet not found');

  const [items, capacity] = await Promise.all([
    dctrackClient.getCabinetItems(cabinetId),
    dctrackClient.getCabinetCapacity(cabinetId),
  ]);

  const pdus = await poweriqClient.listPDUs({ cabinetId });
  const pduReadings = await Promise.all(
    pdus.map(async (pdu) => ({
      pdu,
      readings: await poweriqClient.getPDUReadings(pdu.id),
    })),
  );

  const sensorReadings = await poweriqClient.getCabinetSensorReadings(cabinetId);

  const totalPowerKw = pduReadings.reduce(
    (sum, pr) => sum + ((pr.readings?.activePower ?? 0) / 1000),
    0,
  );

  const avgTemp =
    sensorReadings.temperature.length > 0
      ? sensorReadings.temperature.reduce((s, r) => s + r.value, 0) /
        sensorReadings.temperature.length
      : null;

  return {
    cabinet: { id: cabinetId, name: cabinet.tiName ?? cabinet.name, location: cabinet.cmbLocation ?? cabinet.locationName, ruHeight: cabinet.tiRUs ?? cabinet.ruHeight },
    capacity: {
      space: {
        total: capacity?.totalRu ?? cabinet.ruHeight,
        used: capacity?.usedRu ?? cabinet.usedRuCount ?? 0,
        available: capacity?.availableRu ?? (cabinet.ruHeight - (cabinet.usedRuCount ?? 0)),
        utilizationPercent: capacity?.spaceUtilizationPercent ?? ((cabinet.usedRuCount ?? 0) / cabinet.ruHeight) * 100,
      },
      power: {
        ratedKw: capacity?.ratedPowerKw ?? cabinet.ratedPowerKw,
        currentKw: totalPowerKw,
        availableKw: (capacity?.ratedPowerKw ?? cabinet.ratedPowerKw ?? 0) - totalPowerKw,
        utilizationPercent: capacity?.ratedPowerKw ? (totalPowerKw / capacity.ratedPowerKw) * 100 : null,
      },
    },
    items: items.map((i) => ({
      id: i.id, name: i.tiName, class: i.tiClass,
      uPosition: i.tiUPosition, ruHeight: i.tiRuHeight, status: i.cmbStatus,
    })),
    power: {
      pdus: pduReadings.map((pr) => ({
        id: pr.pdu.id, name: pr.pdu.name,
        activePowerW: pr.readings?.activePower, voltage: pr.readings?.voltage,
        current: pr.readings?.current, powerFactor: pr.readings?.powerFactor,
      })),
      totalKw: totalPowerKw,
    },
    thermal: {
      averageTemperature: avgTemp,
      temperatureSensors: sensorReadings.temperature,
      humiditySensors: sensorReadings.humidity,
    },
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Find Capacity
// ---------------------------------------------------------------------------

export async function findCapacity(params: z.infer<typeof schemas.findCapacitySchema>) {
  const cabinets = await dctrackClient.listCabinets({ locationId: params.locationId });
  const available: any[] = [];

  for (const cab of cabinets) {
    const cabId = Number((cab as any).id);
    const cap = await dctrackClient.getCabinetCapacity(cabId);
    if (!cap) continue;

    const ruHeight = Number((cab as any).tiRUs ?? (cab as any).ruHeight ?? 42);
    const availU = cap.availableRu ?? ruHeight - (cap.usedRu ?? 0);
    const availPwr = cap.availablePowerKw ?? (cap.ratedPowerKw ?? 0) - (cap.actualPowerKw ?? 0);

    if (availU >= params.requiredU && availPwr >= params.requiredPowerKw) {
      const uFit = 1 - Math.abs(availU - params.requiredU) / Math.max(availU, params.requiredU);
      const pFit = params.requiredPowerKw > 0 ? 1 - Math.abs(availPwr - params.requiredPowerKw) / Math.max(availPwr, params.requiredPowerKw) : 1;

      available.push({
        cabinetId: cabId, cabinetName: (cab as any).tiName ?? (cab as any).name, location: (cab as any).cmbLocation ?? (cab as any).locationName,
        availableU: availU, availablePowerKw: availPwr,
        spaceUtilization: cap.spaceUtilizationPercent,
        powerUtilization: cap.powerUtilizationPercent,
        fitScore: ((uFit + pFit) / 2) * 100,
      });
    }
  }

  available.sort((a, b) => b.fitScore - a.fitScore);

  return {
    requirements: { requiredU: params.requiredU, requiredPowerKw: params.requiredPowerKw, contiguous: params.contiguous },
    matchingCabinets: available.slice(0, 10),
    totalMatches: available.length,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Health Status
// ---------------------------------------------------------------------------

export async function getHealthStatus(params: z.infer<typeof schemas.getHealthStatusSchema>) {
  const results: any = { timestamp: new Date().toISOString() };

  const locations = await dctrackClient.listLocations({
    parentId: params.locationId,
    type: params.locationId ? undefined : 'Site',
  });
  results.locations = locations.length;

  const cabinets = await dctrackClient.listCabinets({ locationId: params.locationId });
  results.cabinets = { total: cabinets.length };

  const items = await dctrackClient.searchItems({ locationId: params.locationId, status: 'Installed' });
  results.items = { installed: items.length };

  if (params.includeAlerts) {
    const alerts = await poweriqClient.listAlerts({});
    results.alerts = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
    };
  }

  if (params.includePUE) {
    const pue = await poweriqClient.getPUE({ datacenterId: params.locationId });
    if (pue.length > 0) {
      const first = pue[0]!;
      results.pue = { current: first.pue, itPowerKw: first.itPowerKw, facilityPowerKw: first.facilityPowerKw };
    }
  }

  const alertPenalty = results.alerts ? results.alerts.critical * 20 + results.alerts.warning * 5 : 0;
  const puePenalty = results.pue ? Math.max(0, (results.pue.current - 1.4) * 50) : 0;
  results.healthScore = Math.max(0, 100 - alertPenalty - puePenalty);
  results.status = results.healthScore >= 80 ? 'healthy' : results.healthScore >= 60 ? 'warning' : 'critical';

  return results;
}

// ---------------------------------------------------------------------------
// Ghost Server Detection
// ---------------------------------------------------------------------------

export async function identifyGhostServers(params: z.infer<typeof schemas.identifyGhostServersSchema>) {
  const items = await dctrackClient.searchItems({ locationId: params.locationId, class: 'Device', status: 'Installed' });
  const itDevices = await poweriqClient.listITDevices({});

  const ghosts: any[] = [];

  for (const item of items) {
    const pd = itDevices.find(
      (d) => d.name.toLowerCase() === item.tiName.toLowerCase() || d.cabinetName === item.cmbCabinet,
    );
    const watts = pd?.currentPowerWatts ?? 0;

    if (watts < params.powerThresholdWatts) {
      ghosts.push({
        itemId: item.id, name: item.tiName, serialNumber: item.tiSerialNumber,
        location: item.cmbLocation, cabinet: item.cmbCabinet,
        currentPowerWatts: watts,
        status: watts === 0 ? 'no_power_data' : 'minimal_power',
        recommendation: 'Verify device status and consider decommissioning if not in use',
      });
    }
  }

  return {
    threshold: params.powerThresholdWatts,
    totalDevicesChecked: items.length,
    ghostServersFound: ghosts.length,
    estimatedWastedPowerKw: ghosts.reduce((s, g) => s + g.currentPowerWatts, 0) / 1000,
    ghostServers: ghosts,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Power Chain
// ---------------------------------------------------------------------------

export async function getPowerChain(params: z.infer<typeof schemas.getPowerChainSchema>) {
  const item = await dctrackClient.getItem(params.itemId);
  if (!item) throw new Error('Item not found');

  const connections = await dctrackClient.listConnections({ itemId: params.itemId });
  const powerConns = connections.filter((c) => c.connectionType?.toLowerCase().includes('power'));

  return {
    device: { id: item.id, name: item.tiName, location: item.cmbLocation, cabinet: item.cmbCabinet },
    connections: powerConns.map((c) => ({
      connectionId: c.id, sourceItem: c.sourceItemName, sourcePort: c.sourcePortName,
      destItem: c.destItemName, destPort: c.destPortName,
    })),
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Thermal Analysis
// ---------------------------------------------------------------------------

const ASHRAE_MIN = 18;
const ASHRAE_MAX = 27;
const ASHRAE_ALLOWABLE_MAX = 32;

export async function thermalAnalysis(params: z.infer<typeof schemas.thermalAnalysisSchema>) {
  const sensors = await poweriqClient.listSensors({ sensorType: 'temperature', cabinetId: params.cabinetId });
  const sensorReadings = await Promise.all(
    sensors.map(async (s) => ({ sensor: s, reading: await poweriqClient.getSensorReadings(s.id) })),
  );

  const readings = sensorReadings
    .filter((sr) => sr.reading)
    .map((sr) => ({
      sensorId: sr.sensor.id, sensorName: sr.sensor.name,
      location: sr.sensor.cabinetName ?? 'Unknown', position: sr.sensor.position,
      temperature: sr.reading!.value,
      status: sr.reading!.value <= ASHRAE_MAX ? 'normal' : sr.reading!.value <= ASHRAE_ALLOWABLE_MAX ? 'warning' : 'critical',
      ashraeCompliant: sr.reading!.value >= ASHRAE_MIN && sr.reading!.value <= ASHRAE_MAX,
    }));

  const temps = readings.map((r) => r.temperature);
  const avg = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const hotspots = readings.filter((r) => r.status !== 'normal').sort((a, b) => b.temperature - a.temperature);

  const result: any = {
    summary: {
      totalSensors: readings.length, averageTemperature: avg,
      maxTemperature: temps.length ? Math.max(...temps) : null,
      minTemperature: temps.length ? Math.min(...temps) : null,
      hotspotCount: hotspots.length,
      ashraeCompliantPercent: readings.length ? (readings.filter((r) => r.ashraeCompliant).length / readings.length) * 100 : null,
    },
    hotspots, readings, timestamp: new Date().toISOString(),
  };

  if (params.includeRecommendations && hotspots.length > 0) {
    const recs: string[] = [];
    if (hotspots.some((h) => h.status === 'critical')) {
      recs.push('CRITICAL: Immediate cooling intervention required');
      recs.push('Consider deploying portable spot coolers');
    }
    if (hotspots.length > 3) recs.push('Multiple hotspots detected - review CRAC/CRAH capacity');
    if (avg && avg > 24) recs.push('Average temperature elevated - consider lowering supply air temperature');
    recs.push('Verify blanking panels are installed in all empty U positions');
    recs.push('Check for airflow obstructions in hot/cold aisle containment');
    result.recommendations = recs;
  }

  return result;
}
