/**
 * Power IQ REST API client.
 *
 * Encapsulates every Power IQ v2 API call used by the MCP tools.
 * Real-time readings bypass the cache (useCache = false).
 */

import { BaseClient } from './base-client.js';
import { logger } from '../logger.js';
import type {
  PowerIQDataCenter, PowerIQPDU, PowerIQPDUReading, PowerIQOutletReading,
  PowerIQSensor, PowerIQSensorReading, PowerIQPUE, PowerIQAlert, PowerIQITDevice,
  PowerIQFloor, PowerIQRoom, PowerIQRack, PowerIQDevice, PowerIQInlet,
  PowerIQCircuit, PowerIQEvent, PowerIQJob, PowerIQReading, PowerIQSystemInfo,
  PowerIQAssetStrip, PowerIQRackUnit, PowerIQBladeSlot,
  PowerIQTagGroup, PowerIQTag, PowerIQTagEntry, PowerIQTransferSwitch,
  PowerIQOutlet, PowerIQPanel,
} from '../../types/index.js';

export class PowerIQClient extends BaseClient {
  constructor() {
    super('poweriq', '/api/v2');
  }

  // =======================================================================
  // DATA CENTERS
  // =======================================================================

  async listDataCenters(): Promise<PowerIQDataCenter[]> {
    const res = await this.get<any>('/data_centers');
    return res.data_centers ?? res.data ?? [];
  }

  // =======================================================================
  // PDUs
  // =======================================================================

  async listPDUs(params?: {
    datacenterId?: number;
    cabinetId?: number;
    pageSize?: number;
  }): Promise<PowerIQPDU[]> {
    const res = await this.get<any>('/pdus', params as any);
    return res.pdus ?? res.data ?? [];
  }

  async getPDU(pduId: number): Promise<PowerIQPDU | null> {
    const res = await this.get<any>(`/pdus/${pduId}`);
    return res.pdu ?? res;
  }

  async getPDUReadings(pduId: number): Promise<PowerIQPDUReading | null> {
    const res = await this.get<any>(`/readings/pdus/${pduId}`, {}, false);
    return res.pdu_reading ?? res.reading ?? res;
  }

  async getOutletReadings(pduId: number): Promise<PowerIQOutletReading[]> {
    const res = await this.get<any>(`/pdus/${pduId}/outlets/readings`, {}, false);
    return res.outlet_readings ?? res.readings ?? [];
  }

  // =======================================================================
  // SENSORS
  // =======================================================================

  async listSensors(params?: {
    sensorType?: string;
    cabinetId?: number;
    pageSize?: number;
  }): Promise<PowerIQSensor[]> {
    const res = await this.get<any>('/sensors', params as any);
    return res.sensors ?? res.data ?? [];
  }

  async getSensorReadings(sensorId: number): Promise<PowerIQSensorReading | null> {
    const res = await this.get<any>(`/sensors/${sensorId}/readings`, {}, false);
    return res.sensor_reading ?? res.reading ?? res;
  }

  /** Convenience: get temperature + humidity readings for a single cabinet. */
  async getCabinetSensorReadings(cabinetId: number): Promise<{
    temperature: PowerIQSensorReading[];
    humidity: PowerIQSensorReading[];
  }> {
    const sensors = await this.listSensors({ cabinetId });
    const temperature: PowerIQSensorReading[] = [];
    const humidity: PowerIQSensorReading[] = [];

    for (const sensor of sensors) {
      const reading = await this.getSensorReadings(sensor.id);
      if (!reading) continue;
      if (sensor.sensorType === 'temperature') temperature.push(reading);
      else if (sensor.sensorType === 'humidity') humidity.push(reading);
    }

    return { temperature, humidity };
  }

  // =======================================================================
  // PUE
  // =======================================================================

  async getPUE(params?: {
    datacenterId?: number;
    startTime?: string;
    endTime?: string;
    resolution?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  }): Promise<PowerIQPUE[]> {
    const res = await this.get<any>('/pue', params as any, false);

    if (res.pue !== undefined) {
      return [
        {
          pue: res.pue,
          itPowerKw: res.it_power_kw ?? res.itPowerKw ?? 0,
          facilityPowerKw: res.facility_power_kw ?? res.facilityPowerKw ?? 0,
          readingTime: res.reading_time ?? new Date().toISOString(),
        },
      ];
    }
    return res.pue_readings ?? res.data ?? [];
  }

  // =======================================================================
  // ALERTS
  // =======================================================================

