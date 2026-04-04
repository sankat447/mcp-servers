import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const idSchema = z.object({ id: z.number() });
const jobSchema = z.object({ jobId: z.number() });
const updateOutletSchema = z.object({ id: z.number(), updates: z.record(z.any()) });
const renameOutletsBatchSchema = z.object({
  outlets: z.array(z.object({ id: z.number(), name: z.string() })),
});
const listOutletsSchema = z.object({
  pdu_id: z.number().optional(),
  device_id: z.number().optional(),
});
const listInletsSchema = z.object({ pdu_id: z.number().optional() });
const listCircuitsSchema = z.object({ pdu_id: z.number().optional() });

export async function handlePowerIQSystemTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ system tool');

  switch (toolName) {
    case 'poweriq_get_system_info':
      return poweriqClient.getSystemInfo();
    case 'poweriq_get_job':
      return poweriqClient.listJobs(jobSchema.parse(args).jobId);
    case 'poweriq_update_outlet': {
      const p = updateOutletSchema.parse(args);
      return poweriqClient.updateOutlet(p.id, p.updates);
    }
    case 'poweriq_rename_outlets_batch':
      return poweriqClient.renameOutletsBatch(renameOutletsBatchSchema.parse(args).outlets);
    case 'poweriq_list_outlets': {
      const p = listOutletsSchema.parse(args);
      const params: Record<string, any> = {};
      if (p.pdu_id !== undefined) params.pdu_id = p.pdu_id;
      if (p.device_id !== undefined) params.device_id = p.device_id;
      return poweriqClient.listOutlets(params);
    }
    case 'poweriq_get_outlet':
      return poweriqClient.getOutlet(idSchema.parse(args).id);
    case 'poweriq_list_inlets': {
      const p = listInletsSchema.parse(args);
      const params: Record<string, any> = {};
      if (p.pdu_id !== undefined) params.pdu_id = p.pdu_id;
      return poweriqClient.listInlets(params);
    }
    case 'poweriq_list_circuits': {
      const p = listCircuitsSchema.parse(args);
      const params: Record<string, any> = {};
      if (p.pdu_id !== undefined) params.pdu_id = p.pdu_id;
      return poweriqClient.listCircuits(params);
    }
    case 'poweriq_list_panels':
      return poweriqClient.listPanels();
    case 'poweriq_get_panel':
      return poweriqClient.getPanel(idSchema.parse(args).id);
    case 'poweriq_get_pue_calculations':
      return poweriqClient.getPUECalculations();
    default:
      throw new ToolNotFoundError(toolName);
  }
}
