/**
 * dcTrack REST API client.
 *
 * Encapsulates every dcTrack v2 API call used by the MCP tools.
 * Read operations are cached; write operations bypass the cache.
 */

import { BaseClient } from './base-client.js';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';
import type {
  DcTrackLocation, DcTrackCabinet, DcTrackItem, DcTrackCapacity,
  DcTrackConnection, DcTrackModel, DcTrackMake, DcTrackDataPort,
  DcTrackPowerPort, DcTrackActualReading, DcTrackSubLocation,
  DcTrackTicket, DcTrackProject, DcTrackPartClass, DcTrackPartModel, DcTrackPart,
  DcTrackCustomField, DcTrackWebhook, DcTrackRelationship, DcTrackPermission,
  DcTrackAuditRecord, DcTrackChart, DcTrackBreaker, DcTrackFloormapConfig,
} from '../../types/index.js';

export class DcTrackClient extends BaseClient {
  /** Pagination metadata from the last quicksearch call */
  private _lastSearchMeta: { totalRows: number; pageNumber: number; pageSize: number } = {
    totalRows: -1, pageNumber: 0, pageSize: 0,
  };

  /** Get pagination metadata from the most recent quicksearch call */
  get lastSearchMeta() { return { ...this._lastSearchMeta }; }

  /** Track pagination metadata from a quicksearch API response */
  private trackSearchMeta(res: any, pageSize: number): void {
    this._lastSearchMeta = {
      totalRows: typeof res.totalRows === 'number' ? res.totalRows : -1,
      pageNumber: typeof res.pageNumber === 'number' ? res.pageNumber : 0,
      pageSize,
    };
  }

  constructor() {
    super('dctrack', '/api/v2', config.sunbird.dctrackBaseUrl);
  }

  // =======================================================================
  // READ OPERATIONS
  // =======================================================================

  async listLocations(params?: {
    parentId?: number;
    type?: string;
    pageSize?: number;
    pageNumber?: number;
  }): Promise<DcTrackLocation[]> {
    // dcTrack uses v1 API for locations list
    const res = await this.get<any>('/../v1/locations', params);
    return res.locations ?? res.data ?? [];
  }

  async getLocation(locationId: number): Promise<DcTrackLocation | null> {
    const res = await this.get<any>(`/../v1/locations/${locationId}`);
    return res.location ?? res;
  }

  async listCabinets(params?: {
    locationId?: number;
    pageSize?: number;
    pageNumber?: number;
  }): Promise<DcTrackCabinet[]> {
    // dcTrack has no dedicated cabinets endpoint — use quicksearch with class filter
    const columns: any[] = [
      { name: 'tiClass', filter: { eq: 'Cabinet' } },
    ];
    if (params?.locationId) {
      // Resolve locationId to location path string for cmbLocation filter
      let locationPath: string = String(params.locationId);
      try {
        const loc = await this.getLocation(params.locationId);
        locationPath = (loc as any)?.tiLocationCode ?? (loc as any)?.tiLocationName ?? locationPath;
      } catch {}
      columns.push({ name: 'cmbLocation', filter: { contains: locationPath } });
    }
    const pageSize = params?.pageSize ?? 100;
    const url = `/quicksearch/items?pageNumber=${params?.pageNumber ?? 0}&pageSize=${pageSize}`;
    const res = await this.post<any>(url, {
      columns,
      selectedColumns: [
        { name: 'id' }, { name: 'tiName' }, { name: 'cmbLocation' }, { name: 'cmbStatus' },
        { name: 'cmbModel' }, { name: 'cmbMake' }, { name: 'tiRUs' },
      ],
    });
    this.trackSearchMeta(res, pageSize);
    return res.searchResults?.items ?? res.items ?? [];
  }

  async getCabinet(cabinetId: number): Promise<DcTrackCabinet | null> {
    // Get cabinet details via quicksearch by ID
    const res = await this.post<any>('/quicksearch/items?pageSize=1', {
      columns: [{ name: 'id', filter: { eq: String(cabinetId) } }],
      selectedColumns: [
        { name: 'tiName' }, { name: 'cmbLocation' }, { name: 'cmbStatus' },
        { name: 'tiRUs' }, { name: 'cmbMake' }, { name: 'cmbModel' },
      ],
    });
    const items = res.searchResults?.items ?? [];
    return items[0] ?? null;
  }

  async getCabinetItems(cabinetId: number): Promise<DcTrackItem[]> {
    const res = await this.get<any>(`/items/cabinetItems/${cabinetId}`);
    return res.cabinetItems ?? res.items ?? res.data ?? [];
  }

  async getCabinetCapacity(cabinetId: number): Promise<DcTrackCapacity | null> {
    // Build capacity from cabinet details + installed items count
    const cabinet = await this.getCabinet(cabinetId);
    if (!cabinet) return null;

    const items = await this.getCabinetItems(cabinetId);
    const totalRu = Number(cabinet.ruHeight) || 42;
    const usedRu = items.reduce((sum: number, item: any) => sum + (Number(item.tiRackUnits) || 0), 0);
    const availableRu = totalRu - usedRu;

    return {
      cabinetId,
      totalRu,
      usedRu,
      availableRu,
      ratedPowerKw: 0,
      spaceUtilizationPercent: totalRu > 0 ? Math.round((usedRu / totalRu) * 100) : 0,
      installedItems: items.length,
    } as any;
  }

  async searchItems(params: {
    query?: string;
    class?: string;
    locationId?: number;
    cabinetId?: number;
    status?: string;
    pageSize?: number;
    pageNumber?: number;
  }): Promise<DcTrackItem[]> {
    // Build quicksearch v2 payload using the correct column/filter format
    const columns: any[] = [];
    if (params.query) columns.push({ name: 'tiMultiField', filter: { eq: params.query } });
    if (params.class) columns.push({ name: 'tiClass', filter: { eq: params.class } });
    if (params.status) columns.push({ name: 'cmbStatus', filter: { eq: params.status } });
    if (params.locationId) columns.push({ name: 'cmbLocation', filter: { eq: String(params.locationId) } });

    const pageSize = params.pageSize ?? 50;
    const url = `/quicksearch/items?pageNumber=${params.pageNumber ?? 0}&pageSize=${pageSize}`;
    const res = await this.post<any>(url, {
      columns,
      selectedColumns: [
        { name: 'id' }, { name: 'tiName' }, { name: 'cmbLocation' }, { name: 'cmbCabinet' },
        { name: 'tiClass' }, { name: 'cmbStatus' }, { name: 'tiSerialNumber' },
        { name: 'cmbMake' }, { name: 'cmbModel' }, { name: 'tiRUs' },
      ],
    });
    this.trackSearchMeta(res, pageSize);
    return res.searchResults?.items ?? res.items ?? [];
  }

