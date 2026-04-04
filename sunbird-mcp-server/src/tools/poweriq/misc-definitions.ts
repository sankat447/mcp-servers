export const poweriqMiscToolDefinitions = [
  {
    name: 'poweriq_list_transfer_switches',
    description: 'List all transfer switches in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_transfer_switch',
    description: 'Get transfer switch by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Transfer switch ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_get_transfer_switch_states',
    description: 'Get states for a specific transfer switch',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Transfer switch ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_get_floor_map_mappable',
    description: 'Get mappable floor map resources',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_integration_registration',
    description: 'Get integration registration info',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_integration_status',
    description: 'Get integration registration status',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_list_integration_entities',
    description: 'List integrated entities',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
];
