/**
 * Request handler for dcTrack WRITE tools.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './write-schemas.js';

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
      return dctrackClient.updateItem(p.itemId, p.updates);
    }

    case 'dctrack_move_item': {
      const p = schemas.moveItemSchema.parse(args);
      return dctrackClient.moveItem(p.itemId, p.targetCabinetId, p.targetUPosition, p.targetMounting);
    }

    case 'dctrack_delete_item': {
      const p = schemas.deleteItemSchema.parse(args);
      return dctrackClient.deleteItem(p.itemId, p.force);
    }

    case 'dctrack_create_connection':
      return dctrackClient.createConnection(schemas.createConnectionSchema.parse(args));

    case 'dctrack_delete_connection':
      return dctrackClient.deleteConnection(schemas.deleteConnectionSchema.parse(args).connectionId);

    case 'dctrack_create_change_request':
      return dctrackClient.createChangeRequest(schemas.createChangeRequestSchema.parse(args));

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
