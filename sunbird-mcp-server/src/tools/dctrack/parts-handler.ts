/**
 * Request handler for dcTrack parts tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const createPartClassSchema = z.object({ className: z.string() });
const getPartModelSchema = z.object({ modelId: z.number() });
const createPartModelSchema = z.object({ modelName: z.string(), make: z.string() });
const searchPartModelsSchema = z.object({
  filters: z.any().optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(1000),
});
const getPartSchema = z.object({ partId: z.number() });
const createPartSchema = z.object({
  partModelId: z.number(),
  locationId: z.number().optional(),
  quantity: z.number().optional(),
  serialNumber: z.string().optional(),
});
const updatePartSchema = z.object({ partId: z.number(), updates: z.record(z.any()) });
const deletePartSchema = z.object({ partId: z.number() });
const searchPartsSchema = z.object({
  filters: z.any().optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(1000),
});
const adjustStockSchema = z.object({
  partId: z.number(),
  activity: z.enum(['adjust', 'transfer']),
  quantity: z.number(),
  locationId: z.number().optional(),
});
const assignPartsSchema = z.object({
  assignmentType: z.enum(['ITEMS', 'PORTS']),
  assignments: z.array(z.record(z.any())),
});

export async function handleDcTrackPartsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack parts tool');

  switch (toolName) {
    case 'dctrack_list_part_classes':
      return dctrackClient.listPartClasses();

    case 'dctrack_create_part_class':
      return dctrackClient.createPartClass(createPartClassSchema.parse(args));

    case 'dctrack_get_part_model':
      return dctrackClient.getPartModel(getPartModelSchema.parse(args).modelId);

    case 'dctrack_create_part_model':
      return dctrackClient.createPartModel(createPartModelSchema.parse(args));

    case 'dctrack_search_part_models': {
      const p = searchPartModelsSchema.parse(args);
      return dctrackClient.searchPartModels({ columns: p.filters, pageNumber: p.pageNumber, pageSize: p.pageSize });
    }

    case 'dctrack_get_part':
      return dctrackClient.getPart(getPartSchema.parse(args).partId);

    case 'dctrack_create_part':
      return dctrackClient.createPart(createPartSchema.parse(args));

    case 'dctrack_update_part': {
      const p = updatePartSchema.parse(args);
      return dctrackClient.updatePart(p.partId, p.updates);
    }

    case 'dctrack_delete_part':
      return dctrackClient.deletePart(deletePartSchema.parse(args).partId);

    case 'dctrack_search_parts': {
      const p = searchPartsSchema.parse(args);
      return dctrackClient.searchParts({ columns: p.filters, pageNumber: p.pageNumber, pageSize: p.pageSize });
    }

    case 'dctrack_adjust_stock': {
      const p = adjustStockSchema.parse(args);
      return dctrackClient.adjustPartStock(p.partId, p.activity, p.quantity, p.locationId);
    }

    case 'dctrack_assign_parts': {
      const p = assignPartsSchema.parse(args);
      return dctrackClient.assignParts(p.assignmentType, p.assignments);
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
