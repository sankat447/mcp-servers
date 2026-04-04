/**
 * MCP tool definitions for dcTrack tickets operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackTicketsToolDefinitions = [
  {
    name: 'dctrack_get_ticket',
    description: 'Get a dcTrack ticket by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { ticketId: { type: 'number', description: 'The unique ticket ID' } },
      required: ['ticketId'],
    },
  },
  {
    name: 'dctrack_create_ticket',
    description: 'Create a new ticket in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ticketDesc: { type: 'string', description: 'Ticket description' },
        ticketAction: { type: 'string', description: 'Ticket action type (optional)' },
        assignedTo: { type: 'string', description: 'Username to assign ticket to (optional)' },
        ticketComments: { type: 'string', description: 'Initial comments on the ticket (optional)' },
      },
      required: ['ticketDesc'],
    },
  },
  {
    name: 'dctrack_update_ticket',
    description: 'Update an existing dcTrack ticket',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ticketId: { type: 'number', description: 'The ticket ID to update' },
        updates: { type: 'object', description: 'Fields to update (ticketDesc, ticketAction, assignedTo, ticketStatus, ticketComments, etc.)' },
      },
      required: ['ticketId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_ticket',
    description: 'Delete a dcTrack ticket by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { ticketId: { type: 'number', description: 'The ticket ID to delete' } },
      required: ['ticketId'],
    },
  },
  {
    name: 'dctrack_search_tickets',
    description: 'Search dcTrack tickets with filters and pagination',
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
    name: 'dctrack_assign_ticket_entity',
    description: 'Assign an item or circuit to a dcTrack ticket',
    inputSchema: {
      type: 'object' as const,
      properties: {
        entityType: { type: 'string', description: 'Entity type to assign (items or circuits)' },
        ticketId: { type: 'number', description: 'Ticket ID to assign entity to' },
        entityId: { type: 'number', description: 'ID of the entity to assign' },
      },
      required: ['entityType', 'ticketId', 'entityId'],
    },
  },
  {
    name: 'dctrack_unassign_ticket_entity',
    description: 'Unassign an item or circuit from a dcTrack ticket',
    inputSchema: {
      type: 'object' as const,
      properties: {
        entityType: { type: 'string', description: 'Entity type to unassign (items or circuits)' },
        ticketId: { type: 'number', description: 'Ticket ID to unassign entity from' },
        entityId: { type: 'number', description: 'ID of the entity to unassign' },
      },
      required: ['entityType', 'ticketId', 'entityId'],
    },
  },
];
