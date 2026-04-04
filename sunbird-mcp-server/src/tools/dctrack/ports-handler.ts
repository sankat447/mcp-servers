/**
 * Request handler for dcTrack ports tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const listDataPortsSchema = z.object({ itemId: z.number() });
const getDataPortSchema = z.object({ itemId: z.number(), portId: z.number() });
const createDataPortSchema = z.object({
  itemId: z.number(), portName: z.string(), portSubclass: z.string().optional(),
  connector: z.string().optional(), mediaType: z.string().optional(),
  protocol: z.string().optional(), dataRate: z.string().optional(),
});
const updateDataPortSchema = z.object({ itemId: z.number(), portId: z.number(), updates: z.record(z.any()) });
const deleteDataPortSchema = z.object({ itemId: z.number(), portId: z.number() });
const listPowerPortsSchema = z.object({ itemId: z.number() });

export async function handleDcTrackPortsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack ports tool');

  switch (toolName) {
    case 'dctrack_list_data_ports':
      return dctrackClient.listDataPorts(listDataPortsSchema.parse(args).itemId);

    case 'dctrack_get_data_port': {
      const p = getDataPortSchema.parse(args);
      return dctrackClient.getDataPort(p.itemId, p.portId);
    }

    case 'dctrack_create_data_port': {
      const p = createDataPortSchema.parse(args);
      const { itemId, ...portData } = p;
      return dctrackClient.createDataPort(itemId, portData);
    }

    case 'dctrack_update_data_port': {
      const p = updateDataPortSchema.parse(args);
      return dctrackClient.updateDataPort(p.itemId, p.portId, p.updates);
    }

    case 'dctrack_delete_data_port': {
      const p = deleteDataPortSchema.parse(args);
      return dctrackClient.deleteDataPort(p.itemId, p.portId);
    }

    case 'dctrack_list_power_ports':
      return dctrackClient.listPowerPorts(listPowerPortsSchema.parse(args).itemId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
