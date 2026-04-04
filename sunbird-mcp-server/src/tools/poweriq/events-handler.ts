import { poweriqClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const listEventsSchema = z.object({
  severity: z.string().optional(), eventable_type: z.string().optional(),
  eventable_id: z.number().optional(), limit: z.number().optional(),
});
const idSchema = z.object({ id: z.number() });
const batchSchema = z.object({ eventIds: z.array(z.number()) });

export async function handlePowerIQEventsTool(toolName: string, args: Record<string, any>): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling Power IQ events tool');

  switch (toolName) {
    case 'poweriq_list_events': {
      const p = listEventsSchema.parse(args);
      const params: Record<string, any> = {};
      if (p.severity) params['severity_eq'] = p.severity;
      if (p.eventable_type) params['eventable_type_eq'] = p.eventable_type;
      if (p.eventable_id) params['eventable_id_eq'] = p.eventable_id;
      if (p.limit) params['limit'] = p.limit;
      return poweriqClient.listEvents(params);
    }
    case 'poweriq_get_event':
      return poweriqClient.getEvent(idSchema.parse(args).id);
    case 'poweriq_clear_event':
      return poweriqClient.clearEvent(idSchema.parse(args).id);
    case 'poweriq_clear_events_batch':
      return poweriqClient.clearEventsBatch(batchSchema.parse(args).eventIds);
    default:
      throw new ToolNotFoundError(toolName);
  }
}
