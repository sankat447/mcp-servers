/**
 * MCP tool definitions for dcTrack ports operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackPortsToolDefinitions = [
  {
    name: 'dctrack_list_data_ports',
    description: 'List all data ports on a dcTrack item/device',
    inputSchema: {
      type: 'object' as const,
      properties: { itemId: { type: 'number', description: 'Item ID to list data ports for' } },
      required: ['itemId'],
    },
  },
  {
    name: 'dctrack_get_data_port',
    description: 'Get details of a specific data port on an item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID' },
        portId: { type: 'number', description: 'Data port ID' },
      },
      required: ['itemId', 'portId'],
    },
  },
  {
    name: 'dctrack_create_data_port',
    description: 'Create a new data port on a dcTrack item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID to add port to' },
        portName: { type: 'string', description: 'Port name' },
        portSubclass: { type: 'string', description: 'Port subclass (Physical, Virtual, VLAN)' },
        connector: { type: 'string', description: 'Connector type (RJ45, LC, SC, etc.)' },
        mediaType: { type: 'string', description: 'Media type' },
        protocol: { type: 'string', description: 'Protocol' },
        dataRate: { type: 'string', description: 'Data rate' },
      },
      required: ['itemId', 'portName'],
    },
  },
  {
    name: 'dctrack_update_data_port',
    description: 'Update an existing data port on a dcTrack item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID' },
        portId: { type: 'number', description: 'Port ID to update' },
        updates: { type: 'object', description: 'Fields to update' },
      },
      required: ['itemId', 'portId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_data_port',
    description: 'Delete a data port from a dcTrack item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID' },
        portId: { type: 'number', description: 'Port ID to delete' },
      },
      required: ['itemId', 'portId'],
    },
  },
  {
    name: 'dctrack_list_power_ports',
    description: 'List all power ports on a dcTrack item/device',
    inputSchema: {
      type: 'object' as const,
      properties: { itemId: { type: 'number', description: 'Item ID to list power ports for' } },
      required: ['itemId'],
    },
  },
];
