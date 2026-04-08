/**
 * Request handler for dcTrack ports tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

/**
 * Resolve itemName to itemId via exact name search.
 */
async function resolveItemId(itemId?: number, itemName?: string): Promise<number> {
  if (itemId) return itemId;
  if (!itemName) throw new Error('Either itemId or itemName is required');
  const results = await dctrackClient.searchItems({ name: itemName, pageSize: 1 });
  const found = results[0] as any;
  if (!found?.id) throw new Error(`Item "${itemName}" not found in dcTrack`);
  logger.info({ itemName, resolvedId: found.id }, 'Resolved itemName to ID');
  return Number(found.id);
}

const listDataPortsSchema = z.object({ itemId: z.number().optional(), itemName: z.string().optional() });
const getDataPortSchema = z.object({ itemId: z.number().optional(), itemName: z.string().optional(), portId: z.number() });
const createDataPortSchema = z.object({
  itemId: z.number().optional(), itemName: z.string().optional(), portName: z.string(), portSubclass: z.string().optional(),
  connector: z.string().optional(), mediaType: z.string().optional(),
  protocol: z.string().optional(), dataRate: z.string().optional(),
});
const updateDataPortSchema = z.object({ itemId: z.number().optional(), itemName: z.string().optional(), portId: z.number(), updates: z.record(z.any()) });
const deleteDataPortSchema = z.object({ itemId: z.number().optional(), itemName: z.string().optional(), portId: z.number() });
const listPowerPortsSchema = z.object({ itemId: z.number().optional(), itemName: z.string().optional() });

export async function handleDcTrackPortsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack ports tool');

  switch (toolName) {
    case 'dctrack_list_data_ports': {
      const p = listDataPortsSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.listDataPorts(id);
    }

    case 'dctrack_get_data_port': {
      const p = getDataPortSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.getDataPort(id, p.portId);
    }

    case 'dctrack_create_data_port': {
      const p = createDataPortSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      // v2 API uses portName, portSubClass (capital C), connector, media, protocol, dataRate
      const portData: Record<string, any> = {
        portName: p.portName,
        portSubClass: p.portSubclass ?? 'Physical',
      };
      if (p.connector) portData.connector = p.connector;
      if (p.mediaType) { portData.media = p.mediaType; portData.mediaType = p.mediaType; }
      if (p.protocol) portData.protocol = p.protocol;
      if (p.dataRate) portData.dataRate = p.dataRate;
      return dctrackClient.createDataPort(id, portData);
    }

    case 'dctrack_update_data_port': {
      const p = updateDataPortSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.updateDataPort(id, p.portId, p.updates);
    }

    case 'dctrack_delete_data_port': {
      const p = deleteDataPortSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.deleteDataPort(id, p.portId);
    }

    case 'dctrack_list_power_ports': {
      const p = listPowerPortsSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.listPowerPorts(id);
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
