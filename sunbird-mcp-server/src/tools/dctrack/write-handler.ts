/**
 * Request handler for dcTrack WRITE tools.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './write-schemas.js';

/**
 * Resolve itemName to itemId via exact name search.
 * Returns the numeric ID or throws if not found.
 */
async function resolveItemId(itemId?: number, itemName?: string): Promise<number> {
  if (itemId) return itemId;
  if (!itemName) throw new Error('Either itemId or itemName is required');
  const results = await dctrackClient.searchItems({ name: itemName, pageSize: 1 });
  const found = results[0] as any;
  if (!found?.id) throw new Error(`Item "${itemName}" not found in dcTrack`);
  return Number(found.id);
}

export async function handleDcTrackWriteTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack write tool');

  switch (toolName) {
    case 'dctrack_create_item':
      return dctrackClient.createItem(schemas.createItemSchema.parse(args));

    case 'dctrack_update_item': {
      const p = schemas.updateItemSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.updateItem(id, p.updates);
    }

    case 'dctrack_move_item': {
      const p = schemas.moveItemSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      // Prefer cabinet name (dcTrack's cmbCabinet expects a name string)
      const targetCab: string | number = p.targetCabinetName || p.targetCabinetId || (() => { throw new Error('Either targetCabinetId or targetCabinetName is required'); })();
      return dctrackClient.moveItem(id, targetCab, p.targetUPosition, p.targetMounting);
    }

    case 'dctrack_delete_item': {
      const p = schemas.deleteItemSchema.parse(args);
      const id = await resolveItemId(p.itemId, p.itemName);
      return dctrackClient.deleteItem(id, p.force);
    }

    case 'dctrack_create_connection': {
      const conn = schemas.createConnectionSchema.parse(args);
      // Resolve item names to IDs
      if (!conn.sourceItemId && conn.sourceItemName) {
        conn.sourceItemId = await resolveItemId(undefined, conn.sourceItemName);
      }
      if (!conn.destItemId && conn.destItemName) {
        conn.destItemId = await resolveItemId(undefined, conn.destItemName);
      }
      if (!conn.sourceItemId) throw new Error('Either sourceItemId or sourceItemName is required');
      if (!conn.destItemId) throw new Error('Either destItemId or destItemName is required');
      return dctrackClient.createConnection(conn as any);
    }

    case 'dctrack_delete_connection':
      return dctrackClient.deleteConnection(schemas.deleteConnectionSchema.parse(args).connectionId);

    case 'dctrack_create_change_request': {
      const cr = schemas.createChangeRequestSchema.parse(args);
      // Resolve itemName to itemId if no itemIds provided
      if (!cr.itemIds?.length && cr.itemName) {
        try {
          const resolvedId = await resolveItemId(undefined, cr.itemName);
          cr.itemIds = [resolvedId];
          logger.info({ itemName: cr.itemName, resolvedId }, 'Resolved change request itemName to ID');
        } catch { /* item not found, proceed without */ }
      }
      try {
        return await dctrackClient.createChangeRequest(cr);
      } catch (err: any) {
        logger.warn({ error: err.message }, 'Change request failed — creating as ticket via requests API');
        return dctrackClient.createTicket({
          description: cr.summary + (cr.description ? ' - ' + cr.description : ''),
          summary: cr.summary,
          priority: cr.priority,
        });
      }
    }

    case 'dctrack_update_change_request': {
      const p = schemas.updateChangeRequestSchema.parse(args);
      return dctrackClient.updateChangeRequest(p.requestId, p);
    }

    case 'dctrack_bulk_import': {
      const p = schemas.bulkImportSchema.parse(args);
      return dctrackClient.bulkImport(p.importType, p.data, p.options);
    }

    case 'dctrack_bulk_update': {
      const p = schemas.bulkUpdateSchema.parse(args);
      return dctrackClient.bulkUpdate(p.itemIds, p.updates);
    }

    case 'dctrack_create_cabinet':
      return dctrackClient.createCabinet(schemas.createCabinetSchema.parse(args));

    case 'dctrack_create_location':
      return dctrackClient.createLocation(schemas.createLocationSchema.parse(args));

    case 'dctrack_list_import_templates':
      return dctrackClient.listImportTemplates(args.templateType);

    case 'dctrack_get_import_template':
      return dctrackClient.getImportTemplate(args.templateId);

    case 'dctrack_validate_import_data':
      return dctrackClient.validateImportData(args.importType, args.data, args.templateId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
