/**
 * Power IQ API domain types.
 *
 * All interfaces mirror the Sunbird Power IQ REST API v2 response shapes.
 */

// ---------------------------------------------------------------------------
// Data Centers
// ---------------------------------------------------------------------------

export interface PowerIQDataCenter {
  id: number;
  name: string;
  externalKey?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// PDUs (Power Distribution Units)
// ---------------------------------------------------------------------------

export interface PowerIQPDU {
  id: number;
  name: string;
  deviceType: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  cabinetId?: number;
  cabinetName?: string;
  ratedAmps?: number;
  ratedVolts?: number;
  phases?: number;
  outletCount?: number;
}

export interface PowerIQPDUReading {
  id: number;
  pduId: number;
  activePower?: number;
  apparentPower?: number;
  voltage?: number;
  current?: number;
  powerFactor?: number;
  energy?: number;
  readingTime: string;
}

export interface PowerIQOutletReading {
  id: number;
  outletId: number;
  pduId: number;
  outletNumber: number;
  activePower?: number;
  current?: number;
  voltage?: number;
  readingTime: string;
}

// ---------------------------------------------------------------------------
// Sensors
// ---------------------------------------------------------------------------

export interface PowerIQSensor {
  id: number;
  name: string;
  sensorType: string;
  cabinetId?: number;
  cabinetName?: string;
  position?: string;
  units?: string;
}

export interface PowerIQSensorReading {
  id: number;
  sensorId: number;
  value: number;
  units: string;
  readingTime: string;
}

// ---------------------------------------------------------------------------
// PUE (Power Usage Effectiveness)
// ---------------------------------------------------------------------------

export interface PowerIQPUE {
  datacenterId?: number;
  datacenterName?: string;
  pue: number;
  itPowerKw: number;
  facilityPowerKw: number;
  coolingPowerKw?: number;
  readingTime: string;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export interface PowerIQAlert {
  id: number;
  alertType: string;
  severity: string;
  source: string;
  sourceId?: number;
  sourceName?: string;
  message: string;
  value?: number;
  threshold?: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// IT Devices
// ---------------------------------------------------------------------------

export interface PowerIQITDevice {
  id: number;
  name: string;
  cabinetId?: number;
  cabinetName?: string;
  pduConnections?: Array<{
    pduId: number;
    pduName: string;
    outletNumber: number;
  }>;
  currentPowerWatts?: number;
}

// ---------------------------------------------------------------------------
// Hierarchy Resources (Floor, Room, Aisle, Row, Rack)
// ---------------------------------------------------------------------------

export interface PowerIQFloor {
  id: number;
  name: string;
  external_key?: string;
  parent?: { type: string; id: number };
}

export interface PowerIQRoom {
  id: number;
  name: string;
  external_key?: string;
  parent?: { type: string; id: number };
}

export interface PowerIQRack {
  id: number;
  name: string;
  external_key?: string;
  capacity?: number;
  parent?: { type: string; id: number };
  decommissioned_at?: string;
}

export interface PowerIQDevice {
  id: number;
  name: string;
  customer?: string;
  device_type?: string;
  power_rating?: number;
  decommissioned?: boolean;
  custom_field_1?: string;
  custom_field_2?: string;
  external_key?: string;
  ip_address?: string;
  parent?: { type: string; id: number };
}

// ---------------------------------------------------------------------------
// Inlets & Circuits
// ---------------------------------------------------------------------------

export interface PowerIQInlet {
  id: number;
  name?: string;
  ordinal: number;
  pdu_id: number;
  rated_amps?: number;
  reading?: Record<string, any>;
}

export interface PowerIQCircuit {
  id: number;
  pdu_id: number;
  ordinal: number;
  name?: string;
  rated_amps?: number;
  device_id?: number;
  panel_id?: number;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface PowerIQEvent {
  id: number;
  name: string;
  severity: string;
  created_at: string;
  occurred_at?: string;
  cleared_at?: string;
  eventable_type?: string;
  eventable_id?: number;
  source?: number;
  notification_status?: string;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface PowerIQJob {
  id: number;
  status: string;
  completed: boolean;
  percent_complete?: number;
  start_time?: string;
  end_time?: string;
  has_errors: boolean;
  error_count?: number;
  last_message?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Readings (generic)
// ---------------------------------------------------------------------------

export interface PowerIQReading {
  id?: number;
  reading_time: string;
  active_power?: number;
  apparent_power?: number;
  current?: number;
  voltage?: number;
  power_factor?: number;
  watt_hour?: number;
  watt_hour_delta?: number;
  unutilized_capacity?: number;
  value?: number;
  min_value?: number;
  max_value?: number;
}

// ---------------------------------------------------------------------------
// System Info
// ---------------------------------------------------------------------------

export interface PowerIQSystemInfo {
  poweriq_version: string;
  uuid: string;
  database_uuid?: string;
  current_time?: string;
  configuration?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Asset Strips
// ---------------------------------------------------------------------------

export interface PowerIQAssetStrip {
  id: number;
  pdu_id: number;
  name?: string;
  state?: string;
  ordinal?: number;
  default_connected_led_color?: string;
  default_disconnected_led_color?: string;
  numbering_scheme?: string;
  orientation?: string;
}

export interface PowerIQRackUnit {
  id: number;
  asset_strip_id?: number;
  position?: number;
  name?: string;
  asset_tag?: string;
}

export interface PowerIQBladeSlot {
  id: number;
  rack_unit_id?: number;
  position?: number;
  name?: string;
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export interface PowerIQTagGroup {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PowerIQTag {
  id: number;
  name: string;
  tag_group_id?: number;
  tag_group_name?: string;
  tag_entries_count?: number;
}

export interface PowerIQTagEntry {
  id: number;
  tag_id?: number;
  taggable_type?: string;
  taggable_id?: number;
}

// ---------------------------------------------------------------------------
// Transfer Switches
// ---------------------------------------------------------------------------

export interface PowerIQTransferSwitch {
  id: number;
  pdu_id: number;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Outlets (extended for write)
// ---------------------------------------------------------------------------

export interface PowerIQOutlet {
  id: number;
  ordinal: number;
  name?: string;
  device_id?: number;
  pdu_id: number;
  state?: string;
  rated_amps?: number;
  pue_it?: boolean;
  pue_total?: boolean;
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

export interface PowerIQPanel {
  id: number;
  pdu_id?: number;
  name?: string;
}
