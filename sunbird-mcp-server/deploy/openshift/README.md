# Sunbird MCP Server — OpenShift Deployment Guide

Deploy the Sunbird DCIM MCP Server (190 tools covering dcTrack + Power IQ) to OpenShift.

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| `oc` CLI | [Install guide](https://docs.openshift.com/container-platform/latest/cli_reference/openshift_cli/getting-started-cli.html) |
| OpenShift access | Logged in with access to `aitp-ai` namespace |
| Network | Cluster can reach Sunbird DCIM at `192.168.200.201:443` |
| Docker (optional) | Only needed if building images locally |

---

## Quick Start (First-Time Deploy)

```bash
# 1. Login to OpenShift
oc login https://api.ocp419.crucible.iisl.com:6443
oc project aitp-ai

# 2. Run the deploy script — it will prompt for credentials
cd sunbird-mcp-server
./deploy/openshift/deploy.sh --from-template
```

The script will:
1. Prompt for Sunbird URL, username, and password
2. Generate `deployment.yaml` from the template (with your credentials)
3. Build the Docker image via OpenShift BuildConfig
4. Apply all Kubernetes resources (Secret, ConfigMap, Deployment, Service, Route, HPA, NetworkPolicy)
5. Wait for rollout and run a health check

---

## Manual Step-by-Step Deploy

### Step 1: Generate deployment.yaml

```bash
cp deployment.template.yaml deployment.yaml
```

Edit `deployment.yaml` and replace these three placeholders with real values:

| Placeholder | Replace With |
|-------------|-------------|
| `__SUNBIRD_BASE_URL__` | `https://192.168.200.201` |
| `__SUNBIRD_USERNAME__` | `API` |
| `__SUNBIRD_PASSWORD__` | Your actual Sunbird password |

> **WARNING**: `deployment.yaml` contains credentials. It is gitignored — never commit it.

### Step 2: Build the image

```bash
cd sunbird-mcp-server   # project root

# Create BuildConfig (first time only)
oc new-build --name=sunbird-mcp-server --binary --strategy=docker

# Build and push
oc start-build sunbird-mcp-server --from-dir=. --follow --wait
```

### Step 3: Deploy

```bash
oc apply -f deploy/openshift/deployment.yaml
oc rollout status deployment/sunbird-mcp-server --timeout=300s
```

### Step 4: Get the route URL

```bash
oc get route sunbird-mcp -o jsonpath='{.spec.host}'
# Output: sunbird-mcp.apps.ocp419.crucible.iisl.com
```

---

## Verify Deployment

### Health Check

```bash
ROUTE=$(oc get route sunbird-mcp -o jsonpath='{.spec.host}')
curl -sk https://${ROUTE}/health | python3 -m json.tool
```

Expected response:
```json
{
  "status": "ok",
  "dctrack": "connected",
  "poweriq": "connected",
  "uptime": 42
}
```

### List All Tools (190 total)

```bash
curl -sk https://${ROUTE}/tools | python3 -m json.tool | head -60
```

### Test Individual Tools

```bash
# dcTrack — List locations
curl -sk -X POST https://${ROUTE}/tools/dctrack_list_locations \
  -H 'Content-Type: application/json' -d '{}'

# dcTrack — Search items
curl -sk -X POST https://${ROUTE}/tools/dctrack_search_items \
  -H 'Content-Type: application/json' -d '{"class": "Device", "pageSize": 5}'

# dcTrack — List makes
curl -sk -X POST https://${ROUTE}/tools/dctrack_list_makes \
  -H 'Content-Type: application/json' -d '{}'

# dcTrack — List data ports on an item
curl -sk -X POST https://${ROUTE}/tools/dctrack_list_data_ports \
  -H 'Content-Type: application/json' -d '{"itemId": 101}'

# dcTrack — Get power readings for an item
curl -sk -X POST https://${ROUTE}/tools/dctrack_get_actual_readings \
  -H 'Content-Type: application/json' -d '{"itemId": 101}'

# dcTrack — Search tickets
curl -sk -X POST https://${ROUTE}/tools/dctrack_search_tickets \
  -H 'Content-Type: application/json' -d '{}'

# dcTrack — List custom fields
curl -sk -X POST https://${ROUTE}/tools/dctrack_list_custom_fields \
  -H 'Content-Type: application/json' -d '{}'

# dcTrack — List charts/reports
curl -sk -X POST https://${ROUTE}/tools/dctrack_list_charts \
  -H 'Content-Type: application/json' -d '{}'

# PowerIQ — List data centers
curl -sk -X POST https://${ROUTE}/tools/poweriq_list_datacenters \
  -H 'Content-Type: application/json' -d '{}'

# PowerIQ — List racks
curl -sk -X POST https://${ROUTE}/tools/poweriq_list_racks \
  -H 'Content-Type: application/json' -d '{}'

# PowerIQ — List events (last 10)
curl -sk -X POST https://${ROUTE}/tools/poweriq_list_events \
  -H 'Content-Type: application/json' -d '{"limit": 10}'

# PowerIQ — Get readings rollup
curl -sk -X POST https://${ROUTE}/tools/poweriq_get_readings_rollup \
  -H 'Content-Type: application/json' \
  -d '{"resourceType": "outlets", "id": 1, "interval": "daily"}'

# PowerIQ — Get executive summary
curl -sk -X POST https://${ROUTE}/tools/poweriq_get_executive_summary \
  -H 'Content-Type: application/json' \
  -d '{"resourceType": "data_centers", "id": 1}'

# PowerIQ — System info
curl -sk -X POST https://${ROUTE}/tools/poweriq_get_system_info \
  -H 'Content-Type: application/json' -d '{}'

# Combined — Health status
curl -sk -X POST https://${ROUTE}/tools/dcim_get_health_status \
  -H 'Content-Type: application/json' -d '{"locationId": 1}'

# Combined — Thermal analysis
curl -sk -X POST https://${ROUTE}/tools/dcim_thermal_analysis \
  -H 'Content-Type: application/json' -d '{"cabinetId": 100}'
```

### Test via MCP JSON-RPC Endpoint

```bash
# List tools via MCP protocol
curl -sk -X POST https://${ROUTE}/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call a tool via MCP protocol
curl -sk -X POST https://${ROUTE}/mcp \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "dctrack_list_locations",
      "arguments": {}
    }
  }'
```

---

## Update & Redeploy

### After Code Changes

```bash
# Rebuild image and restart pods
oc start-build sunbird-mcp-server --from-dir=. --follow --wait
oc rollout restart deployment/sunbird-mcp-server
oc rollout status deployment/sunbird-mcp-server

# Or use the script
./deploy/openshift/deploy.sh
```

### Rollout Only (no rebuild)

```bash
./deploy/openshift/deploy.sh --rollout
```

### Update Credentials

```bash
# Edit the secret directly
oc edit secret sunbird-credentials -n aitp-ai

# Or regenerate deployment.yaml and re-apply
./deploy/openshift/deploy.sh --from-template
```

---

## Monitoring & Troubleshooting

### Check Pod Status

```bash
oc get pods -l app=sunbird-mcp-server
```

### View Logs

```bash
# Follow logs from all pods
oc logs -f deployment/sunbird-mcp-server

# Logs from a specific pod
oc logs sunbird-mcp-server-<pod-hash> -f

# Last 100 lines with errors only
oc logs deployment/sunbird-mcp-server --tail=100 | grep -i error
```

### Check HPA (Auto-Scaling)

```bash
oc get hpa sunbird-mcp-server-hpa
```

### Debug a Failing Pod

```bash
# Describe pod for events
oc describe pod -l app=sunbird-mcp-server

# Shell into a running pod
oc exec -it deployment/sunbird-mcp-server -- /bin/sh

# Inside the pod, test Sunbird connectivity
wget -qO- --no-check-certificate https://192.168.200.201/api/v2/authentication/login
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Pod `CrashLoopBackOff` | Bad credentials or Sunbird unreachable | Check `oc logs`, verify Secret values |
| Health returns `dctrack: disconnected` | Wrong `SUNBIRD_BASE_URL` or firewall | Check NetworkPolicy egress, test from pod |
| `ImagePullBackOff` | Build not completed or wrong image ref | Run `oc start-build` again |
| `0/N nodes available` | Insufficient resources | Check `oc describe pod`, adjust resource requests |
| Route returns 503 | Pods not ready yet | Wait for readiness probe, check logs |

---

## Connecting MCP Clients

### n8n / LibreChat (HTTP mode)

```
MCP Server URL: https://sunbird-mcp.apps.ocp419.crucible.iisl.com/mcp
```

### Claude Desktop / Cursor (stdio mode — local dev only)

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sunbird-dcim": {
      "command": "node",
      "args": ["/path/to/sunbird-mcp-server/dist/main.js", "--stdio"],
      "env": {
        "SUNBIRD_BASE_URL": "https://192.168.200.201",
        "SUNBIRD_USERNAME": "API",
        "SUNBIRD_PASSWORD": "your-password"
      }
    }
  }
}
```

---

## Files in This Directory

| File | Purpose | Committed? |
|------|---------|------------|
| `README.md` | This guide | Yes |
| `deployment.template.yaml` | Deployment template with `__PLACEHOLDER__` values | Yes |
| `deployment.yaml` | **Actual deployment with real credentials** | **No** (gitignored) |
| `deploy.sh` | Automated build + deploy script | Yes |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  OpenShift Cluster                   │
│                                                     │
│  ┌─────────────┐    ┌──────────────────────────┐    │
│  │   Route      │───▶│  Service (ClusterIP:8080) │   │
│  │  (TLS edge)  │    └──────────┬───────────────┘   │
│  └─────────────┘               │                    │
│                    ┌───────────┴───────────┐        │
│                    ▼                       ▼        │
│            ┌──────────────┐       ┌──────────────┐  │
│            │  Pod (replica)│       │  Pod (replica)│ │
│            │  MCP Server   │       │  MCP Server   │ │
│            │  190 tools    │       │  190 tools    │ │
│            └──────┬───────┘       └──────┬───────┘  │
│                   │                       │         │
│                   └───────────┬───────────┘         │
│                               │ HTTPS :443          │
│                               ▼                     │
│                    ┌──────────────────┐              │
│                    │ Sunbird DCIM      │              │
│                    │ 192.168.200.201   │              │
│                    │ dcTrack + PowerIQ │              │
│                    └──────────────────┘              │
└─────────────────────────────────────────────────────┘
```

### Tool Coverage (190 tools)

| Product | Category | Tools |
|---------|----------|-------|
| dcTrack | Items, Locations, Cabinets | 27 |
| dcTrack | Makes, Models, Connectors | 10 |
| dcTrack | Ports (Data + Power) | 6 |
| dcTrack | Power Chain, Space Planning | 10 |
| dcTrack | Tickets | 7 |
| dcTrack | Projects | 4 |
| dcTrack | Parts (Classes, Models, Instances) | 12 |
| dcTrack | Admin (Custom Fields, Audit, Reports, Breakers, Lookups, Webhooks, Relationships, Permissions, Floormap, Favorites) | 30 |
| Power IQ | Core (PDUs, Sensors, PUE, Alerts, IT Devices) | 10 |
| Power IQ | Infrastructure (Hierarchy CRUD, Navigation) | 12 |
| Power IQ | PDU Write Operations | 5 |
| Power IQ | Readings & Rollups | 5 |
| Power IQ | Events | 4 |
| Power IQ | Power Control | 3 |
| Power IQ | System (Info, Jobs, Outlets, Inlets, Circuits, Panels, PUE) | 11 |
| Power IQ | Assets (Strips, Rack Units, Blade Slots) | 9 |
| Power IQ | Tags (Groups, Tags, Entries) | 12 |
| Power IQ | Misc (Transfer Switches, Integration, Floor Maps) | 7 |
| Combined | Cross-product Analytics | 6 |
| **Total** | | **190** |
