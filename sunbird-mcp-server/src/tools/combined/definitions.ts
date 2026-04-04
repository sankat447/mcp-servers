export const combinedToolDefinitions = [
  {
    name: 'dcim_get_rack_summary',
    description: 'Get comprehensive rack/cabinet summary combining dcTrack asset data with Power IQ power and thermal readings',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cabinetId: { type: 'number', description: 'dcTrack cabinet ID' },
        cabinetName: { type: 'string', description: 'Cabinet name (alternative to ID)' },
      },
      required: [],
    },
  },
  {
    name: 'dcim_find_capacity',
    description: 'Find available capacity across data centers matching requirements for space and power',
    inputSchema: {
      type: 'object' as const,
      properties: {
        requiredU: { type: 'number' },
        requiredPowerKw: { type: 'number' },
        requiredPorts: { type: 'number' },
        locationId: { type: 'number' },
        contiguous: { type: 'boolean', default: true },
      },
      required: ['requiredU', 'requiredPowerKw'],
    },
  },
  {
    name: 'dcim_get_health_status',
    description: 'Get overall health status of data center infrastructure',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number' },
        includeAlerts: { type: 'boolean', default: true },
        includePUE: { type: 'boolean', default: true },
      },
      required: [],
    },
  },
  {
    name: 'dcim_identify_ghost_servers',
    description: 'Identify potential ghost servers with minimal or no power consumption',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number' },
        powerThresholdWatts: { type: 'number', default: 10 },
      },
      required: [],
    },
  },
  {
    name: 'dcim_get_power_chain',
    description: 'Trace the complete power chain for a device from outlet to UPS/utility',
    inputSchema: {
      type: 'object' as const,
      properties: { itemId: { type: 'number' } },
      required: ['itemId'],
    },
  },
  {
    name: 'dcim_thermal_analysis',
    description: 'Get thermal analysis including hotspots, cooling efficiency, and ASHRAE compliance',
    inputSchema: {
      type: 'object' as const,
      properties: {
        locationId: { type: 'number' },
        cabinetId: { type: 'number' },
        includeRecommendations: { type: 'boolean', default: true },
      },
      required: [],
    },
  },
];
