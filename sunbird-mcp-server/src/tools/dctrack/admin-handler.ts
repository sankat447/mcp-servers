/**
 * Request handler for dcTrack admin/configuration tools.
 *
 * Maps each tool name to the appropriate schema validation + client call.
 */

import { dctrackClient } from '../../lib/clients/index.js';
import { ToolNotFoundError } from '../../lib/errors/index.js';
import { logger } from '../../lib/logger.js';
import { z } from 'zod';

// CUSTOM FIELDS
const getCustomFieldSchema = z.object({ customFieldId: z.number() });
const createCustomFieldSchema = z.object({
  label: z.string(),
  fieldType: z.string(),
  appliedTo: z.string().optional(),
  options: z.array(z.string()).optional(),
});
const updateCustomFieldSchema = z.object({ customFieldId: z.number(), updates: z.record(z.any()) });
const deleteCustomFieldSchema = z.object({ customFieldId: z.number() });

// AUDIT TRAIL
const searchAuditTrailSchema = z.object({
  filters: z.any().optional(),
  selectedColumns: z.array(z.record(z.any())).optional(),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(1000),
});

// CHARTS
const getChartSchema = z.object({ chartId: z.number() });
const getChartDataSchema = z.object({ chartId: z.number(), params: z.record(z.any()).optional() });

// BREAKERS
const listBreakersSchema = z.object({ panelItemId: z.number() });
const createBreakerSchema = z.object({ panelItemId: z.number(), breaker: z.record(z.any()) });
const updateBreakerSchema = z.object({
  panelItemId: z.number(),
  breakerPortId: z.number(),
  updates: z.record(z.any()),
});
const deleteBreakerSchema = z.object({ panelItemId: z.number(), breakerPortId: z.number() });

// LOOKUP LISTS
const getLookupListSchema = z.object({ listType: z.string(), id: z.number().optional() });
const getPicklistOptionsSchema = z.object({ listType: z.string() });

// WEBHOOKS
const updateWebhookConfigSchema = z.object({ config: z.record(z.any()) });

// RELATIONSHIPS
const getRelationshipSchema = z.object({ id: z.number() });
const createRelationshipSchema = z.object({ relationship: z.record(z.any()) });
const searchRelationshipsSchema = z.object({ params: z.record(z.any()) });
const deleteRelationshipSchema = z.object({ id: z.number() });

// PERMISSIONS
const createPermissionSchema = z.object({ permission: z.record(z.any()) });
const updatePermissionSchema = z.object({ permissionId: z.number(), updates: z.record(z.any()) });
const deletePermissionSchema = z.object({ permissionId: z.number() });

// FLOORMAP CONFIG
const getFloormapConfigSchema = z.object({ locationId: z.number() });
const updateFloormapConfigSchema = z.object({ locationId: z.number(), config: z.record(z.any()) });

// LOCATION FAVORITES
const getLocationFavoritesSchema = z.object({ username: z.string(), entityType: z.string() });