  async listAlerts(params?: {
    severity?: string;
    type?: string;
    acknowledged?: boolean;
    limit?: number;
  }): Promise<PowerIQAlert[]> {
    const res = await this.get<any>(
      '/alerts',
      { ...params, limit: params?.limit ?? 100 } as any,
      false,
    );
    return res.alerts ?? res.data ?? [];
  }

  // =======================================================================
  // IT DEVICES
  // =======================================================================

  async listITDevices(params?: {
    cabinetId?: number;
    pageSize?: number;
  }): Promise<PowerIQITDevice[]> {
    const res = await this.get<any>('/it_devices', params as any);
    return res.it_devices ?? res.data ?? [];
  }

  // =======================================================================
  // DATA CENTER CRUD
  // =======================================================================

  async getDataCenter(id: number): Promise<PowerIQDataCenter | null> {
    const res = await this.get<any>(`/data_centers/${id}`);
    return res.data_center ?? res;
  }

  async createDataCenter(dc: Record<string, any>): Promise<PowerIQDataCenter> {
    const res = await this.post<any>('/data_centers', { data_center: dc });
    logger.info({ name: dc.name }, 'Data center created');
    return res.data_center ?? res;
  }

  async updateDataCenter(id: number, updates: Record<string, any>): Promise<PowerIQDataCenter> {
    const res = await this.put<any>(`/data_centers/${id}`, { data_center: updates });
    logger.info({ id }, 'Data center updated');
    return res.data_center ?? res;
  }

