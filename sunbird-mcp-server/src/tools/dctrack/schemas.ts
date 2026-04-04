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
  pageSize: z.number().default(50).describe('Number of results per page'),
});

export const getLocationSchema = z.object({
  locationId: z.number().describe('The unique identifier of the location'),
});

export const listCabinetsSchema = z.object({
  locationId: z.number().optional().describe('Filter by location ID'),
  pageSize: z.number().default(50).describe('Number of results per page'),
});

export const getCabinetSchema = z.object({
  cabinetId: z.number().describe('The unique identifier of the cabinet'),
});

export const getCabinetItemsSchema = z.object({
  cabinetId: z.number().describe('The unique identifier of the cabinet'),
});

export const getCabinetCapacitySchema = z.object({
  cabinetId: z.number().describe('The unique identifier of the cabinet'),
});

export const searchItemsSchema = z.object({
  query: z.string().optional().describe('Search query (name, serial number, asset tag)'),
  class: z
    .enum([
      'Device', 'Network', 'Data Panel', 'Probe', 'Passive',
      'CRAC', 'UPS', 'PDU', 'Floor PDU', 'Rack PDU', 'Power Outlet',
    ])
    .optional()
    .describe('Filter by item class'),
  locationId: z.number().optional().describe('Filter by location ID'),
  cabinetId: z.number().optional().describe('Filter by cabinet ID'),
  status: z
    .enum(['Installed', 'Planned', 'PoweredOff', 'Storage', 'Archived'])
    .optional()
    .describe('Filter by status'),
  pageSize: z.number().default(50).describe('Number of results per page'),
});

export const getItemSchema = z.object({
  itemId: z.number().describe('The unique identifier of the item'),
});

export const listConnectionsSchema = z.object({
  itemId: z.number().optional().describe('Filter by item ID'),
  pageSize: z.number().default(50).describe('Number of results per page'),
});

export const getConnectionSchema = z.object({
  connectionId: z.number().describe('The unique identifier of the connection'),
});

export const listModelsSchema = z.object({
  class: z.string().optional().describe('Filter by model class'),
  make: z.string().optional().describe('Filter by manufacturer'),
  pageSize: z.number().default(100).describe('Number of results per page'),
});

export const getModelSchema = z.object({
  modelId: z.number().describe('The unique identifier of the model'),
});
