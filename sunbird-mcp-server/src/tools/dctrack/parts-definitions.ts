/**
 * MCP tool definitions for dcTrack parts operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackPartsToolDefinitions = [
  {
    name: 'dctrack_list_part_classes',
    description: 'List all part classes in dcTrack',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_create_part_class',
    description: 'Create a new part class in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        className: { type: 'string', description: 'Name of the part class' },
      },
      required: ['className'],
    },
  },
  {
    name: 'dctrack_get_part_model',
    description: 'Get a part model by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { modelId: { type: 'number', description: 'The unique part model ID' } },
      required: ['modelId'],
    },
  },
  {
    name: 'dctrack_create_part_model',
    description: 'Create a new part model in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        modelName: { type: 'string', description: 'Part model name' },
        make: { type: 'string', description: 'Manufacturer name' },
      },
      required: ['modelName', 'make'],
    },
  },
  {
    name: 'dctrack_search_part_models',
    description: 'Search part models with filters and pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: { type: 'object', description: 'Search filters - array of {name, filter: {eq/lt/gt/in}} objects' },
        pageNumber: { type: 'number', description: 'Page number (0-based)', default: 0 },
        pageSize: { type: 'number', description: 'Results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_part',
    description: 'Get a part instance by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { partId: { type: 'number', description: 'The unique part ID' } },
      required: ['partId'],
    },
  },
  {
    name: 'dctrack_create_part',
    description: 'Create a new part instance in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        partModelId: { type: 'number', description: 'Part model ID' },
        locationId: { type: 'number', description: 'Location ID for the part (optional)' },
        quantity: { type: 'number', description: 'Quantity of parts (optional)' },
        serialNumber: { type: 'string', description: 'Serial number of the part (optional)' },
      },
      required: ['partModelId'],
    },
  },
  {
    name: 'dctrack_update_part',
    description: 'Update an existing part instance',
    inputSchema: {
      type: 'object' as const,
      properties: {
        partId: { type: 'number', description: 'The part ID to update' },
        updates: { type: 'object', description: 'Fields to update (locationId, quantity, serialNumber, etc.)' },
      },
      required: ['partId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_part',
    description: 'Delete a part instance by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { partId: { type: 'number', description: 'The part ID to delete' } },
      required: ['partId'],
    },
  },
  {
    name: 'dctrack_search_parts',
    description: 'Search part instances with filters and pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: { type: 'object', description: 'Search filters - array of {name, filter: {eq/lt/gt/in}} objects' },
        pageNumber: { type: 'number', description: 'Page number (0-based)', default: 0 },
        pageSize: { type: 'number', description: 'Results per page', default: 50 },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_adjust_stock',
    description: 'Adjust or transfer part stock quantity',
    inputSchema: {
      type: 'object' as const,
      properties: {
        partId: { type: 'number', description: 'The part ID to adjust stock for' },
        activity: { type: 'string', enum: ['adjust', 'transfer'], description: 'Stock activity type' },
        quantity: { type: 'number', description: 'Quantity to adjust or transfer' },
        locationId: { type: 'number', description: 'Target location ID (optional, used for transfer)' },
      },
      required: ['partId', 'activity', 'quantity'],
    },
  },
  {
    name: 'dctrack_assign_parts',
    description: 'Assign parts to items or ports',
    inputSchema: {
      type: 'object' as const,
      properties: {
        assignmentType: { type: 'string', enum: ['ITEMS', 'PORTS'], description: 'Assignment target type' },
        assignments: { type: 'array', items: { type: 'object' }, description: 'Array of assignment objects' },
      },
      required: ['assignmentType', 'assignments'],
    },
  },
];
