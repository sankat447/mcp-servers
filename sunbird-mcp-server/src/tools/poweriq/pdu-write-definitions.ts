export const poweriqPduWriteToolDefinitions = [
  {
    name: 'poweriq_create_pdu',
    description: 'Add a new PDU to Power IQ for monitoring',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ip_address: { type: 'string', description: 'PDU IP address' },
        snmp_community_string: { type: 'string', description: 'SNMP community string' },
        proxy_index: { type: 'number', description: 'Proxy index (0 for standalone)' },
        snmp3_enabled: { type: 'boolean', description: 'Enable SNMPv3' },
        snmp3_user: { type: 'string', description: 'SNMPv3 username' },
        snmp3_auth_level: { type: 'string', description: 'SNMPv3 auth level' },
      },
      required: ['ip_address'],
    },
  },
  {
    name: 'poweriq_update_pdu',
    description: 'Update a PDU configuration in Power IQ',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'PDU ID' },
        updates: { type: 'object', description: 'Fields to update (name, contact, location, etc.)' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_delete_pdu',
    description: 'Delete a PDU from Power IQ (readings permanently lost)',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'PDU ID to delete' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_rescan_pdu',
    description: 'Trigger an immediate rescan/poll of a PDU',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'PDU ID to rescan' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_batch_create_pdus',
    description: 'Add multiple PDUs to Power IQ in one async batch operation',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pdus: { type: 'array', items: { type: 'object' }, description: 'Array of PDU objects with ip_address and SNMP settings' },
      },
      required: ['pdus'],
    },
  },
];
