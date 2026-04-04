# Power IQ REST API Reference (v9.0.1)

Complete REST API documentation for Sunbird Power IQ - Data Center Power Management.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Request / Response Format](#request--response-format)
- [HTTP Status Codes](#http-status-codes)
- [Search, Filter & Pagination](#search-filter--pagination)
- [Async Operations](#async-operations)
- [Data Center Hierarchy](#data-center-hierarchy)
- [PDU Management](#pdu-management)
- [Outlets](#outlets)
- [Inlets](#inlets)
- [Circuits & Circuit Breakers](#circuits--circuit-breakers)
- [Panels](#panels)
- [Sensors](#sensors)
- [Events](#events)
- [Power & Energy Readings](#power--energy-readings)
- [Power Control](#power-control)
- [Asset Strips & Rack Units](#asset-strips--rack-units)
- [Tags & Tag Groups](#tags--tag-groups)
- [Transfer Switches](#transfer-switches)
- [Integration](#integration)
- [Jobs](#jobs)
- [System Info & Settings](#system-info--settings)
- [Floor Maps](#floor-maps)
- [Extractions](#extractions)
- [PUE Calculations](#pue-calculations)
- [Measurements & Summaries](#measurements--summaries)
- [Resource Attributes](#resource-attributes)

---

## Overview

The Power IQ REST API provides programmatic access to manage and monitor data center power infrastructure including PDUs, outlets, sensors, readings, events, and the data center hierarchy.

**Base URL**: `https://{poweriq-host}/api/v2`

All endpoints are prefixed with `/api/v2/`.

---

## Authentication

Power IQ uses **HTTP Basic Authentication** over HTTPS.

```
Authorization: Basic <Base64(username:password)>
```

**Example**:
```
Authorization: Basic YWRtaW46c3VuYmlyZA==
```

---

## Request / Response Format

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Accept` | `application/json; charset=utf-8` |

- All request/response bodies use JSON format
- GET requests have no body
- Server timeout: 600 seconds maximum
- Responses may be GZip-compressed

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Missing/invalid parameters, body, or wrong Content-Type |
| 401 | Authentication failure or insufficient permissions |
| 404 | Resource or action does not exist |
| 406 | Incorrect Accept header or unsupported format |
| 422 | Async request failed |
| 500 | Server-side error |

**Error Response**:
```json
{
  "error": "ExceptionType",
  "messages": ["description of the error"]
}
```

---

## Search, Filter & Pagination

All list endpoints (`GET /api/v2/{resource}`) support search via URL query parameters. Parameters are combined with AND logic.

### Filter Modifiers

Append modifier to field name: `{field}_{modifier}=value`

**Universal (all types)**:
| Modifier | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `name_eq=PDU-1` |
| `not_eq` | Not equals | `state_not_eq=OFF` |
| `in[]` | In array | `id_in[]=1&id_in[]=2` |
| `not_in[]` | Not in array | `id_not_in[]=3` |
| `null` | Is null | `device_id_null=true` |
| `not_null` | Is not null | `device_id_not_null=true` |

**String-specific**:
| Modifier | Description | Example |
|----------|-------------|---------|
| `cont` | Contains substring | `name_cont=server` |
| `not_cont` | Does not contain | `name_not_cont=test` |
| `cont_any[]` | Contains any | `name_cont_any[]=a&name_cont_any[]=b` |
| `start` | Starts with | `name_start=PDU` |
| `end` | Ends with | `name_end=-01` |
| `not_start` | Does not start with | `name_not_start=TEST` |
| `not_end` | Does not end with | `name_not_end=-old` |

**Numeric / Date / Time**:
| Modifier | Description | Example |
|----------|-------------|---------|
| `gt` | Greater than | `created_at_gt=2024/01/01` |
| `lt` | Less than | `active_power_lt=1000` |
| `gteq` | Greater than or equal | `reading_time_gteq=2024/06/01` |
| `lteq` | Less than or equal | `current_lteq=20.5` |

**Boolean**:
| Modifier | Description | Example |
|----------|-------------|---------|
| `true` | Is true | `pue_it_true=1` |
| `false` | Is false | `decommissioned_false=1` |

**Presence**:
| Modifier | Description | Example |
|----------|-------------|---------|
| `present` | Not NULL and not empty | `name_present=1` |
| `blank` | Is NULL or empty | `external_key_blank=1` |

### Pagination & Sorting

| Parameter | Description | Example |
|-----------|-------------|---------|
| `limit` | Max results to return | `limit=10` |
| `offset` | Number of records to skip | `offset=20` |
| `order` | Sort by field.direction | `order=reading_time.desc` |

**Example**: Get 10 most recent events:
```
GET /api/v2/events?order=created_at.desc&limit=10
```

**Example**: Get events for a specific PDU:
```
GET /api/v2/events?eventable_type_eq=Pdu&eventable_id_eq=50
```

---

## Async Operations

Some operations support async mode by passing `async=true`. Returns a Job resource:

```json
{
  "id": 123,
  "status": "ACTIVE",
  "percent_complete": 45.0,
  "has_errors": false
}
```

Monitor via `GET /api/v2/jobs/:id`.

---

## Data Center Hierarchy

Power IQ organizes resources in a hierarchy: **Data Center > Floor > Room > Aisle > Row > Rack > Device/PDU**

All hierarchy resources share common endpoints:

### Common Endpoints (for each resource type)

Replace `{resource}` with: `data_centers`, `floors`, `rooms`, `aisles`, `rows`, `racks`, `devices`, `sensors`, `doors`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/{resource}` | List all (supports search/filter) |
| GET | `/api/v2/{resource}/:id` | Get by ID |
| POST | `/api/v2/{resource}` | Create new |
| PUT | `/api/v2/{resource}/:id` | Update (full replace) |
| PATCH | `/api/v2/{resource}/:id` | Partial update |
| DELETE | `/api/v2/{resource}/:id` | Delete (and descendants) |

### Hierarchy Navigation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/{resource}/:id/parent` | Get parent resource |
| GET | `/api/v2/{resource}/:id/children` | Get child resources |
| GET | `/api/v2/{resource}/:id/descendants` | Get all descendants |
| GET | `/api/v2/{resource}/:id/siblings` | Get sibling resources |
| GET | `/api/v2/{resource}/:id/roles` | Get resource roles |
| PUT | `/api/v2/{resource}/:id/move_to` | Move in hierarchy |
| GET | `/api/v2/{resource}/:id/latest_reading` | Get latest reading |

**Notes**:
- `parent` not valid for `data_centers`
- `children` not valid for `devices` or `sensors`
- `descendants` supports `types[]` filter parameter

**Move Example**:
```
PUT /api/v2/racks/5/move_to
{
  "room": { "id": 2 }
}
```

**Latest Reading Example**:
```
GET /api/v2/racks/5/latest_reading?type=active_power
```
Response: `{ "active_power": 12345.6 }`

### Data Center Specific

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/data_centers/:id/executive_summary` | Executive summary |
| GET | `/api/v2/data_centers/:id/pue_summary` | PUE summary |

### Floor / Room Specific

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/floors/:id/executive_summary` | Floor executive summary |
| GET | `/api/v2/rooms/:id/executive_summary` | Room executive summary |

### Device Specific

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/devices/:id/outlets` | Get outlets for device |
| GET | `/api/v2/devices/:id/circuits` | Get circuits for device |

---

## PDU Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/pdus` | List all PDUs (supports search) |
| GET | `/api/v2/pdus/:id` | Get PDU by ID |
| POST | `/api/v2/pdus` | Add single PDU |
| PUT | `/api/v2/pdus/:id` | Update PDU |
| PATCH | `/api/v2/pdus/:id` | Partial update PDU |
| DELETE | `/api/v2/pdus/:id` | Delete PDU (readings permanently lost) |
| POST | `/api/v2/pdus/create_batch` | Batch create PDUs (async) |
| DELETE | `/api/v2/pdus/destroy_batch` | Batch delete PDUs |
| PUT | `/api/v2/pdus/:id/rescan` | Schedule immediate PDU poll |
| PUT | `/api/v2/pdus/:id/move_to` | Move PDU in hierarchy |
| GET | `/api/v2/pdus/:id/parent` | Get PDU parent |
| GET | `/api/v2/pdus/:id/siblings` | Get PDU siblings |
| POST | `/api/v2/pdus/update_ip_addresses` | Batch update IP addresses |

### PDU Sub-Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/pdus/:id/outlets` | Get all outlets |
| GET | `/api/v2/pdus/:id/inlets` | Get all inlets |
| GET | `/api/v2/pdus/:id/sensors` | Get all sensors |
| GET | `/api/v2/pdus/:id/circuits` | Get all circuits |
| GET | `/api/v2/pdus/:id/circuit_breakers` | Get all circuit breakers |
| GET | `/api/v2/pdus/:id/circuit_poles` | Get all circuit poles |
| GET | `/api/v2/pdus/:id/panels` | Get all panels |
| GET | `/api/v2/pdus/:id/asset_strips` | Get all asset strips |
| GET | `/api/v2/pdus/:id/events` | Get all events |

### Create PDU Body

```json
{
  "pdu": {
    "ip_address": "192.168.1.100",
    "ipmi_username": "admin",
    "ipmi_password": "password",
    "proxy_index": 0,
    "snmp3_enabled": false,
    "snmp_community_string": "public",
    "snmp3_user": "user",
    "snmp3_auth_level": "authPriv",
    "snmp3_auth_passkey": "passkey",
    "snmp3_auth_protocol": "SHA",
    "snmp3_priv_passkey": "privkey",
    "snmp3_priv_protocol": "AES"
  }
}
```

### Batch Update IP Addresses

```
POST /api/v2/pdus/update_ip_addresses
{
  "ip_addresses": [
    { "old_ip_address": "10.0.0.1", "new_ip_address": "10.0.1.1" },
    { "old_ip_address": "10.0.0.2", "new_ip_address": "10.0.1.2" }
  ]
}
```

### Batch Delete

```
DELETE /api/v2/pdus/destroy_batch
{ "pdus": [1, 2, 3] }
```

---

## Outlets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/outlets` | List all outlets (supports search) |
| GET | `/api/v2/outlets/:id` | Get outlet by ID |
| PUT | `/api/v2/outlets/:id` | Update outlet |
| PATCH | `/api/v2/outlets/:id` | Partial update outlet |
| PUT | `/api/v2/outlets/:id/rename` | Rename outlet |
| PUT | `/api/v2/outlets/rename_batch` | Batch rename outlets |
| GET | `/api/v2/outlets/:id/events` | Get outlet events |
| GET | `/api/v2/outlets/:id/readings` | Get outlet raw readings |
| GET | `/api/v2/outlets/:id/readings_rollups/:interval` | Get rollup readings |

**Batch Rename**:
```json
{
  "outlets": [
    { "id": 1, "name": "Server-A-PS1" },
    { "id": 2, "name": "Server-A-PS2" }
  ]
}
```

**Rollup intervals**: `hourly`, `daily`, `monthly`

---

## Inlets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/inlets` | List all inlets |
| GET | `/api/v2/inlets/:id` | Get inlet by ID |
| GET | `/api/v2/inlets/:id/inlet_poles` | Get inlet poles |
| GET | `/api/v2/inlets/:id/readings` | Get raw readings |
| GET | `/api/v2/inlets/:id/readings_rollups/:interval` | Get rollup readings |

### Inlet Poles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/inlet_poles` | List all inlet poles |
| GET | `/api/v2/inlet_poles/:id` | Get by ID |
| GET | `/api/v2/inlet_poles/:id/readings` | Get raw readings |
| GET | `/api/v2/inlet_poles/:id/readings_rollups/:interval` | Get rollup readings |

---

## Circuits & Circuit Breakers

### Circuits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/circuits` | List all circuits |
| GET | `/api/v2/circuits/:id` | Get by ID |
| PUT | `/api/v2/circuits/:id` | Update circuit |
| PATCH | `/api/v2/circuits/:id` | Partial update |
| GET | `/api/v2/circuits/:id/circuit_poles` | Get circuit poles |
| GET | `/api/v2/circuits/:id/readings` | Get raw readings |
| GET | `/api/v2/circuits/:id/readings_rollups/:interval` | Get rollup readings |

### Circuit Breakers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/circuit_breakers` | List all circuit breakers |
| GET | `/api/v2/circuit_breakers/:id` | Get by ID |
| GET | `/api/v2/circuit_breakers/:id/readings_rollups/:interval` | Get rollup readings |

### Circuit Poles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/circuit_poles` | List all circuit poles |
| GET | `/api/v2/circuit_poles/:id` | Get by ID |

---

## Panels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/panels` | List all panels |
| GET | `/api/v2/panels/:id` | Get by ID |
| GET | `/api/v2/panels/:id/circuits` | Get circuits for panel |
| GET | `/api/v2/panels/:id/circuit_poles` | Get circuit poles for panel |
| GET | `/api/v2/panels/:id/inlets` | Get inlets for panel |

---

## Sensors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/sensors` | List all sensors (supports search) |
| GET | `/api/v2/sensors/:id` | Get sensor by ID |
| PUT | `/api/v2/sensors/:id` | Update sensor |
| PATCH | `/api/v2/sensors/:id` | Partial update |
| PUT | `/api/v2/sensors/:id/move_to` | Move sensor in hierarchy |
| GET | `/api/v2/sensors/:id/parent` | Get parent |
| GET | `/api/v2/sensors/:id/siblings` | Get siblings |
| GET | `/api/v2/sensors/:id/events` | Get sensor events |
| GET | `/api/v2/sensors/:id/readings` | Get raw readings |
| GET | `/api/v2/sensors/:id/readings_rollups/:interval` | Get rollup readings |

**Sensor Types**: `AbsoluteHumiditySensor`, `HumiditySensor`, `TemperatureSensor`, `AirFlowSensor`, `AirPressureSensor`, `ContactClosureSensor`, `MotionDetectionSensor`, `SmokeSensor`, `TamperDetectionSensor`, `WaterSensor`, `VibrationSensor`, `VibrationAccelerationSensor`

---

## Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/events` | List all events (supports search) |
| GET | `/api/v2/events/:id` | Get event by ID |
| PUT | `/api/v2/events/:id/clear` | Clear single event |
| PUT | `/api/v2/events/clear_batch` | Clear multiple events |

**Clear Batch Body**:
```json
{ "events": [1, 2, 26] }
```

**Event Severity Levels**: `CRITICAL`, `WARNING`, `INFORMATIONAL`

**Event Sources**: `1` = SNMP Trap, `2-3` = Internal

---

## Power & Energy Readings

### Reading Endpoints

Available for: `outlets`, `inlets`, `inlet_poles`, `circuits`, `circuit_breakers`, `sensors`, `racks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/{resource}/:id/readings` | Raw readings |
| GET | `/api/v2/{resource}/:id/readings_rollups/hourly` | Hourly rollups |
| GET | `/api/v2/{resource}/:id/readings_rollups/daily` | Daily rollups |
| GET | `/api/v2/{resource}/:id/readings_rollups/monthly` | Monthly rollups |

### Bulk Reading Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/outlet_readings` | All outlet readings |
| GET | `/api/v2/outlet_readings_rollups/:interval` | Outlet rollups |
| GET | `/api/v2/inlet_readings` | All inlet readings |
| GET | `/api/v2/inlet_readings_rollups/:interval` | Inlet rollups |
| GET | `/api/v2/inlet_pole_readings` | All inlet pole readings |
| GET | `/api/v2/inlet_pole_readings_rollups/:interval` | Inlet pole rollups |
| GET | `/api/v2/circuit_readings` | All circuit readings |
| GET | `/api/v2/circuit_readings_rollups/:interval` | Circuit rollups |
| GET | `/api/v2/circuit_breaker_readings` | All breaker readings |
| GET | `/api/v2/circuit_breaker_readings_rollups/:interval` | Breaker rollups |
| GET | `/api/v2/circuit_pole_readings` | All circuit pole readings |
| GET | `/api/v2/sensor_readings` | All sensor readings |
| GET | `/api/v2/sensor_readings_rollups/:interval` | Sensor rollups |
| GET | `/api/v2/rack_readings` | All rack readings |
| GET | `/api/v2/rack_readings_rollups/:interval` | Rack rollups |

**Rollup intervals**: `hourly`, `daily`, `monthly`

---

## Power Control

Execute power state changes on outlets or hierarchy containers.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/outlets/power_control` | Control specific outlets |
| POST | `/api/v2/devices/:id/power_control` | Control device outlets |
| POST | `/api/v2/racks/:id/power_control` | Control all outlets in rack |
| POST | `/api/v2/rows/:id/power_control` | Control all outlets in row |
| POST | `/api/v2/aisles/:id/power_control` | Control all outlets in aisle |
| POST | `/api/v2/rooms/:id/power_control` | Control all outlets in room |
| POST | `/api/v2/floors/:id/power_control` | Control all outlets on floor |
| POST | `/api/v2/data_centers/:id/power_control` | Control all outlets in DC |
| POST | `/api/v2/doors/:id/power_control` | Control door |
| POST | `/api/v2/device_groups/power_control` | Control device groups |

**Body**:
```json
{ "state": "ON" }
```

**Valid states**: `ON`, `OFF`, `CYCLE`

**Outlet-specific body**:
```json
{
  "state": "ON",
  "outlets": [1, 2, 3]
}
```

**Device groups body**:
```json
{
  "state": "CYCLE",
  "device_groups": [1, 2, 3]
}
```

Returns a Job resource on success.

---

## Asset Strips & Rack Units

### Asset Strips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/asset_strips` | List all asset strips |
| GET | `/api/v2/asset_strips/:id` | Get by ID (includes rack units) |
| PUT | `/api/v2/asset_strips/:id` | Update asset strip |
| PATCH | `/api/v2/asset_strips/:id` | Partial update |
| GET | `/api/v2/asset_strips/:id/rack_units` | Get all LEDs |

### Rack Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/rack_units` | List all rack units |
| GET | `/api/v2/rack_units/:id` | Get by ID |
| PUT | `/api/v2/rack_units/:id` | Update rack unit |
| PATCH | `/api/v2/rack_units/:id` | Partial update |
| GET | `/api/v2/rack_units/:id/blade_slots` | Get blade slots |

### Blade Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/blade_slots` | List all blade slots |
| GET | `/api/v2/blade_slots/:id` | Get by ID |

---

## Tags & Tag Groups

### Tag Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/tag_groups` | List all tag groups |
| GET | `/api/v2/tag_groups/:id` | Get by ID |
| POST | `/api/v2/tag_groups` | Create tag group |
| PUT | `/api/v2/tag_groups/:id` | Update tag group |
| PATCH | `/api/v2/tag_groups/:id` | Partial update |
| DELETE | `/api/v2/tag_groups/:id` | Delete tag group |
| GET | `/api/v2/tag_groups/:id/tags` | Get tags in group |
| POST | `/api/v2/tag_groups/:id/tags` | Add tag to group |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/tags` | List all tags |
| GET | `/api/v2/tags/:id` | Get by ID |
| PUT | `/api/v2/tags/:id` | Update tag |
| PATCH | `/api/v2/tags/:id` | Partial update |
| DELETE | `/api/v2/tags/:id` | Delete tag |
| GET | `/api/v2/tags/:id/tag_entries` | Get tag entries |
| POST | `/api/v2/tags/:id/tag_entries` | Create tag entry |

### Tag Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/tag_entries` | List all tag entries |
| GET | `/api/v2/tag_entries/:id` | Get by ID |
| DELETE | `/api/v2/tag_entries/:id` | Delete tag entry |

---

## Transfer Switches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/transfer_switches` | List all |
| GET | `/api/v2/transfer_switches/:id` | Get by ID |
| GET | `/api/v2/transfer_switches/:id/transfer_switch_states` | Get states |
| GET | `/api/v2/transfer_switch_states` | List all states |
| GET | `/api/v2/transfer_switch_states/:id` | Get state by ID |

---

## Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/integration/registration` | Get registration info |
| GET | `/api/v2/integration/registration/status` | Get registration status |
| PUT | `/api/v2/integration/registration` | Update registration |
| GET | `/api/v2/integration/entities` | List integrated entities |
| GET | `/api/v2/integration/entities/:entity_type/:entity_id` | Get entity |
| PUT | `/api/v2/integration/entities/:entity_type/:entity_id` | Update entity |

---

## Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/jobs/:id` | Get job by ID |
| GET | `/api/v2/jobs/:id/messages` | Get job messages |
| GET | `/api/v2/job_messages` | List all job messages |
| GET | `/api/v2/job_messages/:id` | Get message by ID |

---

## System Info & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/system_info` | Get system info, version, config |
| GET | `/api/v2/settings` | Get system settings |
| POST | `/api/v2/settings/init` | Initialize settings |

---

## Floor Maps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/floor_maps/mappable` | Get mappable resources |

---

## Extractions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/extractions/:id` | Get extraction by ID |
| GET | `/api/v2/extractions/since/:id` | Get extractions since ID |

---

## PUE Calculations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/pue_calculations` | Get PUE calculations |

---

## Measurements & Summaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/measurements` | Submit measurements |
| POST | `/api/v2/summaries` | Submit summaries |

---

## Resource Attributes

### PDU

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `ip_address` | String | Create | IP address |
| `mac_address` | String | No | MAC address |
| `firmware_version` | String | No | Firmware |
| `model` | String | No | Model name |
| `manufacturer` | String | No | Manufacturer |
| `serial_number` | String | No | Serial number |
| `name` | String | Yes | Display name |
| `contact` | String | Yes | Contact info |
| `location` | String | Yes | Location string |
| `health` | String | No | Health status |
| `phase` | String | No | Phase type |
| `maintenance_enabled` | Boolean | Yes | Maintenance mode |
| `snmp3_enabled` | Boolean | Yes | SNMPv3 enabled |
| `snmp3_auth_level` | String | Yes | Auth level |
| `supports_outlet_power_control` | Boolean | No | Power control capability |
| `supports_sensor_renaming` | Boolean | No | Sensor rename capability |

### Outlet

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `ordinal` | Integer | No | Outlet number on PDU |
| `name` | String | Yes | Display name |
| `device_id` | Integer | No | Associated device |
| `pdu_id` | Integer | No | Parent PDU |
| `state` | String | No | ON/OFF |
| `rated_amps` | Float | No | Rated capacity |
| `reading` | Object | No | Latest reading |
| `pue_it` | Boolean | No | PUE IT flag |
| `pue_total` | Boolean | No | PUE total flag |

### Data Center

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `name` | String | Yes | Name |
| `external_key` | String | Yes | External reference |
| `city` | String | Yes | City |
| `state` | String | Yes | State/province |
| `country` | String | Yes | Country |
| `contact_name` | String | Yes | Contact |
| `capacity` | Float | Yes | Capacity in kW |
| `peak_kwh_rate` | Float | Yes | Peak rate |
| `off_peak_kwh_rate` | Float | Yes | Off-peak rate |
| `peak_begin` | Float | Yes | Peak start (24h, e.g. 8.5=8:30AM) |
| `peak_end` | Float | Yes | Peak end |
| `co2_factor` | Float | Yes | CO2 factor |
| `cooling_factor` | Float | Yes | Cooling factor |
| `custom_field_1` | String | Yes | Custom field |
| `custom_field_2` | String | Yes | Custom field |
| `parent` | Hash | No | Parent resource (type + id) |

### Rack

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `name` | String | Yes | Name |
| `external_key` | String | Yes | External reference |
| `capacity` | Float | Yes | Capacity in kW |
| `parent` | Hash | No | Parent resource |
| `decommissioned_at` | DateTime | No | Decommission date |

### Device

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `name` | String | Yes | Name |
| `customer` | String | Yes | Customer name |
| `device_type` | String | Yes | Type |
| `power_rating` | Integer | Yes | Watts |
| `decommissioned` | Boolean | Yes | Decommissioned flag |
| `custom_field_1` | String | Yes | Custom field |
| `custom_field_2` | String | Yes | Custom field |
| `external_key` | String | Yes | External reference |
| `ip_address` | String | Yes | IP address |
| `asset_tag_id` | Integer | No | Asset tag reference |
| `parent` | Hash | No | Parent resource |

### Sensor

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `pdu_id` | Integer | No | Parent PDU |
| `ordinal` | Integer | No | Sensor number |
| `type` | String | No | Sensor type |
| `name` | String | Yes | Display name |
| `position` | String | No | INLET/OUTLET/EXTERNAL |
| `vertical_position` | String | No | TOP/MIDDLE/BOTTOM |
| `serial_number` | String | No | Serial number |
| `reading` | Hash | No | Latest reading |
| `state` | Hash | No | Current state |

### Inlet

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `name` | String | Yes | Name |
| `ordinal` | Integer | No | Inlet number |
| `pdu_id` | Integer | No | Parent PDU |
| `rated_amps` | Float | No | Rated capacity |
| `reading` | Object | No | Latest reading |

### Circuit

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `pdu_id` | Integer | No | Parent PDU |
| `ordinal` | Integer | No | Circuit number |
| `name` | String | Yes | Name |
| `rated_amps` | Float | No | Rated capacity |
| `device_id` | Integer | No | Associated device |
| `panel_id` | Integer | No | Associated panel |

### Event

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique ID |
| `created_at` | DateTime | Creation timestamp |
| `occurred_at` | DateTime | Occurrence timestamp |
| `cleared_at` | DateTime | Cleared timestamp |
| `name` | String | Event name |
| `severity` | String | CRITICAL/WARNING/INFORMATIONAL |
| `event_config_id` | Integer | Event config reference |
| `source` | Integer | 1=SNMP Trap, 2-3=Internal |
| `eventable_type` | String | Resource type (Pdu, Outlet, etc.) |
| `eventable_id` | Integer | Resource ID |
| `cleared_by` | String | How cleared |
| `notification_status` | String | Notification delivery status |

### Outlet Reading

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Reading ID |
| `pdu_id` | Integer | PDU reference |
| `outlet_id` | Integer | Outlet reference |
| `reading_time` | DateTime | Timestamp |
| `active_power` | Float | Active power (W) |
| `apparent_power` | Float | Apparent power (VA) |
| `power_factor` | Float | Power factor |
| `current` | Float | Current (A) |
| `voltage` | Float | Voltage (V) |
| `unutilized_capacity` | Float | Unused capacity |
| `watt_hour` | Float | Energy (Wh) |
| `watt_hour_delta` | Float | Energy delta |

### Sensor Reading

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Reading ID |
| `sensor_id` | Integer | Sensor reference |
| `value` | Float | Reading value |
| `reading_time` | DateTime | Timestamp |
| `max_value` | Float | Maximum value |
| `min_value` | Float | Minimum value |
| `uom` | Object | Unit of measure |

### Asset Strip

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `pdu_id` | Integer | No | Parent PDU |
| `name` | String | Yes | Name |
| `state` | String | No | ok/upgrading/unavailable/unsupported |
| `ordinal` | Integer | No | Strip number |
| `default_connected_led_color` | String | Yes | Hex RGB color |
| `default_disconnected_led_color` | String | Yes | Hex RGB color |
| `numbering_scheme` | String | No | top_down/bottom_up |
| `orientation` | String | No | top_connector/bottom_connector |

### Job

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Job ID |
| `status` | String | ACTIVE/COMPLETED/ABORTED |
| `completed` | Boolean | Completion flag |
| `percent_complete` | Float | Progress percentage |
| `start_time` | DateTime | Start timestamp |
| `end_time` | DateTime | End timestamp |
| `has_errors` | Boolean | Error flag |
| `error_count` | Integer | Number of errors |
| `last_message` | String | Latest status message |
| `description` | String | Job description |

### Tag

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | Integer | No | Unique ID |
| `name` | String | Yes | Tag name |
| `tag_group_id` | Integer | No | Parent group |
| `tag_group_name` | String | No | Parent group name |
| `tag_entries_count` | Integer | No | Entry count |
