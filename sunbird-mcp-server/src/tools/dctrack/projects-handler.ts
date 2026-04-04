/**
 * Request handler for dcTrack projects tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const getProjectSchema = z.object({ projectId: z.number() });
const createProjectSchema = z.object({
  projectName: z.string(),
  projectNumber: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectManager: z.string().optional(),
});
const updateProjectSchema = z.object({ projectId: z.number(), updates: z.record(z.any()) });
const deleteProjectSchema = z.object({ projectId: z.number() });

export async function handleDcTrackProjectsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack projects tool');

  switch (toolName) {
    case 'dctrack_get_project':
      return dctrackClient.getProject(getProjectSchema.parse(args).projectId);

    case 'dctrack_create_project':
      return dctrackClient.createProject(createProjectSchema.parse(args));

    case 'dctrack_update_project': {
      const p = updateProjectSchema.parse(args);
      return dctrackClient.updateProject(p.projectId, p.updates);
    }

    case 'dctrack_delete_project':
      return dctrackClient.deleteProject(deleteProjectSchema.parse(args).projectId);

    default:
      throw new ToolNotFoundError(toolName);
  }
}
