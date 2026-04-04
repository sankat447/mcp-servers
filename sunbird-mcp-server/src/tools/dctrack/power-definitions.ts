/**
 * MCP tool definitions for dcTrack power and space operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackPowerToolDefinitions = [
  {
    name: 'dctrack_get_location_power_chain',
    description: 'Get the complete power chain (links and nodes) for a dcTrack location',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number', description: 'Location ID to get power chain for' },
        nodeFields: { type: 'array', items: { type: 'string' }, description: 'Fields to include for each node' },
      },
      required: ['locationId'],
    },
  },
  {
    name: 'dctrack_get_actual_readings',
    description: 'Get actual power readings for all power ports on a dcTrack item',
    inputSchema: {
      type: 'object' as const,
      properties: { itemId: { type: 'number', description: 'Item ID to get readings for' } },
      required: ['itemId'],
    },
  },
  {
    name: 'dctrack_get_port_readings',
    description: 'Get actual power readings for a specific power port',
    inputSchema: {
      type: 'object' as const,
      properties: { portId: { type: 'number', description: 'Power port ID' } },
      required: ['portId'],
    },
  },
  {
    name: 'dctrack_update_port_readings',
    description: 'Update actual power readings for a specific power port',
    inputSchema: {
      type: 'object' as const,
      properties: {
        portId: { type: 'number', description: 'Power port ID' },
        readings: { type: 'object', description: 'Reading values (actualAmps, actualVolts, actualWatts, actualPowerFactor)' },
      },
      required: ['portId', 'readings'],
    },
  },
  {
    name: 'dctrack_get_power_sum',
    description: 'Get power sum for multiple items by their IDs',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemIds: { type: 'array', items: { type: 'number' }, description: 'List of item IDs' },
      },
      required: ['itemIds'],
    },
  },
  {
    name: 'dctrack_find_available_cabinets',
    description: 'Find cabinets with available space matching RU and power requirements',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs to search within' },
        minAvailableRUs: { type: 'number', description: 'Minimum available rack units needed' },
        minAvailablePowerKw: { type: 'number', description: 'Minimum available power in kW' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_find_available_upositions',
    description: 'Find available starting U-positions within a cabinet',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'Cabinet ID to search in' },
        ruNeeded: { type: 'number', description: 'Number of contiguous RUs needed' },
      },
      required: ['cabinetId', 'ruNeeded'],
    },
  },
  {
    name: 'dctrack_list_sublocations',
    description: 'List sub-locations (zones, pods, etc.) for a dcTrack location',
    inputSchema: {
      type: 'object' as const,
      properties: { locationId: { type: 'number', description: 'Parent location ID' } },
      required: ['locationId'],
    },
  },
  {
    name: 'dctrack_get_sublocation',
    description: 'Get details of a specific sub-location',
    inputSchema: {
      type: 'object' as const,
      properties: { subLocationId: { type: 'number', description: 'Sub-location ID' } },
      required: ['subLocationId'],
    },
  },
  {
    name: 'dctrack_create_sublocation',
    description: 'Create a new sub-location in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Sub-location name' },
        locationId: { type: 'number', description: 'Parent location ID' },
        type: { type: 'string', description: 'Sub-location type' },
      },
      required: ['name', 'locationId'],
    },
  },
];
