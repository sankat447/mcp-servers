import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './schemas.js';
import * as ops from './operations.js';

export async function handleCombinedTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling combined DCIM tool');

  switch (toolName) {
    case 'dcim_get_rack_summary':
      return ops.getRackSummary(args);

    case 'dcim_find_capacity':
      return ops.findCapacity(schemas.findCapacitySchema.parse(args));

    case 'dcim_get_health_status':
      return ops.getHealthStatus(schemas.getHealthStatusSchema.parse(args));

    case 'dcim_identify_ghost_servers':
      return ops.identifyGhostServers(schemas.identifyGhostServersSchema.parse(args));

    case 'dcim_get_power_chain':
      return ops.getPowerChain(schemas.getPowerChainSchema.parse(args));

    case 'dcim_thermal_analysis':
      return ops.thermalAnalysis(schemas.thermalAnalysisSchema.parse(args));

    default:
      throw new ToolNotFoundError(toolName);
  }
}
