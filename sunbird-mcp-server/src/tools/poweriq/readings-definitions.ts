export const poweriqReadingsToolDefinitions = [
  {
    name: 'poweriq_get_inlet_readings',
    description: 'Get power readings for a specific PDU inlet',
    inputSchema: {
      type: 'object' as const,
      properties: { inletId: { type: 'number', description: 'Inlet ID' } },
      required: ['inletId'],
    },
  },
  {
    name: 'poweriq_get_circuit_readings',
    description: 'Get power readings for a specific circuit',
    inputSchema: {
      type: 'object' as const,
      properties: { circuitId: { type: 'number', description: 'Circuit ID' } },
      required: ['circuitId'],
    },
  },
  {
    name: 'poweriq_get_rack_readings',
    description: 'Get aggregated power readings for a rack',
    inputSchema: {
      type: 'object' as const,
      properties: { rackId: { type: 'number', description: 'Rack ID' } },
      required: ['rackId'],
    },
  },
  {
    name: 'poweriq_get_readings_rollup',
    description: 'Get historical rollup readings (hourly/daily/monthly) for any resource',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', enum: ['outlets', 'inlets', 'circuits', 'sensors', 'racks', 'inlet_poles', 'circuit_breakers'], description: 'Resource type' },
        id: { type: 'number', description: 'Resource ID' },
        interval: { type: 'string', enum: ['hourly', 'daily', 'monthly'], description: 'Rollup interval' },
      },
      required: ['resourceType', 'id', 'interval'],
    },
  },
  {
    name: 'poweriq_get_latest_reading',
    description: 'Get the latest reading for any hierarchy resource (rack, room, floor, etc.)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', enum: ['data_centers', 'floors', 'rooms', 'aisles', 'rows', 'racks'], description: 'Resource type' },
        id: { type: 'number', description: 'Resource ID' },
        type: { type: 'string', description: 'Reading type (active_power, watt_hour, etc.)' },
      },
      required: ['resourceType', 'id'],
    },
  },
];
