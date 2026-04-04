export const poweriqAssetsToolDefinitions = [
  {
    name: 'poweriq_list_asset_strips',
    description: 'List all asset strips in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_asset_strip',
    description: 'Get asset strip by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Asset strip ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_update_asset_strip',
    description: 'Update asset strip properties such as LED colors',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Asset strip ID' },
        updates: { type: 'object', description: 'Fields to update (e.g. LED colors, settings)' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_get_asset_strip_rack_units',
    description: 'Get rack units on a specific asset strip',
    inputSchema: {
      type: 'object' as const,
      properties: { assetStripId: { type: 'number', description: 'Asset strip ID' } },
      required: ['assetStripId'],
    },
  },
  {
    name: 'poweriq_list_rack_units',
    description: 'List all rack units in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'poweriq_get_rack_unit',
    description: 'Get rack unit by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Rack unit ID' } },
      required: ['id'],
    },
  },
  {
    name: 'poweriq_update_rack_unit',
    description: 'Update rack unit properties',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Rack unit ID' },
        updates: { type: 'object', description: 'Fields to update on the rack unit' },
      },
      required: ['id', 'updates'],
    },
  },
  {
    name: 'poweriq_get_rack_unit_blade_slots',
    description: 'Get blade slots for a specific rack unit',
    inputSchema: {
      type: 'object' as const,
      properties: { rackUnitId: { type: 'number', description: 'Rack unit ID' } },
      required: ['rackUnitId'],
    },
  },
  {
    name: 'poweriq_list_blade_slots',
    description: 'List all blade slots in Power IQ',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
];
