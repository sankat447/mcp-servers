/**
 * dcTrack API domain types.
 *
 * All interfaces mirror the Sunbird dcTrack REST API v2 response shapes
 * so they can be used both as return types from the client and as
 * input/output types for MCP tool handlers.
 */

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export interface DcTrackLocation {
  id: number;
  name: string;
  code?: string;
  type: string;
  parentId?: number;
  parentName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// ---------------------------------------------------------------------------
// Cabinets
// ---------------------------------------------------------------------------

export interface DcTrackCabinet {
  id: number;
  name: string;
  locationId: number;
  locationName?: string;
  rowName?: string;
  ruHeight: number;
  usedRuCount?: number;
  availableRuCount?: number;
  ratedPowerKw?: number;
  status?: string;
}

// ---------------------------------------------------------------------------
// Items (devices, assets)
// ---------------------------------------------------------------------------

export interface DcTrackItem {
  id: number;
  tiName: string;
  tiSerialNumber?: string;
  tiAssetTag?: string;
  tiClass: string;
  cmbLocation?: string;
  cmbCabinet?: string;
  cmbStatus?: string;
  tiUPosition?: number;
  tiMounting?: string;
  tiMake?: string;
  tiModel?: string;
  tiRuHeight?: number;
}

// ---------------------------------------------------------------------------
// Capacity
// ---------------------------------------------------------------------------

export interface DcTrackCapacity {
  cabinetId: number;
  totalRu: number;
  usedRu: number;
  availableRu: number;
  ratedPowerKw: number;
  actualPowerKw?: number;
  availablePowerKw?: number;
  spaceUtilizationPercent: number;
  powerUtilizationPercent?: number;
}

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

export interface DcTrackConnection {
  id: number;
  sourceItemId: number;
  sourceItemName?: string;
  sourcePortId?: number;
  sourcePortName?: string;
  destItemId: number;
  destItemName?: string;
  destPortId?: number;
  destPortName?: string;
  cableId?: string;
  connectionType?: string;
}

// ---------------------------------------------------------------------------
// Models (equipment library)
// ---------------------------------------------------------------------------

export interface DcTrackModel {
  id: number;
  modelName: string;
  make: string;
  ruHeight: number;
  class: string;
  ratedPowerWatts?: number;
  weight?: number;
}

// ---------------------------------------------------------------------------
// Pagination helpers
// ---------------------------------------------------------------------------

export interface PaginationParams {
  pageSize?: number;
  pageNumber?: number;
}

// ---------------------------------------------------------------------------
// Makes
// ---------------------------------------------------------------------------

export interface DcTrackMake {
  makeId: number;
  makeName: string;
  accountNumber?: string;
  technicalSupport?: string;
  aliases?: string[];
  notes?: string;
}

// ---------------------------------------------------------------------------
// Data Ports
// ---------------------------------------------------------------------------

export interface DcTrackDataPort {
  portId: number;
  portName: string;
  portSubclass?: string;
  mediaType?: string;
  protocol?: string;
  dataRate?: string;
  connector?: string;
  index?: number;
  itemId?: number;
}

// ---------------------------------------------------------------------------
// Power Ports
// ---------------------------------------------------------------------------

export interface DcTrackPowerPort {
  portId: number;
  portName: string;
  portSubclass?: string;
  connector?: string;
  phase?: string;
  volts?: string;
  ratedCapacityAmps?: number;
  index?: number;
  itemId?: number;
}

// ---------------------------------------------------------------------------
// Power Chain Reading
// ---------------------------------------------------------------------------

export interface DcTrackActualReading {
  portId: number;
  portName?: string;
  itemId?: number;
  itemName?: string;
  actualAmps?: number;
  actualVolts?: number;
  actualWatts?: number;
  actualPowerFactor?: number;
  readingTime?: string;
}

// ---------------------------------------------------------------------------
// Sub-Locations
// ---------------------------------------------------------------------------

export interface DcTrackSubLocation {
  id: number;
  name: string;
  type?: string;
  typeCode?: number;
  parentId?: number;
  locationId?: number;
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export interface DcTrackTicket {
  id: number;
  ticketNumber?: string;
  ticketDesc?: string;
  ticketStatus?: string;
  ticketAction?: string;
  ticketComments?: string;
  assignedTo?: string;
  createdBy?: string;
  createdDate?: string;
  lastUpdatedOn?: string;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface DcTrackProject {
  id: number;
  projectName?: string;
  projectNumber?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  projectManager?: string;
}

// ---------------------------------------------------------------------------
// Part Classes
// ---------------------------------------------------------------------------

export interface DcTrackPartClass {
  id: number;
  className?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Part Models
// ---------------------------------------------------------------------------

export interface DcTrackPartModel {
  id: number;
  modelName?: string;
  make?: string;
  partClassId?: number;
  partClassName?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Parts (Instances)
// ---------------------------------------------------------------------------

export interface DcTrackPart {
  id: number;
  partModelId?: number;
  partModelName?: string;
  locationId?: number;
  locationName?: string;
  quantity?: number;
  serialNumber?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Custom Fields
// ---------------------------------------------------------------------------

export interface DcTrackCustomField {
  id: number;
  label?: string;
  fieldType?: string;
  appliedTo?: string;
  required?: boolean;
  options?: string[];
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface DcTrackWebhook {
  url?: string;
  enabled?: boolean;
  events?: string[];
  secret?: string;
}

// ---------------------------------------------------------------------------
// Relationships (Entity Links)
// ---------------------------------------------------------------------------

export interface DcTrackRelationship {
  id: number;
  entityType1?: string;
  entityId1?: number;
  entityType2?: string;
  entityId2?: number;
  relationshipType?: string;
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export interface DcTrackPermission {
  id: number;
  entityType?: string;
  entityId?: number;
  role?: string;
  username?: string;
  accessLevel?: string;
}

// ---------------------------------------------------------------------------
// Audit Trail
// ---------------------------------------------------------------------------

export interface DcTrackAuditRecord {
  entityType?: string;
  entityId?: number;
  changeType?: string;
  changedBy?: string;
  changedOn?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

// ---------------------------------------------------------------------------
// Charts / Reports
// ---------------------------------------------------------------------------

export interface DcTrackChart {
  id: number;
  name?: string;
  description?: string;
  chartType?: string;
}

// ---------------------------------------------------------------------------
// Breakers
// ---------------------------------------------------------------------------

export interface DcTrackBreaker {
  breakerPortId: number;
  breakerName?: string;
  breakerStatus?: string;
  ratingAmps?: number;
  noOfPoles?: number;
  panelItemId?: number;
}

// ---------------------------------------------------------------------------
// Floormap / Visualization
// ---------------------------------------------------------------------------

export interface DcTrackFloormapConfig {
  locationId: number;
  locationName?: string;
  floormapImage?: string;
  configuration?: Record<string, any>;
}
