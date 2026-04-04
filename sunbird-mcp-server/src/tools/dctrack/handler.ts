/**
 * Request handler for dcTrack READ tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './schemas.js';

export async function handleDcTrackReadTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack read tool');

  switch (toolName) {
    case 'dctrack_list_locations':
      return dctrackClient.listLocations(schemas.listLocationsSchema.parse(args));

    case 'dctrack_get_location':
      return dctrackClient.getLocation(schemas.getLocationSchema.parse(args).locationId);

    case 'dctrack_list_cabinets':
      return dctrackClient.listCabinets(schemas.listCabinetsSchema.parse(args));

    case 'dctrack_get_cabinet':
      return dctrackClient.getCabinet(schemas.getCabinetSchema.parse(args).cabinetId);

    case 'dctrack_get_cabinet_items':
      return dctrackClient.getCabinetItems(schemas.getCabinetItemsSchema.parse(args).cabinetId);

    case 'dctrack_get_cabinet_capacity':
      return dctrackClient.getCabinetCapacity(
        schemas.getCabinetCapacitySchema.parse(args).cabinetId,
      );

    case 'dctrack_search_items':
      return dctrackClient.searchItems(schemas.searchItemsSchema.parse(args));

    case 'dctrack_get_item':
      return dctrackClient.getItem(schemas.getItemSchema.parse(args).itemId);

    case 'dctrack_list_connections':
      return dctrackClient.listConnections(schemas.listConnectionsSchema.parse(args));

    case 'dctrack_get_connection':
      return dctrackClient.getConnection(schemas.getConnectionSchema.parse(args).connectionId);

    case 'dctrack_list_models':
      return dctrackClient.listModels(schemas.listModelsSchema.parse(args));

    case 'dctrack_get_model':
      return dctrackClient.getModel(schemas.getModelSchema.parse(args).modelId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
