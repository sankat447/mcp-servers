/**
 * MCP tool definitions for dcTrack projects operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackProjectsToolDefinitions = [
  {
    name: 'dctrack_get_project',
    description: 'Get a dcTrack project by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { projectId: { type: 'number', description: 'The unique project ID' } },
      required: ['projectId'],
    },
  },
  {
    name: 'dctrack_create_project',
    description: 'Create a new project in dcTrack',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectName: { type: 'string', description: 'Project name' },
        projectNumber: { type: 'string', description: 'Project number (optional, auto-generated if omitted)' },
        location: { type: 'string', description: 'Location name (e.g., "ORSTED") - required by dcTrack' },
        description: { type: 'string', description: 'Project description (optional)' },
        status: { type: 'string', description: 'Project status (optional)' },
        startDate: { type: 'string', description: 'Project start date (optional)' },
        endDate: { type: 'string', description: 'Project end date (optional)' },
        projectManager: { type: 'string', description: 'Project manager username (optional)' },
      },
      required: ['projectName'],
    },
  },
  {
    name: 'dctrack_update_project',
    description: 'Update an existing dcTrack project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'number', description: 'The project ID to update' },
        updates: { type: 'object', description: 'Fields to update (projectName, projectNumber, description, status, startDate, endDate, projectManager, etc.)' },
      },
      required: ['projectId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_project',
    description: 'Delete a dcTrack project by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { projectId: { type: 'number', description: 'The project ID to delete' } },
      required: ['projectId'],
    },
  },
];
