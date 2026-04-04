import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const createPDUSchema = z.object({
  ip_address: z.string(), snmp_community_string: z.string().optional(),
  proxy_index: z.number().optional(), snmp3_enabled: z.boolean().optional(),
  snmp3_user: z.string().optional(), snmp3_auth_level: z.string().optional(),
});
const updatePDUSchema = z.object({ id: z.number(), updates: z.record(z.any()) });
const idSchema = z.object({ id: z.number() });
const batchCreateSchema = z.object({ pdus: z.array(z.record(z.any())) });

export async function handlePowerIQPduWriteTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ PDU write tool');

  switch (toolName) {
    case 'poweriq_create_pdu':
      return poweriqClient.createPDU(createPDUSchema.parse(args));
    case 'poweriq_update_pdu': {
      const p = updatePDUSchema.parse(args);
      return poweriqClient.updatePDU(p.id, p.updates);
    }
    case 'poweriq_delete_pdu':
      return poweriqClient.deletePDU(idSchema.parse(args).id);
    case 'poweriq_rescan_pdu':
      return poweriqClient.rescanPDU(idSchema.parse(args).id);
    case 'poweriq_batch_create_pdus':
      return poweriqClient.batchCreatePDUs(batchCreateSchema.parse(args).pdus);
    default:
      throw new ToolNotFoundError(toolName);
  }
}
