import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const idSchema = z.object({ id: z.number() });
const updateSchema = z.object({ id: z.number(), updates: z.record(z.any()) });
const assetStripIdSchema = z.object({ assetStripId: z.number() });
const rackUnitIdSchema = z.object({ rackUnitId: z.number() });

export async function handlePowerIQAssetsTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ assets tool');

  switch (toolName) {
    case 'poweriq_list_asset_strips':
      return poweriqClient.listAssetStrips();
    case 'poweriq_get_asset_strip':
      return poweriqClient.getAssetStrip(idSchema.parse(args).id);
    case 'poweriq_update_asset_strip': {
      const p = updateSchema.parse(args);
      return poweriqClient.updateAssetStrip(p.id, p.updates);
    }
    case 'poweriq_get_asset_strip_rack_units':
      return poweriqClient.getAssetStripRackUnits(assetStripIdSchema.parse(args).assetStripId);
    case 'poweriq_list_rack_units':
      return poweriqClient.listRackUnits();
    case 'poweriq_get_rack_unit':
      return poweriqClient.getRackUnit(idSchema.parse(args).id);
    case 'poweriq_update_rack_unit': {
      const p = updateSchema.parse(args);
      return poweriqClient.updateRackUnit(p.id, p.updates);
    }
    case 'poweriq_get_rack_unit_blade_slots':
      return poweriqClient.getRackUnitBladeSlots(rackUnitIdSchema.parse(args).rackUnitId);
    case 'poweriq_list_blade_slots':
      return poweriqClient.listBladeSlots();
    default:
      throw new ToolNotFoundError(toolName);
  }
}
