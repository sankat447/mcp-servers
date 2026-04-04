import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './schemas.js';

export async function handlePowerIQTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ tool');

  switch (toolName) {
    case 'poweriq_list_datacenters':
      return poweriqClient.listDataCenters();

    case 'poweriq_list_pdus':
      return poweriqClient.listPDUs(schemas.listPDUsSchema.parse(args));

    case 'poweriq_get_pdu':
      return poweriqClient.getPDU(schemas.getPDUSchema.parse(args).pduId);

    case 'poweriq_get_pdu_readings': {
      const p = schemas.getPDUReadingsSchema.parse(args);
      const readings = await poweriqClient.getPDUReadings(p.pduId);
      if (p.includeOutlets) {
        const outlets = await poweriqClient.getOutletReadings(p.pduId);
        return { pdu: readings, outlets };
      }
      return readings;
    }

    case 'poweriq_list_sensors':
      return poweriqClient.listSensors(schemas.listSensorsSchema.parse(args));

    case 'poweriq_get_sensor_readings':
      return poweriqClient.getSensorReadings(schemas.getSensorReadingsSchema.parse(args).sensorId);

    case 'poweriq_get_pue':
      return poweriqClient.getPUE(schemas.getPUESchema.parse(args));

    case 'poweriq_list_alerts':
      return poweriqClient.listAlerts(schemas.listAlertsSchema.parse(args));

    case 'poweriq_list_it_devices':
      return poweriqClient.listITDevices(schemas.listITDevicesSchema.parse(args));

    case 'poweriq_get_outlet_readings':
      return poweriqClient.getOutletReadings(schemas.getOutletReadingsSchema.parse(args).pduId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
