/**
 * MCP tool definitions for dcTrack WRITE operations.
 */

export const dctrackWriteToolDefinitions = [
  {
    name: 'dctrack_create_item',
    description: 'Create a new item in dcTrack. For rackable items (Device, Network, Rack PDU, Probe, Data Panel, Passive) use cabinetName. For free-standing items (UPS, HVAC, Floor PDU, Power Outlet) use locationName — they go in the room, not inside a cabinet.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tiName: { type: 'string', description: 'Item name (required)' },
        tiClass: { type: 'string', description: 'Item class: Device, Network, Rack PDU, UPS, Floor PDU, HVAC, Power Outlet, Probe, Data Panel, Passive' },
        locationName: { type: 'string', description: 'Location name (e.g. "AI-ROOM-01") — for free-standing items (UPS, HVAC, Floor PDU, Power Outlet). Auto-resolves to full path.' },
        cmbLocation: { type: 'string', description: 'Full location path (e.g. "AI-DEMO-DC > AI-ROOM-01") — alternative to locationName' },
        cabinetName: { type: 'string', description: 'Cabinet name (e.g. "AI-CAB-01") — for rackable items inside a cabinet' },
        cabinetId: { type: 'number', description: 'Cabinet ID (numeric) — use cabinetName instead when possible' },
        make: { type: 'string', description: 'Manufacturer name (e.g., "APC", "Rittal") — required by dcTrack' },
        model: { type: 'string', description: 'Model name (e.g., "AP8861") — required by dcTrack' },
        tiUPosition: { type: 'number', description: 'U position in cabinet (bottom of item)' },
        tiMounting: { type: 'string', enum: ['Front', 'Rear', 'ZeroU'], description: 'Mounting position — use ZeroU for PDUs' },
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
    description: 'Update an existing item in dcTrack. Provide itemName (preferred) or itemId — itemName auto-resolves to the correct ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to update (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name (e.g. "AI-SRV-01") — auto-resolves to itemId. Preferred over itemId.' },
        updates: { type: 'object', description: 'Fields to update. Common fields: cmbStatus (Installed/Planned/PoweredOff/Storage/Archived), tiName, tiSerialNumber, tiAssetTag, cmbRowLabel (row name e.g. "Row-A"), cmbRowPosition (position number). NOTE: Setting cabinet status to Installed requires cmbRowLabel and cmbRowPosition.' },
      },
      required: ['updates'],
    },
  },
  {
    name: 'dctrack_move_item',
    description: 'Move an item from one cabinet/location to another. Provide itemName (preferred) or itemId, and targetCabinetName (preferred) or targetCabinetId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to move (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name (e.g. "AI-SRV-01") — auto-resolves to itemId. Preferred over itemId.' },
        targetCabinetId: { type: 'number', description: 'Destination cabinet ID (provide this OR targetCabinetName)' },
        targetCabinetName: { type: 'string', description: 'Destination cabinet name (e.g. "AI-CAB-01") — auto-resolves to ID. Preferred.' },
        targetUPosition: { type: 'number', description: 'Target U position (e.g. 20)' },
        targetMounting: { type: 'string', enum: ['Front', 'Rear', 'ZeroU'] },
      },
      required: ['targetUPosition'],
    },
  },
  {
    name: 'dctrack_delete_item',
    description: 'Delete an item from dcTrack. Provide itemName (preferred) or itemId — itemName auto-resolves to the correct ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to delete (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name (e.g. "AI-SRV-01") — auto-resolves to itemId. Preferred over itemId.' },
        force: { type: 'boolean', description: 'Force delete', default: false },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_create_connection',
    description: 'Create a power or network connection between two items. Use itemName (preferred) or itemId for source and destination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sourceItemId: { type: 'number', description: 'Source item ID (provide this OR sourceItemName)' },
        sourceItemName: { type: 'string', description: 'Source item name (e.g. "AI-CAB-01 178B-01 PDU 1") — auto-resolves to ID. Preferred.' },
        sourcePortName: { type: 'string', description: 'Source port name (e.g. "Outlet 1", "eth0")' },
        destItemId: { type: 'number', description: 'Destination item ID (provide this OR destItemName)' },
        destItemName: { type: 'string', description: 'Destination item name (e.g. "AI-CAB-01 DELL POWEREDGE-C6100 U1") — auto-resolves to ID. Preferred.' },
        destPortName: { type: 'string', description: 'Destination port name (e.g. "PS1", "Port-1")' },
        connectionType: { type: 'string', enum: ['Power', 'Network', 'Fiber', 'Serial', 'KVM'] },
      },
      required: [],
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
    description: 'Create a change request. requestType defaults to "Other". itemIds/itemName optional.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        requestType: { type: 'string', enum: ['Install', 'Move', 'Decommission', 'PowerOn', 'PowerOff', 'Other'], description: 'Defaults to "Other"' },
        summary: { type: 'string', description: 'Brief summary of the change' },
        description: { type: 'string', description: 'Detailed description' },
        itemIds: { type: 'array', items: { type: 'number' } },
        itemName: { type: 'string', description: 'Item name — auto-resolves to itemId' },
        scheduledDate: { type: 'string' },
        assignee: { type: 'string' },
        priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
      },
      required: ['summary'],
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
    description: 'Create a new cabinet/rack in dcTrack. Use locationName (preferred) or locationId. Provide make and model by name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Cabinet name (e.g., "AI-CAB-01")' },
        locationName: { type: 'string', description: 'Location name (e.g., "AI-ROOM-01") — preferred, auto-resolves' },
        locationId: { type: 'number', description: 'Location ID (numeric) — use locationName instead when possible' },
        make: { type: 'string', description: 'Manufacturer name (e.g., "Rittal") — required by dcTrack' },
        model: { type: 'string', description: 'Model name (e.g., "Orsted VX5311.116") — required by dcTrack' },
        ruHeight: { type: 'number', default: 42 },
        ratedPowerKw: { type: 'number' },
        rowPosition: { type: 'number' },
        customFields: { type: 'object' },
      },
      required: ['name', 'make', 'model'],
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
