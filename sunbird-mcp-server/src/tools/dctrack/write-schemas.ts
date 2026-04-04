/**
 * Zod validation schemas for dcTrack WRITE tools.
 */

import { z } from 'zod';

export const createItemSchema = z.object({
  tiName: z.string().describe('Item name (required)'),
  tiClass: z.string().describe('Item class: Device, Network, Rack PDU, etc.'),
  cmbLocation: z.string().optional().describe('Location path (e.g., "DC1/Room1/Row1")'),
  cabinetId: z.number().optional().describe('Cabinet ID to place item in'),
  tiUPosition: z.number().optional().describe('U position in cabinet (bottom of item)'),
  tiMounting: z.enum(['Front', 'Rear', 'ZeroU']).optional().describe('Mounting position'),
  modelId: z.number().optional().describe('Model ID from model library'),
  tiSerialNumber: z.string().optional().describe('Serial number'),
  tiAssetTag: z.string().optional().describe('Asset tag'),
  cmbStatus: z.enum(['Planned', 'Installed', 'PoweredOff', 'Storage', 'Archived']).optional(),
  customFields: z.record(z.any()).optional().describe('Custom field values'),
});

export const updateItemSchema = z.object({
  itemId: z.number().describe('Item ID to update'),
  updates: z.object({
    tiName: z.string().optional(),
    cmbStatus: z.string().optional(),
    tiSerialNumber: z.string().optional(),
    tiAssetTag: z.string().optional(),
    cabinetId: z.number().optional(),
    tiUPosition: z.number().optional(),
    customFields: z.record(z.any()).optional(),
  }),
});

export const moveItemSchema = z.object({
  itemId: z.number().describe('Item ID to move'),
  targetCabinetId: z.number().describe('Destination cabinet ID'),
  targetUPosition: z.number().describe('Target U position'),
  targetMounting: z.enum(['Front', 'Rear', 'ZeroU']).optional(),
});

export const deleteItemSchema = z.object({
  itemId: z.number().describe('Item ID to delete'),
  force: z.boolean().default(false).describe('Force delete even if item has connections'),
});

export const createConnectionSchema = z.object({
  sourceItemId: z.number().describe('Source item ID'),
  sourcePortId: z.number().optional(),
  sourcePortName: z.string().optional(),
  destItemId: z.number().describe('Destination item ID'),
  destPortId: z.number().optional(),
  destPortName: z.string().optional(),
  cableId: z.string().optional(),
  connectionType: z.enum(['Power', 'Network', 'Fiber', 'Serial', 'KVM']).optional(),
});

export const deleteConnectionSchema = z.object({
  connectionId: z.number().describe('Connection ID to delete'),
});

export const createChangeRequestSchema = z.object({
  requestType: z.enum(['Install', 'Move', 'Decommission', 'PowerOn', 'PowerOff', 'Other']),
  summary: z.string().describe('Brief summary of the change'),
  description: z.string().optional(),
  itemIds: z.array(z.number()).optional(),
  scheduledDate: z.string().optional().describe('ISO 8601 date'),
  assignee: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
});

export const updateChangeRequestSchema = z.object({
  requestId: z.number().describe('Change request ID'),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'InProgress', 'Completed', 'Cancelled']).optional(),
  comments: z.string().optional(),
});

export const bulkImportSchema = z.object({
  importType: z.enum(['items', 'connections', 'models']),
  data: z.array(z.record(z.any())),
  options: z.object({
    updateExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false),
    templateId: z.number().optional(),
  }).optional(),
});

export const bulkUpdateSchema = z.object({
  itemIds: z.array(z.number()),
  updates: z.record(z.any()),
});

export const createCabinetSchema = z.object({
  name: z.string(),
  locationId: z.number(),
  modelId: z.number().optional(),
  ruHeight: z.number().default(42),
  ratedPowerKw: z.number().optional(),
  rowPosition: z.number().optional(),
  customFields: z.record(z.any()).optional(),
});

export const createLocationSchema = z.object({
  name: z.string(),
  type: z.enum(['Site', 'Building', 'Floor', 'Room', 'Aisle', 'Row']),
  parentId: z.number().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});
