import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const idSchema = z.object({ id: z.number() });
const createDCSchema = z.object({
  name: z.string(), city: z.string().optional(), state: z.string().optional(),
  country: z.string().optional(), capacity: z.number().optional(),
  contact_name: z.string().optional(), external_key: z.string().optional(),
});
const updateDCSchema = z.object({ id: z.number(), updates: z.record(z.any()) });
const childrenSchema = z.object({ resourceType: z.string(), id: z.number() });
const descendantsSchema = z.object({ resourceType: z.string(), id: z.number(), types: z.array(z.string()).optional() });
const moveSchema = z.object({ resourceType: z.string(), id: z.number(), targetType: z.string(), targetId: z.number() });
const summarySchema = z.object({ resourceType: z.string(), id: z.number() });

export async function handlePowerIQInfraTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ infrastructure tool');

  switch (toolName) {
    case 'poweriq_get_datacenter':
      return poweriqClient.getDataCenter(idSchema.parse(args).id);
    case 'poweriq_create_datacenter':
      return poweriqClient.createDataCenter(createDCSchema.parse(args));
    case 'poweriq_update_datacenter': {
      const p = updateDCSchema.parse(args);
      return poweriqClient.updateDataCenter(p.id, p.updates);
    }
    case 'poweriq_delete_datacenter':
      return poweriqClient.deleteDataCenter(idSchema.parse(args).id);
    case 'poweriq_list_floors':
      return poweriqClient.listFloors();
    case 'poweriq_list_rooms':
      return poweriqClient.listRooms();
    case 'poweriq_list_racks':
      return poweriqClient.listRacks();
    case 'poweriq_get_rack':
      return poweriqClient.getRack(idSchema.parse(args).id);
    case 'poweriq_get_children': {
      const p = childrenSchema.parse(args);
      return poweriqClient.getChildren(p.resourceType, p.id);
    }
    case 'poweriq_get_descendants': {
      const p = descendantsSchema.parse(args);
      return poweriqClient.getDescendants(p.resourceType, p.id, p.types);
    }
    case 'poweriq_move_resource': {
      const p = moveSchema.parse(args);
      return poweriqClient.moveResource(p.resourceType, p.id, p.targetType, p.targetId);
    }
    case 'poweriq_get_executive_summary': {
      const p = summarySchema.parse(args);
      return poweriqClient.getExecutiveSummary(p.resourceType, p.id);
    }
    default:
      throw new ToolNotFoundError(toolName);
  }
}
