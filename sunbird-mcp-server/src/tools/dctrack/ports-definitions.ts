/**
 * MCP tool definitions for dcTrack ports operations.
 *
 * Each object matches the MCP SDK Tool shape: name, description, inputSchema.
 */

export const dctrackPortsToolDefinitions = [
  {
    name: 'dctrack_list_data_ports',
    description: 'List all data ports on a dcTrack item/device. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name (e.g. "AI-CAB-01 CISCO NEXUS-9236C U10") — auto-resolves to itemId. Preferred.' },
      },
      required: [],
    },
  },
  {
    name: 'dctrack_get_data_port',
    description: 'Get details of a specific data port on an item. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name — auto-resolves to itemId. Preferred.' },
        portId: { type: 'number', description: 'Data port ID' },
      },
      required: ['portId'],
    },
  },
  {
    name: 'dctrack_create_data_port',
    description: 'Create a new data port on a dcTrack item. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name — auto-resolves to itemId. Preferred.' },
        portName: { type: 'string', description: 'Port name' },
        portSubclass: { type: 'string', description: 'Port subclass (Physical, Virtual, VLAN)' },
        connector: { type: 'string', description: 'Connector type (RJ45, LC, SC, QSFP28, etc.)' },
        mediaType: { type: 'string', description: 'Media type (Cat6, Fiber, etc.)' },
        protocol: { type: 'string', description: 'Protocol (Ethernet, etc.)' },
        dataRate: { type: 'string', description: 'Data rate (1GbE, 10GbE, 100GbE, etc.)' },
      },
      required: ['portName'],
    },
  },
  {
    name: 'dctrack_update_data_port',
    description: 'Update an existing data port on a dcTrack item. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name — auto-resolves to itemId. Preferred.' },
        portId: { type: 'number', description: 'Port ID to update' },
        updates: { type: 'object', description: 'Fields to update' },
      },
      required: ['portId', 'updates'],
    },
  },
  {
    name: 'dctrack_delete_data_port',
    description: 'Delete a data port from a dcTrack item. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name — auto-resolves to itemId. Preferred.' },
        portId: { type: 'number', description: 'Port ID to delete' },
      },
      required: ['portId'],
    },
  },
  {
    name: 'dctrack_list_power_ports',
    description: 'List all power ports on a dcTrack item/device. Provide itemName (preferred) or itemId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        itemId: { type: 'number', description: 'Item ID (provide this OR itemName)' },
        itemName: { type: 'string', description: 'Item name (e.g. "AI-CAB-01 178B-01 PDU 1") — auto-resolves to itemId. Preferred.' },
      },
      required: [],
    },
  },
];
