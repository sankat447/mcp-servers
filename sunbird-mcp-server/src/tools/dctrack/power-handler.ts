/**
 * Request handler for dcTrack power and space tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const locationPowerChainSchema = z.object({ locationId: z.number(), nodeFields: z.array(z.string()).optional() });
const actualReadingsSchema = z.object({ itemId: z.number() });
const portReadingsSchema = z.object({ portId: z.number() });
const updatePortReadingsSchema = z.object({ portId: z.number(), readings: z.record(z.any()) });
const powerSumSchema = z.object({ itemIds: z.array(z.number()) });
const findCabinetsSchema = z.object({
  locationIds: z.array(z.number()).optional(),
  minAvailableRUs: z.number().optional(),
  minAvailablePowerKw: z.number().optional(),
});
const findUPositionsSchema = z.object({ cabinetId: z.number(), ruNeeded: z.number() });
const listSubLocationsSchema = z.object({ locationId: z.number() });
const getSubLocationSchema = z.object({ subLocationId: z.number() });
const createSubLocationSchema = z.object({ name: z.string(), locationId: z.number(), type: z.string().optional() });

export async function handleDcTrackPowerTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack power/space tool');

  switch (toolName) {
    case 'dctrack_get_location_power_chain': {
      const p = locationPowerChainSchema.parse(args);
      return dctrackClient.getPowerChainForLocation(p.locationId, p.nodeFields);
    }

    case 'dctrack_get_actual_readings':
      return dctrackClient.getActualReadingsByItem(actualReadingsSchema.parse(args).itemId);

    case 'dctrack_get_port_readings':
      return dctrackClient.getActualReadingsByPort(portReadingsSchema.parse(args).portId);

    case 'dctrack_update_port_readings': {
      const p = updatePortReadingsSchema.parse(args);
      return dctrackClient.updateActualReadingsByPort(p.portId, p.readings);
    }

    case 'dctrack_get_power_sum':
      return dctrackClient.getPowerSumBulk(powerSumSchema.parse(args).itemIds);

    case 'dctrack_find_available_cabinets':
      return dctrackClient.findAvailableCabinets(findCabinetsSchema.parse(args));

    case 'dctrack_find_available_upositions': {
      const p = findUPositionsSchema.parse(args);
      return dctrackClient.findAvailableUPositions(p);
    }

    case 'dctrack_list_sublocations':
      return dctrackClient.listSubLocations(listSubLocationsSchema.parse(args).locationId);

    case 'dctrack_get_sublocation':
      return dctrackClient.getSubLocation(getSubLocationSchema.parse(args).subLocationId);

    case 'dctrack_create_sublocation':
      return dctrackClient.createSubLocation(createSubLocationSchema.parse(args));

    default:
      throw new ToolNotFoundError(toolName);
  }
}
