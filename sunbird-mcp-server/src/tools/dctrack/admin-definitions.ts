/**
 * MCP tool definitions for dcTrack admin/configuration operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackAdminToolDefinitions = [
  // CUSTOM FIELDS
  {
    name: 'dctrack_list_custom_fields',
    description: 'List all custom fields defined in dcTrack',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_get_custom_field',
    description: 'Get a custom field by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { customFieldId: { type: 'number', description: 'The unique custom field ID' } },
      required: ['customFieldId'],
    },
  },
  {
    name: 'dctrack_create_custom_field',
    description: 'Create a new custom field in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label: { type: 'string', description: 'Display label for the custom field' },
        fieldType: { type: 'string', description: 'Field type (text, number, date, picklist, etc.)' },
        appliedTo: { type: 'string', description: 'Entity type the field applies to (optional)' },
        options: { type: 'array', items: { type: 'string' }, description: 'Picklist options (optional)' },
      },
      required: ['label', 'fieldType'],
    },
  },
  {
    name: 'dctrack_update_custom_field',
    description: 'Update an existing custom field',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customFieldId: { type: 'number', description: 'The custom field ID to update' },
        updates: { type: 'object', description: 'Fields to update (label, fieldType, appliedTo, options, etc.)' },
      },
      required: ['customFieldId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_custom_field',
    description: 'Delete a custom field by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { customFieldId: { type: 'number', description: 'The custom field ID to delete' } },
      required: ['customFieldId'],
    },
  },

  // AUDIT TRAIL
  {
    name: 'dctrack_search_audit_trail',
    description: 'Search the dcTrack audit trail with filters and pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: { type: 'object', description: 'Search filters - array of {name, filter: {eq/lt/gt/in}} objects' },
        selectedColumns: { type: 'array', items: { type: 'object' }, description: 'Columns to return in results (optional)' },
        pageNumber: { type: 'number', description: 'Page number (0-based)', default: 0 },
        pageSize: { type: 'number', description: 'Results per page', default: 1000 },
      },
      required: [],
    },
  },

  // CHARTS / REPORTS
  {
    name: 'dctrack_list_charts',
    description: 'List all charts and reports available in dcTrack',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_get_chart',
    description: 'Get a chart or report definition by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { chartId: { type: 'number', description: 'The unique chart/report ID' } },
      required: ['chartId'],
    },
  },
  {
    name: 'dctrack_get_chart_data',
    description: 'Get chart or report data by chart ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        chartId: { type: 'number', description: 'The chart/report ID' },
        params: { type: 'object', description: 'Additional query parameters (optional)' },
      },
      required: ['chartId'],
    },
  },

  // BREAKERS
  {
    name: 'dctrack_list_breakers',
    description: 'List all breakers on a panel item',
    inputSchema: {
      type: 'object' as const,
      properties: { panelItemId: { type: 'number', description: 'Panel item ID to list breakers for' } },
      required: ['panelItemId'],
    },
  },
  {
    name: 'dctrack_create_breaker',
    description: 'Create a new breaker on a panel item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        panelItemId: { type: 'number', description: 'Panel item ID to add breaker to' },
        breaker: { type: 'object', description: 'Breaker configuration object' },
      },
      required: ['panelItemId', 'breaker'],
    },
  },
  {
    name: 'dctrack_update_breaker',
    description: 'Update an existing breaker on a panel item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        panelItemId: { type: 'number', description: 'Panel item ID' },
        breakerPortId: { type: 'number', description: 'Breaker port ID to update' },
        updates: { type: 'object', description: 'Fields to update' },
      },
      required: ['panelItemId', 'breakerPortId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_breaker',
    description: 'Delete a breaker from a panel item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        panelItemId: { type: 'number', description: 'Panel item ID' },
        breakerPortId: { type: 'number', description: 'Breaker port ID to delete' },
      },
      required: ['panelItemId', 'breakerPortId'],
    },
  },

  // LOOKUP LISTS
  {
    name: 'dctrack_get_lookup_list',
    description: 'Get a lookup list by type, optionally filtered by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listType: { type: 'string', description: 'Lookup list type (e.g. locations, models, etc.)' },
        id: { type: 'number', description: 'Optional ID to filter lookup results' },
      },
      required: ['listType'],
    },
  },
  {
    name: 'dctrack_get_picklist_options',
    description: 'Get picklist dropdown options for a given list type',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listType: { type: 'string', description: 'Picklist type to retrieve options for' },
      },
      required: ['listType'],
    },
  },

  // WEBHOOKS
  {
    name: 'dctrack_get_webhook_config',
    description: 'Get the current dcTrack webhook/notification configuration',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_update_webhook_config',
    description: 'Update the dcTrack webhook/notification configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        config: { type: 'object', description: 'Webhook configuration object (url, events, enabled, etc.)' },
      },
      required: ['config'],
    },
  },
  {
    name: 'dctrack_delete_webhook_config',
    description: 'Delete the dcTrack webhook/notification configuration',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },

  // RELATIONSHIPS
  {
    name: 'dctrack_get_relationship',
    description: 'Get a relationship by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'The unique relationship ID' } },
      required: ['id'],
    },
  },
  {
    name: 'dctrack_create_relationship',
    description: 'Create a new entity relationship/link in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        relationship: { type: 'object', description: 'Relationship object (entityType1, entityId1, entityType2, entityId2, relationshipType, etc.)' },
      },
      required: ['relationship'],
    },
  },
  {
    name: 'dctrack_search_relationships',
    description: 'Search relationships by criteria',
    inputSchema: {
      type: 'object' as const,
      properties: {
        params: { type: 'object', description: 'Search parameters (entityType, entityId, relationshipType, etc.)' },
      },
      required: ['params'],
    },
  },
  {
    name: 'dctrack_delete_relationship',
    description: 'Delete a relationship by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'The relationship ID to delete' } },
      required: ['id'],
    },
  },

  // PERMISSIONS
  {
    name: 'dctrack_list_permissions',
    description: 'List all explicit permissions in dcTrack',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_create_permission',
    description: 'Create a new explicit permission in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        permission: { type: 'object', description: 'Permission object (username, entityType, entityId, accessLevel, etc.)' },
      },
      required: ['permission'],
    },
  },
  {
    name: 'dctrack_update_permission',
    description: 'Update an existing explicit permission',
    inputSchema: {
      type: 'object' as const,
      properties: {
        permissionId: { type: 'number', description: 'The permission ID to update' },
        updates: { type: 'object', description: 'Fields to update (accessLevel, etc.)' },
      },
      required: ['permissionId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_permission',
    description: 'Delete an explicit permission by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { permissionId: { type: 'number', description: 'The permission ID to delete' } },
      required: ['permissionId'],
    },
  },

  // FLOORMAP CONFIG
  {
    name: 'dctrack_get_floormap_config',
    description: 'Get the floormap visualization configuration for a location',
    inputSchema: {
      type: 'object' as const,
      properties: { locationId: { type: 'number', description: 'Location ID to get floormap config for' } },
      required: ['locationId'],
    },
  },
  {
    name: 'dctrack_list_floormap_configs',
    description: 'List all floormap visualization configurations',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'dctrack_update_floormap_config',
    description: 'Update the floormap visualization configuration for a location',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number', description: 'Location ID to update floormap config for' },
        config: { type: 'object', description: 'Floormap configuration object' },
      },
      required: ['locationId', 'config'],
    },
  },

  // LOCATION FAVORITES
  {
    name: 'dctrack_get_location_favorites',
    description: 'Get favorite entities for a user by entity type',
    inputSchema: {
      type: 'object' as const,
      properties: {
        username: { type: 'string', description: 'Username to retrieve favorites for' },
        entityType: { type: 'string', description: 'Entity type to retrieve favorites for (locations, cabinets, etc.)' },
      },
      required: ['username', 'entityType'],
    },
  },
];