  async getItem(itemId: number): Promise<DcTrackItem | null> {
    const res = await this.get<any>(`/dcimoperations/items/${itemId}`);
    return res.item ?? res;
  }

  async listConnections(params?: {
    itemId?: number;
    pageSize?: number;
  }): Promise<DcTrackConnection[]> {
    if (!params?.itemId) {
      // No list-all-connections endpoint exists; return helpful message
      return [];
    }
    // Get connections for a specific item by fetching its data ports (which include connection info)
    const dataPorts = await this.listDataPorts(params.itemId);
    const powerPorts = await this.listPowerPorts(params.itemId);
    const connections: DcTrackConnection[] = [];
    for (const port of [...dataPorts, ...powerPorts]) {
      if ((port as any).connectedToItemId || (port as any).connectedPortId) {
        connections.push({
          id: (port as any).portId ?? (port as any).id,
          sourceItemName: String(params.itemId),
          sourcePortName: (port as any).portName ?? (port as any).name,
          destItemName: (port as any).connectedToItemName ?? '',
          destPortName: (port as any).connectedPortName ?? '',
          connectionType: (port as any).portType ?? 'data',
        } as any);
      }
    }
    return connections;
  }

  async getConnection(connectionId: number): Promise<DcTrackConnection | null> {
    // Try data connection first, then power connection
    try {
      const res = await this.get<any>(`/connections/dataconnections/${connectionId}`);
      return res.dataConnection ?? res.connection ?? res;
    } catch {
      try {
        const res = await this.get<any>(`/connections/powerconnections/${connectionId}`);
        return res.powerConnection ?? res.connection ?? res;
      } catch {
        return null;
      }
    }
  }

  async listModels(params?: {
    class?: string;
    make?: string;
    pageSize?: number;
  }): Promise<DcTrackModel[]> {
    // No dedicated list endpoint — use quicksearch/models
    const columns: any[] = [];
    if (params?.class) columns.push({ name: 'class', filter: { eq: params.class } });
    if (params?.make) columns.push({ name: 'make', filter: { eq: params.make } });
    const pageSize = params?.pageSize ?? 100;
    const url = `/quicksearch/models?pageNumber=0&pageSize=${pageSize}`;
    const res = await this.post<any>(url, {
      columns,
      selectedColumns: [{ name: 'model' }, { name: 'make' }, { name: 'class' }, { name: 'mounting' }, { name: 'formFactor' }, { name: 'ruHeight' }],
    });
    this.trackSearchMeta(res, pageSize);
    return res.searchResults?.models ?? res.models ?? [];
  }

  async getModel(modelId: number): Promise<DcTrackModel | null> {
    const res = await this.get<any>(`/models/${modelId}?usedCounts=true`);
    return res.model ?? res;
  }

  // =======================================================================
  // WRITE OPERATIONS
  // =======================================================================

  async createItem(item: {
    tiName: string;
    tiClass: string;
    cmbLocation?: string;
    cabinetId?: number;
    tiUPosition?: number;
    tiMounting?: string;
    modelId?: number;
    tiSerialNumber?: string;
    tiAssetTag?: string;
    cmbStatus?: string;
    customFields?: Record<string, any>;
  }): Promise<DcTrackItem> {
    const payload: Record<string, any> = { tiName: item.tiName, tiClass: item.tiClass };

    if (item.cmbLocation) payload.cmbLocation = item.cmbLocation;
    if (item.cabinetId) payload.cmbCabinet = item.cabinetId;
    if (item.tiUPosition) payload.tiUPosition = item.tiUPosition;
    if (item.tiMounting) payload.tiMounting = item.tiMounting;
    if (item.modelId) payload.cmbModel = item.modelId;
    if (item.tiSerialNumber) payload.tiSerialNumber = item.tiSerialNumber;
    if (item.tiAssetTag) payload.tiAssetTag = item.tiAssetTag;
    if (item.cmbStatus) payload.cmbStatus = item.cmbStatus;
    if (item.customFields) Object.assign(payload, item.customFields);

    const res = await this.post<any>('/dcimoperations/items?returnDetails=true&proceedOnWarning=true', payload);
    logger.info({ itemName: item.tiName }, 'Item created');
    return res.item ?? res;
  }

  async updateItem(itemId: number, updates: Record<string, any>): Promise<DcTrackItem> {
    const res = await this.put<any>(`/dcimoperations/items/${itemId}?returnDetails=true&proceedOnWarning=true`, updates);
    logger.info({ itemId }, 'Item updated');
    return res.item ?? res;
  }

  async moveItem(
    itemId: number,
    targetCabinetId: number,
    targetUPosition: number,
    targetMounting?: string,
  ): Promise<DcTrackItem> {
    const payload: Record<string, any> = {
      cmbCabinet: targetCabinetId,
      tiUPosition: targetUPosition,
    };
    if (targetMounting) payload.tiMounting = targetMounting;

    const res = await this.put<any>(`/dcimoperations/items/${itemId}`, payload);
    logger.info({ itemId, targetCabinetId, targetUPosition }, 'Item moved');
    return res.item ?? res;
  }

