# Combined DCIM MCP Server — Test Prompts

Test prompts for combined analytics tools that span both dcTrack and Power IQ.

**Test Environment:**
- dcTrack location: `AI-ROOM-01`
- Known cabinets: `178B-01`, `178B-02`, `178B-03`, `178B-04`

---

## 1. Health Status

### dcim_get_health_status
```
What is the overall health status of the data center?
```
```
Show me the DCIM health dashboard
```
```
Are there any critical alerts across dcTrack and Power IQ?
```

---

## 2. Rack Summary

### dcim_get_rack_summary
```
Give me a full summary for cabinet 178B-02 including power and space
```
```
Show me a combined rack summary for cabinet 178B-01
```
```
What is the complete status of rack 178B-03 — space, power, and devices?
```

---

## 3. Capacity Finder

### dcim_find_capacity
```
Find cabinets with available capacity for a 4U server drawing 2kW
```
```
Where can I install a new 2U device in AI-ROOM-01?
```
```
Which racks have at least 10U free and 5kW power budget available?
```

---

## 4. Ghost Server Detection

### dcim_identify_ghost_servers
```
Find ghost servers — devices that exist in dcTrack but have no power readings in Power IQ
```
```
Are there any orphaned or disconnected devices in AI-ROOM-01?
```
```
Identify servers that are physically installed but not drawing power
```

---

## 5. Power Chain

### dcim_get_power_chain
```
Show me the full power chain for cabinet 178B-02 from utility to device
```
```
Trace the power path for rack 178B-01
```
```
What PDUs and circuits feed cabinet 178B-03?
```

---

## 6. Thermal Analysis

### dcim_thermal_analysis
```
Show me the thermal analysis for AI-ROOM-01
```
```
Are there any hot spots in the data center?
```
```
What is the temperature distribution across all racks?
```

---

## End-to-End Scenario Tests

### Scenario 1: New Server Deployment Planning
```
I need to deploy a new 4U GPU server. Find me a cabinet in AI-ROOM-01 with enough space and power, show me the available U positions, and tell me what the power chain looks like for that cabinet.
```

### Scenario 2: Capacity Audit
```
Give me a complete capacity overview of AI-ROOM-01 — how much space and power is used vs available across all cabinets?
```

### Scenario 3: Infrastructure Health Check
```
Run a full health check — show me the overall status, any alerts, ghost servers, and thermal hotspots in the data center.
```

### Scenario 4: Power Chain Investigation
```
I'm seeing a power issue in cabinet 178B-02. Show me the full power chain, current readings, and any related alerts.
```

### Scenario 5: Device Inventory
```
Show me everything installed in cabinet 178B-02 — devices, their power consumption, and network connections.
```

---

## Smoke Test Sequence (Quick Validation)

1. `What is the overall health status of the data center?`
2. `Give me a full summary for cabinet 178B-02`
3. `Find cabinets with available capacity for a 4U server`
4. `Find ghost servers in the data center`
5. `Show me the power chain for cabinet 178B-02`
6. `Show me the thermal analysis for AI-ROOM-01`