export async function handleDcTrackAdminTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  logger.info({ tool: toolName, args }, 'Handling dcTrack admin tool');

  switch (toolName) {
    // CUSTOM FIELDS
    case 'dctrack_list_custom_fields':
      return dctrackClient.listCustomFields();

    case 'dctrack_get_custom_field':
      return dctrackClient.getCustomField(getCustomFieldSchema.parse(args).customFieldId);

    case 'dctrack_create_custom_field': {
      const cf = createCustomFieldSchema.parse(args);
      // dcTrack custom fields API requires a nested format
      const cfPayload: Record<string, any> = {
        tiLabel: { label: 'Label', value: cf.label, editable: true },
        tiType: {
          label: 'Type',
          value: { id: cf.fieldType === 'Number' ? 91015 : 91016, value: cf.fieldType },
          editable: false,
        },
      };
      if (cf.appliedTo) {
        cfPayload.cmbClass = { label: 'Class', value: [cf.appliedTo], editable: true };
      }
      return dctrackClient.createCustomField(cfPayload);
    }

    case 'dctrack_update_custom_field': {
      const p = updateCustomFieldSchema.parse(args);
      return dctrackClient.updateCustomField(p.customFieldId, p.updates);
    }

    case 'dctrack_delete_custom_field':
      return dctrackClient.deleteCustomField(deleteCustomFieldSchema.parse(args).customFieldId);

    // AUDIT TRAIL
    case 'dctrack_search_audit_trail': {
      const p = searchAuditTrailSchema.parse(args);
      return dctrackClient.searchAuditTrail({
        columns: p.filters,
        selectedColumns: p.selectedColumns as Array<{ name: string }> | undefined,
        pageNumber: p.pageNumber,
        pageSize: p.pageSize,
      });
    }

    // CHARTS
    case 'dctrack_list_charts':
      return dctrackClient.listCharts();

    case 'dctrack_get_chart':
      return dctrackClient.getChart(getChartSchema.parse(args).chartId);

    case 'dctrack_get_chart_data': {
      const p = getChartDataSchema.parse(args);
      return dctrackClient.getChartData(p.chartId, p.params);
    }

    // BREAKERS
    case 'dctrack_list_breakers':
      return dctrackClient.listBreakers(listBreakersSchema.parse(args).panelItemId);

    case 'dctrack_create_breaker': {
      const p = createBreakerSchema.parse(args);
      return dctrackClient.createBreaker(p.panelItemId, p.breaker);
    }

    case 'dctrack_update_breaker': {
      const p = updateBreakerSchema.parse(args);
      return dctrackClient.updateBreaker(p.panelItemId, p.breakerPortId, p.updates);
    }

    case 'dctrack_delete_breaker': {
      const p = deleteBreakerSchema.parse(args);
      return dctrackClient.deleteBreaker(p.panelItemId, p.breakerPortId);
    }

    // LOOKUP LISTS
    case 'dctrack_get_lookup_list': {
      const p = getLookupListSchema.parse(args);
      return dctrackClient.getLookupList(p.listType, p.id);
    }

    case 'dctrack_get_picklist_options':
      return dctrackClient.getPicklistOptions(getPicklistOptionsSchema.parse(args).listType);

    // WEBHOOKS
    case 'dctrack_get_webhook_config':
      return dctrackClient.getWebhookConfig();

    case 'dctrack_update_webhook_config':
      return dctrackClient.updateWebhookConfig(updateWebhookConfigSchema.parse(args).config);

    case 'dctrack_delete_webhook_config':
      return dctrackClient.deleteWebhookConfig();

    // RELATIONSHIPS
    case 'dctrack_get_relationship':
      return dctrackClient.getRelationship(getRelationshipSchema.parse(args).id);

    case 'dctrack_create_relationship':
      return dctrackClient.createRelationship(createRelationshipSchema.parse(args).relationship);

    case 'dctrack_search_relationships':
      return dctrackClient.searchRelationships(searchRelationshipsSchema.parse(args).params);

    case 'dctrack_delete_relationship':
      return dctrackClient.deleteRelationship(deleteRelationshipSchema.parse(args).id);

    // PERMISSIONS
    case 'dctrack_list_permissions':
      return dctrackClient.listPermissions();

    case 'dctrack_create_permission':
      return dctrackClient.createPermission(createPermissionSchema.parse(args).permission);

    case 'dctrack_update_permission': {
      const p = updatePermissionSchema.parse(args);
      return dctrackClient.updatePermission(p.permissionId, p.updates);
    }

    case 'dctrack_delete_permission':
      return dctrackClient.deletePermission(deletePermissionSchema.parse(args).permissionId);

    // FLOORMAP CONFIG
    case 'dctrack_get_floormap_config':
      return dctrackClient.getFloormapConfig(getFloormapConfigSchema.parse(args).locationId);

    case 'dctrack_list_floormap_configs':
      return dctrackClient.getAllFloormapConfigs();

    case 'dctrack_update_floormap_config': {
      const p = updateFloormapConfigSchema.parse(args);
      return dctrackClient.updateFloormapConfig(p.locationId, p.config);
    }

    // LOCATION FAVORITES
    case 'dctrack_get_location_favorites': {
      const p = getLocationFavoritesSchema.parse(args);
      return dctrackClient.getLocationFavorites(p.username, p.entityType);
    }

    default:
      throw new ToolNotFoundError(toolName);
  }
}
