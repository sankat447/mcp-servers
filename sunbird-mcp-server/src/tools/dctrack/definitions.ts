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
        pageSize: { type: 'number', description: 'Number of results per page', default: 1000 },
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
    description: 'List all cabinets/racks in dcTrack. Use "location" parameter to filter by location name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        location: { type: 'string', description: 'Filter by location name (e.g. "AI-ROOM-01"). Preferred over locationId.' },
        locationId: { type: 'number', description: 'Filter by location ID' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 1000 },
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
    description: 'Get all items installed in a cabinet. Provide cabinetName (preferred) or cabinetId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'The unique identifier of the cabinet' },
        cabinetName: { type: 'string', description: 'Cabinet name (e.g., "178B-02") — preferred, auto-resolves to ID' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_cabinet_u_map',
    description: 'Get a full U-position map for a cabinet showing every U slot (U1 to U42/U48 etc.) and whether it is Occupied or Available, with item details. Use this to visualize rack layout.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'The numeric ID of the cabinet' },
        cabinetName: { type: 'string', description: 'Cabinet name (e.g., "178B-02") — preferred, auto-resolves to ID' },
      },
      required: [],
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
    name: 'dctrack_list_cabinets_with_capacity',
    description: 'PREFERRED for capacity questions. List cabinets with space metrics (total U, used U, available U, utilization %). Use this instead of dctrack_get_cabinet_capacity when asking about free space, available capacity, remaining room, or comparing cabinets. Returns ALL cabinets with capacity in a single call. Supports filtering by minAvailableRu.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        location: { type: 'string', description: 'Filter by location name (e.g. "AI-ROOM-01"). Preferred over locationId.' },
        locationId: { type: 'number', description: 'Filter by location ID' },
        minAvailableRu: { type: 'number', description: 'Only return cabinets with at least this many free RU slots (e.g. 10)' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_search_items',
    description: 'Search for items (devices, assets) in dcTrack. Use this for finding items by name, class, status, or location. This is the primary search tool — use it instead of dctrack_get_cabinet_items when searching across a location or for items by name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Broad search across multiple fields (name, serial number, asset tag). Use "name" instead for exact item name matching.' },
        name: { type: 'string', description: 'Exact item name filter (e.g. "AI-CAB-01"). Preferred over "query" when searching by item name.' },
        class: {
          type: 'string',
          description: 'Filter by item class (Cabinet, Device, Network, Data Panel, Probe, Passive, CRAC, UPS, PDU, Floor PDU, Rack PDU, Power Outlet, etc.)',
        },
        location: { type: 'string', description: 'Filter by location name (e.g. "AI-ROOM-01"). Resolves to locationId automatically.' },
        locationId: { type: 'number', description: 'Filter by location ID (use "location" name instead if you have the name)' },
        cabinetId: { type: 'number', description: 'Filter by cabinet ID' },
        status: {
          type: 'string',
          enum: ['Installed', 'Planned', 'PoweredOff', 'Storage', 'Archived'],
          description: 'Filter by status',
        },
        pageSize: { type: 'number', description: 'Number of results per page', default: 1000 },
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
        pageSize: { type: 'number', description: 'Number of results per page', default: 1000 },
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
    description: 'List/search equipment models from the dcTrack model library. Use query to search by model name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search model name (partial match, e.g. "C6100")' },
        class: { type: 'string', description: 'Filter by model class' },
        make: { type: 'string', description: 'Filter by manufacturer' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 1000 },
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
