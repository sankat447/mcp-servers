/**
 * Request handler for dcTrack tickets tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const getTicketSchema = z.object({ ticketId: z.number() });
const createTicketSchema = z.object({
  ticketDesc: z.string(),
  ticketAction: z.string().optional(),
  assignedTo: z.string().optional(),
  ticketComments: z.string().optional(),
});
const updateTicketSchema = z.object({ ticketId: z.number(), updates: z.record(z.any()) });
const deleteTicketSchema = z.object({ ticketId: z.number() });
const searchTicketsSchema = z.object({
  filters: z.any().optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(50),
});
const assignTicketEntitySchema = z.object({
  entityType: z.string(),
  ticketId: z.number(),
  entityId: z.number(),
});
const unassignTicketEntitySchema = z.object({
  entityType: z.string(),
  ticketId: z.number(),
  entityId: z.number(),
});

export async function handleDcTrackTicketsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack tickets tool');

  switch (toolName) {
    case 'dctrack_get_ticket':
      return dctrackClient.getTicket(getTicketSchema.parse(args).ticketId);

    case 'dctrack_create_ticket':
      return dctrackClient.createTicket(createTicketSchema.parse(args));

    case 'dctrack_update_ticket': {
      const p = updateTicketSchema.parse(args);
      return dctrackClient.updateTicket(p.ticketId, p.updates);
    }

    case 'dctrack_delete_ticket':
      return dctrackClient.deleteTicket(deleteTicketSchema.parse(args).ticketId);

    case 'dctrack_search_tickets': {
      const p = searchTicketsSchema.parse(args);
      return dctrackClient.searchTickets({ columns: p.filters, pageNumber: p.pageNumber, pageSize: p.pageSize });
    }

    case 'dctrack_assign_ticket_entity': {
      const p = assignTicketEntitySchema.parse(args);
      return dctrackClient.assignTicketEntity(p.entityType, p.ticketId, p.entityId);
    }

    case 'dctrack_unassign_ticket_entity': {
      const p = unassignTicketEntitySchema.parse(args);
      return dctrackClient.unassignTicketEntity(p.entityType, p.ticketId, p.entityId);
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
