/**
 * Request handler for dcTrack READ tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 * List operations include pagination metadata (totalRows, showing, pageSize).
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import * as schemas from './schemas.js';

/**
 * Wrap a list result with pagination metadata from the client's last search.
 * Returns { data: T[], totalRows, showing, pageSize } so consumers know
 * whether there are more records beyond what was returned.
 */
function wrapWithPagination<T>(data: T[]): { data: T[]; totalRows: number; showing: number; pageSize: number } {
  const meta = dctrackClient.lastSearchMeta;
  return {
    data,
    totalRows: meta.totalRows >= 0 ? meta.totalRows : data.length,
    showing: data.length,
    pageSize: meta.pageSize,
  };
}

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

    case 'dctrack_list_cabinets': {
      const data = await dctrackClient.listCabinets(schemas.listCabinetsSchema.parse(args));
      return wrapWithPagination(data);
    }

    case 'dctrack_get_cabinet':
      return dctrackClient.getCabinet(schemas.getCabinetSchema.parse(args).cabinetId);

    case 'dctrack_get_cabinet_items': {
      const cabArgs = schemas.getCabinetItemsSchema.parse(args);
      let cabItemsId = cabArgs.cabinetId;
      if (!cabItemsId && cabArgs.cabinetName) {
        const results = await dctrackClient.searchItems({ query: cabArgs.cabinetName, class: 'Cabinet', pageSize: 1 });
        const found = results[0] as any;
        if (found?.id) cabItemsId = Number(found.id);
        else throw new Error(`Cabinet "${cabArgs.cabinetName}" not found`);
      }
      if (!cabItemsId) throw new Error('Either cabinetId or cabinetName is required');
      return dctrackClient.getCabinetItems(cabItemsId);
    }

    case 'dctrack_get_cabinet_u_map': {
      const uMapArgs = schemas.getCabinetUMapSchema.parse(args);
      let uMapCabId = uMapArgs.cabinetId;
      if (!uMapCabId && uMapArgs.cabinetName) {
        const results = await dctrackClient.searchItems({ query: uMapArgs.cabinetName, class: 'Cabinet', pageSize: 1 });
        const found = results[0] as any;
        if (found?.id) uMapCabId = Number(found.id);
        else throw new Error(`Cabinet "${uMapArgs.cabinetName}" not found`);
      }
      if (!uMapCabId) throw new Error('Either cabinetId or cabinetName is required');
      return dctrackClient.getCabinetUMap(uMapCabId);
    }

    case 'dctrack_get_cabinet_capacity': {
      const cap = schemas.getCabinetCapacitySchema.parse(args);
      let cabId = cap.cabinetId;
      if (!cabId && cap.cabinetName) {
        // Resolve cabinet name to ID via search
        const results = await dctrackClient.searchItems({ query: cap.cabinetName, class: 'Cabinet', pageSize: 1 });
        const found = results[0] as any;
        if (found?.id) cabId = Number(found.id);
      }
      if (!cabId) throw new Error('Provide either cabinetId or a valid cabinetName');
      return dctrackClient.getCabinetCapacity(cabId);
    }

    case 'dctrack_search_items': {
      const data = await dctrackClient.searchItems(schemas.searchItemsSchema.parse(args));
      return wrapWithPagination(data);
    }

    case 'dctrack_get_item':
      return dctrackClient.getItem(schemas.getItemSchema.parse(args).itemId);

    case 'dctrack_list_connections':
      return dctrackClient.listConnections(schemas.listConnectionsSchema.parse(args));

    case 'dctrack_get_connection':
      return dctrackClient.getConnection(schemas.getConnectionSchema.parse(args).connectionId);

    case 'dctrack_list_models': {
      const data = await dctrackClient.listModels(schemas.listModelsSchema.parse(args));
      return wrapWithPagination(data);
    }

    case 'dctrack_get_model':
      return dctrackClient.getModel(schemas.getModelSchema.parse(args).modelId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
