/**
 * MCP tool definitions for dcTrack makes/models operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackMakesToolDefinitions = [
  {
    name: 'dctrack_list_makes',
    description: 'List ALL manufacturers (makes) — returns the full unfiltered list. Use dctrack_search_makes instead when searching by name.',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_get_make',
    description: 'Get details of a specific manufacturer/make by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { makeId: { type: 'number', description: 'The unique make ID' } },
      required: ['makeId'],
    },
  },
  {
    name: 'dctrack_create_make',
    description: 'Create a new manufacturer/make in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        makeName: { type: 'string', description: 'Manufacturer name' },
        accountNumber: { type: 'string', description: 'Account number (optional)' },
        aliases: { type: 'array', items: { type: 'string' }, description: 'Alternative names' },
        notes: { type: 'string', description: 'Notes' },
      },
      required: ['makeName'],
    },
  },
  {
    name: 'dctrack_update_make',
    description: 'Update an existing manufacturer/make',
    inputSchema: {
      type: 'object' as const,
      properties: {
        makeId: { type: 'number', description: 'The make ID to update' },
        updates: { type: 'object', description: 'Fields to update (makeName, accountNumber, aliases, notes, technicalSupport)' },
      },
      required: ['makeId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_make',
    description: 'Delete a manufacturer/make from dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: { makeId: { type: 'number', description: 'The make ID to delete' } },
      required: ['makeId'],
    },
  },
  {
    name: 'dctrack_search_makes',
    description: 'Search for a manufacturer/make by name. Use this when the user wants to find a specific make like "Dell", "Cisco", "APC". Returns matching makes only.',
    inputSchema: {
      type: 'object' as const,
      properties: { searchString: { type: 'string', description: 'Manufacturer name to search (e.g., "Dell", "Cisco")' } },
      required: ['searchString'],
    },
  },
  {
    name: 'dctrack_create_model',
    description: 'Create a new equipment model in dcTrack model library',
    inputSchema: {
      type: 'object' as const,
      properties: {
        model: { type: 'string', description: 'Model name' },
        make: { type: 'string', description: 'Manufacturer name' },
        class: { type: 'string', description: 'Model class (Device, Network, RackPDU, Cabinet, etc.)' },
        subclass: { type: 'string', description: 'Model subclass (e.g., "Network Stack", "BladeChassis", "Server") - required' },
        mounting: { type: 'string', enum: ['Rackable', 'Non-Rackable', 'Free-Standing'], description: 'Mounting type' },
        formFactor: { type: 'string', enum: ['Fixed', 'Chassis', 'Blade'], description: 'Form factor' },
        ruHeight: { type: 'number', description: 'Height in rack units' },
        dimHeight: { type: 'number', description: 'Physical height in inches' },
        dimWidth: { type: 'number', description: 'Physical width in inches' },
        dimDepth: { type: 'number', description: 'Physical depth in inches' },
        weight: { type: 'number', description: 'Weight in pounds' },
      },
      required: ['model', 'make', 'class'],
    },
  },
  {
    name: 'dctrack_update_model',
    description: 'Update an existing equipment model (PUT - full replace, include all fields)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        modelId: { type: 'number', description: 'Model ID to update' },
        model: { type: 'object', description: 'Complete model object with all fields' },
      },
      required: ['modelId', 'model'],
    },
  },
  {
    name: 'dctrack_delete_model',
    description: 'Delete an equipment model from dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: { modelId: { type: 'number', description: 'Model ID to delete' } },
      required: ['modelId'],
    },
  },
  {
    name: 'dctrack_search_models',
    description: 'Search equipment models with filters and pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: { type: 'object', description: 'Search filters - array of {name, filter: {eq/lt/gt/in}} objects' },
        pageNumber: { type: 'number', description: 'Page number (0-based)', default: 0 },
        pageSize: { type: 'number', description: 'Results per page', default: 1000 },
      },
      required: [],
    },
  },
];