  async deleteDataCenter(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/data_centers/${id}`);
    logger.info({ id }, 'Data center deleted');
    return { success: true, message: `Data center ${id} deleted` };
  }

  // =======================================================================
  // HIERARCHY NAVIGATION
  // =======================================================================

  async listFloors(params?: Record<string, any>): Promise<PowerIQFloor[]> {
    const res = await this.get<any>('/floors', params);
    return res.floors ?? [];
  }

  async listRooms(params?: Record<string, any>): Promise<PowerIQRoom[]> {
    const res = await this.get<any>('/rooms', params);
    return res.rooms ?? [];
  }

  async listRacks(params?: Record<string, any>): Promise<PowerIQRack[]> {
    const res = await this.get<any>('/racks', params);
    return res.racks ?? [];
  }

  async getRack(id: number): Promise<PowerIQRack | null> {
    const res = await this.get<any>(`/racks/${id}`);
    return res.rack ?? res;
  }

  async getChildren(resourceType: string, id: number): Promise<any[]> {
    const res = await this.get<any>(`/${resourceType}/${id}/children`);
    return res.children ?? res[resourceType] ?? [];
  }

  async getDescendants(resourceType: string, id: number, types?: string[]): Promise<any[]> {
    const params: Record<string, any> = {};
    if (types) params['types[]'] = types;
    const res = await this.get<any>(`/${resourceType}/${id}/descendants`, params);
    return res.descendants ?? [];
  }

  async moveResource(resourceType: string, id: number, targetType: string, targetId: number): Promise<any> {
    const res = await this.put<any>(`/${resourceType}/${id}/move_to`, { [targetType]: { id: targetId } });
    logger.info({ resourceType, id, targetType, targetId }, 'Resource moved');
    return res;
  }

  async getExecutiveSummary(resourceType: string, id: number): Promise<any> {
    const res = await this.get<any>(`/${resourceType}/${id}/executive_summary`, undefined, false);
    return res;
  }

  async getLatestReading(resourceType: string, id: number, type?: string): Promise<any> {
    const params: Record<string, any> = {};
    if (type) params.type = type;
    const res = await this.get<any>(`/${resourceType}/${id}/latest_reading`, params, false);
    return res;
  }

  // =======================================================================
  // PDU WRITE OPERATIONS
  // =======================================================================

  async createPDU(pdu: Record<string, any>): Promise<PowerIQPDU> {
    const res = await this.post<any>('/pdus', { pdu });
    logger.info({ ip: pdu.ip_address }, 'PDU created');
    return res.pdu ?? res;
  }

  async updatePDU(id: number, updates: Record<string, any>): Promise<PowerIQPDU> {
    const res = await this.put<any>(`/pdus/${id}`, { pdu: updates });
    logger.info({ id }, 'PDU updated');
    return res.pdu ?? res;
  }

  async deletePDU(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/pdus/${id}`);
    logger.info({ id }, 'PDU deleted');
    return { success: true, message: `PDU ${id} deleted` };
  }

  async rescanPDU(id: number): Promise<any> {
    const res = await this.put<any>(`/pdus/${id}/rescan`, {});
    logger.info({ id }, 'PDU rescan triggered');
    return res;
  }

  async batchCreatePDUs(pdus: Record<string, any>[]): Promise<any> {
    const res = await this.post<any>('/pdus/create_batch', { pdus });
    logger.info({ count: pdus.length }, 'Batch PDU creation submitted');
    return res;
  }

  async batchDeletePDUs(pduIds: number[]): Promise<any> {
    const res = await this.del<any>('/pdus/destroy_batch');
    // Need to pass body with delete - use post with method override or http directly
    const { data } = await this.http.delete('/pdus/destroy_batch', { data: { pdus: pduIds } });
    logger.info({ count: pduIds.length }, 'Batch PDU deletion submitted');
    return data;
  }

  // =======================================================================
  // INLETS
  // =======================================================================

  async listInlets(params?: Record<string, any>): Promise<PowerIQInlet[]> {
    const res = await this.get<any>('/inlets', params);
    return res.inlets ?? [];
  }

  async getInlet(id: number): Promise<PowerIQInlet | null> {
    const res = await this.get<any>(`/inlets/${id}`);
    return res.inlet ?? res;
  }

  async getInletReadings(inletId: number): Promise<PowerIQReading[]> {
    const res = await this.get<any>(`/inlets/${inletId}/readings`, undefined, false);
    return res.readings ?? [];
  }

  // =======================================================================
  // CIRCUITS
  // =======================================================================

  async listCircuits(params?: Record<string, any>): Promise<PowerIQCircuit[]> {
    const res = await this.get<any>('/circuits', params);
    return res.circuits ?? [];
  }

  async getCircuitReadings(circuitId: number): Promise<PowerIQReading[]> {
    const res = await this.get<any>(`/circuits/${circuitId}/readings`, undefined, false);
    return res.readings ?? [];
  }

  // =======================================================================
  // READINGS (Generic)
  // =======================================================================

  async getResourceReadings(resourceType: string, id: number): Promise<PowerIQReading[]> {
    const res = await this.get<any>(`/${resourceType}/${id}/readings`, undefined, false);
    return res.readings ?? [];
  }

  async getReadingsRollup(resourceType: string, id: number, interval: string): Promise<PowerIQReading[]> {
    const res = await this.get<any>(`/${resourceType}/${id}/readings_rollups/${interval}`, undefined, false);
    return res.readings_rollups ?? res.readings ?? [];
  }

  async getRackReadings(rackId: number): Promise<PowerIQReading[]> {
    const res = await this.get<any>(`/racks/${rackId}/readings`, undefined, false);
    return res.readings ?? [];
  }

  // =======================================================================
  // EVENTS
  // =======================================================================

  async listEvents(params?: Record<string, any>): Promise<PowerIQEvent[]> {
    const res = await this.get<any>('/events', params, false);
    return res.events ?? [];
  }

  async getEvent(id: number): Promise<PowerIQEvent | null> {
    const res = await this.get<any>(`/events/${id}`);
    return res.event ?? res;
  }

  async clearEvent(id: number): Promise<any> {
    const res = await this.put<any>(`/events/${id}/clear`, {});
    logger.info({ id }, 'Event cleared');
    return res;
  }

  async clearEventsBatch(eventIds: number[]): Promise<any> {
    const res = await this.put<any>('/events/clear_batch', { events: eventIds });
    logger.info({ count: eventIds.length }, 'Events batch cleared');
    return res;
  }

  // =======================================================================
  // POWER CONTROL
  // =======================================================================

  async powerControlOutlets(outletIds: number[], state: string): Promise<any> {
    const res = await this.post<any>('/outlets/power_control', { state, outlets: outletIds });
    logger.info({ state, count: outletIds.length }, 'Outlet power control executed');
    return res;
  }

  async powerControlDevice(deviceId: number, state: string): Promise<any> {
    const res = await this.post<any>(`/devices/${deviceId}/power_control`, { state });
    logger.info({ deviceId, state }, 'Device power control executed');
    return res;
  }

  async powerControlRack(rackId: number, state: string): Promise<any> {
    const res = await this.post<any>(`/racks/${rackId}/power_control`, { state });
    logger.info({ rackId, state }, 'Rack power control executed');
    return res;
  }

  async powerControlRoom(roomId: number, state: string): Promise<any> {
    const res = await this.post<any>(`/rooms/${roomId}/power_control`, { state });
    logger.info({ roomId, state }, 'Room power control executed');
    return res;
  }

  // =======================================================================
  // SYSTEM
  // =======================================================================

  async getSystemInfo(): Promise<PowerIQSystemInfo> {
    const res = await this.get<any>('/system_info');
    return res;
  }

  async listJobs(jobId?: number): Promise<PowerIQJob | PowerIQJob[]> {
    if (jobId) {
      const res = await this.get<any>(`/jobs/${jobId}`);
      return res.job ?? res;
    }
    const res = await this.get<any>('/jobs');
    return res.jobs ?? [];
  }

  // =======================================================================
  // OUTLETS WRITE
  // =======================================================================

  async updateOutlet(id: number, updates: Record<string, any>): Promise<any> {
    const res = await this.put<any>(`/outlets/${id}`, { outlet: updates });
    logger.info({ id }, 'Outlet updated');
    return res.outlet ?? res;
  }

  async renameOutletsBatch(outlets: Array<{ id: number; name: string }>): Promise<any> {
    const res = await this.put<any>('/outlets/rename_batch', { outlets });
    logger.info({ count: outlets.length }, 'Outlets batch renamed');
    return res;
  }

  // =======================================================================
  // ASSET STRIPS
  // =======================================================================

  async listAssetStrips(params?: Record<string, any>): Promise<PowerIQAssetStrip[]> {
    const res = await this.get<any>('/asset_strips', params);
    return res.asset_strips ?? [];
  }

  async getAssetStrip(id: number): Promise<PowerIQAssetStrip | null> {
    const res = await this.get<any>(`/asset_strips/${id}`);
    return res.asset_strip ?? res;
  }

  async updateAssetStrip(id: number, updates: Record<string, any>): Promise<any> {
    const res = await this.put<any>(`/asset_strips/${id}`, { asset_strip: updates });
    logger.info({ id }, 'Asset strip updated');
    return res.asset_strip ?? res;
  }

  async getAssetStripRackUnits(assetStripId: number): Promise<PowerIQRackUnit[]> {
    const res = await this.get<any>(`/asset_strips/${assetStripId}/rack_units`);
    return res.rack_units ?? [];
  }

  // =======================================================================
  // RACK UNITS
  // =======================================================================

  async listRackUnits(params?: Record<string, any>): Promise<PowerIQRackUnit[]> {
    const res = await this.get<any>('/rack_units', params);
    return res.rack_units ?? [];
  }

  async getRackUnit(id: number): Promise<PowerIQRackUnit | null> {
    const res = await this.get<any>(`/rack_units/${id}`);
    return res.rack_unit ?? res;
  }

  async updateRackUnit(id: number, updates: Record<string, any>): Promise<any> {
    const res = await this.put<any>(`/rack_units/${id}`, { rack_unit: updates });
    logger.info({ id }, 'Rack unit updated');
    return res.rack_unit ?? res;
  }

  async getRackUnitBladeSlots(rackUnitId: number): Promise<PowerIQBladeSlot[]> {
    const res = await this.get<any>(`/rack_units/${rackUnitId}/blade_slots`);
    return res.blade_slots ?? [];
  }

  // =======================================================================
  // BLADE SLOTS
  // =======================================================================

  async listBladeSlots(params?: Record<string, any>): Promise<PowerIQBladeSlot[]> {
    const res = await this.get<any>('/blade_slots', params);
    return res.blade_slots ?? [];
  }

  async getBladeSlot(id: number): Promise<PowerIQBladeSlot | null> {
    const res = await this.get<any>(`/blade_slots/${id}`);
    return res.blade_slot ?? res;
  }

  // =======================================================================
  // TAG GROUPS
  // =======================================================================

  async listTagGroups(): Promise<PowerIQTagGroup[]> {
    const res = await this.get<any>('/tag_groups');
    return res.tag_groups ?? [];
  }

  async getTagGroup(id: number): Promise<PowerIQTagGroup | null> {
    const res = await this.get<any>(`/tag_groups/${id}`);
    return res.tag_group ?? res;
  }

  async createTagGroup(tagGroup: Record<string, any>): Promise<PowerIQTagGroup> {
    const res = await this.post<any>('/tag_groups', { tag_group: tagGroup });
    logger.info({ name: tagGroup.name }, 'Tag group created');
    return res.tag_group ?? res;
  }

  async updateTagGroup(id: number, updates: Record<string, any>): Promise<PowerIQTagGroup> {
    const res = await this.put<any>(`/tag_groups/${id}`, { tag_group: updates });
    logger.info({ id }, 'Tag group updated');
    return res.tag_group ?? res;
  }

  async deleteTagGroup(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/tag_groups/${id}`);
    logger.info({ id }, 'Tag group deleted');
    return { success: true, message: `Tag group ${id} deleted` };
  }

  // =======================================================================
  // TAGS
  // =======================================================================

  async listTags(): Promise<PowerIQTag[]> {
    const res = await this.get<any>('/tags');
    return res.tags ?? [];
  }

  async getTag(id: number): Promise<PowerIQTag | null> {
    const res = await this.get<any>(`/tags/${id}`);
    return res.tag ?? res;
  }

  async createTag(tagGroupId: number, tag: Record<string, any>): Promise<PowerIQTag> {
    const res = await this.post<any>(`/tag_groups/${tagGroupId}/tags`, { tag });
    logger.info({ name: tag.name }, 'Tag created');
    return res.tag ?? res;
  }

  async updateTag(id: number, updates: Record<string, any>): Promise<PowerIQTag> {
    const res = await this.put<any>(`/tags/${id}`, { tag: updates });
    logger.info({ id }, 'Tag updated');
    return res.tag ?? res;
  }

  async deleteTag(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/tags/${id}`);
    logger.info({ id }, 'Tag deleted');
    return { success: true, message: `Tag ${id} deleted` };
  }

  async createTagEntry(tagId: number, entry: Record<string, any>): Promise<PowerIQTagEntry> {
    const res = await this.post<any>(`/tags/${tagId}/tag_entries`, { tag_entry: entry });
    logger.info({ tagId }, 'Tag entry created');
    return res.tag_entry ?? res;
  }

  async deleteTagEntry(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/tag_entries/${id}`);
    logger.info({ id }, 'Tag entry deleted');
    return { success: true, message: `Tag entry ${id} deleted` };
  }

  // =======================================================================
  // TRANSFER SWITCHES
  // =======================================================================

  async listTransferSwitches(params?: Record<string, any>): Promise<PowerIQTransferSwitch[]> {
    const res = await this.get<any>('/transfer_switches', params);
    return res.transfer_switches ?? [];
  }

  async getTransferSwitch(id: number): Promise<PowerIQTransferSwitch | null> {
    const res = await this.get<any>(`/transfer_switches/${id}`);
    return res.transfer_switch ?? res;
  }

  async getTransferSwitchStates(id: number): Promise<any[]> {
    const res = await this.get<any>(`/transfer_switches/${id}/transfer_switch_states`);
    return res.transfer_switch_states ?? [];
  }

  // =======================================================================
  // PANELS
  // =======================================================================

  async listPanels(params?: Record<string, any>): Promise<PowerIQPanel[]> {
    const res = await this.get<any>('/panels', params);
    return res.panels ?? [];
  }

  async getPanel(id: number): Promise<PowerIQPanel | null> {
    const res = await this.get<any>(`/panels/${id}`);
    return res.panel ?? res;
  }

  async getPanelCircuits(panelId: number): Promise<any[]> {
    const res = await this.get<any>(`/panels/${panelId}/circuits`);
    return res.circuits ?? [];
  }

  async getPanelInlets(panelId: number): Promise<any[]> {
    const res = await this.get<any>(`/panels/${panelId}/inlets`);
    return res.inlets ?? [];
  }

  // =======================================================================
  // OUTLETS (extended for write)
  // =======================================================================

  async listOutlets(params?: Record<string, any>): Promise<PowerIQOutlet[]> {
    const res = await this.get<any>('/outlets', params);
    return res.outlets ?? [];
  }

  async getOutlet(id: number): Promise<PowerIQOutlet | null> {
    const res = await this.get<any>(`/outlets/${id}`);
    return res.outlet ?? res;
  }

  // =======================================================================
  // FLOOR MAPS
  // =======================================================================

  async getFloorMapMappable(): Promise<any[]> {
    const res = await this.get<any>('/floor_maps/mappable');
    return res.mappable ?? res.data ?? [];
  }

  // =======================================================================
  // PUE CALCULATIONS
  // =======================================================================

  async getPUECalculations(): Promise<any[]> {
    const res = await this.get<any>('/pue_calculations');
    return res.pue_calculations ?? [];
  }

  // =======================================================================
  // INTEGRATION
  // =======================================================================

  async getIntegrationRegistration(): Promise<any> {
    return this.get<any>('/integration/registration');
  }

  async getIntegrationStatus(): Promise<any> {
    return this.get<any>('/integration/registration/status');
  }

  async listIntegrationEntities(): Promise<any[]> {
    const res = await this.get<any>('/integration/entities');
    return res.entities ?? [];
  }

  // =======================================================================
  // CONNECTION TEST
  // =======================================================================

  async testConnection(): Promise<boolean> {
    try {
      await this.listDataCenters();
      return true;
    } catch {
      return false;
    }
  }
}
