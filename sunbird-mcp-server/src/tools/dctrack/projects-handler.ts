/**
 * Request handler for dcTrack projects tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

const getProjectSchema = z.object({ projectId: z.number().optional(), projectName: z.string().optional() });
const createProjectSchema = z.object({
  projectName: z.string(),
  projectNumber: z.string().optional(),
  location: z.string().optional().describe('Location name for the project'),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectManager: z.string().optional(),
}).passthrough();
const updateProjectSchema = z.object({ projectId: z.number().optional(), projectName: z.string().optional(), updates: z.record(z.any()) });
const deleteProjectSchema = z.object({ projectId: z.number().optional(), projectName: z.string().optional() });

export async function handleDcTrackProjectsTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack projects tool');

  switch (toolName) {
    case 'dctrack_get_project': {
      const gp = getProjectSchema.parse(args);
      const gpId = await dctrackClient.resolveProjectId(gp.projectId, gp.projectName);
      return dctrackClient.getProject(gpId);
    }

    case 'dctrack_create_project': {
      const proj = createProjectSchema.parse(args);
      // dcTrack requires projectNumber — auto-generate if not provided
      if (!proj.projectNumber) {
        proj.projectNumber = `PRJ-${Date.now()}`;
      }

      // Resolve location name to dcTrack tiLocationCode (e.g., "AI-DEMO-DC > AI-ROOM-01")
      if (proj.location) {
        try {
          const locs = await dctrackClient.listLocations();
          const query = proj.location.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
          const match = locs.find((l: any) => {
            const name = (l.tiLocationName || '').toLowerCase().replace(/[-_\s]+/g, ' ').trim();
            return name === query;
          }) || locs.find((l: any) => {
            const code = (l.tiLocationCode || '').toLowerCase();
            const lastSeg = code.split('>').pop()?.replace(/[-_\s]+/g, ' ').trim() || '';
            return lastSeg === query;
          });
          if (match) {
            const resolvedCode = (match as any).tiLocationCode || (match as any).tiLocationName;
            logger.info({ input: proj.location, resolvedCode }, 'Resolved project location');
            proj.location = resolvedCode;
          } else {
            logger.warn({ input: proj.location }, 'Could not resolve project location — sending as-is');
          }
        } catch (err) {
          logger.warn({ err, input: proj.location }, 'Failed to resolve location — sending as-is');
        }
      }

      logger.info({ payload: proj }, 'Sending project create payload to dcTrack');
      return dctrackClient.createProject(proj);
    }

    case 'dctrack_update_project': {
      const p = updateProjectSchema.parse(args);
      const upId = await dctrackClient.resolveProjectId(p.projectId, p.projectName);
      return dctrackClient.updateProject(upId, p.updates);
    }

    case 'dctrack_delete_project': {
      const dp = deleteProjectSchema.parse(args);
      const dpId = await dctrackClient.resolveProjectId(dp.projectId, dp.projectName);
      return dctrackClient.deleteProject(dpId);
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
