/**
 * Central tool registry.
 *
 * Aggregates every tool definition and routes incoming tool calls to
 * the correct domain handler.  This is the single entry point used by
 * both the MCP server and the HTTP transport.
 */

// dcTrack imports
import { dctrackReadToolDefinitions, handleDcTrackReadTool } from './dctrack/index.js';
import { dctrackWriteToolDefinitions, handleDcTrackWriteTool } from './dctrack/index.js';
import { dctrackMakesToolDefinitions, handleDcTrackMakesTool } from './dctrack/index.js';
import { dctrackPortsToolDefinitions, handleDcTrackPortsTool } from './dctrack/index.js';
import { dctrackPowerToolDefinitions, handleDcTrackPowerTool } from './dctrack/index.js';
import { dctrackTicketsToolDefinitions, handleDcTrackTicketsTool } from './dctrack/index.js';
import { dctrackProjectsToolDefinitions, handleDcTrackProjectsTool } from './dctrack/index.js';
import { dctrackPartsToolDefinitions, handleDcTrackPartsTool } from './dctrack/index.js';
import { dctrackAdminToolDefinitions, handleDcTrackAdminTool } from './dctrack/index.js';

// PowerIQ imports
import { poweriqToolDefinitions, handlePowerIQTool } from './poweriq/index.js';
import { poweriqInfraToolDefinitions, handlePowerIQInfraTool } from './poweriq/index.js';
import { poweriqPduWriteToolDefinitions, handlePowerIQPduWriteTool } from './poweriq/index.js';
import { poweriqReadingsToolDefinitions, handlePowerIQReadingsTool } from './poweriq/index.js';
import { poweriqEventsToolDefinitions, handlePowerIQEventsTool } from './poweriq/index.js';
import { poweriqPowerControlToolDefinitions, handlePowerIQPowerControlTool } from './poweriq/index.js';
import { poweriqSystemToolDefinitions, handlePowerIQSystemTool } from './poweriq/index.js';
import { poweriqAssetsToolDefinitions, handlePowerIQAssetsTool } from './poweriq/index.js';
import { poweriqTagsToolDefinitions, handlePowerIQTagsTool } from './poweriq/index.js';
import { poweriqMiscToolDefinitions, handlePowerIQMiscTool } from './poweriq/index.js';

// Combined imports
import { combinedToolDefinitions, handleCombinedTool } from './combined/index.js';

import { ToolNotFoundError } from '../lib/errors/index.js';
import { logger } from '../lib/logger.js';

// ---------------------------------------------------------------------------
// All definitions (exposed to MCP `tools/list`)
// ---------------------------------------------------------------------------

export const allToolDefinitions = [
  // dcTrack
  ...dctrackReadToolDefinitions,
  ...dctrackWriteToolDefinitions,
  ...dctrackMakesToolDefinitions,
  ...dctrackPortsToolDefinitions,
  ...dctrackPowerToolDefinitions,
  ...dctrackTicketsToolDefinitions,
  ...dctrackProjectsToolDefinitions,
  ...dctrackPartsToolDefinitions,
  ...dctrackAdminToolDefinitions,
  // PowerIQ
  ...poweriqToolDefinitions,
  ...poweriqInfraToolDefinitions,
  ...poweriqPduWriteToolDefinitions,
  ...poweriqReadingsToolDefinitions,
  ...poweriqEventsToolDefinitions,
  ...poweriqPowerControlToolDefinitions,
  ...poweriqSystemToolDefinitions,
  ...poweriqAssetsToolDefinitions,
  ...poweriqTagsToolDefinitions,
  ...poweriqMiscToolDefinitions,
  // Combined
  ...combinedToolDefinitions,
];

// ---------------------------------------------------------------------------
// Routing map (built once at import time)
// ---------------------------------------------------------------------------

