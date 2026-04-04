# dcTrack REST API Reference (v9.2.3)

Complete REST API documentation for Sunbird dcTrack Data Center Infrastructure Management (DCIM).

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [General Information](#general-information)
- [Async Bulk Operations](#async-bulk-operations)
- [Items Management](#items-management)
- [Makes, Models & Connectors](#makes-models--connectors)
- [Item Ports](#item-ports)
- [Breakers](#breakers)
- [Locations](#locations)
- [Sub-Locations](#sub-locations)
- [Location Favorites](#location-favorites)
- [Cabinet Space](#cabinet-space)
- [Permissions](#permissions)
- [Lookup Lists](#lookup-lists)
- [Field Properties](#field-properties)
- [Requests & Work Orders](#requests--work-orders)
- [Connections](#connections)
- [Power Chain & Actual Readings](#power-chain--actual-readings)
- [Tickets](#tickets)
- [Custom Fields](#custom-fields)
- [Webhooks](#webhooks)
- [Relationships](#relationships)
- [Visualizations (Floormap)](#visualizations-floormap)
- [Projects](#projects)
- [Part Classes](#part-classes)
- [Part Models](#part-models)
- [Parts](#parts)
- [Reports & Charts](#reports--charts)
- [Audit Trails](#audit-trails)
- [Error Codes](#error-codes)

---

## Overview

The dcTrack REST API provides programmatic access to create, modify, delete, and retrieve item information in the dcTrack database. The API supports two versions:

- **v1**: `/api/v1/...` (legacy, used for locations)
- **v2**: `/api/v2/...` (current, recommended)

Base URL: `https://{dctrack-host}`

All APIs use HTTPS only. JSON is the only supported format.

---

## Authentication

dcTrack supports two authentication methods:

### Basic Authentication

Every request includes credentials:

```
Authorization: Basic <base64(username:password)>
```

### Token-Based (Bearer) Authentication

1. Obtain a token:

```
POST /api/v2/authentication/login
Authorization: Basic <base64(username:password)>
```

**Response**: HTTP 200 with `Authorization` header containing `Bearer <token>`

2. Use the token on subsequent calls:

```
Authorization: Bearer <token>
```

**Notes**:
- Token reuse avoids login/logout overhead per call
- Tokens expire based on user session timeout (e.g., 30 min inactivity)
- On expiry, re-authenticate via `/api/v2/authentication/login`
- SAML accounts cannot make API calls; add `?saml=false` if SAML auto-redirect is enabled

### Required Headers

| Header | Value |
|--------|-------|
| `Accept` | `application/json` |
| `Content-Type` | `application/json` |
| `From` (optional) | Tracks originating user in audit trail |
| `Content-Encoding` (optional) | `gzip` for compressed responses |

---

## General Information

- Item names are always stored in **UPPERCASE**
- Dates must be ISO format: `YYYY-MM-DD`
- API reports **GMT** time, not dcTrack system time
- Trailing `/` in URLs is **not supported** (as of 9.1.0)
- Empty/null fields are omitted from response payloads
- Access privileges enforce dcTrack user roles
- `proceedOnWarning=true|false` controls business warning handling on many endpoints
- `returnDetails=true|false` controls whether full JSON or just `id`/`tiName` is returned

### U-Position Values

| Value | Meaning |
|-------|---------|
| `-9` | No U-Position set |
| `-2` | Located ABOVE the cabinet |
| `-1` | Located BELOW the cabinet |

---

## Async Bulk Operations

Many bulk APIs support asynchronous processing via `/bulk/async`:

```
POST /api/v2/{resource}/bulk/async
```

- Returns a Job status object with `uniqueJobId`
- Check status: `GET /api/v2/{resource}/bulk/async?jobId=<jobId>`
- Cancel: `DELETE /api/v2/{resource}/bulk/async?jobId=<jobId>`

**Job Response Fields**:
- `batchStatus`: `COMPLETED`, `RUNNING`, etc.
- `currentCount`, `totalCount`, `skippedCount`
- `isJobRunning`, `jobFailed`
- `actionResults.children[]`: Per-item results with `httpCode`, `errorList`, `warningList`

**APIs supporting async bulk**:
- Items, Breakers, Part Classes, Part Models, Part Instances
- Actual Readings, Power Sum, Floormap Configuration, Requests

---

## Items Management

### Create Item

```
POST /api/v2/dcimoperations/items?returnDetails={true|false}&proceedOnWarning={true|false}
```

**Body**: Item JSON object (see [Item Fields](#item-json-fields))

```json
{
  "tiName": "CAB-NEW",
  "cmbLocation": "WORKFLOW",
  "cmbMake": "CPI",
  "cmbModel": "48RU-Cabinet GlobalFrame-3A-200",
  "cmbRowLabel": "GC-NEW",
  "cmbRowPosition": 1
}
```

### Update Item

```
PUT /api/v2/dcimoperations/items/{id}?returnDetails={true|false}&proceedOnWarning={true|false}
```

### Delete Item

```
DELETE /api/v2/dcimoperations/items/{id}?proceedOnWarning={true|false}
```

### Get Item by ID

```
GET /api/v2/dcimoperations/items/{id}
```

Returns item wrapped in `"item"` object.

### Search Items (Deprecated)

```
GET /api/v2/dcimoperations/search/items/{itemName}
GET /api/v2/dcimoperations/search/items/{itemName}/{locationId}
```

Max 50 results. Use Advanced Search for more.

### Advanced Search (Quick Search)

```
POST /api/v2/quicksearch/items?pageNumber={n}&pageSize={size}
```

**Body**:
```json
{
  "columns": [
    {"name": "tiName", "filter": {"eq": "SERVER*"}},
    {"name": "tiClass", "filter": {"eq": "Device"}},
    {"name": "tiRUs", "filter": {"lt": "4"}},
    {"name": "cmbLocation", "filter": {"in": ["SITEA", "SITEB"]}}
  ],
  "selectedColumns": [
    {"name": "tiName"},
    {"name": "cmbLocation"},
    {"name": "cmbCabinet"},
    {"name": "cmbMake"},
    {"name": "cmbModel"}
  ],
  "customFieldByLabel": true
}
```

**Filter Operators**: `eq`, `lt`, `gt`, `in`
- String search: contains match by default; wrap in quotes for exact match
- Wildcards: `*` for begins/ends with
- `tiMultiField`: searches across Name, Make, Model, Class, Location, Status, IP, etc.
- `pageNumber=0` for no paging; `pageSize=0` for no limit (default 50)

**Response**:
```json
{
  "totalRows": 2,
  "pageNumber": 1,
  "searchResults": {
    "items": [...]
  }
}
```

### Get Item Field List

```
GET /api/v2/quicksearch/items/itemListFields
```

### Get Items in Cabinet

```
GET /api/v2/items/cabinetItems/{cabinetItemId}
```

Returns all items including passive items.

### Bulk Item Operations

```
POST /api/v2/dcimoperations/items/bulk
```

**Body**:
```json
{
  "bodies": [ {item1}, {item2}, ... ],
  "method": "POST|PUT|DELETE",
  "proceedOnWarning": true
}
```

### Item JSON Fields

Key item fields (full list is extensive):

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Item ID (read-only) |
| `tiName` | String | Item name (auto-uppercased) |
| `tiClass` | String | Item class (Device, Network, Cabinet, etc.) |
| `tiSubclass` | String | Item subclass |
| `cmbLocation` | String | Location name |
| `cmbCabinet` | String | Cabinet name |
| `cmbMake` | String | Manufacturer |
| `cmbModel` | String | Model name |
| `cmbStatus` | String | Item status |
| `cmbUPosition` | String | U-position in cabinet |
| `cmbSlotPosition` | String | Slot position (blades) |
| `cmbChassis` | String | Chassis name (blades) |
| `tiSerialNumber` | String | Serial number |
| `tiAssetTag` | String | Asset tag |
| `tiRUs` | Integer | Rack units consumed |
| `tiWeight` | Float | Weight |
| `tiNotes` | String | Notes |
| `cmbRowLabel` | String | Row label |
| `cmbRowPosition` | Integer | Row position |
| `modelId` | Integer | Model ID |
| `tiCustomField_{Label}` | Various | Custom field by label |
| `installationDate` | Date | Installation date (YYYY-MM-DD) |
| `purchaseDate` | Date | Purchase date |
| `contractStartDate` | Date | Contract start |
| `contractEndDate` | Date | Contract end |
| `lastUpdatedOn` | Timestamp | Last update timestamp |
| `sysCreationDate` | Timestamp | System creation date |
| `origin` | String | Origin of item |

---

## Makes, Models & Connectors

### Makes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/makes` | List all makes |
| POST | `/api/v2/makes` | Create a make |
| PUT | `/api/v2/makes/{makeId}` | Update a make |
| DELETE | `/api/v2/makes/{makeId}` | Delete a make |
| GET | `/api/v2/dcimoperations/search/makes/{makeName}` | Search makes by name |
| POST | `/api/v2/dcimoperations/search/list/makes` | Search makes (supports special chars) |

**Make Object**:
```json
{
  "makeId": 895,
  "makeName": "ABC",
  "accountNumber": "abc123",
  "technicalSupport": "555-555-1212",
  "aliases": ["ABC Corporation", "ABC Corp"],
  "notes": "string"
}
```

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/models/{modelId}?usedCounts=true` | Get model by ID |
| POST | `/api/v2/models?returnDetails={bool}&proceedOnWarning=false` | Create a model |
| PUT | `/api/v2/models/{id}?returnDetails={bool}&proceedOnWarning=false` | Update a model (PUT, not PATCH) |
| PATCH | `/api/v2/models/{id}?returnDetails={bool}&proceedOnWarning=false` | Modify model (partial update) |
| DELETE | `/api/v2/models/{id}` | Delete a model |
| POST | `/api/v2/quicksearch/models?pageNumber={n}&pageSize={s}` | Search models |
| POST | `/api/v2/models/images/{modelId}` | Upload model image |
| DELETE | `/api/v2/models/images/{modelId}` | Delete model image |

**Model Object** (key fields):
```json
{
  "modelId": 31093,
  "model": "AMS2500",
  "makeId": 145,
  "make": "Hitachi",
  "class": "Device",
  "mounting": "Rackable",
  "formFactor": "Chassis",
  "ruHeight": 4,
  "dimHeight": 6.9,
  "dimWidth": 19.0,
  "dimDepth": 25.5,
  "weight": 101.0,
  "subclass": "BladeChassis",
  "originalPower": 264.0,
  "potentialPower": 264.0,
  "powerPorts": [...],
  "dataPorts": [...],
  "chassisFaces": [...],
  "aliases": [...]
}
```

### Connectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/connectors/{connectorId}` | Get connector by ID |
| POST | `/api/v2/connectors` | Create connector |
| PUT | `/api/v2/connectors/{connectorId}` | Update connector |
| DELETE | `/api/v2/connectors/{connectorId}` | Delete connector |
| POST | `/api/v2/quicksearch/connectors` | Advanced search connectors |
| POST | `/api/v2/connectors/images/{connectorId}` | Upload connector image |
| DELETE | `/api/v2/connectors/images/{connectorId}` | Delete connector image |

---

## Item Ports

### Data Ports (v2)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/dcimoperations/items/{itemId}/dataports` | Create data port |
| PUT | `/api/v2/dcimoperations/items/{itemId}/dataports/{portId}` | Update data port |
| DELETE | `/api/v2/dcimoperations/items/{itemId}/dataports/{portId}` | Delete data port |
| GET | `/api/v2/dcimoperations/items/{itemId}/dataports/{portId}` | Get data port by ID |
| GET | `/api/v2/dcimoperations/items/{itemId}/dataports` | List all data ports on item |

**Data Port Fields**: `portId`, `portName`, `portSubclass` (Physical, Virtual, VLAN, etc.), `mediaType`, `protocol`, `dataRate`, `connector`, `index`

### Power Ports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items/{itemId}/powerports` | Get all power ports on item |
| PUT | `/api/v1/items/{itemId}/powerports/{portId}` | Update power port |
| GET | `/api/v1/items/{itemId}/powerports/compatible` | Get compatible connectors |

---

## Breakers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/dcimoperations/items/{panelItemId}/breakers` | List breakers for panel |
| GET | `/api/v2/dcimoperations/items/{panelItemId}/breakers/{breakerPortId}` | Get single breaker |
| PUT | `/api/v2/dcimoperations/items/{panelItemId}/breakers/{breakerPortId}` | Update breaker |
| POST | `/api/v2/dcimoperations/items/{panelItemId}/breakers` | Create breaker |
| DELETE | `/api/v2/dcimoperations/items/{panelItemId}/breakers/{breakerPortId}` | Delete breaker |
| POST | `/api/v2/dcimoperations/items/{panelItemId}/breakers/bulk` | Bulk breaker operations |

---

## Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/locations` | List all locations |
| POST | `/api/v1/locations?proceedOnWarning=false` | Create location |
| GET | `/api/v1/locations/{locationId}` | Get location by ID |
| PUT | `/api/v1/locations/{locationId}?proceedOnWarning=false` | Update location |
| DELETE | `/api/v1/locations/{locationId}` | Delete location |
| POST | `/api/v2/quicksearch/locations?pageNumber={n}&pageSize={s}` | Advanced search locations |
| GET | `/api/v2/quicksearch/locations/locationListFields` | Get location field list |

---

## Sub-Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/subLocations/list/{locationId}` | List sub-locations for location |
| GET | `/api/v2/subLocations/{locationId}/type/{typeCode}` | Get sub-locations by type |
| GET | `/api/v2/subLocations/{subLocationId}/children` | Get child sub-locations |
| GET | `/api/v2/subLocations/{subLocationId}` | Get sub-location details |
| POST | `/api/v2/subLocations` | Create sub-location |
| PUT | `/api/v2/subLocations/{subLocationId}` | Update sub-location |
| DELETE | `/api/v2/subLocations/{subLocationId}` | Delete sub-location |

---

## Location Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/users/{username}/favorites/{entityType}` | Get favorites for user |
| GET | `/api/v2/users/favorites/{entityType}` | Get favorites for all users |
| PUT | `/api/v2/users/{username}/favorites` | Assign/unassign favorites for user |
| PUT | `/api/v2/users/favorites` | Assign/unassign favorites for multiple users |

---

## Cabinet Space

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/capacity/cabinets/list/search` | Find cabinets with available space |
| POST | `/api/v2/items/uposition/available` | Find available U-positions in cabinet |

---

## Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/permissions/explicit/{permissionId}` | Get permission by ID |
| POST | `/api/v2/permissions/explicit` | Create permission |
| PUT | `/api/v2/permissions/explicit/{permissionId}` | Update permission |
| DELETE | `/api/v2/permissions/explicit/{permissionId}` | Delete permission |
| POST | `/api/v2/permissions/explicit/bulk` | Bulk permission operations |
| GET | `/api/v2/permissions/explicit` | List all permissions |
| GET | `/api/v2/permissions/explicit/entityType/{entityType}` | Get by entity type |
| GET | `/api/v2/permissions/explicit/{entityType}/{entityId}` | Get by entity type & ID |

---

## Lookup Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/dcimoperations/lookups/{listType}/{id}` | Get lookup records |
| GET | `/api/v2/dcimoperations/picklists/{listType}` | Get picklist options |
| PUT | `/api/v2/dcimoperations/picklists/{listType}` | Update picklist options |

**Supported List Types**: `TYPE`, `FUNCTION`, `CUSTOMER`, `DEPARTMENT`, `CONTRACT_NUMBER`, `SLA_PROFILE`, `PROJECT_NAME`, `PROJECT_NUMBER`, `SYSTEM_ADMIN`, `SYSTEM_ADMIN_TEAM`, `CABINET_GROUPING`, `CONNECTOR_AC_BREAKER`, `PHASE_ID`, `VM_CLUSTER`, and more.

---

## Field Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/settings/lists/fieldProperties?entity={Entity}` | Get field properties |
| PUT | `/api/v2/settings/lists/defaultValue` | Update default field value |

---

## Requests & Work Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/dcimoperations/requests` | Submit item request |
| DELETE | `/api/v2/dcimoperations/requests/{requestId}` | Delete/cancel request |
| POST | `/api/v2/dcimoperations/requests/bulk` | Bulk request operations |
| PUT | `/api/v2/dcimoperations/requests/complete/{requestId}` | Complete request |
| PUT | `/api/v2/dcimoperations/workorders/complete/{workOrderId}` | Complete work order |
| GET | `/api/v2/dcimoperations/requests/pending/{itemId}` | Get pending requests for item |
| GET | `/api/v2/dcimoperations/requests/status/{requestId}` | Get request status |
| POST | `/api/v2/dcimoperations/search/list/requests` | Search requests |

**Request Types**: `Install`, `Decommission`, `Move`, `PowerOff`, `PowerOn`, `ReservationNew`, `ReservationRemove`

**Request Statuses**: `Request Issued`, `Request Approved`, `Request Rejected`, `Work Order Issued`, `Work Order Complete`, `Request Complete`

---

## Connections

### Data Connections

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/connections/dataconnections` | Create data connection |
| PUT | `/api/v2/connections/dataconnections/{connectionId}` | Update data connection |
| GET | `/api/v2/connections/dataconnections/{connectionId}` | Get by ID |
| GET | `/api/v2/connections/dataconnections?location={loc}&itemName={name}&portName={port}` | Get by node |
| DELETE | `/api/v2/connections/dataconnections/{connectionId}` | Delete |

### Power Connections

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/connections/powerconnections` | Create power connection |
| PUT | `/api/v2/connections/powerconnections/{connectionId}` | Update power connection |
| GET | `/api/v2/connections/powerconnections/{connectionId}` | Get by ID |
| GET | `/api/v2/connections/powerconnections?location={loc}&itemName={name}&portName={port}` | Get by node |
| DELETE | `/api/v2/connections/powerconnections/{connectionId}` | Delete |

### Circuit Information

```
GET /api/v2/dcimoperations/circuits/{circuitType}?location={loc}&itemName={name}&portName={port}
```

---

## Power Chain & Actual Readings

### Power Chain (Current)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/powerChain/{locationId}` | Get full power chain for location |
| POST | `/api/v2/powerChain/powerSum/bulk` | Get power sum by port IDs |
| POST | `/api/v2/items/powerSum/bulk` | Get power sum by item IDs |
| GET | `/api/v2/powerChain/items/actualReadings/{itemId}` | Get readings by item |
| POST | `/api/v2/powerChain/items/actualReadings/bulk` | Bulk get readings by items |
| POST | `/api/v2/powerChain/ports/actualReadings/bulk` | Bulk update readings |
| PUT | `/api/v2/powerChain/ports/actualReadings/{portId}` | Update readings by port |
| GET | `/api/v2/powerChain/ports/actualReadings/{portId}` | Get readings by port |

### Actual Readings (Deprecated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/dcimoperations/items/{itemId}/actualReadings` | All ports on item |
| GET | `/api/v2/dcimoperations/items/{itemId}/actualReadings/{portName}` | By port name |
| GET | `/api/v2/dcimoperations/items/{itemId}/actualReadings/{portName}/{index}` | By port index |
| PUT | `/api/v2/dcimoperations/items/actualReadings` | Update single port |

---

## Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/tickets/{ticketId}` | Get ticket by ID |
| POST | `/api/v2/tickets` | Create ticket |
| PUT | `/api/v2/tickets/{ticketId}` | Update ticket |
| DELETE | `/api/v2/tickets/{ticketId}?proceedOnWarning={bool}` | Delete ticket |
| POST | `/api/v2/quicksearch/tickets?pageNumber={n}&pageSize={s}` | Search tickets |
| GET | `/api/v2/quicksearch/tickets/ticketListFields` | Get ticket field list |
| POST | `/api/v2/tickets/bulk` | Bulk ticket operations |
| POST | `/api/v2/tickets/assignment/{entityType}/assign` | Assign entity to ticket |
| POST | `/api/v2/tickets/assignment/{entityType}/unassign` | Unassign entity from ticket |

---

## Custom Fields

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/settings/lists/customFields` | Create custom field |
| PUT | `/api/v2/settings/lists/customFields/{customFieldId}` | Update custom field |
| GET | `/api/v2/settings/lists/customFields` | List all custom fields |
| GET | `/api/v2/settings/lists/customFields/{customFieldId}` | Get custom field details |
| DELETE | `/api/v2/settings/lists/customFields/{customFieldId}?proceedOnWarning=false` | Delete custom field |

**Custom Field Types**: `Text`, `SingleSelect`, `MultiSelect`, `Date`, `Checkbox`, `Numeric`, `URL`

Custom fields in item payloads: `tiCustomField_{Label}` (text) or `tiCustomField_{Label}: ["Value"]` (select)

---

## Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/notifications/config` | Get webhook configuration |
| PUT | `/api/v2/notifications/config` | Update webhook configuration |
| POST | `/api/v2/notifications/config` | Update (service turned down) |
| DELETE | `/api/v2/notifications/config` | Delete webhook |

---

## Relationships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/relationship/{id}` | Get relationship by ID |
| POST | `/api/v2/relationship` | Create entity link |
| GET | `/api/v2/relationship/{entityType}/{entityId}` | Get by entity type/ID |
| POST | `/api/v2/relationship/search` | Search entity links |
| DELETE | `/api/v2/relationship/{id}` | Delete entity link |

---

## Visualizations (Floormap)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/visualization/floormaps/upload/{locationId}` | Upload floormap drawing |
| GET | `/api/v2/visualization/floormaps/configuration/{locationId}` | Get config for location |
| GET | `/api/v2/visualization/floormaps/configuration` | Get all configs |
| PUT | `/api/v2/visualization/floormaps/configuration/{locationId}` | Update config |
| POST | `/api/v2/visualization/floormaps/configuration/bulk` | Bulk update configs |

---

## Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/dcimoperations/projects` | Create project |
| PUT | `/api/v2/dcimoperations/projects/{id}` | Update project |
| DELETE | `/api/v2/dcimoperations/projects/{id}` | Delete project |
| GET | `/api/v2/dcimoperations/projects/{id}` | Get project by ID |

---

## Part Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/parts/classes` | Create part class |
| PUT | `/api/v2/parts/classes/{partClassId}` | Update part class |
| DELETE | `/api/v2/parts/classes/{partClassId}` | Delete part class |
| GET | `/api/v2/parts/classes` | List all part classes |
| POST | `/api/v2/parts/classes/bulk` | Bulk part class operations |

---

## Part Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/partModels` | Create part model |
| PUT | `/api/v2/partModels/{modelId}` | Update part model |
| DELETE | `/api/v2/partModels/{modelId}` | Delete part model |
| GET | `/api/v2/partModels/{modelId}` | Get model by ID |
| POST | `/api/v2/quicksearch/parts/models?pageNumber={n}&pageSize={s}` | Search part models |
| POST | `/api/v2/partModels/images/{id}` | Upload image |
| DELETE | `/api/v2/partModels/images/{id}` | Delete image |
| POST | `/api/v2/partModels/bulk` | Bulk operations |
| GET | `/api/v2/quicksearch/parts/partModelListFields` | Get field list |

---

## Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/parts` | Create part instance |
| GET | `/api/v2/parts/{partId}` | Get part by ID |
| PUT | `/api/v2/parts/{partId}` | Update part |
| DELETE | `/api/v2/parts/{partId}` | Delete part |
| POST | `/api/v2/parts/bulk` | Bulk operations |
| PUT | `/api/v2/parts/{partId}/stock/{activity}` | Adjust/transfer stock (`adjust` or `transfer`) |
| POST | `/api/v2/parts/assignments/{assignmentType}` | Assign parts (`ITEMS` or `PORTS`) |
| GET | `/api/v2/quicksearch/parts/partListFields` | Get part field list |
| POST | `/api/v2/quicksearch/parts?pageNumber={n}&pageSize={s}` | Search parts |
| GET | `/api/v2/quicksearch/parts/partTransactionListFields` | Get transaction field list |
| POST | `/api/v2/quicksearch/parts/transactions?pageNumber={n}&pageSize={s}` | Search transactions |

---

## Reports & Charts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/reports/charts` | List all charts |
| GET | `/api/v2/reports/charts/{id}` | Get chart by ID |
| POST | `/api/v2/reports/charts/{id}/data` | Get chart data |
| POST | `/api/v2/reports/charts/{id}/details` | Get chart data details |
| POST | `/api/v2/reports/charts/parameters/{id}` | Get chart parameter picks |

---

## Audit Trails

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/quicksearch/auditTrail?pageNumber={n}&pageSize={s}` | Search audit trail |
| GET | `/api/v2/quicksearch/auditTrail/auditTrailListFields` | Get audit trail field list |

**Audit Trail Search Body**:
```json
{
  "columns": [
    {"name": "entityType", "filter": {"eq": "Items"}},
    {"name": "changedBy", "filter": {"eq": "admin"}}
  ],
  "selectedColumns": [
    {"name": "entityType"},
    {"name": "changeType"},
    {"name": "changedBy"},
    {"name": "changedOn"}
  ]
}
```

---

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 207 | Multi-status (bulk operations - partial success) |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Internal server error |

Common error response:
```json
{
  "errors": ["error message"],
  "warnings": ["warning message"]
}
```
