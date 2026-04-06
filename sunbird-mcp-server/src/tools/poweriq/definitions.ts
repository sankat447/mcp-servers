export const poweriqToolDefinitions = [
  {
    name: 'poweriq_list_datacenters',
    description: 'List all data centers configured in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_list_pdus',
    description: 'List all PDUs (Power Distribution Units) in Power IQ',
    inputSchema: {
      type: 'object' as const,
      properties: {
        datacenterId: { type: 'number', description: 'Filter by data center ID' },
        cabinetId: { type: 'number', description: 'Filter by cabinet ID' },
        pageSize: { type: 'number', default: 1000 },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_get_pdu',
    description: 'Get detailed information about a specific PDU',
    inputSchema: {
      type: 'object' as const,
      properties: { pduId: { type: 'number', description: 'PDU identifier' } },
      required: ['pduId'],
    },
  },
  {
    name: 'poweriq_get_pdu_readings',
    description: 'Get current power readings for a PDU including voltage, current, power, and power factor',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pduId: { type: 'number' },
        includeOutlets: { type: 'boolean', default: false },
      },
      required: ['pduId'],
    },
  },
  {
    name: 'poweriq_list_sensors',
    description: 'List environmental sensors in Power IQ',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sensorType: { type: 'string', enum: ['temperature', 'humidity', 'airflow', 'pressure'] },
        cabinetId: { type: 'number' },
        pageSize: { type: 'number', default: 1000 },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_get_sensor_readings',
    description: 'Get current readings for a specific sensor',
    inputSchema: {
      type: 'object' as const,
      properties: { sensorId: { type: 'number' } },
      required: ['sensorId'],
    },
  },
  {
    name: 'poweriq_get_pue',
    description: 'Get Power Usage Effectiveness (PUE) data for data centers',
    inputSchema: {
      type: 'object' as const,
      properties: {
        datacenterId: { type: 'number' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        resolution: { type: 'string', enum: ['hourly', 'daily', 'weekly', 'monthly'], default: 'hourly' },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_list_alerts',
    description: 'List active alerts from Power IQ',
    inputSchema: {
      type: 'object' as const,
      properties: {
        severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
        type: { type: 'string', enum: ['power', 'environmental', 'device', 'connectivity'] },
        acknowledged: { type: 'boolean' },
        limit: { type: 'number', default: 1000 },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_list_it_devices',
    description: 'List IT devices tracked in Power IQ with their power consumption',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number' },
        pageSize: { type: 'number', default: 1000 },
      },
      required: [],
    },
  },
  {
    name: 'poweriq_get_outlet_readings',
    description: 'Get outlet-level power readings for a PDU',
    inputSchema: {
      type: 'object' as const,
      properties: { pduId: { type: 'number' } },
      required: ['pduId'],
    },
  },
];
