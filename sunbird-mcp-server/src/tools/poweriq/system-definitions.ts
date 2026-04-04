export const poweriqSystemToolDefinitions = [
  {
    name: 'poweriq_get_system_info',
    description: 'Get Power IQ system info, version, and configuration',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_job',
    description: 'Get job status by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { jobId: { type: 'number', description: 'Job ID' } },
      required: ['jobId'],
    },
  },
  {
    name: 'poweriq_update_outlet',
    description: 'Update outlet properties',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Outlet ID' },
        updates: { type: 'object', description: 'Fields to update on the outlet' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_rename_outlets_batch',
    description: 'Batch rename outlets',
    inputSchema: {
      type: 'object' as const,
      properties: {
        outlets: {
          type: 'array',
          description: 'Array of outlet rename operations',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Outlet ID' },
              name: { type: 'string', description: 'New outlet name' },
            },
            required: ['id', 'name'],
          },
        },
      },
      required: ['outlets'],
    },
  },
  {
    name: 'poweriq_list_outlets',
    description: 'List all outlets with optional filtering',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pdu_id: { type: 'number', description: 'Filter by PDU ID' },
        device_id: { type: 'number', description: 'Filter by device ID' },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_get_outlet',
    description: 'Get outlet by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Outlet ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_list_inlets',
    description: 'List all inlets with optional PDU filtering',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pdu_id: { type: 'number', description: 'Filter by PDU ID' },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_list_circuits',
    description: 'List all circuits with optional PDU filtering',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pdu_id: { type: 'number', description: 'Filter by PDU ID' },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_list_panels',
    description: 'List all panels in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_panel',
    description: 'Get panel by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Panel ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_get_pue_calculations',
    description: 'Get PUE calculations',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
];