  async deleteItem(
    itemId: number,
    force = false,
  ): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/dcimoperations/items/${itemId}${force ? '?force=true' : ''}`);
    logger.info({ itemId }, 'Item deleted');
    return { success: true, message: `Item ${itemId} deleted` };
  }

  async createConnection(connection: {
    sourceItemId: number;
    sourcePortId?: number;
    sourcePortName?: string;
    destItemId: number;
    destPortId?: number;
    destPortName?: string;
    cableId?: string;
    connectionType?: string;
  }): Promise<DcTrackConnection> {
    // Resolve item names/locations from IDs for the API
    let startItem: any = null;
    let endItem: any = null;
    try {
      startItem = await this.getItem(connection.sourceItemId);
      endItem = await this.getItem(connection.destItemId);
    } catch {
      // If we can't resolve items, try with IDs
    }

    const payload: Record<string, any> = {};
    if (startItem) {
      payload.startingItemName = startItem.tiName;
      payload.startingItemLocation = startItem.cmbLocation ?? startItem.tiLocationName;
    }
    if (endItem) {
      payload.endingItemName = endItem.tiName;
      payload.endingItemLocation = endItem.cmbLocation ?? endItem.tiLocationName;
    }
    if (connection.sourcePortName) payload.startingPortName = connection.sourcePortName;
    if (connection.destPortName) payload.endingPortName = connection.destPortName;
    if (connection.cableId) {
      payload.cordList = [{ cordId: connection.cableId, cordType: 'PatchCord' }];
    }
    payload.proceedOnWarning = true;

    // Use dataconnections for Network/Fiber/Serial/KVM, powerconnections for Power
    const isPower = connection.connectionType === 'Power';
    const endpoint = isPower ? '/connections/powerconnections' : '/connections/dataconnections';

    const res = await this.post<any>(endpoint, payload);
    logger.info(
      { src: connection.sourceItemId, dest: connection.destItemId },
      'Connection created',
    );
    return res.connection ?? res;
  }

  async deleteConnection(
    connectionId: number,
  ): Promise<{ success: boolean; message: string }> {
    // Try data connection first, fallback to power connection
    try {
      await this.del<any>(`/connections/dataconnections/${connectionId}`);
    } catch {
      await this.del<any>(`/connections/powerconnections/${connectionId}`);
    }
    logger.info({ connectionId }, 'Connection deleted');
    return { success: true, message: `Connection ${connectionId} deleted` };
  }

  async createChangeRequest(request: {
    requestType: string;
    summary: string;
    description?: string;
    itemIds?: number[];
    scheduledDate?: string;
    assignee?: string;
    priority?: string;
  }): Promise<any> {
    // dcTrack requests use /dcimoperations/requests endpoint
    // Supported request types: InstallItem, PlanforDecommission, MoveItem, etc.
    const requestTypeMap: Record<string, string> = {
      Install: 'InstallItem',
      Move: 'MoveItem',
      Decommission: 'PlanforDecommission',
      PowerOn: 'PowerOn',
      PowerOff: 'PowerOff',
      Other: 'Other',
    };

    const payload: Record<string, any> = {
      requestType: requestTypeMap[request.requestType] ?? request.requestType,
      comments: request.summary + (request.description ? ` - ${request.description}` : ''),
    };
    const itemIds = request.itemIds;
    if (itemIds && itemIds.length > 0) {
      const firstItemId = itemIds[0]!;
      payload.itemId = firstItemId;
      // Try to resolve item name
      try {
        const item = await this.getItem(firstItemId);
        payload.itemName = (item as any)?.tiName;
      } catch {
        // ok
      }
    }
    if (request.scheduledDate) payload.dueDate = request.scheduledDate;
    if (request.priority) payload.priority = request.priority.toLowerCase();
    if (request.assignee) payload.requestedBy = request.assignee;

    const res = await this.post<any>('/dcimoperations/requests', payload);
    logger.info({ summary: request.summary }, 'Change request created');
    return res.request ?? res;
  }

  async updateChangeRequest(
    requestId: number,
    updates: { status?: string; comments?: string },
  ): Promise<any> {
    if (updates.status === 'Completed' || updates.status === 'Complete') {
      // Use the set-to-complete endpoint
      const res = await this.put<any>(`/dcimoperations/requests/${requestId}/complete`, {});
      logger.info({ requestId }, 'Change request completed');
      return res;
    }
    if (updates.status === 'Cancelled' || updates.status === 'Canceled') {
      // Cancel = delete
      await this.del<any>(`/dcimoperations/requests/${requestId}`);
      logger.info({ requestId }, 'Change request cancelled');
      return { success: true, message: `Request ${requestId} cancelled` };
    }
    // For other updates, not directly supported — return info
    return { requestId, message: 'Request status updates are managed through Complete or Cancel operations in dcTrack' };
  }

  async bulkImport(
    importType: string,
    data: Record<string, any>[],
    options?: { updateExisting?: boolean; validateOnly?: boolean; templateId?: number },
  ): Promise<{ success: boolean; imported: number; failed: number; errors: any[] }> {
    const endpoint =
      importType === 'items'
        ? '/dcimoperations/items/import'
        : importType === 'connections'
          ? '/dcimoperations/connections/import'
          : '/dcimoperations/models/import';

    const res = await this.post<any>(endpoint, {
      data,
      options: {
        updateExisting: options?.updateExisting ?? false,
        validateOnly: options?.validateOnly ?? false,
        templateId: options?.templateId,
      },
    });

    logger.info({ importType, count: data.length }, 'Bulk import completed');
    return {
      success: true,
      imported: res.imported ?? data.length,
      failed: res.failed ?? 0,
      errors: res.errors ?? [],
    };
  }

  async bulkUpdate(
    itemIds: number[],
    updates: Record<string, any>,
  ): Promise<{ success: boolean; updated: number; failed: number; errors: any[] }> {
    const results = { success: true, updated: 0, failed: 0, errors: [] as any[] };

    for (const itemId of itemIds) {
      try {
        await this.updateItem(itemId, updates);
        results.updated++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ itemId, error: err.message });
      }
    }

    results.success = results.failed === 0;
    logger.info({ updated: results.updated, failed: results.failed }, 'Bulk update completed');
    return results;
  }

  async createCabinet(cabinet: {
    name: string;
    locationId: number;
    make?: string;
    model?: string;
    modelId?: number;
    ruHeight?: number;
    ratedPowerKw?: number;
    rowPosition?: number;
    customFields?: Record<string, any>;
    [key: string]: any;
  }): Promise<DcTrackCabinet> {
    // Cabinets are created through the items API — there is no /dcimoperations/cabinets endpoint
    // Need full location path (e.g., "ORSTED > ROOM 01"), not just name
    let locationName: string;
    try {
      const loc = await this.getLocation(cabinet.locationId);
      locationName = (loc as any)?.tiLocationCode ?? (loc as any)?.cmbLocation ?? (loc as any)?.tiLocationName ?? (loc as any)?.name ?? String(cabinet.locationId);
    } catch {
      locationName = String(cabinet.locationId);
    }

    const payload: Record<string, any> = {
      tiName: cabinet.name,
      cmbLocation: locationName,
    };
    // Make & model by name — dcTrack resolves these to IDs internally
    if (cabinet.make) payload.cmbMake = cabinet.make;
    if (cabinet.model) payload.cmbModel = cabinet.model;
    if (cabinet.modelId) payload.cmbModel = cabinet.modelId;
    if (cabinet.ratedPowerKw) payload.tiRatedPowerKw = cabinet.ratedPowerKw;
    if (cabinet.rowPosition) payload.cmbRowPosition = cabinet.rowPosition;
    if (cabinet.customFields) Object.assign(payload, cabinet.customFields);

    const res = await this.post<any>('/dcimoperations/items?returnDetails=true&proceedOnWarning=true', payload);
    logger.info({ cabinetName: cabinet.name }, 'Cabinet created');
    return res.item ?? res;
  }

  async createLocation(location: {
    name: string;
    type: string;
    parentId?: number;
    code?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    customFields?: Record<string, any>;
  }): Promise<DcTrackLocation> {
    // Location creation uses v1 API — resolve parent location code from parentId
    let parentLocationCode: string | undefined;
    if (location.parentId) {
      try {
        const parent = await this.getLocation(location.parentId);
        parentLocationCode = (parent as any)?.tiLocationCode ?? (parent as any)?.tiLocationName ?? (parent as any)?.name;
      } catch {
        // fallback: just use the ID
      }
    }

    // Map user-friendly type to dcTrack hierarchy level
    const hierarchyMap: Record<string, string> = {
      Site: 'DataCenter',
      Building: 'Building',
      Floor: 'Floor',
      Room: 'Room',
      Aisle: 'Aisle',
      Row: 'Row',
    };

    const payload: Record<string, any> = {
      tiLocationName: location.name,
      cmbHierarchyLevel: hierarchyMap[location.type] ?? location.type,
    };
    if (parentLocationCode) payload.tiParentLocationCode = parentLocationCode;
    if (location.code) payload.tiLocationCode = location.code;
    if (location.address) payload.cmbAddressLine1 = location.address;
    if (location.city) payload.cmbAddressCity = location.city;
    if (location.state) payload.cmbAddressState = location.state;
    if (location.country) payload.cmbAddressCountry = location.country;
    if (location.customFields) Object.assign(payload, location.customFields);

    // v1 API — need to go up one level from /api/v2
    const res = await this.post<any>('/../v1/locations?proceedOnWarning=true', payload);
    logger.info({ locationName: location.name, type: location.type }, 'Location created');
    return res.location ?? res;
  }

  async listImportTemplates(templateType?: string): Promise<any[]> {
    const params = templateType ? { type: templateType } : {};
    const res = await this.get<any>('/import/templates', params);
    return res.templates ?? res.data ?? [];
  }

  async getImportTemplate(templateId: number): Promise<any> {
    const res = await this.get<any>(`/import/templates/${templateId}`);
    return res.template ?? res;
  }

  async validateImportData(
    importType: string,
    data: Record<string, any>[],
    templateId?: number,
  ): Promise<{ valid: boolean; errors: any[]; warnings: any[] }> {
    const res = await this.post<any>(`/import/validate/${importType}`, {
      data,
      templateId,
    });
    return {
      valid: res.valid ?? res.errors?.length === 0,
      errors: res.errors ?? [],
      warnings: res.warnings ?? [],
    };
  }

  // =======================================================================
  // MAKES
  // =======================================================================

  async listMakes(): Promise<DcTrackMake[]> {
    const res = await this.get<any>('/makes');
    return Array.isArray(res) ? res : res.makes ?? [];
  }

  async getMake(makeId: number): Promise<DcTrackMake | null> {
    // No GET /makes/{id} endpoint — filter from full list
    const all = await this.listMakes();
    return all.find((m: any) => m.makeId === makeId) ?? null;
  }

  async createMake(make: { makeName: string; accountNumber?: string; aliases?: string[]; notes?: string }): Promise<DcTrackMake> {
    const res = await this.post<any>('/makes', make);
    logger.info({ makeName: make.makeName }, 'Make created');
    return res;
  }

  async updateMake(makeId: number, updates: Record<string, any>): Promise<DcTrackMake> {
    const res = await this.put<any>(`/makes/${makeId}`, { makeId, ...updates });
    logger.info({ makeId }, 'Make updated');
    return res;
  }

  async deleteMake(makeId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/makes/${makeId}`);
    logger.info({ makeId }, 'Make deleted');
    return { success: true, message: `Make ${makeId} deleted` };
  }

  async searchMakes(searchString: string): Promise<any[]> {
    const res = await this.post<any>('/dcimoperations/search/list/makes', { searchString });
    return res.cmbMake ?? [];
  }

  // =======================================================================
  // MODEL WRITE OPERATIONS
  // =======================================================================

  async createModel(model: Record<string, any>): Promise<DcTrackModel> {
    const res = await this.post<any>('/models?returnDetails=true&proceedOnWarning=true', model);
    logger.info({ model: model.model }, 'Model created');
    return res;
  }

  async updateModel(modelId: number, model: Record<string, any>): Promise<DcTrackModel> {
    const res = await this.put<any>(`/models/${modelId}?returnDetails=true&proceedOnWarning=false`, model);
    logger.info({ modelId }, 'Model updated');
    return res;
  }

  async deleteModel(modelId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/models/${modelId}`);
    logger.info({ modelId }, 'Model deleted');
    return { success: true, message: `Model ${modelId} deleted` };
  }

  async searchModels(params: {
    columns?: Array<{ name: string; filter?: Record<string, string> }>;
    selectedColumns?: Array<{ name: string }>;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const res = await this.post<any>(
      `/quicksearch/models?pageNumber=${params.pageNumber ?? 0}&pageSize=${params.pageSize ?? 50}`,
      {
        columns: params.columns ?? [],
        selectedColumns: params.selectedColumns ?? [{ name: 'model' }, { name: 'make' }, { name: 'class' }],
      },
    );
    return res;
  }

  // =======================================================================
  // DATA PORTS
  // =======================================================================

  async listDataPorts(itemId: number): Promise<DcTrackDataPort[]> {
    const res = await this.get<any>(`/dcimoperations/items/${itemId}/dataports`);
    return res.dataPorts ?? res.data ?? [];
  }

  async getDataPort(itemId: number, portId: number): Promise<DcTrackDataPort | null> {
    const res = await this.get<any>(`/dcimoperations/items/${itemId}/dataports/${portId}`);
    return res.dataPort ?? res;
  }

  async createDataPort(itemId: number, port: Record<string, any>): Promise<DcTrackDataPort> {
    const res = await this.post<any>(`/dcimoperations/items/${itemId}/dataports`, port);
    logger.info({ itemId, portName: port.portName }, 'Data port created');
    return res.dataPort ?? res;
  }

  async updateDataPort(itemId: number, portId: number, updates: Record<string, any>): Promise<DcTrackDataPort> {
    const res = await this.put<any>(`/dcimoperations/items/${itemId}/dataports/${portId}`, updates);
    logger.info({ itemId, portId }, 'Data port updated');
    return res.dataPort ?? res;
  }

  async deleteDataPort(itemId: number, portId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/dcimoperations/items/${itemId}/dataports/${portId}`);
    logger.info({ itemId, portId }, 'Data port deleted');
    return { success: true, message: `Data port ${portId} deleted` };
  }

  // =======================================================================
  // POWER PORTS (v1 API)
  // =======================================================================

  async listPowerPorts(itemId: number): Promise<DcTrackPowerPort[]> {
    // Power ports use the v1 API path - need to construct full URL
    const res = await this.get<any>(`/../v1/items/${itemId}/powerports`);
    return res.powerPorts ?? res.data ?? [];
  }

  // =======================================================================
  // POWER CHAIN
  // =======================================================================

  async getPowerChainForLocation(locationId: number, nodeFields?: string[]): Promise<any> {
    try {
      const res = await this.post<any>(`/powerChain/${locationId}`, {
        nodeFields: nodeFields ?? ['tiName', 'cmbLocation', 'tiClass'],
      });
      return res;
    } catch (err: any) {
      // Power chain may not be configured for all locations — return friendly message
      const msg = err?.message ?? String(err);
      if (msg.includes('500') || msg.includes('Server error') || err?.statusCode >= 500) {
        return {
          status: 'not_configured',
          locationId,
          powerChain: [],
          summary: `The power chain is not configured for location ${locationId} in dcTrack. This means power distribution paths have not been set up for this location. To view power chain data, the dcTrack administrator needs to configure the power chain for this location first.`,
        };
      }
      throw err;
    }
  }

  async getActualReadingsByItem(itemId: number): Promise<DcTrackActualReading[]> {
    const res = await this.get<any>(`/powerChain/items/actualReadings/${itemId}`, undefined, false);
    return res.actualReadings ?? res.portReadings ?? [];
  }

  async getActualReadingsByPort(portId: number): Promise<DcTrackActualReading | null> {
    const res = await this.get<any>(`/powerChain/ports/actualReadings/${portId}`, undefined, false);
    return res;
  }

  async updateActualReadingsByPort(portId: number, readings: Record<string, any>): Promise<any> {
    const res = await this.put<any>(`/powerChain/ports/actualReadings/${portId}`, readings);
    logger.info({ portId }, 'Actual readings updated');
    return res;
  }

  async getPowerSumBulk(itemIds: number[]): Promise<any> {
    const res = await this.post<any>('/items/powerSum/bulk', {
      bodies: itemIds,
      method: 'GET',
      proceedOnWarning: true,
    });
    return res;
  }

  // =======================================================================
  // CABINET SPACE
  // =======================================================================

  async findAvailableCabinets(params: {
    locationIds?: number[];
    minAvailableRUs?: number;
    minAvailablePowerKw?: number;
  }): Promise<any[]> {
    // No reliable dedicated endpoint — compute from cabinet list + capacity
    const cabinets = await this.listCabinets({ pageSize: 200 });
    const results: any[] = [];
    for (const cab of cabinets) {
      const cap = await this.getCabinetCapacity(Number(cab.id));
      if (!cap) continue;
      const meetsSpace = !params.minAvailableRUs || cap.availableRu >= params.minAvailableRUs;
      if (meetsSpace) {
        results.push({
          cabinetId: Number(cab.id), cabinetName: (cab as any).tiName,
          location: (cab as any).cmbLocation,
          totalRu: cap.totalRu, availableRu: cap.availableRu, usedRu: cap.usedRu,
          spaceUtilization: cap.spaceUtilizationPercent,
        });
      }
    }
    return results;
  }

  async findAvailableUPositions(params: {
    cabinetId: number;
    ruNeeded: number;
  }): Promise<any[]> {
    const res = await this.post<any>('/items/uposition/available', {
      cabinetId: params.cabinetId,
      ruNeeded: params.ruNeeded,
    });
    return res.availablePositions ?? res.data ?? [];
  }

  // =======================================================================
  // SUB-LOCATIONS
  // =======================================================================

  async listSubLocations(locationId: number): Promise<DcTrackSubLocation[]> {
    const res = await this.get<any>(`/subLocations/list/${locationId}`);
    return res.subLocations ?? res.data ?? [];
  }

  async getSubLocation(subLocationId: number): Promise<DcTrackSubLocation | null> {
    const res = await this.get<any>(`/subLocations/${subLocationId}`);
    return res.subLocation ?? res;
  }

  async createSubLocation(subLocation: Record<string, any>): Promise<DcTrackSubLocation> {
    // Sub-location API requires a very specific nested format
    let locationValue: string | undefined;
    const locationId = subLocation.locationId;
    if (locationId) {
      try {
        const loc = await this.getLocation(locationId);
        locationValue = (loc as any)?.tiLocationCode ?? (loc as any)?.tiLocationName ?? (loc as any)?.name;
      } catch {
        locationValue = String(locationId);
      }
    }

    const payload: Record<string, any> = {
      cmbLocation: {
        label: 'Location',
        value: { id: locationId, value: locationValue ?? String(locationId) },
      },
      tiSubLocationName: {
        label: 'Name',
        value: subLocation.name,
      },
      cmbSubLocationType: {
        label: 'Type',
        value: { value: subLocation.type ?? 'Aisle' },
      },
    };
    if (subLocation.powerCapacity) {
      payload.tiPowerCapacity = { label: 'Capacity (kW)', value: subLocation.powerCapacity };
    }

    const res = await this.post<any>('/subLocations', payload);
    logger.info({ name: subLocation.name }, 'Sub-location created');
    return res.subLocation ?? res;
  }

  async updateSubLocation(subLocationId: number, updates: Record<string, any>): Promise<DcTrackSubLocation> {
    const res = await this.put<any>(`/subLocations/${subLocationId}`, updates);
    logger.info({ subLocationId }, 'Sub-location updated');
    return res.subLocation ?? res;
  }

  async deleteSubLocation(subLocationId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/subLocations/${subLocationId}`);
    logger.info({ subLocationId }, 'Sub-location deleted');
    return { success: true, message: `Sub-location ${subLocationId} deleted` };
  }

  // =======================================================================
  // TICKETS
  // =======================================================================

  async getTicket(ticketId: number): Promise<DcTrackTicket | null> {
    const res = await this.get<any>(`/tickets/${ticketId}`);
    return res.ticket ?? res;
  }

  async createTicket(ticket: Record<string, any>): Promise<DcTrackTicket> {
    const res = await this.post<any>('/tickets', ticket);
    logger.info({ ticket: ticket.ticketDesc }, 'Ticket created');
    return res.ticket ?? res;
  }

  async updateTicket(ticketId: number, updates: Record<string, any>): Promise<DcTrackTicket> {
    const res = await this.put<any>(`/tickets/${ticketId}`, updates);
    logger.info({ ticketId }, 'Ticket updated');
    return res.ticket ?? res;
  }

  async deleteTicket(ticketId: number, proceedOnWarning = true): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/tickets/${ticketId}?proceedOnWarning=${proceedOnWarning}`);
    logger.info({ ticketId }, 'Ticket deleted');
    return { success: true, message: `Ticket ${ticketId} deleted` };
  }

  async searchTickets(params: {
    columns?: Array<{ name: string; filter?: Record<string, string> }>;
    selectedColumns?: Array<{ name: string }>;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const url = `/quicksearch/tickets?pageNumber=${params.pageNumber ?? 0}&pageSize=${params.pageSize ?? 50}`;
    const res = await this.post<any>(url, {
      columns: params.columns ?? [],
      selectedColumns: params.selectedColumns ?? [{ name: 'ticketNumber' }, { name: 'ticketDesc' }, { name: 'ticketStatus' }],
    });
    return res;
  }

  async getTicketFieldList(): Promise<any[]> {
    const res = await this.get<any>('/quicksearch/tickets/ticketListFields');
    return res ?? [];
  }

  async bulkTickets(bodies: Record<string, any>[], method: string, proceedOnWarning = true): Promise<any> {
    const res = await this.post<any>('/tickets/bulk', { bodies, method, proceedOnWarning });
    logger.info({ method, count: bodies.length }, 'Bulk ticket operation completed');
    return res;
  }

  async assignTicketEntity(entityType: string, ticketId: number, entityId: number): Promise<any> {
    const res = await this.post<any>(`/tickets/assignment/${entityType}/assign`, { ticketId, entityId });
    logger.info({ ticketId, entityType, entityId }, 'Entity assigned to ticket');
    return res;
  }

  async unassignTicketEntity(entityType: string, ticketId: number, entityId: number): Promise<any> {
    const res = await this.post<any>(`/tickets/assignment/${entityType}/unassign`, { ticketId, entityId });
    logger.info({ ticketId, entityType, entityId }, 'Entity unassigned from ticket');
    return res;
  }

  // =======================================================================
  // PROJECTS
  // =======================================================================

  async getProject(projectId: number): Promise<DcTrackProject | null> {
    const res = await this.get<any>(`/dcimoperations/projects/${projectId}`);
    return res.project ?? res;
  }

  async createProject(project: Record<string, any>): Promise<DcTrackProject> {
    const res = await this.post<any>('/dcimoperations/projects', project);
    logger.info({ name: project.projectName }, 'Project created');
    return res.project ?? res;
  }

  async updateProject(projectId: number, updates: Record<string, any>): Promise<DcTrackProject> {
    const res = await this.put<any>(`/dcimoperations/projects/${projectId}`, updates);
    logger.info({ projectId }, 'Project updated');
    return res.project ?? res;
  }

  async deleteProject(projectId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/dcimoperations/projects/${projectId}`);
    logger.info({ projectId }, 'Project deleted');
    return { success: true, message: `Project ${projectId} deleted` };
  }

  // =======================================================================
  // PART CLASSES
  // =======================================================================

  async listPartClasses(): Promise<DcTrackPartClass[]> {
    const res = await this.get<any>('/parts/classes');
    return res.partClasses ?? res.data ?? [];
  }

  async createPartClass(partClass: Record<string, any>): Promise<DcTrackPartClass> {
    const res = await this.post<any>('/parts/classes', partClass);
    logger.info({ className: partClass.className }, 'Part class created');
    return res;
  }

  async updatePartClass(partClassId: number, updates: Record<string, any>): Promise<DcTrackPartClass> {
    const res = await this.put<any>(`/parts/classes/${partClassId}`, updates);
    logger.info({ partClassId }, 'Part class updated');
    return res;
  }

  async deletePartClass(partClassId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/parts/classes/${partClassId}`);
    logger.info({ partClassId }, 'Part class deleted');
    return { success: true, message: `Part class ${partClassId} deleted` };
  }

  // =======================================================================
  // PART MODELS
  // =======================================================================

  async getPartModel(modelId: number): Promise<DcTrackPartModel | null> {
    const res = await this.get<any>(`/partModels/${modelId}`);
    return res;
  }

  async createPartModel(model: Record<string, any>): Promise<DcTrackPartModel> {
    const res = await this.post<any>('/partModels', model);
    logger.info({ modelName: model.modelName }, 'Part model created');
    return res;
  }

  async updatePartModel(modelId: number, updates: Record<string, any>): Promise<DcTrackPartModel> {
    const res = await this.put<any>(`/partModels/${modelId}`, updates);
    logger.info({ modelId }, 'Part model updated');
    return res;
  }

  async deletePartModel(modelId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/partModels/${modelId}`);
    logger.info({ modelId }, 'Part model deleted');
    return { success: true, message: `Part model ${modelId} deleted` };
  }

  async searchPartModels(params: {
    columns?: any[];
    selectedColumns?: Array<{ name: string }>;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const url = `/quicksearch/parts/models?pageNumber=${params.pageNumber ?? 0}&pageSize=${params.pageSize ?? 50}`;
    return this.post<any>(url, {
      columns: params.columns ?? [],
      selectedColumns: params.selectedColumns ?? [{ name: 'modelName' }, { name: 'make' }],
    });
  }

  // =======================================================================
  // PARTS (INSTANCES)
  // =======================================================================

  async getPart(partId: number): Promise<DcTrackPart | null> {
    const res = await this.get<any>(`/parts/${partId}`);
    return res.part ?? res;
  }

  async createPart(part: Record<string, any>): Promise<DcTrackPart> {
    const res = await this.post<any>('/parts', part);
    logger.info({ partModelId: part.partModelId }, 'Part created');
    return res.part ?? res;
  }

  async updatePart(partId: number, updates: Record<string, any>): Promise<DcTrackPart> {
    const res = await this.put<any>(`/parts/${partId}`, updates);
    logger.info({ partId }, 'Part updated');
    return res.part ?? res;
  }

  async deletePart(partId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/parts/${partId}`);
    logger.info({ partId }, 'Part deleted');
    return { success: true, message: `Part ${partId} deleted` };
  }

  async searchParts(params: {
    columns?: any[];
    selectedColumns?: Array<{ name: string }>;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const url = `/quicksearch/parts?pageNumber=${params.pageNumber ?? 0}&pageSize=${params.pageSize ?? 50}`;
    return this.post<any>(url, {
      columns: params.columns ?? [],
      selectedColumns: params.selectedColumns ?? [{ name: 'partModelName' }, { name: 'locationName' }],
    });
  }

  async adjustPartStock(partId: number, activity: string, quantity: number, locationId?: number): Promise<any> {
    const payload: Record<string, any> = { quantity };
    if (locationId) payload.locationId = locationId;
    const res = await this.put<any>(`/parts/${partId}/stock/${activity}`, payload);
    logger.info({ partId, activity, quantity }, 'Part stock adjusted');
    return res;
  }

  async assignParts(assignmentType: string, assignments: Record<string, any>[]): Promise<any> {
    const res = await this.post<any>(`/parts/assignments/${assignmentType}`, { assignments });
    logger.info({ assignmentType, count: assignments.length }, 'Parts assigned');
    return res;
  }

  // =======================================================================
  // CUSTOM FIELDS
  // =======================================================================

  async listCustomFields(): Promise<DcTrackCustomField[]> {
    const res = await this.get<any>('/settings/lists/customFields');
    return res.customFields ?? res.data ?? [];
  }

  async getCustomField(customFieldId: number): Promise<DcTrackCustomField | null> {
    const res = await this.get<any>(`/settings/lists/customFields/${customFieldId}`);
    return res.customField ?? res;
  }

  async createCustomField(field: Record<string, any>): Promise<DcTrackCustomField> {
    const res = await this.post<any>('/settings/lists/customFields', field);
    logger.info({ label: field.label }, 'Custom field created');
    return res;
  }

  async updateCustomField(customFieldId: number, updates: Record<string, any>): Promise<DcTrackCustomField> {
    const res = await this.put<any>(`/settings/lists/customFields/${customFieldId}`, updates);
    logger.info({ customFieldId }, 'Custom field updated');
    return res;
  }

  async deleteCustomField(customFieldId: number, proceedOnWarning = false): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/settings/lists/customFields/${customFieldId}?proceedOnWarning=${proceedOnWarning}`);
    logger.info({ customFieldId }, 'Custom field deleted');
    return { success: true, message: `Custom field ${customFieldId} deleted` };
  }

  // =======================================================================
  // AUDIT TRAIL
  // =======================================================================

  async searchAuditTrail(params: {
    columns?: any[];
    selectedColumns?: Array<{ name: string }>;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const url = `/quicksearch/auditTrail?pageNumber=${params.pageNumber ?? 0}&pageSize=${params.pageSize ?? 50}`;
    try {
      return await this.post<any>(url, {
        columns: params.columns ?? [],
        selectedColumns: params.selectedColumns ?? [
          { name: 'action' }, { name: 'changedBy' }, { name: 'changedDate' },
          { name: 'entityName' }, { name: 'entityType' },
        ],
      });
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('400')) {
        return {
          status: 'not_available',
          summary: 'The audit trail feature is not accessible with the current API credentials. This may require additional dcTrack licensing or the API user may need audit trail permissions enabled by an administrator.',
          searchResults: { auditTrail: [] }, totalRows: 0,
        };
      }
      throw err;
    }
  }

  async getAuditTrailFieldList(): Promise<any[]> {
    const res = await this.get<any>('/quicksearch/auditTrail/auditTrailListFields');
    return res ?? [];
  }

  // =======================================================================
  // REPORTS / CHARTS
  // =======================================================================

  async listCharts(): Promise<DcTrackChart[]> {
    const res = await this.get<any>('/reports/charts');
    return res.charts ?? res.data ?? [];
  }

  async getChart(chartId: number): Promise<DcTrackChart | null> {
    const res = await this.get<any>(`/reports/charts/${chartId}`);
    return res.chart ?? res;
  }

  async getChartData(chartId: number, params?: Record<string, any>): Promise<any> {
    return this.post<any>(`/reports/charts/${chartId}/data`, params ?? {});
  }

  // =======================================================================
  // BREAKERS
  // =======================================================================

  async listBreakers(panelItemId: number): Promise<DcTrackBreaker[]> {
    const res = await this.get<any>(`/dcimoperations/items/${panelItemId}/breakers`);
    return res.breakers ?? res.data ?? [];
  }

  async getBreaker(panelItemId: number, breakerPortId: number): Promise<DcTrackBreaker | null> {
    const res = await this.get<any>(`/dcimoperations/items/${panelItemId}/breakers/${breakerPortId}`);
    return res.breaker ?? res;
  }

  async createBreaker(panelItemId: number, breaker: Record<string, any>): Promise<DcTrackBreaker> {
    const res = await this.post<any>(`/dcimoperations/items/${panelItemId}/breakers`, breaker);
    logger.info({ panelItemId }, 'Breaker created');
    return res.breaker ?? res;
  }

  async updateBreaker(panelItemId: number, breakerPortId: number, updates: Record<string, any>): Promise<DcTrackBreaker> {
    const res = await this.put<any>(`/dcimoperations/items/${panelItemId}/breakers/${breakerPortId}`, updates);
    logger.info({ panelItemId, breakerPortId }, 'Breaker updated');
    return res.breaker ?? res;
  }

  async deleteBreaker(panelItemId: number, breakerPortId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/dcimoperations/items/${panelItemId}/breakers/${breakerPortId}`);
    logger.info({ panelItemId, breakerPortId }, 'Breaker deleted');
    return { success: true, message: `Breaker ${breakerPortId} deleted` };
  }

  // =======================================================================
  // LOOKUP LISTS
  // =======================================================================

  async getLookupList(listType: string, id?: number): Promise<any[]> {
    const path = id ? `/dcimoperations/lookups/${listType}/${id}` : `/dcimoperations/lookups/${listType}`;
    const res = await this.get<any>(path);
    return res.data ?? res ?? [];
  }

  async getPicklistOptions(listType: string): Promise<any[]> {
    const res = await this.get<any>(`/dcimoperations/picklists/${listType}`);
    return res.data ?? res ?? [];
  }

  async updatePicklistOptions(listType: string, options: Record<string, any>): Promise<any> {
    return this.put<any>(`/dcimoperations/picklists/${listType}`, options);
  }

  // =======================================================================
  // WEBHOOKS
  // =======================================================================

  async getWebhookConfig(): Promise<DcTrackWebhook | null> {
    const res = await this.get<any>('/notifications/config');
    return res;
  }

  async updateWebhookConfig(config: Record<string, any>): Promise<DcTrackWebhook> {
    const res = await this.put<any>('/notifications/config', config);
    logger.info('Webhook config updated');
    return res;
  }

  async deleteWebhookConfig(): Promise<{ success: boolean; message: string }> {
    await this.del<any>('/notifications/config');
    logger.info('Webhook config deleted');
    return { success: true, message: 'Webhook config deleted' };
  }

  // =======================================================================
  // RELATIONSHIPS
  // =======================================================================

  async getRelationship(id: number): Promise<DcTrackRelationship | null> {
    const res = await this.get<any>(`/relationship/${id}`);
    return res;
  }

  async createRelationship(relationship: Record<string, any>): Promise<DcTrackRelationship> {
    const res = await this.post<any>('/relationship', relationship);
    logger.info('Relationship created');
    return res;
  }

  async searchRelationships(params: Record<string, any>): Promise<DcTrackRelationship[]> {
    const res = await this.post<any>('/relationship/search', params);
    return res.relationships ?? res.data ?? [];
  }

  async getRelationshipsByEntity(entityType: string, entityId: number): Promise<DcTrackRelationship[]> {
    const res = await this.get<any>(`/relationship/${entityType}/${entityId}`);
    return res.relationships ?? res.data ?? [];
  }

  async deleteRelationship(id: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/relationship/${id}`);
    logger.info({ id }, 'Relationship deleted');
    return { success: true, message: `Relationship ${id} deleted` };
  }

  // =======================================================================
  // PERMISSIONS
  // =======================================================================

  async listPermissions(): Promise<DcTrackPermission[]> {
    const res = await this.get<any>('/permissions/explicit');
    return res.permissions ?? res.data ?? [];
  }

  async getPermission(permissionId: number): Promise<DcTrackPermission | null> {
    const res = await this.get<any>(`/permissions/explicit/${permissionId}`);
    return res.permission ?? res;
  }

  async createPermission(permission: Record<string, any>): Promise<DcTrackPermission> {
    const res = await this.post<any>('/permissions/explicit', permission);
    logger.info('Permission created');
    return res;
  }

  async updatePermission(permissionId: number, updates: Record<string, any>): Promise<DcTrackPermission> {
    const res = await this.put<any>(`/permissions/explicit/${permissionId}`, updates);
    logger.info({ permissionId }, 'Permission updated');
    return res;
  }

  async deletePermission(permissionId: number): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/permissions/explicit/${permissionId}`);
    logger.info({ permissionId }, 'Permission deleted');
    return { success: true, message: `Permission ${permissionId} deleted` };
  }

  // =======================================================================
  // VISUALIZATIONS (FLOORMAP)
  // =======================================================================

  async getFloormapConfig(locationId: number): Promise<DcTrackFloormapConfig | null> {
    const res = await this.get<any>(`/visualization/floormaps/configuration/${locationId}`);
    return res;
  }

  async getAllFloormapConfigs(): Promise<DcTrackFloormapConfig[]> {
    const res = await this.get<any>('/visualization/floormaps/configuration');
    return res.configurations ?? res.data ?? [];
  }

  async updateFloormapConfig(locationId: number, config: Record<string, any>): Promise<any> {
    const res = await this.put<any>(`/visualization/floormaps/configuration/${locationId}`, config);
    logger.info({ locationId }, 'Floormap config updated');
    return res;
  }

  // =======================================================================
  // LOCATION FAVORITES
  // =======================================================================

  async getLocationFavorites(username: string, entityType: string): Promise<any[]> {
    const res = await this.get<any>(`/users/${username}/favorites/${entityType}`);
    return res.favorites ?? res.data ?? [];
  }

  async assignLocationFavorites(username: string, favorites: Record<string, any>): Promise<any> {
    return this.put<any>(`/users/${username}/favorites`, favorites);
  }

  // =======================================================================
  // CONNECTION TEST
  // =======================================================================

  async testConnection(): Promise<boolean> {
    try {
      // Use /makes as a lightweight v2 endpoint to verify connectivity
      await this.get<any>('/makes');
      return true;
    } catch {
      return false;
    }
  }
}
