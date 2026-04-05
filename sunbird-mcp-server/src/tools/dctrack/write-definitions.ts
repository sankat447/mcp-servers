/**
 * MCP tool definitions for dcTrack WRITE operations.
 */

export const dctrackWriteToolDefinitions = [
  {
    name: 'dctrack_create_item',
    description: 'Create a new item (device, asset) in dcTrack. Use this to add servers, network devices, PDUs, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tiName: { type: 'string', description: 'Item name (required)' },
        tiClass: { type: 'string', description: 'Item class: Device, Network, Rack PDU, CRAC, UPS, etc.' },
        cmbLocation: { type: 'string', description: 'Location path (e.g., "DC1/Room1/Row1")' },
        cabinetId: { type: 'number', description: 'Cabinet ID to place item in' },
        tiUPosition: { type: 'number', description: 'U position in cabinet (bottom of item)' },
        tiMounting: { type: 'string', enum: ['Front', 'Rear', 'ZeroU'], description: 'Mounting position' },
        modelId: { type: 'number', description: 'Model ID from model library' },
        tiSerialNumber: { type: 'string', description: 'Serial number' },
        tiAssetTag: { type: 'string', description: 'Asset tag' },
        cmbStatus: { type: 'string', enum: ['Planned', 'Installed', 'PoweredOff', 'Storage', 'Archived'] },
        customFields: { type: 'object', description: 'Custom field values as key-value pairs' },
      },
      required: ['tiName', 'tiClass'],
    },
  },
  {
    name: 'dctrack_update_item',
    description: 'Update an existing item in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to update' },
        updates: { type: 'object', description: 'Fields to update' },
      },
      required: ['itemId', 'updates'],
    },
  },
  {
    name: 'dctrack_move_item',
    description: 'Move an item from one cabinet/location to another',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to move' },
        targetCabinetId: { type: 'number', description: 'Destination cabinet ID' },
        targetUPosition: { type: 'number', description: 'Target U position' },
        targetMounting: { type: 'string', enum: ['Front', 'Rear', 'ZeroU'] },
      },
      required: ['itemId', 'targetCabinetId', 'targetUPosition'],
    },
  },
  {
    name: 'dctrack_delete_item',
    description: 'Delete an item from dcTrack. Use with caution.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to delete' },
        force: { type: 'boolean', description: 'Force delete', default: false },
      },
      required: ['itemId'],
    },
  },
  {
    name: 'dctrack_create_connection',
    description: 'Create a network or power connection between two items',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sourceItemId: { type: 'number', description: 'Source item ID' },
        sourcePortId: { type: 'number' },
        sourcePortName: { type: 'string' },
        destItemId: { type: 'number', description: 'Destination item ID' },
        destPortId: { type: 'number' },
        destPortName: { type: 'string' },
        cableId: { type: 'string' },
        connectionType: { type: 'string', enum: ['Power', 'Network', 'Fiber', 'Serial', 'KVM'] },
      },
      required: ['sourceItemId', 'destItemId'],
    },
  },
  {
    name: 'dctrack_delete_connection',
    description: 'Delete a connection between items',
    inputSchema: {
      type: 'object' as const,
      properties: { connectionId: { type: 'number' } },
      required: ['connectionId'],
    },
  },
  {
    name: 'dctrack_create_change_request',
    description: 'Create a change request for installing, moving, or decommissioning equipment',
    inputSchema: {
      type: 'object' as const,
      properties: {
        requestType: { type: 'string', enum: ['Install', 'Move', 'Decommission', 'PowerOn', 'PowerOff', 'Other'] },
        summary: { type: 'string' },
        description: { type: 'string' },
        itemIds: { type: 'array', items: { type: 'number' } },
        scheduledDate: { type: 'string' },
        assignee: { type: 'string' },
        priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
      },
      required: ['requestType', 'summary'],
    },
  },
  {
    name: 'dctrack_update_change_request',
    description: 'Update a change request status or add comments',
    inputSchema: {
      type: 'object' as const,
      properties: {
        requestId: { type: 'number' },
        status: { type: 'string', enum: ['Draft', 'Submitted', 'Approved', 'InProgress', 'Completed', 'Cancelled'] },
        comments: { type: 'string' },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'dctrack_bulk_import',
    description: 'Bulk import items, connections, or models using template data',
    inputSchema: {
      type: 'object' as const,
      properties: {
        importType: { type: 'string', enum: ['items', 'connections', 'models'] },
        data: { type: 'array', items: { type: 'object' } },
        options: { type: 'object' },
      },
      required: ['importType', 'data'],
    },
  },
  {
    name: 'dctrack_bulk_update',
    description: 'Update multiple items at once with the same field values',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemIds: { type: 'array', items: { type: 'number' } },
        updates: { type: 'object' },
      },
      required: ['itemIds', 'updates'],
    },
  },
  {
    name: 'dctrack_create_cabinet',
    description: 'Create a new cabinet/rack in dcTrack. Provide make and model by name (e.g., "Rittal", "Orsted VX5311.116") — they are required by dcTrack.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Cabinet name (e.g., "AI-CAB-01")' },
        locationId: { type: 'number', description: 'Location ID (e.g., 8 for AI-ROOM-01)' },
        make: { type: 'string', description: 'Manufacturer name (e.g., "Rittal") — required by dcTrack' },
        model: { type: 'string', description: 'Model name (e.g., "Orsted VX5311.116") — required by dcTrack' },
        ruHeight: { type: 'number', default: 42 },
        ratedPowerKw: { type: 'number' },
        rowPosition: { type: 'number' },
        customFields: { type: 'object' },
      },
      required: ['name', 'locationId', 'make', 'model'],
    },
  },
  {
    name: 'dctrack_create_location',
    description: 'Create a new location (site, building, floor, room, row) in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['Site', 'Building', 'Floor', 'Room', 'Aisle', 'Row'] },
        parentId: { type: 'number' },
        code: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        customFields: { type: 'object' },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'dctrack_list_import_templates',
    description: 'List available import templates for bulk data import',
    inputSchema: {
      type: 'object' as const,
      properties: { templateType: { type: 'string', enum: ['items', 'connections', 'models'] } },
      required: [],
    },
  },
  {
    name: 'dctrack_get_import_template',
    description: 'Get details of an import template including field mappings',
    inputSchema: {
      type: 'object' as const,
      properties: { templateId: { type: 'number' } },
      required: ['templateId'],
    },
  },
  {
    name: 'dctrack_validate_import_data',
    description: 'Validate import data against dcTrack schema without actually importing',
    inputSchema: {
      type: 'object' as const,
      properties: {
        importType: { type: 'string', enum: ['items', 'connections', 'models'] },
        data: { type: 'array', items: { type: 'object' } },
        templateId: { type: 'number' },
      },
      required: ['importType', 'data'],
    },
  },
];
