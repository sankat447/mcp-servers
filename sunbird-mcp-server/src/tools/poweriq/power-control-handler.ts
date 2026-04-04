import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const outletsSchema = z.object({ outletIds: z.array(z.number()), state: z.enum(['ON', 'OFF', 'CYCLE']) });
const deviceSchema = z.object({ deviceId: z.number(), state: z.enum(['ON', 'OFF', 'CYCLE']) });
const rackSchema = z.object({ rackId: z.number(), state: z.enum(['ON', 'OFF', 'CYCLE']) });

export async function handlePowerIQPowerControlTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ power control tool');

  switch (toolName) {
    case 'poweriq_power_control_outlets': {
      const p = outletsSchema.parse(args);
      return poweriqClient.powerControlOutlets(p.outletIds, p.state);
    }
    case 'poweriq_power_control_device': {
      const p = deviceSchema.parse(args);
      return poweriqClient.powerControlDevice(p.deviceId, p.state);
    }
    case 'poweriq_power_control_rack': {
      const p = rackSchema.parse(args);
      return poweriqClient.powerControlRack(p.rackId, p.state);
    }
    default:
      throw new ToolNotFoundError(toolName);
  }
}
