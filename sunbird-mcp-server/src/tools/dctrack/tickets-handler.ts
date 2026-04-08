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
  ticketDesc: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  ticketAction: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  ticketComments: z.string().nullable().optional(),
  ticketPurpose: z.string().nullable().optional(),
  ticketType: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  severity: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
}).passthrough();
const updateTicketSchema = z.object({ ticketId: z.number(), updates: z.record(z.any()) });
const deleteTicketSchema = z.object({ ticketId: z.number() });
const searchTicketsSchema = z.object({
  filters: z.any().optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(1000),
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

    case 'dctrack_create_ticket': {
      const parsed = createTicketSchema.parse(args);
      // Build payload with every possible field name dcTrack might accept
      const desc = parsed.ticketDesc || parsed.summary || parsed.description || '';
      const clean: Record<string, any> = {};
      // Strip nulls and pass everything through
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== null && v !== undefined) clean[k] = v;
      }
      // Ensure desc is set in multiple field name patterns
      if (desc) {
        clean.ticketDesc = desc;
        clean.summary = parsed.summary || desc;
        clean.description = parsed.description || desc;
        clean.tiSummary = parsed.summary || desc;
        clean.tiDescription = parsed.description || desc;
      }
      // Priority/severity cause "Invalid ticket priority" on this dcTrack instance
      // Store them in the description instead
      delete clean.priority; delete clean.cmbPriority;
      delete clean.severity; delete clean.cmbSeverity;
      if (parsed.priority) {
        clean.description = (clean.description || clean.summary || '') + ' [Priority: ' + parsed.priority + ']';
      }
      if (parsed.ticketPurpose) { clean.cmbTicketPurpose = parsed.ticketPurpose; clean.ticketPurpose = parsed.ticketPurpose; }
      if (parsed.ticketType) { clean.cmbTicketType = parsed.ticketType; clean.ticketType = parsed.ticketType; }
      if (parsed.location) { clean.cmbLocation = parsed.location; clean.location = parsed.location; }
      return dctrackClient.createTicket(clean);
    }

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
