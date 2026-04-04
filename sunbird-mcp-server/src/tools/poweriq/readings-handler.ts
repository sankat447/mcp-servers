import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const inletSchema = z.object({ inletId: z.number() });
const circuitSchema = z.object({ circuitId: z.number() });
const rackSchema = z.object({ rackId: z.number() });
const rollupSchema = z.object({ resourceType: z.string(), id: z.number(), interval: z.string() });
const latestSchema = z.object({ resourceType: z.string(), id: z.number(), type: z.string().optional() });

export async function handlePowerIQReadingsTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ readings tool');

  switch (toolName) {
    case 'poweriq_get_inlet_readings':
      return poweriqClient.getInletReadings(inletSchema.parse(args).inletId);
    case 'poweriq_get_circuit_readings':
      return poweriqClient.getCircuitReadings(circuitSchema.parse(args).circuitId);
    case 'poweriq_get_rack_readings':
      return poweriqClient.getRackReadings(rackSchema.parse(args).rackId);
    case 'poweriq_get_readings_rollup': {
      const p = rollupSchema.parse(args);
      return poweriqClient.getReadingsRollup(p.resourceType, p.id, p.interval);
    }
    case 'poweriq_get_latest_reading': {
      const p = latestSchema.parse(args);
      return poweriqClient.getLatestReading(p.resourceType, p.id, p.type);
    }
    default:
      throw new ToolNotFoundError(toolName);
  }
}
