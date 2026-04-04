import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const idSchema = z.object({ id: z.number() });
const createTagGroupSchema = z.object({ name: z.string() });
const updateSchema = z.object({ id: z.number(), updates: z.record(z.any()) });
const createTagSchema = z.object({ tagGroupId: z.number(), name: z.string() });
const createTagEntrySchema = z.object({
  tagId: z.number(),
  taggable_type: z.string(),
  taggable_id: z.number(),
});

export async function handlePowerIQTagsTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ tags tool');

  switch (toolName) {
    case 'poweriq_list_tag_groups':
      return poweriqClient.listTagGroups();
    case 'poweriq_get_tag_group':
      return poweriqClient.getTagGroup(idSchema.parse(args).id);
    case 'poweriq_create_tag_group': {
      const p = createTagGroupSchema.parse(args);
      return poweriqClient.createTagGroup({ name: p.name });
    }
    case 'poweriq_update_tag_group': {
      const p = updateSchema.parse(args);
      return poweriqClient.updateTagGroup(p.id, p.updates);
    }
    case 'poweriq_delete_tag_group':
      return poweriqClient.deleteTagGroup(idSchema.parse(args).id);
    case 'poweriq_list_tags':
      return poweriqClient.listTags();
    case 'poweriq_get_tag':
      return poweriqClient.getTag(idSchema.parse(args).id);
    case 'poweriq_create_tag': {
      const p = createTagSchema.parse(args);
      return poweriqClient.createTag(p.tagGroupId, { name: p.name });
    }
    case 'poweriq_update_tag': {
      const p = updateSchema.parse(args);
      return poweriqClient.updateTag(p.id, p.updates);
    }
    case 'poweriq_delete_tag':
      return poweriqClient.deleteTag(idSchema.parse(args).id);
    case 'poweriq_create_tag_entry': {
      const p = createTagEntrySchema.parse(args);
      return poweriqClient.createTagEntry(p.tagId, {
        taggable_type: p.taggable_type,
        taggable_id: p.taggable_id,
      });
    }
    case 'poweriq_delete_tag_entry':
      return poweriqClient.deleteTagEntry(idSchema.parse(args).id);
    default:
      throw new ToolNotFoundError(toolName);
  }
}