type Category =
  | 'dctrack-read'
  | 'dctrack-write'
  | 'dctrack-makes'
  | 'dctrack-ports'
  | 'dctrack-power'
  | 'dctrack-tickets'
  | 'dctrack-projects'
  | 'dctrack-parts'
  | 'dctrack-admin'
  | 'poweriq'
  | 'poweriq-infra'
  | 'poweriq-pdu-write'
  | 'poweriq-readings'
  | 'poweriq-events'
  | 'poweriq-power-control'
  | 'poweriq-system'
  | 'poweriq-assets'
  | 'poweriq-tags'
  | 'poweriq-misc'
  | 'combined';

const toolCategory = new Map<string, Category>();

// dcTrack categories
dctrackReadToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-read'));
dctrackWriteToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-write'));
dctrackMakesToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-makes'));
dctrackPortsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-ports'));
dctrackPowerToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-power'));
dctrackTicketsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-tickets'));
dctrackProjectsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-projects'));
dctrackPartsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-parts'));
dctrackAdminToolDefinitions.forEach((t) => toolCategory.set(t.name, 'dctrack-admin'));

// PowerIQ categories
poweriqToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq'));
poweriqInfraToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-infra'));
poweriqPduWriteToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-pdu-write'));
poweriqReadingsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-readings'));
poweriqEventsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-events'));
poweriqPowerControlToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-power-control'));
poweriqSystemToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-system'));
poweriqAssetsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-assets'));
poweriqTagsToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-tags'));
poweriqMiscToolDefinitions.forEach((t) => toolCategory.set(t.name, 'poweriq-misc'));

// Combined
combinedToolDefinitions.forEach((t) => toolCategory.set(t.name, 'combined'));

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function handleToolCall(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  const cat = toolCategory.get(toolName);

  if (!cat) throw new ToolNotFoundError(toolName);

  logger.info({ tool: toolName, category: cat }, 'Routing tool call');

  switch (cat) {
    // dcTrack
    case 'dctrack-read':
      return handleDcTrackReadTool(toolName, args);
    case 'dctrack-write':
      return handleDcTrackWriteTool(toolName, args);
    case 'dctrack-makes':
      return handleDcTrackMakesTool(toolName, args);
    case 'dctrack-ports':
      return handleDcTrackPortsTool(toolName, args);
    case 'dctrack-power':
      return handleDcTrackPowerTool(toolName, args);
    case 'dctrack-tickets':
      return handleDcTrackTicketsTool(toolName, args);
    case 'dctrack-projects':
      return handleDcTrackProjectsTool(toolName, args);
    case 'dctrack-parts':
      return handleDcTrackPartsTool(toolName, args);
    case 'dctrack-admin':
      return handleDcTrackAdminTool(toolName, args);
    // PowerIQ
    case 'poweriq':
      return handlePowerIQTool(toolName, args);
    case 'poweriq-infra':
      return handlePowerIQInfraTool(toolName, args);
    case 'poweriq-pdu-write':
      return handlePowerIQPduWriteTool(toolName, args);
    case 'poweriq-readings':
      return handlePowerIQReadingsTool(toolName, args);
    case 'poweriq-events':
      return handlePowerIQEventsTool(toolName, args);
    case 'poweriq-power-control':
      return handlePowerIQPowerControlTool(toolName, args);
    case 'poweriq-system':
      return handlePowerIQSystemTool(toolName, args);
    case 'poweriq-assets':
      return handlePowerIQAssetsTool(toolName, args);
    case 'poweriq-tags':
      return handlePowerIQTagsTool(toolName, args);
    case 'poweriq-misc':
      return handlePowerIQMiscTool(toolName, args);
    // Combined
    case 'combined':
      return handleCombinedTool(toolName, args);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getToolDefinition(toolName: string) {
  return allToolDefinitions.find((t) => t.name === toolName);
}

export function listTools() {
  return allToolDefinitions.map((t) => ({ name: t.name, description: t.description }));
}
