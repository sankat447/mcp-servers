# Sunbird DCIM MCP Server
## Architecture and Implementation Guide

**Version:** 1.0  
**Author:** Infrastructure & Integration Development Team  
**Date:** December 2024  
**Platform:** Model Context Protocol (MCP) Server for Sunbird dcTrack & Power IQ

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [MCP Protocol Overview](#3-mcp-protocol-overview)
4. [Sunbird API Integration](#4-sunbird-api-integration)
5. [MCP Server Design](#5-mcp-server-design)
6. [Tool Definitions](#6-tool-definitions)
7. [Implementation](#7-implementation)
8. [Deployment](#8-deployment)
9. [n8n Integration](#9-n8n-integration)
10. [Testing & Validation](#10-testing--validation)
11. [Security Considerations](#11-security-considerations)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Executive Summary

### 1.1 Objective

Build a Model Context Protocol (MCP) server that exposes Sunbird DCIM (dcTrack and Power IQ) functionality as standardized tools for AI agents. This enables:

- **AI-powered data center operations** via natural language queries
- **Integration with n8n workflows** for automated processing
- **Unified API abstraction** over dcTrack and Power IQ REST services
- **Real-time data access** for capacity, power, thermal, and asset management

### 1.2 Environment Details

| Component | Details |
|-----------|---------|
| **PowerIQ URL** | `https://192.168.200.201/` |
| **dcTrack URL** | `https://192.168.200.201/` |
| **API Username** | `API` |
| **API Password** | `~!Universal1` |
| **MCP Server Runtime** | Node.js 20+ / Python 3.11+ |
| **Deployment Target** | OpenShift 4.19 (AITP Stack) |

### 1.3 Key Deliverables

1. **MCP Server** - Exposes 25+ tools for DCIM operations
2. **Sunbird API Client** - Unified wrapper for dcTrack and Power IQ
3. **Docker Container** - Production-ready deployment
4. **n8n Integration** - Workflow templates and configuration
5. **Documentation** - Complete API reference and usage examples

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI AGENTIC LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐ │
│  │  LibreChat  │    │    n8n      │    │   LangGraph Agents          │ │
│  │  (Chat UI)  │    │ (Workflows) │    │   (Orchestration)           │ │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┬───────────────┘ │
│         │                  │                         │                  │
│         └──────────────────┼─────────────────────────┘                  │
│                            │                                            │
│                            ▼                                            │
│              ┌─────────────────────────────┐                           │
│              │     MCP SERVER (SSE/HTTP)   │                           │
│              │  sunbird-dcim-mcp:8080      │                           │
│              └─────────────┬───────────────┘                           │
│                            │                                            │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             │ MCP Protocol (JSON-RPC over SSE)
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                            │         MCP SERVER INTERNALS               │
├────────────────────────────┼────────────────────────────────────────────┤
│                            ▼                                            │
│              ┌─────────────────────────────┐                           │
│              │      Tool Router            │                           │
│              │  (Request Classification)   │                           │
│              └─────────────┬───────────────┘                           │
│                            │                                            │
│         ┌──────────────────┼──────────────────┐                        │
│         ▼                  ▼                  ▼                        │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                  │
│  │  dcTrack    │   │  Power IQ   │   │  Combined   │                  │
│  │   Tools     │   │   Tools     │   │   Tools     │                  │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                  │
│         │                 │                 │                          │
│         └─────────────────┼─────────────────┘                          │
│                           ▼                                            │
│              ┌─────────────────────────────┐                           │
│              │   Sunbird API Client        │                           │
│              │   (Unified REST Wrapper)    │                           │
│              └─────────────┬───────────────┘                           │
│                            │                                            │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             │ HTTPS REST API
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                            ▼         SUNBIRD DCIM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐│
│  │       dcTrack           │    │           Power IQ                  ││
│  │   (Asset Management)    │    │      (Power & Environmental)        ││
│  ├─────────────────────────┤    ├─────────────────────────────────────┤│
│  │ • Items/Assets          │    │ • PDU Readings                      ││
│  │ • Locations/Sites       │    │ • Environmental Sensors             ││
│  │ • Cabinets/Racks        │    │ • PUE Calculations                  ││
│  │ • Connections           │    │ • Alerts & Events                   ││
│  │ • Capacity Data         │    │ • Device Power Mapping              ││
│  │ • Change Requests       │    │ • Cooling Units                     ││
│  │ • Models Library        │    │ • UPS Status                        ││
│  └─────────────────────────┘    └─────────────────────────────────────┘│
│                                                                         │
│                    https://192.168.200.201/                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Descriptions

| Component | Purpose | Technology |
|-----------|---------|------------|
| **MCP Server** | Exposes DCIM tools via MCP protocol | Node.js + @modelcontextprotocol/sdk |
| **Tool Router** | Routes requests to appropriate handlers | Internal routing logic |
| **Sunbird API Client** | Unified wrapper for REST APIs | Axios + retry logic |
| **dcTrack Tools** | Asset, location, capacity operations | REST API integration |
| **Power IQ Tools** | Power, thermal, PUE operations | REST API integration |
| **Combined Tools** | Cross-system analysis and correlation | Data aggregation |

### 2.3 Data Flow

```
1. AI Agent/n8n sends MCP request (tool call)
           │
           ▼
2. MCP Server receives JSON-RPC request
           │
           ▼
3. Tool Router identifies target tool
           │
           ▼
4. Tool handler prepares Sunbird API call(s)
           │
           ▼
5. Sunbird API Client executes REST request(s)
           │
           ▼
6. Response transformed to MCP format
           │
           ▼
7. Result returned to AI Agent/n8n
```

---

## 3. MCP Protocol Overview

### 3.1 What is MCP?

Model Context Protocol (MCP) is an open standard developed by Anthropic for connecting AI models to external data sources and tools. It provides:

- **Standardized tool definitions** with JSON Schema
- **Transport agnostic** (stdio, SSE, HTTP)
- **Resource access** for documents and data
- **Prompt templates** for common operations

### 3.2 MCP Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `initialize` | Client → Server | Establish connection, exchange capabilities |
| `tools/list` | Client → Server | Get available tools |
| `tools/call` | Client → Server | Execute a tool |
| `resources/list` | Client → Server | List available resources |
| `resources/read` | Client → Server | Read resource content |

### 3.3 Tool Definition Structure

```json
{
  "name": "dctrack_get_cabinet",
  "description": "Get detailed information about a cabinet/rack in dcTrack",
  "inputSchema": {
    "type": "object",
    "properties": {
      "cabinetId": {
        "type": "string",
        "description": "The unique identifier of the cabinet"
      }
    },
    "required": ["cabinetId"]
  }
}
```

---

## 4. Sunbird API Integration

### 4.1 Authentication

Both dcTrack and Power IQ use HTTP Basic Authentication:

```
Authorization: Basic <base64(username:password)>
Base64("API:~!Universal1") = "QVBJOn4hVW5pdmVyc2FsMQ=="
```

### 4.2 dcTrack REST API Endpoints

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Items** | `/api/v2/dcimoperations/items` | GET | List all items |
| | `/api/v2/dcimoperations/items/{id}` | GET | Get item by ID |
| | `/api/v2/quicksearch/items` | POST | Search items |
| **Locations** | `/api/v2/dcimoperations/locations` | GET | List locations |
| | `/api/v2/dcimoperations/locations/{id}` | GET | Get location |
| **Cabinets** | `/api/v2/dcimoperations/cabinets` | GET | List cabinets |
| | `/api/v2/dcimoperations/cabinets/{id}` | GET | Get cabinet |
| | `/api/v2/dcimoperations/cabinets/{id}/items` | GET | Items in cabinet |
| **Capacity** | `/api/v2/capacity/cabinets/{id}` | GET | Cabinet capacity |
| **Connections** | `/api/v2/dcimoperations/connections` | GET | List connections |
| **Models** | `/api/v2/dcimoperations/models` | GET | Model library |

### 4.3 Power IQ REST API Endpoints

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Data Centers** | `/api/v2/data_centers` | GET | List data centers |
| **PDUs** | `/api/v2/pdus` | GET | List PDUs |
| | `/api/v2/pdus/{id}` | GET | Get PDU details |
| | `/api/v2/pdus/{id}/outlets` | GET | PDU outlets |
| **Readings** | `/api/v2/readings/pdus/{id}` | GET | PDU readings |
| | `/api/v2/readings/outlets/{id}` | GET | Outlet readings |
| **Sensors** | `/api/v2/sensors` | GET | List sensors |
| | `/api/v2/sensors/{id}/readings` | GET | Sensor readings |
| **PUE** | `/api/v2/pue` | GET | PUE data |
| **Alerts** | `/api/v2/alerts` | GET | Active alerts |
| **Devices** | `/api/v2/it_devices` | GET | IT devices |

### 4.4 API Response Formats

**dcTrack Item Response:**
```json
{
  "item": {
    "id": 12345,
    "tiName": "Server-001",
    "tiSerialNumber": "ABC123",
    "cmbLocation": "DC1/Room1/Row1",
    "cmbCabinet": "Rack-A1",
    "tiClass": "Device",
    "cmbStatus": "Installed",
    "tiUPosition": 20,
    "tiMounting": "Front"
  }
}
```

**Power IQ PDU Reading Response:**
```json
{
  "pdu_reading": {
    "id": 456,
    "pdu_id": 123,
    "active_power": 4500.5,
    "apparent_power": 4800.2,
    "voltage": 208.1,
    "current": 21.6,
    "power_factor": 0.94,
    "reading_time": "2024-12-23T10:30:00Z"
  }
}
```

---

## 5. MCP Server Design

### 5.1 Tool Categories

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MCP SERVER TOOLS (43 Total)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                DCTRACK READ TOOLS (12)                       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ • dctrack_list_locations      • dctrack_get_location        │   │
│  │ • dctrack_list_cabinets       • dctrack_get_cabinet         │   │
│  │ • dctrack_get_cabinet_items   • dctrack_get_cabinet_capacity│   │
│  │ • dctrack_search_items        • dctrack_get_item            │   │
│  │ • dctrack_list_connections    • dctrack_get_connection      │   │
│  │ • dctrack_list_models         • dctrack_get_model           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               DCTRACK WRITE TOOLS (15) 🆕                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ • dctrack_create_item         • dctrack_update_item         │   │
│  │ • dctrack_move_item           • dctrack_delete_item         │   │
│  │ • dctrack_create_connection   • dctrack_delete_connection   │   │
│  │ • dctrack_create_change_request • dctrack_update_change_req │   │
│  │ • dctrack_bulk_import         • dctrack_bulk_update         │   │
│  │ • dctrack_create_cabinet      • dctrack_create_location     │   │
│  │ • dctrack_list_import_templates • dctrack_get_import_template│  │
│  │ • dctrack_validate_import_data                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   POWER IQ TOOLS (10)                        │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ • poweriq_list_datacenters    • poweriq_list_pdus           │   │
│  │ • poweriq_get_pdu             • poweriq_get_pdu_readings    │   │
│  │ • poweriq_list_sensors        • poweriq_get_sensor_readings │   │
│  │ • poweriq_get_pue             • poweriq_list_alerts         │   │
│  │ • poweriq_list_it_devices     • poweriq_get_outlet_readings │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   COMBINED TOOLS (6)                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ • dcim_get_rack_summary       (Cabinet + Power + Thermal)   │   │
│  │ • dcim_find_capacity          (Space + Power availability)  │   │
│  │ • dcim_get_health_status      (Alerts + Utilization)        │   │
│  │ • dcim_identify_ghost_servers (Items - Power correlation)   │   │
│  │ • dcim_get_power_chain        (Item → PDU → Panel → UPS)    │   │
│  │ • dcim_thermal_analysis       (Sensors + Cabinets)          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Server Configuration

```typescript
interface MCPServerConfig {
  // Server settings
  server: {
    name: string;           // "sunbird-dcim-mcp"
    version: string;        // "1.0.0"
    port: number;           // 8080
    transport: "sse" | "stdio";
  };
  
  // Sunbird connection
  sunbird: {
    baseUrl: string;        // "https://192.168.200.201"
    username: string;       // "API"
    password: string;       // "~!Universal1"
    timeout: number;        // 30000 (ms)
    rejectUnauthorized: boolean; // false (for self-signed certs)
  };
  
  // Caching
  cache: {
    enabled: boolean;       // true
    ttlSeconds: number;     // 60
  };
}
```

### 5.3 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   API Request                                                       │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────┐                                                       │
│   │ Try     │──────────────────────────────────────────► Success    │
│   │ Request │                                              │        │
│   └────┬────┘                                              │        │
│        │ Error                                             │        │
│        ▼                                                   │        │
│   ┌─────────────────┐                                      │        │
│   │ Classify Error  │                                      │        │
│   └────────┬────────┘                                      │        │
│            │                                               │        │
│     ┌──────┴──────┬──────────────┬─────────────────┐      │        │
│     ▼             ▼              ▼                 ▼      │        │
│ ┌───────┐   ┌─────────┐   ┌───────────┐   ┌───────────┐  │        │
│ │ 401   │   │ 429     │   │ 5xx       │   │ Network   │  │        │
│ │ Auth  │   │ Rate    │   │ Server    │   │ Error     │  │        │
│ └───┬───┘   │ Limited │   │ Error     │   └─────┬─────┘  │        │
│     │       └────┬────┘   └─────┬─────┘         │        │        │
│     │            │              │               │        │        │
│     ▼            ▼              ▼               ▼        │        │
│  Return       Wait &         Retry           Retry       │        │
│  Error        Retry          (3x)            (3x)        │        │
│                                                          ▼        │
│                                                      Return       │
│                                                      Result       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Tool Definitions

### 6.1 dcTrack Tools

#### dctrack_list_locations

```json
{
  "name": "dctrack_list_locations",
  "description": "List all locations (sites, buildings, floors, rooms) in dcTrack hierarchy",
  "inputSchema": {
    "type": "object",
    "properties": {
      "parentId": {
        "type": "number",
        "description": "Filter by parent location ID (optional)"
      },
      "type": {
        "type": "string",
        "enum": ["Site", "Building", "Floor", "Room", "Aisle", "Row"],
        "description": "Filter by location type"
      },
      "pageSize": {
        "type": "number",
        "description": "Number of results per page (default: 50)",
        "default": 50
      }
    },
    "required": []
  }
}
```

#### dctrack_get_cabinet_capacity

```json
{
  "name": "dctrack_get_cabinet_capacity",
  "description": "Get detailed capacity information for a cabinet including space (U), power (kW), and cooling",
  "inputSchema": {
    "type": "object",
    "properties": {
      "cabinetId": {
        "type": "number",
        "description": "The unique identifier of the cabinet"
      }
    },
    "required": ["cabinetId"]
  }
}
```

#### dctrack_search_items

```json
{
  "name": "dctrack_search_items",
  "description": "Search for items (devices, assets) in dcTrack using various criteria",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query (name, serial number, asset tag)"
      },
      "class": {
        "type": "string",
        "enum": ["Device", "Network", "Data Panel", "Probe", "Passive", "CRAC", "UPS", "PDU", "Floor PDU", "Rack PDU", "Power Outlet"],
        "description": "Filter by item class"
      },
      "locationId": {
        "type": "number",
        "description": "Filter by location ID"
      },
      "cabinetId": {
        "type": "number",
        "description": "Filter by cabinet ID"
      },
      "status": {
        "type": "string",
        "enum": ["Installed", "Planned", "PoweredOff", "Storage", "Archived"],
        "description": "Filter by status"
      },
      "pageSize": {
        "type": "number",
        "default": 50
      }
    },
    "required": []
  }
}
```

### 6.1.5 dcTrack Write Tools

#### dctrack_create_item

```json
{
  "name": "dctrack_create_item",
  "description": "Create a new item (device, asset) in dcTrack",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tiName": { "type": "string", "description": "Item name (required)" },
      "tiClass": { "type": "string", "description": "Item class: Device, Network, Rack PDU, CRAC, UPS, etc." },
      "cmbLocation": { "type": "string", "description": "Location path (e.g., 'DC1/Room1/Row1')" },
      "cabinetId": { "type": "number", "description": "Cabinet ID to place item in" },
      "tiUPosition": { "type": "number", "description": "U position in cabinet (bottom of item)" },
      "tiMounting": { "type": "string", "enum": ["Front", "Rear", "ZeroU"] },
      "modelId": { "type": "number", "description": "Model ID from model library" },
      "tiSerialNumber": { "type": "string", "description": "Serial number" },
      "tiAssetTag": { "type": "string", "description": "Asset tag" },
      "cmbStatus": { "type": "string", "enum": ["Planned", "Installed", "PoweredOff", "Storage", "Archived"] },
      "customFields": { "type": "object", "description": "Custom field values as key-value pairs" }
    },
    "required": ["tiName", "tiClass"]
  }
}
```

#### dctrack_bulk_import

```json
{
  "name": "dctrack_bulk_import",
  "description": "Bulk import items, connections, or models using template data",
  "inputSchema": {
    "type": "object",
    "properties": {
      "importType": { 
        "type": "string", 
        "enum": ["items", "connections", "models"],
        "description": "Type of data to import"
      },
      "data": {
        "type": "array",
        "items": { "type": "object" },
        "description": "Array of records to import. Each record should match dcTrack field schema."
      },
      "options": {
        "type": "object",
        "properties": {
          "updateExisting": { "type": "boolean", "default": false },
          "validateOnly": { "type": "boolean", "default": false },
          "templateId": { "type": "number" }
        }
      }
    },
    "required": ["importType", "data"]
  }
}
```

**Bulk Import Example:**
```json
{
  "importType": "items",
  "data": [
    {
      "tiName": "Server-001",
      "tiClass": "Device",
      "tiSerialNumber": "ABC123",
      "cmbCabinet": "Rack-A1",
      "tiUPosition": 10,
      "cmbStatus": "Planned"
    },
    {
      "tiName": "Server-002",
      "tiClass": "Device",
      "tiSerialNumber": "ABC124",
      "cmbCabinet": "Rack-A1",
      "tiUPosition": 12,
      "cmbStatus": "Planned"
    }
  ],
  "options": {
    "validateOnly": false,
    "updateExisting": true
  }
}
```

#### dctrack_create_change_request

```json
{
  "name": "dctrack_create_change_request",
  "description": "Create a change request for installing, moving, or decommissioning equipment",
  "inputSchema": {
    "type": "object",
    "properties": {
      "requestType": { 
        "type": "string", 
        "enum": ["Install", "Move", "Decommission", "PowerOn", "PowerOff", "Other"]
      },
      "summary": { "type": "string", "description": "Brief summary of the change" },
      "description": { "type": "string", "description": "Detailed description" },
      "itemIds": { "type": "array", "items": { "type": "number" } },
      "scheduledDate": { "type": "string", "description": "ISO 8601 datetime" },
      "assignee": { "type": "string" },
      "priority": { "type": "string", "enum": ["Low", "Medium", "High", "Critical"] }
    },
    "required": ["requestType", "summary"]
  }
}
```

### 6.2 Power IQ Tools

#### poweriq_get_pdu_readings

```json
{
  "name": "poweriq_get_pdu_readings",
  "description": "Get current power readings for a PDU including voltage, current, power, and power factor",
  "inputSchema": {
    "type": "object",
    "properties": {
      "pduId": {
        "type": "number",
        "description": "The unique identifier of the PDU"
      },
      "includeOutlets": {
        "type": "boolean",
        "description": "Include outlet-level readings",
        "default": false
      }
    },
    "required": ["pduId"]
  }
}
```

#### poweriq_get_pue

```json
{
  "name": "poweriq_get_pue",
  "description": "Get Power Usage Effectiveness (PUE) data for data centers",
  "inputSchema": {
    "type": "object",
    "properties": {
      "datacenterId": {
        "type": "number",
        "description": "Filter by data center ID (optional)"
      },
      "startTime": {
        "type": "string",
        "format": "date-time",
        "description": "Start of time range (ISO 8601)"
      },
      "endTime": {
        "type": "string",
        "format": "date-time",
        "description": "End of time range (ISO 8601)"
      },
      "resolution": {
        "type": "string",
        "enum": ["hourly", "daily", "weekly", "monthly"],
        "description": "Data resolution",
        "default": "hourly"
      }
    },
    "required": []
  }
}
```

#### poweriq_list_alerts

```json
{
  "name": "poweriq_list_alerts",
  "description": "List active alerts from Power IQ including power, environmental, and device alerts",
  "inputSchema": {
    "type": "object",
    "properties": {
      "severity": {
        "type": "string",
        "enum": ["critical", "warning", "info"],
        "description": "Filter by severity"
      },
      "type": {
        "type": "string",
        "enum": ["power", "environmental", "device", "connectivity"],
        "description": "Filter by alert type"
      },
      "acknowledged": {
        "type": "boolean",
        "description": "Filter by acknowledgment status"
      },
      "limit": {
        "type": "number",
        "default": 100
      }
    },
    "required": []
  }
}
```

### 6.3 Combined Tools

#### dcim_get_rack_summary

```json
{
  "name": "dcim_get_rack_summary",
  "description": "Get comprehensive rack/cabinet summary combining dcTrack asset data with Power IQ power and thermal readings",
  "inputSchema": {
    "type": "object",
    "properties": {
      "cabinetId": {
        "type": "number",
        "description": "dcTrack cabinet ID"
      },
      "cabinetName": {
        "type": "string",
        "description": "Cabinet name (alternative to ID)"
      }
    },
    "required": []
  }
}
```

**Response Structure:**
```json
{
  "cabinet": {
    "id": 123,
    "name": "Rack-A1",
    "location": "DC1/Room1/Row1",
    "ruHeight": 42
  },
  "capacity": {
    "space": {
      "total": 42,
      "used": 28,
      "available": 14,
      "utilizationPercent": 66.7
    },
    "power": {
      "ratedKw": 10,
      "currentKw": 6.8,
      "availableKw": 3.2,
      "utilizationPercent": 68
    }
  },
  "items": [...],
  "powerReadings": {
    "pduA": {...},
    "pduB": {...},
    "totalKw": 6.8
  },
  "thermal": {
    "inletTemp": 22.4,
    "exhaustTemp": 31.2,
    "deltaT": 8.8
  },
  "alerts": [...]
}
```

#### dcim_identify_ghost_servers

```json
{
  "name": "dcim_identify_ghost_servers",
  "description": "Identify potential ghost servers - devices in dcTrack with minimal or no power consumption in Power IQ",
  "inputSchema": {
    "type": "object",
    "properties": {
      "locationId": {
        "type": "number",
        "description": "Limit search to specific location"
      },
      "powerThresholdWatts": {
        "type": "number",
        "description": "Power threshold below which device is considered ghost",
        "default": 10
      }
    },
    "required": []
  }
}
```

#### dcim_find_capacity

```json
{
  "name": "dcim_find_capacity",
  "description": "Find available capacity across data centers matching specified requirements",
  "inputSchema": {
    "type": "object",
    "properties": {
      "requiredU": {
        "type": "number",
        "description": "Required rack units"
      },
      "requiredPowerKw": {
        "type": "number",
        "description": "Required power in kW"
      },
      "requiredPorts": {
        "type": "number",
        "description": "Required network ports"
      },
      "locationId": {
        "type": "number",
        "description": "Limit search to specific location"
      },
      "contiguous": {
        "type": "boolean",
        "description": "Require contiguous U space",
        "default": true
      }
    },
    "required": ["requiredU", "requiredPowerKw"]
  }
}
```

---

## 7. Implementation

### 7.1 Project Structure

```
sunbird-mcp-server/
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server.ts                # MCP server setup
│   ├── config.ts                # Configuration management
│   ├── clients/
│   │   ├── sunbird-client.ts    # Base HTTP client
│   │   ├── dctrack-client.ts    # dcTrack API client
│   │   └── poweriq-client.ts    # Power IQ API client
│   ├── tools/
│   │   ├── index.ts             # Tool registry
│   │   ├── dctrack-tools.ts     # dcTrack tool handlers
│   │   ├── poweriq-tools.ts     # Power IQ tool handlers
│   │   └── combined-tools.ts    # Combined tool handlers
│   ├── types/
│   │   ├── dctrack.ts           # dcTrack type definitions
│   │   ├── poweriq.ts           # Power IQ type definitions
│   │   └── mcp.ts               # MCP type definitions
│   └── utils/
│       ├── cache.ts             # Response caching
│       ├── logger.ts            # Logging utility
│       └── errors.ts            # Error handling
├── config/
│   └── default.json             # Default configuration
└── tests/
    ├── clients/
    ├── tools/
    └── integration/
```

### 7.2 Core Implementation Files

The following sections contain the complete implementation code for the MCP server.

---

## 8. Deployment

### 8.1 Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  sunbird-mcp:
    build: .
    image: sunbird-mcp-server:latest
    container_name: sunbird-mcp-server
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - SUNBIRD_BASE_URL=https://192.168.200.201
      - SUNBIRD_USERNAME=API
      - SUNBIRD_PASSWORD=~!Universal1
      - MCP_PORT=8080
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 8.2 OpenShift Deployment

```yaml
# openshift/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sunbird-mcp-server
  namespace: aitp-ai
  labels:
    app: sunbird-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sunbird-mcp-server
  template:
    metadata:
      labels:
        app: sunbird-mcp-server
    spec:
      containers:
        - name: mcp-server
          image: registry.apps.ocp419.crucible.iisl.com/aitp/sunbird-mcp-server:latest
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: sunbird-credentials
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: sunbird-mcp-server
  namespace: aitp-ai
spec:
  selector:
    app: sunbird-mcp-server
  ports:
    - port: 8080
      targetPort: 8080
  type: ClusterIP
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: sunbird-mcp
  namespace: aitp-ai
spec:
  host: sunbird-mcp.apps.ocp419.crucible.iisl.com
  to:
    kind: Service
    name: sunbird-mcp-server
  port:
    targetPort: 8080
  tls:
    termination: edge
```

### 8.3 Secrets Configuration

```yaml
# openshift/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: sunbird-credentials
  namespace: aitp-ai
type: Opaque
stringData:
  SUNBIRD_BASE_URL: "https://192.168.200.201"
  SUNBIRD_USERNAME: "API"
  SUNBIRD_PASSWORD: "~!Universal1"
```

---

## 9. n8n Integration

### 9.1 MCP Client Configuration in n8n

To use the MCP server in n8n workflows, you'll create a custom node or use HTTP Request nodes.

#### Option A: Direct HTTP Integration

```json
{
  "name": "Call MCP Tool",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://sunbird-mcp-server.aitp-ai.svc.cluster.local:8080/mcp",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "jsonrpc",
          "value": "2.0"
        },
        {
          "name": "id",
          "value": "={{ $runIndex }}"
        },
        {
          "name": "method",
          "value": "tools/call"
        },
        {
          "name": "params",
          "value": "={{ JSON.stringify({ name: 'dctrack_get_cabinet_capacity', arguments: { cabinetId: $json.cabinetId } }) }}"
        }
      ]
    }
  }
}
```

#### Option B: SSE Connection for Real-time

For real-time communication, connect to the SSE endpoint:

```
URL: http://sunbird-mcp-server.aitp-ai.svc.cluster.local:8080/sse
```

### 9.2 n8n Workflow: Capacity Check

```json
{
  "name": "DCIM-MCP-Capacity-Check",
  "nodes": [
    {
      "parameters": {
        "path": "capacity-check",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://sunbird-mcp-server:8080/mcp",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"jsonrpc\": \"2.0\",\n  \"id\": \"1\",\n  \"method\": \"tools/call\",\n  \"params\": {\n    \"name\": \"dcim_find_capacity\",\n    \"arguments\": {\n      \"requiredU\": {{ $json.requiredU || 4 }},\n      \"requiredPowerKw\": {{ $json.requiredPowerKw || 2 }}\n    }\n  }\n}"
      },
      "name": "Find Capacity",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const mcpResponse = $input.first().json;\nconst result = mcpResponse.result || mcpResponse;\n\nreturn {\n  json: {\n    success: true,\n    availableLocations: result.content || result,\n    query: {\n      requiredU: $('Webhook').first().json.requiredU,\n      requiredPowerKw: $('Webhook').first().json.requiredPowerKw\n    }\n  }\n};"
      },
      "name": "Format Response",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Find Capacity", "type": "main", "index": 0 }]]
    },
    "Find Capacity": {
      "main": [[{ "node": "Format Response", "type": "main", "index": 0 }]]
    }
  }
}
```

### 9.3 n8n Workflow: Alert Processing with MCP

```json
{
  "name": "DCIM-MCP-Alert-Enrichment",
  "nodes": [
    {
      "parameters": {
        "path": "poweriq-alert",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      },
      "name": "Alert Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://sunbird-mcp-server:8080/mcp",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"jsonrpc\": \"2.0\",\n  \"id\": \"1\",\n  \"method\": \"tools/call\",\n  \"params\": {\n    \"name\": \"dcim_get_rack_summary\",\n    \"arguments\": {\n      \"cabinetName\": \"{{ $json.cabinet }}\"\n    }\n  }\n}"
      },
      "name": "Get Rack Context",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://sunbird-mcp-server:8080/mcp",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"jsonrpc\": \"2.0\",\n  \"id\": \"2\",\n  \"method\": \"tools/call\",\n  \"params\": {\n    \"name\": \"poweriq_list_alerts\",\n    \"arguments\": {\n      \"severity\": \"critical\",\n      \"limit\": 10\n    }\n  }\n}"
      },
      "name": "Get Related Alerts",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 400]
    },
    {
      "parameters": {
        "jsCode": "const alert = $('Alert Webhook').first().json;\nconst rackContext = $('Get Rack Context').first().json.result;\nconst relatedAlerts = $('Get Related Alerts').first().json.result;\n\n// Enrich alert with context\nreturn {\n  json: {\n    originalAlert: alert,\n    rackSummary: rackContext?.content || rackContext,\n    relatedAlerts: relatedAlerts?.content || relatedAlerts,\n    enrichedAt: new Date().toISOString()\n  }\n};"
      },
      "name": "Enrich Alert",
      "type": "n8n-nodes-base.code",
      "position": [700, 300]
    }
  ]
}
```

---

## 10. Testing & Validation

### 10.1 Connection Test

```bash
# Test MCP server health
curl -X GET http://localhost:8080/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "sunbird": {
    "dctrack": "connected",
    "poweriq": "connected"
  }
}
```

### 10.2 Tool Test Examples

```bash
# List available tools
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list"
  }'

# Call dctrack_list_locations
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
      "name": "dctrack_list_locations",
      "arguments": {}
    }
  }'

# Call poweriq_get_pue
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "poweriq_get_pue",
      "arguments": {
        "resolution": "daily"
      }
    }
  }'

# Call combined tool
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "4",
    "method": "tools/call",
    "params": {
      "name": "dcim_find_capacity",
      "arguments": {
        "requiredU": 10,
        "requiredPowerKw": 5
      }
    }
  }'
```

### 10.3 Integration Test with n8n

```bash
# Test via n8n webhook
curl -X POST http://workflows.apps.ocp419.crucible.iisl.com/webhook/capacity-check \
  -H "Content-Type: application/json" \
  -d '{
    "requiredU": 8,
    "requiredPowerKw": 4
  }'
```

---

## 11. Security Considerations

### 11.1 Credential Management

| Practice | Implementation |
|----------|----------------|
| **Never hardcode credentials** | Use environment variables or secrets |
| **Use Kubernetes secrets** | Store in OpenShift secrets, mount as env |
| **Rotate credentials** | Implement credential rotation schedule |
| **Audit access** | Log all API calls with timestamps |

### 11.2 Network Security

```yaml
# Network policy to restrict MCP server access
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: sunbird-mcp-policy
  namespace: aitp-ai
spec:
  podSelector:
    matchLabels:
      app: sunbird-mcp-server
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: aitp-ai
        - namespaceSelector:
            matchLabels:
              name: aitp-ui
      ports:
        - port: 8080
  egress:
    - to:
        - ipBlock:
            cidr: 192.168.200.201/32  # Sunbird server
      ports:
        - port: 443
```

### 11.3 TLS Configuration

For self-signed certificates on Sunbird:

```typescript
// In sunbird-client.ts
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,  // Accept self-signed certs
  // Or provide CA certificate:
  // ca: fs.readFileSync('/path/to/sunbird-ca.crt')
});
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection refused | Sunbird not reachable | Check network connectivity, firewall |
| 401 Unauthorized | Invalid credentials | Verify username/password |
| SSL certificate error | Self-signed cert | Set `rejectUnauthorized: false` |
| Timeout errors | Slow API response | Increase timeout, check Sunbird load |
| Empty results | No matching data | Verify filters, check data exists |

### 12.2 Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
export DEBUG=mcp:*

# Run with verbose output
node --inspect src/index.js
```

### 12.3 Health Check Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Overall health status |
| `/health/dctrack` | GET | dcTrack connectivity |
| `/health/poweriq` | GET | Power IQ connectivity |
| `/metrics` | GET | Prometheus metrics |

---

## Appendix A: Complete Tool Reference

| Tool Name | Category | Description |
|-----------|----------|-------------|
| `dctrack_list_locations` | dcTrack | List all locations |
| `dctrack_get_location` | dcTrack | Get location details |
| `dctrack_list_cabinets` | dcTrack | List cabinets |
| `dctrack_get_cabinet` | dcTrack | Get cabinet details |
| `dctrack_get_cabinet_items` | dcTrack | List items in cabinet |
| `dctrack_get_cabinet_capacity` | dcTrack | Get cabinet capacity |
| `dctrack_search_items` | dcTrack | Search items |
| `dctrack_get_item` | dcTrack | Get item details |
| `dctrack_list_connections` | dcTrack | List connections |
| `dctrack_get_connection` | dcTrack | Get connection details |
| `dctrack_list_models` | dcTrack | List models |
| `dctrack_get_model` | dcTrack | Get model details |
| `poweriq_list_datacenters` | Power IQ | List data centers |
| `poweriq_list_pdus` | Power IQ | List PDUs |
| `poweriq_get_pdu` | Power IQ | Get PDU details |
| `poweriq_get_pdu_readings` | Power IQ | Get PDU readings |
| `poweriq_list_sensors` | Power IQ | List sensors |
| `poweriq_get_sensor_readings` | Power IQ | Get sensor readings |
| `poweriq_get_pue` | Power IQ | Get PUE data |
| `poweriq_list_alerts` | Power IQ | List alerts |
| `poweriq_list_it_devices` | Power IQ | List IT devices |
| `poweriq_get_outlet_readings` | Power IQ | Get outlet readings |
| `dcim_get_rack_summary` | Combined | Full rack summary |
| `dcim_find_capacity` | Combined | Find available capacity |
| `dcim_get_health_status` | Combined | System health status |
| `dcim_identify_ghost_servers` | Combined | Find ghost servers |
| `dcim_get_power_chain` | Combined | Trace power path |
| `dcim_thermal_analysis` | Combined | Thermal analysis |

---

## Appendix B: API Rate Limits

| API | Rate Limit | Recommendation |
|-----|------------|----------------|
| dcTrack | ~100 req/min | Use caching, batch requests |
| Power IQ | ~60 req/min | Cache readings for 30-60 seconds |

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Infrastructure & Integration Development Team
