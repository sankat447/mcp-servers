/**
 * MCP tool definitions for dcTrack projects operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackProjectsToolDefinitions = [
  {
    name: 'dctrack_get_project',
    description: 'Get a dcTrack project. Provide projectName (preferred) or projectId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'number', description: 'Project ID (provide this OR projectName)' },
        projectName: { type: 'string', description: 'Project name (e.g. "RM01-AI-CAB-01 Lifecycle") — auto-resolves to projectId. Preferred.' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_create_project',
    description: 'Create a new project in dcTrack. Valid status values: "In Progress", "Complete".',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectName: { type: 'string', description: 'Project name' },
        projectNumber: { type: 'string', description: 'Project number (optional, auto-generated if omitted)' },
        location: { type: 'string', description: 'Location name (e.g., "AI-ROOM-01")' },
        description: { type: 'string', description: 'Project description' },
        status: { type: 'string', description: 'Status: "In Progress" or "Complete"' },
        startDate: { type: 'string', description: 'Start date (optional)' },
        endDate: { type: 'string', description: 'End date (optional)' },
        projectManager: { type: 'string', description: 'Project manager (optional)' },
      },
      required: ['projectName'],
    },
  },
  {
    name: 'dctrack_update_project',
    description: 'Update a dcTrack project. Provide projectName (preferred) or projectId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'number', description: 'Project ID (provide this OR projectName)' },
        projectName: { type: 'string', description: 'Project name — auto-resolves to ID. Preferred.' },
        updates: { type: 'object', description: 'Fields to update (status, description, etc.)' },
      },
      required: ['updates'],
    },
  },
  {
    name: 'dctrack_delete_project',
    description: 'Delete a dcTrack project. Provide projectName (preferred) or projectId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'number', description: 'Project ID (provide this OR projectName)' },
        projectName: { type: 'string', description: 'Project name — auto-resolves to ID. Preferred.' },
      },
      required: [],
    },
  },
];
