export const poweriqInfraToolDefinitions = [
  {
    name: 'poweriq_get_datacenter',
    description: 'Get detailed information about a specific Power IQ data center',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Data center ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_create_datacenter',
    description: 'Create a new data center in Power IQ',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Data center name' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State/province' },
        country: { type: 'string', description: 'Country' },
        capacity: { type: 'number', description: 'Capacity in kW' },
        contact_name: { type: 'string', description: 'Contact name' },
        external_key: { type: 'string', description: 'External reference key' },
      },
      required: ['name'],
    },
  },
  {
    name: 'poweriq_update_datacenter',
    description: 'Update an existing Power IQ data center',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Data center ID' },
        updates: { type: 'object', description: 'Fields to update' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_delete_datacenter',
    description: 'Delete a data center from Power IQ (deletes all descendants)',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Data center ID to delete' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_list_floors',
    description: 'List all floors in Power IQ data center hierarchy',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_list_rooms',
    description: 'List all rooms in Power IQ data center hierarchy',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_list_racks',
    description: 'List all racks in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_rack',
    description: 'Get detailed information about a specific rack',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Rack ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_get_children',
    description: 'Get child resources of a hierarchy element (e.g., rooms in a floor)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', enum: ['data_centers', 'floors', 'rooms', 'aisles', 'rows', 'racks'], description: 'Parent resource type' },
        id: { type: 'number', description: 'Parent resource ID' },
      },
      required: ['resourceType', 'id'],
    },
  },
  {
    name: 'poweriq_get_descendants',
    description: 'Get all descendant resources of a hierarchy element',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', enum: ['data_centers', 'floors', 'rooms', 'aisles', 'rows', 'racks'], description: 'Parent resource type' },
        id: { type: 'number', description: 'Parent resource ID' },
        types: { type: 'array', items: { type: 'string' }, description: 'Filter by descendant types' },
      },
      required: ['resourceType', 'id'],
    },
  },
  {
    name: 'poweriq_move_resource',
    description: 'Move a resource to a new parent in the hierarchy',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', description: 'Resource type to move' },
        id: { type: 'number', description: 'Resource ID to move' },
        targetType: { type: 'string', description: 'Target parent resource type' },
        targetId: { type: 'number', description: 'Target parent resource ID' },
      },
      required: ['resourceType', 'id', 'targetType', 'targetId'],
    },
  },
  {
    name: 'poweriq_get_executive_summary',
    description: 'Get executive summary for a data center, floor, or room',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceType: { type: 'string', enum: ['data_centers', 'floors', 'rooms'], description: 'Resource type' },
        id: { type: 'number', description: 'Resource ID' },
      },
      required: ['resourceType', 'id'],
    },
  },
];
