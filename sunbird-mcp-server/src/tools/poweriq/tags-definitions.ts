export const poweriqTagsToolDefinitions = [
  {
    name: 'poweriq_list_tag_groups',
    description: 'List all tag groups in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_tag_group',
    description: 'Get tag group by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Tag group ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_create_tag_group',
    description: 'Create a new tag group',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Tag group name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'poweriq_update_tag_group',
    description: 'Update an existing tag group',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Tag group ID' },
        updates: { type: 'object', description: 'Fields to update on the tag group' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_delete_tag_group',
    description: 'Delete a tag group by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Tag group ID to delete' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_list_tags',
    description: 'List all tags in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_tag',
    description: 'Get tag by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Tag ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_create_tag',
    description: 'Create a new tag in a tag group',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tagGroupId: { type: 'number', description: 'Tag group ID to create the tag in' },
        name: { type: 'string', description: 'Tag name' },
      },
      required: ['tagGroupId', 'name'],
    },
  },
  {
    name: 'poweriq_update_tag',
    description: 'Update an existing tag',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Tag ID' },
        updates: { type: 'object', description: 'Fields to update on the tag' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_delete_tag',
    description: 'Delete a tag by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Tag ID to delete' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_create_tag_entry',
    description: 'Create a tag entry associating a tag with a resource',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tagId: { type: 'number', description: 'Tag ID' },
        taggable_type: { type: 'string', description: 'Type of resource to tag (e.g. Outlet, Pdu, Rack)' },
        taggable_id: { type: 'number', description: 'ID of the resource to tag' },
      },
      required: ['tagId', 'taggable_type', 'taggable_id'],
    },
  },
  {
    name: 'poweriq_delete_tag_entry',
    description: 'Delete a tag entry by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Tag entry ID to delete' } },
      required: ['id'],
    },
  },
];
