# n8n Integration Guide for Sunbird MCP Server

This guide explains how to integrate the Sunbird DCIM MCP Server with n8n workflows.

## Prerequisites

1. **MCP Server Running**: Ensure the Sunbird MCP Server is deployed and accessible
2. **n8n Access**: You need access to your n8n instance
3. **Network Connectivity**: n8n must be able to reach the MCP server

## Connection Configuration

### Internal Kubernetes/OpenShift

If both n8n and the MCP server are in the same cluster:

```
MCP Server URL: http://sunbird-mcp-server.aitp-ai.svc.cluster.local:8080
```

### External Access

If accessing from outside the cluster:

```
MCP Server URL: https://sunbird-mcp.apps.ocp419.crucible.iisl.com
```

## Integration Methods

### Method 1: Direct Tool Calls (Recommended for Simple Use Cases)

Use the HTTP Request node to call tools directly:

```
POST /tools/{toolName}
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

**Example - Find Capacity:**

1. Add an **HTTP Request** node
2. Configure:
   - Method: `POST`
   - URL: `http://sunbird-mcp-server:8080/tools/dcim_find_capacity`
   - Body Type: JSON
   - Body:
     ```json
     {
       "requiredU": 10,
       "requiredPowerKw": 5
     }
     ```

### Method 2: MCP JSON-RPC (Full Protocol Compliance)

Use the standard MCP protocol for tool calls:

```
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

**Example - List Locations:**

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "dctrack_list_locations",
    "arguments": {
      "type": "Room"
    }
  }
}
```

## Common Workflow Patterns

### Pattern 1: Webhook Trigger → MCP Call → Response

```
[Webhook] → [HTTP Request to MCP] → [Code: Process Response] → [Respond]
```

### Pattern 2: Scheduled Monitoring

```
[Schedule Trigger] → [MCP: Get Metrics] → [Analyze] → [If Alert] → [Notify]
                                                    ↓
                                              [Store in DB]
```

### Pattern 3: Multi-Tool Orchestration

```
[Trigger] → [MCP: Tool 1] ┐
          → [MCP: Tool 2] ├→ [Merge] → [Analyze] → [Action]
          → [MCP: Tool 3] ┘
```

## Processing MCP Responses

MCP responses are wrapped in a standard format. Use a Code node to extract the data:

```javascript
const mcpResponse = $input.first().json;

// For MCP JSON-RPC responses
let result;
if (mcpResponse.result && mcpResponse.result.content) {
  const textContent = mcpResponse.result.content.find(c => c.type === 'text');
  if (textContent) {
    result = JSON.parse(textContent.text);
  }
} else if (mcpResponse.result) {
  result = mcpResponse.result;
}

// For direct tool call responses
if (mcpResponse.success !== undefined) {
  result = mcpResponse.result;
}

return {
  json: {
    success: true,
    data: result
  }
};
```

## Available Tools Quick Reference

### dcTrack Tools

| Tool | Input | Output |
|------|-------|--------|
| `dctrack_list_locations` | `{ type?, parentId? }` | Array of locations |
| `dctrack_get_cabinet` | `{ cabinetId }` | Cabinet details |
| `dctrack_get_cabinet_capacity` | `{ cabinetId }` | Capacity info |
| `dctrack_search_items` | `{ query?, class?, status? }` | Array of items |

### Power IQ Tools

| Tool | Input | Output |
|------|-------|--------|
| `poweriq_get_pue` | `{ resolution? }` | PUE data |
| `poweriq_list_alerts` | `{ severity?, type? }` | Array of alerts |
| `poweriq_get_pdu_readings` | `{ pduId, includeOutlets? }` | Power readings |
| `poweriq_list_sensors` | `{ sensorType?, cabinetId? }` | Array of sensors |

### Combined Tools

| Tool | Input | Output |
|------|-------|--------|
| `dcim_get_rack_summary` | `{ cabinetId or cabinetName }` | Full rack data |
| `dcim_find_capacity` | `{ requiredU, requiredPowerKw }` | Matching cabinets |
| `dcim_get_health_status` | `{ includeAlerts?, includePUE? }` | Health summary |
| `dcim_identify_ghost_servers` | `{ powerThresholdWatts? }` | Ghost server list |
| `dcim_thermal_analysis` | `{ includeRecommendations? }` | Thermal report |

## Error Handling

Add an **IF** node after the HTTP Request to handle errors:

```javascript
// Check for success
const response = $json;

if (response.error || response.success === false) {
  // Handle error
  throw new Error(response.error?.message || 'Tool call failed');
}

// Continue with success path
return $json;
```

## Best Practices

### 1. Use Timeouts

Set appropriate timeouts for MCP calls (recommended: 60 seconds):

```json
{
  "options": {
    "timeout": 60000
  }
}
```

### 2. Cache Results

For frequently accessed data, use n8n's caching or store results in MongoDB:

```
[MCP Call] → [Store in MongoDB with TTL] → [Use cached data]
```

### 3. Batch Operations

Instead of multiple single calls, use tools that return bulk data:

- Use `dctrack_search_items` instead of multiple `dctrack_get_item` calls
- Use `dcim_get_rack_summary` to get cabinet + items + power in one call

### 4. Error Recovery

Implement retry logic for transient failures:

```javascript
const maxRetries = 3;
let lastError;

for (let i = 0; i < maxRetries; i++) {
  try {
    // Make MCP call
    return result;
  } catch (error) {
    lastError = error;
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
}

throw lastError;
```

## Credential Configuration

If your MCP server requires authentication (future enhancement), configure credentials in n8n:

1. Go to **Settings → Credentials**
2. Add new **HTTP Request** credential
3. Configure header authentication:
   - Header Name: `X-API-Key`
   - Header Value: `your-api-key`
4. Select this credential in your HTTP Request nodes

## Monitoring & Debugging

### Enable Debug Logging

Set the MCP server's `LOG_LEVEL=debug` to see detailed request/response logs.

### Test Tools Manually

Use curl to test tools before building workflows:

```bash
curl -X POST http://sunbird-mcp-server:8080/tools/dctrack_list_locations \
  -H "Content-Type: application/json" \
  -d '{"type": "Room"}'
```

### Check Health

Add a health check workflow that runs periodically:

```
[Schedule: Every 5 min] → [GET /health] → [If unhealthy] → [Alert]
```

## Sample Workflow Files

Import these ready-to-use workflows:

1. **MCP-Integration-Demo.json** - Basic tool call pattern
2. **Capacity-Planning-Workflow.json** - Multi-tool capacity planning
3. **Thermal-Monitoring-Workflow.json** - Scheduled thermal monitoring

## Troubleshooting

### Issue: Connection Refused

- Check MCP server is running: `curl http://sunbird-mcp-server:8080/health`
- Verify network policies allow n8n → MCP communication
- Check service name and port are correct

### Issue: Timeout Errors

- Increase timeout in HTTP Request options
- Check Sunbird API connectivity from MCP server
- Review MCP server logs for slow API calls

### Issue: Empty Results

- Verify tool parameters are correct
- Check Sunbird has data for the requested query
- Review MCP server logs for API errors

### Issue: Parse Errors

- Ensure response is valid JSON
- Check for MCP error responses
- Use try/catch in Code nodes for safety
