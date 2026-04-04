/**
 * dcTrack REST API client.
 *
 * Encapsulates every dcTrack v2 API call used by the MCP tools.
 * Read operations are cached; write operations bypass the cache.
 */

import { BaseClient } from './base-client.js';
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
  constructor() {
    super('dctrack', '/api/v2');
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
    const res = await this.get<any>('/dcimoperations/locations', {
      ...params,
      pageSize: params?.pageSize ?? 100,
      pageNumber: params?.pageNumber ?? 0,
    });
    return res.locations ?? res.data ?? [];
  }

  async getLocation(locationId: number): Promise<DcTrackLocation | null> {
    const res = await this.get<any>(`/dcimoperations/locations/${locationId}`);
    return res.location ?? res;
  }

  async listCabinets(params?: {
    locationId?: number;
    pageSize?: number;
    pageNumber?: number;
  }): Promise<DcTrackCabinet[]> {
    const res = await this.get<any>('/dcimoperations/cabinets', {
      ...params,
      pageSize: params?.pageSize ?? 100,
      pageNumber: params?.pageNumber ?? 0,
    });
    return res.cabinets ?? res.data ?? [];
  }

  async getCabinet(cabinetId: number): Promise<DcTrackCabinet | null> {
    const res = await this.get<any>(`/dcimoperations/cabinets/${cabinetId}`);
    return res.cabinet ?? res;
  }

  async getCabinetItems(cabinetId: number): Promise<DcTrackItem[]> {
    const res = await this.get<any>(`/dcimoperations/cabinets/${cabinetId}/items`);
    return res.items ?? res.data ?? [];
  }

  async getCabinetCapacity(cabinetId: number): Promise<DcTrackCapacity | null> {
    const res = await this.get<any>(`/capacity/cabinets/${cabinetId}`);
    return res.capacity ?? res;
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
    const payload = {
      columns: [
        { name: 'tiName' },
        { name: 'tiSerialNumber' },
        { name: 'tiAssetTag' },
        { name: 'cmbLocation' },
        { name: 'cmbCabinet' },
        { name: 'tiClass' },
        { name: 'cmbStatus' },
        { name: 'tiUPosition' },
        { name: 'tiMake' },
        { name: 'tiModel' },
      ],
      selectedColumns: [
        { name: 'tiName' },
        { name: 'tiSerialNumber' },
        { name: 'cmbLocation' },
        { name: 'cmbCabinet' },
        { name: 'tiClass' },
        { name: 'cmbStatus' },
      ],
      filters: {} as Record<string, any>,
      pageSize: params.pageSize ?? 50,
      pageNumber: params.pageNumber ?? 0,
    };

    if (params.query) payload.filters['tiName'] = { contains: params.query };
    if (params.class) payload.filters['tiClass'] = { eq: params.class };
    if (params.status) payload.filters['cmbStatus'] = { eq: params.status };

    const res = await this.post<any>('/quicksearch/items', payload);
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
    const res = await this.get<any>('/dcimoperations/connections', params as any);
    return res.connections ?? res.data ?? [];
  }

  async getConnection(connectionId: number): Promise<DcTrackConnection | null> {
    const res = await this.get<any>(`/dcimoperations/connections/${connectionId}`);
    return res.connection ?? res;
  }

  async listModels(params?: {
    class?: string;
    make?: string;
    pageSize?: number;
  }): Promise<DcTrackModel[]> {
    const res = await this.get<any>('/dcimoperations/models', {
      ...params,
      pageSize: params?.pageSize ?? 100,
    });
    return res.models ?? res.data ?? [];
  }

  async getModel(modelId: number): Promise<DcTrackModel | null> {
    const res = await this.get<any>(`/dcimoperations/models/${modelId}`);
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

    const res = await this.post<any>('/dcimoperations/items', payload);
    logger.info({ itemName: item.tiName }, 'Item created');
    return res.item ?? res;
  }

  async updateItem(itemId: number, updates: Record<string, any>): Promise<DcTrackItem> {
    const res = await this.put<any>(`/dcimoperations/items/${itemId}`, updates);
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
    const payload: Record<string, any> = {
      sourceItemId: connection.sourceItemId,
      destItemId: connection.destItemId,
    };
    if (connection.sourcePortId) payload.sourcePortId = connection.sourcePortId;
    if (connection.sourcePortName) payload.sourcePortName = connection.sourcePortName;
    if (connection.destPortId) payload.destPortId = connection.destPortId;
    if (connection.destPortName) payload.destPortName = connection.destPortName;
    if (connection.cableId) payload.cableId = connection.cableId;
    if (connection.connectionType) payload.connectionType = connection.connectionType;

    const res = await this.post<any>('/dcimoperations/connections', payload);
    logger.info(
      { src: connection.sourceItemId, dest: connection.destItemId },
      'Connection created',
    );
    return res.connection ?? res;
  }

  async deleteConnection(
    connectionId: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.del<any>(`/dcimoperations/connections/${connectionId}`);
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
    const payload: Record<string, any> = {
      tiRequestType: request.requestType,
      tiSummary: request.summary,
    };
    if (request.description) payload.tiDescription = request.description;
    if (request.itemIds) payload.itemIds = request.itemIds;
    if (request.scheduledDate) payload.tiScheduledDate = request.scheduledDate;
    if (request.assignee) payload.cmbAssignee = request.assignee;
    if (request.priority) payload.cmbPriority = request.priority;

    const res = await this.post<any>('/requests', payload);
    logger.info({ summary: request.summary }, 'Change request created');
    return res.request ?? res;
  }

  async updateChangeRequest(
    requestId: number,
    updates: { status?: string; comments?: string },
  ): Promise<any> {
    const payload: Record<string, any> = {};
    if (updates.status) payload.cmbStatus = updates.status;
    if (updates.comments) payload.tiComments = updates.comments;

    const res = await this.put<any>(`/requests/${requestId}`, payload);
    logger.info({ requestId }, 'Change request updated');
    return res.request ?? res;
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
    modelId?: number;
    ruHeight?: number;
    ratedPowerKw?: number;
    rowPosition?: number;
    customFields?: Record<string, any>;
  }): Promise<DcTrackCabinet> {
    const payload: Record<string, any> = {
      tiName: cabinet.name,
      cmbLocation: cabinet.locationId,
      tiRuHeight: cabinet.ruHeight ?? 42,
    };
    if (cabinet.modelId) payload.cmbModel = cabinet.modelId;
    if (cabinet.ratedPowerKw) payload.tiRatedPowerKw = cabinet.ratedPowerKw;
    if (cabinet.rowPosition) payload.tiRowPosition = cabinet.rowPosition;
    if (cabinet.customFields) Object.assign(payload, cabinet.customFields);

    const res = await this.post<any>('/dcimoperations/cabinets', payload);
    logger.info({ cabinetName: cabinet.name }, 'Cabinet created');
    return res.cabinet ?? res;
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
    const payload: Record<string, any> = {
      tiName: location.name,
      cmbType: location.type,
    };
    if (location.parentId) payload.cmbParent = location.parentId;
    if (location.code) payload.tiCode = location.code;
    if (location.address) payload.tiAddress = location.address;
    if (location.city) payload.tiCity = location.city;
    if (location.state) payload.tiState = location.state;
    if (location.country) payload.tiCountry = location.country;
    if (location.customFields) Object.assign(payload, location.customFields);

    const res = await this.post<any>('/dcimoperations/locations', payload);
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
    const res = await this.get<any>(`/makes/${makeId}`);
    return res.make ?? res;
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
    const res = await this.post<any>('/models?returnDetails=true&proceedOnWarning=false', model);
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
    const res = await this.post<any>(`/powerChain/${locationId}`, {
      nodeFields: nodeFields ?? ['tiName', 'cmbLocation', 'tiClass'],
    });
    return res;
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
    const payload: Record<string, any> = {};
    if (params.locationIds) payload.locationIds = params.locationIds;
    if (params.minAvailableRUs) payload.minAvailableRUs = params.minAvailableRUs;
    if (params.minAvailablePowerKw) payload.minAvailablePowerKw = params.minAvailablePowerKw;

    const res = await this.post<any>('/capacity/cabinets/list/search', payload);
    return res.cabinets ?? res.data ?? [];
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
    const res = await this.post<any>('/subLocations', subLocation);
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
    return this.post<any>(url, {
      columns: params.columns ?? [],
      selectedColumns: params.selectedColumns ?? [
        { name: 'entityType' }, { name: 'changeType' }, { name: 'changedBy' }, { name: 'changedOn' },
      ],
    });
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
      await this.listLocations({ pageSize: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
