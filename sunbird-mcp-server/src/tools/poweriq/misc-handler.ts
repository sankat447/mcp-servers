import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const idSchema = z.object({ id: z.number() });

export async function handlePowerIQMiscTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ misc tool');

  switch (toolName) {
    case 'poweriq_list_transfer_switches':
      return poweriqClient.listTransferSwitches();
    case 'poweriq_get_transfer_switch':
      return poweriqClient.getTransferSwitch(idSchema.parse(args).id);
    case 'poweriq_get_transfer_switch_states':
      return poweriqClient.getTransferSwitchStates(idSchema.parse(args).id);
    case 'poweriq_get_floor_map_mappable':
      return poweriqClient.getFloorMapMappable();
    case 'poweriq_get_integration_registration':
      return poweriqClient.getIntegrationRegistration();
    case 'poweriq_get_integration_status':
      return poweriqClient.getIntegrationStatus();
    case 'poweriq_list_integration_entities':
      return poweriqClient.listIntegrationEntities();
    default:
      throw new ToolNotFoundError(toolName);
  }
}
