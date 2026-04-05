/**
 * Request handler for dcTrack makes/models tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const getMakeSchema = z.object({ makeId: z.number() });
const createMakeSchema = z.object({
  makeName: z.string(),
  accountNumber: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
const updateMakeSchema = z.object({ makeId: z.number(), updates: z.record(z.any()) });
const deleteMakeSchema = z.object({ makeId: z.number() });
const searchMakesSchema = z.object({ searchString: z.string() });
const createModelSchema = z.object({
  model: z.string(), make: z.string(), class: z.string(),
  subclass: z.string().optional(),
  mounting: z.string().optional(), formFactor: z.string().optional(),
  ruHeight: z.number().optional(), dimHeight: z.number().optional(),
  dimWidth: z.number().optional(), dimDepth: z.number().optional(), weight: z.number().optional(),
}).passthrough();
const updateModelSchema = z.object({ modelId: z.number(), model: z.record(z.any()) });
const deleteModelSchema = z.object({ modelId: z.number() });
const searchModelsSchema = z.object({
  filters: z.any().optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(50),
});

export async function handleDcTrackMakesTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack makes/models tool');

  switch (toolName) {
    case 'dctrack_list_makes':
      return dctrackClient.listMakes();

    case 'dctrack_get_make':
      return dctrackClient.getMake(getMakeSchema.parse(args).makeId);

    case 'dctrack_create_make':
      return dctrackClient.createMake(createMakeSchema.parse(args));

    case 'dctrack_update_make': {
      const p = updateMakeSchema.parse(args);
      return dctrackClient.updateMake(p.makeId, p.updates);
    }

    case 'dctrack_delete_make':
      return dctrackClient.deleteMake(deleteMakeSchema.parse(args).makeId);

    case 'dctrack_search_makes':
      return dctrackClient.searchMakes(searchMakesSchema.parse(args).searchString);

    case 'dctrack_create_model':
      return dctrackClient.createModel(createModelSchema.parse(args));

    case 'dctrack_update_model': {
      const p = updateModelSchema.parse(args);
      return dctrackClient.updateModel(p.modelId, p.model);
    }

    case 'dctrack_delete_model':
      return dctrackClient.deleteModel(deleteModelSchema.parse(args).modelId);

    case 'dctrack_search_models': {
      const p = searchModelsSchema.parse(args);
      return dctrackClient.searchModels({ columns: p.filters, pageNumber: p.pageNumber, pageSize: p.pageSize });
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
