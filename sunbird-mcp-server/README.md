# Sunbird DCIM MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to Sunbird dcTrack and Power IQ REST APIs for data center infrastructure management.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (optional, for containerized deployment)
- Access to Sunbird dcTrack and Power IQ

### Local Development

```bash
# Clone or copy the project
cd sunbird-mcp-server

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Sunbird credentials

# Build TypeScript
npm run build

# Start the server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### OpenShift Deployment

```bash
# Apply OpenShift manifests
oc apply -f openshift/deployment.yaml

# Check status
oc get pods -l app=sunbird-mcp-server
```

## 🔧 Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `SUNBIRD_BASE_URL` | `https://192.168.200.201` | Sunbird server URL |
| `SUNBIRD_USERNAME` | `API` | API username |
| `SUNBIRD_PASSWORD` | - | API password |
| `MCP_PORT` | `8080` | Server port |
| `LOG_LEVEL` | `info` | Logging level |
| `CACHE_TTL_SECONDS` | `60` | Cache TTL |

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/tools` | GET | List available tools |
| `/mcp` | POST | MCP JSON-RPC endpoint |
| `/sse` | GET | Server-Sent Events |
| `/tools/:toolName` | POST | Direct tool call |

## 🛠️ Available Tools

### dcTrack Read Tools (12)
- `dctrack_list_locations` - List locations hierarchy
- `dctrack_get_location` - Get location details
- `dctrack_list_cabinets` - List cabinets/racks
- `dctrack_get_cabinet` - Get cabinet details
- `dctrack_get_cabinet_items` - Get items in cabinet
- `dctrack_get_cabinet_capacity` - Get cabinet capacity
- `dctrack_search_items` - Search items
- `dctrack_get_item` - Get item details
- `dctrack_list_connections` - List connections
- `dctrack_get_connection` - Get connection details
- `dctrack_list_models` - List models
- `dctrack_get_model` - Get model details

### dcTrack Write Tools (15) 🆕
- `dctrack_create_item` - Create new device/asset
- `dctrack_update_item` - Update existing item
- `dctrack_move_item` - Move item to different cabinet
- `dctrack_delete_item` - Delete an item
- `dctrack_create_connection` - Create network/power connection
- `dctrack_delete_connection` - Delete a connection
- `dctrack_create_change_request` - Create change request
- `dctrack_update_change_request` - Update change request status
- `dctrack_bulk_import` - Bulk import items/connections
- `dctrack_bulk_update` - Update multiple items at once
- `dctrack_create_cabinet` - Create new cabinet/rack
- `dctrack_create_location` - Create new location
- `dctrack_list_import_templates` - List available import templates
- `dctrack_get_import_template` - Get template field mappings
- `dctrack_validate_import_data` - Validate data before import

### Power IQ Tools (10)
- `poweriq_list_datacenters` - List data centers
- `poweriq_list_pdus` - List PDUs
- `poweriq_get_pdu` - Get PDU details
- `poweriq_get_pdu_readings` - Get PDU readings
- `poweriq_list_sensors` - List sensors
- `poweriq_get_sensor_readings` - Get sensor readings
- `poweriq_get_pue` - Get PUE data
- `poweriq_list_alerts` - List alerts
- `poweriq_list_it_devices` - List IT devices
- `poweriq_get_outlet_readings` - Get outlet readings

### Combined Tools (6)
- `dcim_get_rack_summary` - Full rack summary
- `dcim_find_capacity` - Find available capacity
- `dcim_get_health_status` - System health status
- `dcim_identify_ghost_servers` - Find ghost servers
- `dcim_get_power_chain` - Trace power path
- `dcim_thermal_analysis` - Thermal analysis

## 📖 Usage Examples

### Health Check

```bash
curl http://localhost:8080/health
```

### List Tools

```bash
curl http://localhost:8080/tools
```

### Call Tool via MCP

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "dctrack_list_locations",
      "arguments": {}
    }
  }'
```

### Direct Tool Call

```bash
curl -X POST http://localhost:8080/tools/poweriq_get_pue \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "daily"
  }'
```

### Find Capacity

```bash
curl -X POST http://localhost:8080/tools/dcim_find_capacity \
  -H "Content-Type: application/json" \
  -d '{
    "requiredU": 10,
    "requiredPowerKw": 5
  }'
```

## 🔌 n8n Integration

### HTTP Request Node

Use the HTTP Request node to call tools:

```json
{
  "method": "POST",
  "url": "http://sunbird-mcp-server:8080/tools/dcim_get_rack_summary",
  "body": {
    "cabinetName": "Rack-A1"
  }
}
```

### MCP JSON-RPC

For full MCP protocol compliance:

```json
{
  "method": "POST",
  "url": "http://sunbird-mcp-server:8080/mcp",
  "body": {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "poweriq_list_alerts",
      "arguments": {
        "severity": "critical"
      }
    }
  }
}
```

## 📁 Project Structure

```
sunbird-mcp-server/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP + HTTP server
│   ├── config.ts             # Configuration
│   ├── clients/
│   │   ├── sunbird-client.ts # Base HTTP client
│   │   ├── dctrack-client.ts # dcTrack API
│   │   └── poweriq-client.ts # Power IQ API
│   ├── tools/
│   │   ├── index.ts          # Tool registry
│   │   ├── dctrack-tools.ts  # dcTrack tools
│   │   ├── poweriq-tools.ts  # Power IQ tools
│   │   └── combined-tools.ts # Combined tools
│   └── utils/
│       └── logger.ts         # Logging
├── openshift/
│   └── deployment.yaml       # OpenShift manifests
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔒 Security

- Credentials stored in environment variables
- Self-signed certificate support
- Network policies for OpenShift
- Non-root container execution

## 📊 Monitoring

- Health endpoint: `/health`
- Prometheus-compatible metrics (planned)
- Structured JSON logging with Pino

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test Sunbird connectivity
curl -k -u API:password https://192.168.200.201/api/v2/dcimoperations/locations
```

### SSL Certificate Errors

Set `SUNBIRD_REJECT_UNAUTHORIZED=false` for self-signed certs.

### Debug Logging

Set `LOG_LEVEL=debug` for verbose output.

## 📄 License

MIT
