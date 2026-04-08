/**
 * Zod validation schemas for dcTrack WRITE tools.
 */

import { z } from 'zod';

export const createItemSchema = z.object({
  tiName: z.string().describe('Item name (required)'),
  tiClass: z.string().describe('Item class: Device, Network, Rack PDU, UPS, Floor PDU, HVAC, Power Outlet, Probe, Data Panel, Passive, etc.'),
  cmbLocation: z.string().optional().describe('Location path (e.g., "AI-DEMO-DC > AI-ROOM-01")'),
  locationName: z.string().optional().describe('Location name (e.g., "AI-ROOM-01") — auto-resolves to full path. Use for free-standing items (UPS, HVAC, Floor PDU) that go in a room, not a cabinet.'),
  cabinetId: z.number().optional().describe('Cabinet ID (numeric) — will be resolved to cabinet name'),
  cabinetName: z.string().optional().describe('Cabinet name (e.g., "AI-CAB-01") — preferred over cabinetId'),
  make: z.string().optional().describe('Manufacturer name (e.g., "APC", "Rittal") — required by dcTrack'),
  model: z.string().optional().describe('Model name (e.g., "AP8861") — required by dcTrack'),
  tiUPosition: z.number().optional().describe('U position in cabinet (bottom of item)'),
  tiMounting: z.string().optional().describe('Mounting: Front, Rear, or ZeroU. Omit for standard rackable items.'),
  radioRailsUsed: z.enum(['Front', 'Rear', 'Both']).optional().describe('Rails used — use "Front" for Free-Standing 2-post cabinets'),
  radioDepthPosition: z.enum(['Front', 'Back']).optional().describe('Depth position — use "Back" for side-mounted ZeroU PDUs'),
  modelId: z.number().optional().describe('Model ID from model library'),
  tiSerialNumber: z.string().optional().describe('Serial number'),
  tiAssetTag: z.string().optional().describe('Asset tag'),
  cmbStatus: z.enum(['Planned', 'Installed', 'PoweredOff', 'Storage', 'Archived']).optional(),
  customFields: z.record(z.any()).optional().describe('Custom field values'),
});

export const updateItemSchema = z.object({
  itemId: z.number().optional().describe('Item ID to update (provide this OR itemName)'),
  itemName: z.string().optional().describe('Item name to update (e.g. "AI-SRV-01") — auto-resolves to itemId'),
  updates: z.object({
    tiName: z.string().optional(),
    cmbStatus: z.string().optional(),
    tiSerialNumber: z.string().optional(),
    tiAssetTag: z.string().optional(),
    cabinetId: z.number().optional(),
    tiUPosition: z.number().optional(),
    cmbRowLabel: z.string().optional(),
    cmbRowPosition: z.number().optional(),
    customFields: z.record(z.any()).optional(),
  }).passthrough(),
});

export const moveItemSchema = z.object({
  itemId: z.number().optional().describe('Item ID to move (provide this OR itemName)'),
  itemName: z.string().optional().describe('Item name to move (e.g. "AI-SRV-01") — auto-resolves to itemId'),
  targetCabinetId: z.number().optional().describe('Destination cabinet ID (provide this OR targetCabinetName)'),
  targetCabinetName: z.string().optional().describe('Destination cabinet name (e.g. "AI-CAB-01") — auto-resolves to ID'),
  targetUPosition: z.number().describe('Target U position'),
  targetMounting: z.enum(['Front', 'Rear', 'ZeroU']).optional(),
});

export const deleteItemSchema = z.object({
  itemId: z.number().optional().describe('Item ID to delete (provide this OR itemName)'),
  itemName: z.string().optional().describe('Item name to delete (e.g. "AI-SRV-01") — auto-resolves to itemId'),
  force: z.boolean().default(false).describe('Force delete even if item has connections'),
});

export const createConnectionSchema = z.object({
  sourceItemId: z.number().optional().describe('Source item ID (provide this OR sourceItemName)'),
  sourceItemName: z.string().optional().describe('Source item name — auto-resolves to ID'),
  sourcePortId: z.number().optional(),
  sourcePortName: z.string().optional(),
  destItemId: z.number().optional().describe('Destination item ID (provide this OR destItemName)'),
  destItemName: z.string().optional().describe('Destination item name — auto-resolves to ID'),
  destPortId: z.number().optional(),
  destPortName: z.string().optional(),
  cableId: z.string().optional(),
  connectionType: z.enum(['Power', 'Network', 'Fiber', 'Serial', 'KVM']).optional(),
});

export const deleteConnectionSchema = z.object({
  connectionId: z.number().describe('Connection ID to delete'),
});

export const createChangeRequestSchema = z.object({
  requestType: z.enum(['Install', 'Move', 'Decommission', 'PowerOn', 'PowerOff', 'Other']).optional().default('Other'),
  summary: z.string().describe('Brief summary of the change'),
  description: z.string().optional(),
  itemIds: z.array(z.number()).optional(),
  itemName: z.string().optional().describe('Item name (e.g., "AI-CAB-01") — auto-resolves to itemId if itemIds not provided'),
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
  locationId: z.number().optional().describe('Location ID (numeric)'),
  locationName: z.string().optional().describe('Location name (e.g., "AI-ROOM-01", "ROOM 01") — preferred, auto-resolves'),
  make: z.string().optional().describe('Make/manufacturer name (e.g., "Rittal")'),
  model: z.string().optional().describe('Model name (e.g., "Orsted VX5311.116")'),
  modelId: z.number().optional(),
  ruHeight: z.number().default(42),
  ratedPowerKw: z.number().optional(),
  rowPosition: z.number().optional(),
  customFields: z.record(z.any()).optional(),
}).passthrough();

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
