export const poweriqEventsToolDefinitions = [
  {
    name: 'poweriq_list_events',
    description: 'List events/alerts from Power IQ with optional filtering',
    inputSchema: {
      type: 'object' as const,
      properties: {
        severity: { type: 'string', enum: ['CRITICAL', 'WARNING', 'INFORMATIONAL'], description: 'Filter by severity' },
        eventable_type: { type: 'string', description: 'Filter by source type (Pdu, Outlet, Sensor, etc.)' },
        eventable_id: { type: 'number', description: 'Filter by source resource ID' },
        limit: { type: 'number', description: 'Max results to return' },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_get_event',
    description: 'Get details of a specific event',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Event ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_clear_event',
    description: 'Clear/acknowledge a single event',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Event ID to clear' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_clear_events_batch',
    description: 'Clear/acknowledge multiple events at once',
    inputSchema: {
      type: 'object' as const,
      properties: {
        eventIds: { type: 'array', items: { type: 'number' }, description: 'List of event IDs to clear' },
      },
      required: ['eventIds'],
    },
  },
];
