/**
 * Zod validation schemas for dcTrack read tools.
 */

import { z } from 'zod';

export const listLocationsSchema = z.object({
  parentId: z.number().optional().describe('Filter by parent location ID'),
  type: z
    .enum(['Site', 'Building', 'Floor', 'Room', 'Aisle', 'Row'])
    .optional()
    .describe('Filter by location type'),
  pageSize: z.number().default(1000).describe('Number of results per page'),
});

export const getLocationSchema = z.object({
  locationId: z.number().describe('The unique identifier of the location'),
});

export const listCabinetsSchema = z.object({
  location: z.string().optional().describe('Filter by location name (e.g. "AI-ROOM-01"). Preferred over locationId.'),
  locationId: z.number().optional().describe('Filter by location ID'),
  pageSize: z.number().default(1000).describe('Number of results per page'),
});

export const getCabinetSchema = z.object({
  cabinetId: z.number().describe('The unique identifier of the cabinet'),
});

export const getCabinetItemsSchema = z.object({
  cabinetId: z.number().optional().describe('The unique identifier of the cabinet'),
  cabinetName: z.string().optional().describe('Cabinet name (e.g., "178B-02") — will resolve to cabinetId automatically'),
});

export const getCabinetUMapSchema = z.object({
  cabinetId: z.number().optional().describe('The unique identifier of the cabinet'),
  cabinetName: z.string().optional().describe('Cabinet name (e.g., "178B-02") — will resolve to cabinetId automatically'),
});

export const getCabinetCapacitySchema = z.object({
  cabinetId: z.number().optional().describe('The numeric ID of the cabinet'),
  cabinetName: z.string().optional().describe('The cabinet name to look up'),
});

export const listCabinetsWithCapacitySchema = z.object({
  location: z.string().optional().describe('Filter by location name (e.g. "AI-ROOM-01")'),
  locationId: z.number().optional().describe('Filter by location ID'),
  minAvailableRu: z.number().optional().describe('Only return cabinets with at least this many free RU slots'),
});

export const searchItemsSchema = z.object({
  query: z.string().optional().describe('Broad search query across multiple fields (name, serial number, asset tag). Use "name" instead for exact item name matching.'),
  name: z.string().optional().describe('Exact item name filter (e.g. "AI-CAB-01"). Preferred over "query" when searching by item name.'),
  class: z
    .string()
    .optional()
    .describe('Filter by item class (Cabinet, Device, Network, Data Panel, Probe, Passive, CRAC, UPS, PDU, Floor PDU, Rack PDU, Power Outlet, etc.)'),
  location: z.string().optional().describe('Filter by location name (e.g. "AI-ROOM-01"). Resolves to locationId automatically.'),
  locationId: z.number().optional().describe('Filter by location ID (use "location" name instead if you have the name)'),
  cabinetId: z.number().optional().describe('Filter by cabinet ID'),
  status: z
    .enum(['Installed', 'Planned', 'PoweredOff', 'Storage', 'Archived'])
    .optional()
    .describe('Filter by status'),
  pageSize: z.number().default(1000).describe('Number of results per page'),
});

export const getItemSchema = z.object({
  itemId: z.number().describe('The unique identifier of the item'),
});

export const listConnectionsSchema = z.object({
  itemId: z.number().optional().describe('Filter by item ID'),
  pageSize: z.number().default(1000).describe('Number of results per page'),
});

export const getConnectionSchema = z.object({
  connectionId: z.number().describe('The unique identifier of the connection'),
});

export const listModelsSchema = z.object({
  query: z.string().optional().describe('Search model name (partial match, e.g. "C6100")'),
  class: z.string().optional().describe('Filter by model class'),
  make: z.string().optional().describe('Filter by manufacturer'),
  pageSize: z.number().default(1000).describe('Number of results per page'),
});

export const getModelSchema = z.object({
  modelId: z.number().describe('The unique identifier of the model'),
});
