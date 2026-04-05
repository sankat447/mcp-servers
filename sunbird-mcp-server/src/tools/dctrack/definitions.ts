/**
 * MCP tool definitions for dcTrack READ operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackReadToolDefinitions = [
  {
    name: 'dctrack_list_locations',
    description: 'List all locations (sites, buildings, floors, rooms) in dcTrack hierarchy',
    inputSchema: {
      type: 'object' as const,
      properties: {
        parentId: { type: 'number', description: 'Filter by parent location ID' },
        type: {
          type: 'string',
          enum: ['Site', 'Building', 'Floor', 'Room', 'Aisle', 'Row'],
          description: 'Filter by location type',
        },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_location',
    description: 'Get detailed information about a specific location',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number', description: 'The unique identifier of the location' },
      },
      required: ['locationId'],
    },
  },
  {
    name: 'dctrack_list_cabinets',
    description: 'List all cabinets/racks in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number', description: 'Filter by location ID' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_cabinet',
    description: 'Get detailed information about a cabinet/rack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'The unique identifier of the cabinet' },
      },
      required: ['cabinetId'],
    },
  },
  {
    name: 'dctrack_get_cabinet_items',
    description: 'Get all items installed in a cabinet',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'The unique identifier of the cabinet' },
      },
      required: ['cabinetId'],
    },
  },
  {
    name: 'dctrack_get_cabinet_capacity',
    description: 'Get detailed capacity information for a cabinet including space (U), power (kW), and utilization. Provide either cabinetId (numeric) or cabinetName (string like "178B-02").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'The numeric ID of the cabinet (if known)' },
        cabinetName: { type: 'string', description: 'The cabinet name (e.g. "178B-02") — will be looked up to find the ID' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_search_items',
    description: 'Search for items (devices, assets) in dcTrack using various criteria',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (name, serial number, asset tag)' },
        class: {
          type: 'string',
          description: 'Filter by item class (Cabinet, Device, Network, Data Panel, Probe, Passive, CRAC, UPS, PDU, Floor PDU, Rack PDU, Power Outlet, etc.)',
        },
        locationId: { type: 'number', description: 'Filter by location ID' },
        cabinetId: { type: 'number', description: 'Filter by cabinet ID' },
        status: {
          type: 'string',
          enum: ['Installed', 'Planned', 'PoweredOff', 'Storage', 'Archived'],
          description: 'Filter by status',
        },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_item',
    description: 'Get detailed information about a specific item/device',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'The unique identifier of the item' },
      },
      required: ['itemId'],
    },
  },
  {
    name: 'dctrack_list_connections',
    description: 'List network/power connections in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Filter by item ID' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_connection',
    description: 'Get detailed information about a specific connection',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: { type: 'number', description: 'The unique identifier of the connection' },
      },
      required: ['connectionId'],
    },
  },
  {
    name: 'dctrack_list_models',
    description: 'List equipment models from the dcTrack model library',
    inputSchema: {
      type: 'object' as const,
      properties: {
        class: { type: 'string', description: 'Filter by model class' },
        make: { type: 'string', description: 'Filter by manufacturer' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 100 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_model',
    description: 'Get detailed information about a specific equipment model',
    inputSchema: {
      type: 'object' as const,
      properties: {
        modelId: { type: 'number', description: 'The unique identifier of the model' },
      },
      required: ['modelId'],
    },
  },
];
