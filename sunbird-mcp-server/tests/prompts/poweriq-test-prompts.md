# Power IQ MCP Server — CRUD Test Prompts

Test prompts for all Power IQ MCP tools. Send each prompt through the chat UI and verify the expected tool is called and returns a valid response.

**Test Environment:**
- Power IQ URL: `https://192.168.200.201`

---

## 1. Data Centers

### poweriq_list_datacenters
```
List all data centers in Power IQ
```
```
Show me all data center locations
```

### poweriq_get_datacenter
```
Get details for data center ID 1
```

### poweriq_create_datacenter
```
Create a new data center called "AI-DC-Test" in Power IQ
```

### poweriq_update_datacenter
```
Update data center ID 999 to change the name to "AI-DC-Test-Updated"
```

### poweriq_delete_datacenter
```
Delete data center ID 999
```

---

## 2. Floors

### poweriq_list_floors
```
List all floors in Power IQ
```
```
Show me the floors in data center ID 1
```

---

## 3. Rooms

### poweriq_list_rooms
```
List all rooms in Power IQ
```
```
Show rooms on floor ID 1
```

---

## 4. Racks

### poweriq_list_racks
```
List all racks in Power IQ
```
```
Show me all racks in room ID 1
```

### poweriq_get_rack
```
Get details for rack ID 100
```

### poweriq_get_rack_readings
```
Get the power readings for rack ID 100
```

---

## 5. Hierarchy Navigation

### poweriq_get_children
```
Show me the children of data center ID 1
```
```
What resources are directly under floor ID 5?
```

### poweriq_get_descendants
```
Show all descendants of data center ID 1
```
```
List everything under room ID 10 recursively
```

### poweriq_move_resource
```
Move rack ID 100 to room ID 20
```

---

## 6. Executive Summary

### poweriq_get_executive_summary
```
Show me the executive power summary for Power IQ
```
```
Get the overall data center power overview
```

---

## 7. PDUs (Read)

### poweriq_list_pdus
```
List all PDUs in Power IQ
```
```
Show me all rack PDUs
```

### poweriq_get_pdu
```
Get details for PDU ID 50
```
```
Show me PDU information for ID 100
```

### poweriq_get_pdu_readings
```
Get the current power readings for PDU ID 50
```
```
What is the current load on PDU 100?
```

---

## 8. PDUs (Write)

### poweriq_create_pdu
```
Create a new PDU in Power IQ with IP address 192.168.200.50 and SNMP community "public"
```

### poweriq_update_pdu
```
Update PDU ID 50 to change the label to "AI-PDU-01"
```

### poweriq_delete_pdu
```
Delete PDU ID 9999 from Power IQ
```

### poweriq_rescan_pdu
```
Rescan PDU ID 50 to refresh its data
```

### poweriq_batch_create_pdus
```
Batch create PDUs for IP range 192.168.200.50-55 with SNMP community "public"
```

---

## 9. Outlets

### poweriq_list_outlets
```
List all outlets for PDU ID 50
```
```
Show me the outlets on PDU 100
```

### poweriq_get_outlet
```
Get details for outlet ID 200
```

### poweriq_get_outlet_readings
```
Get power readings for outlet ID 200
```
```
What is the current draw on outlet 200?
```

### poweriq_update_outlet
```
Update outlet ID 200 to change the label to "GPU-Server-A1"
```

### poweriq_rename_outlets_batch
```
Rename outlets 200, 201, 202 to "GPU-01", "GPU-02", "GPU-03"
```

---

## 10. Inlets

### poweriq_list_inlets
```
List all inlets for PDU ID 50
```
```
Show me the inlets on PDU 100
```

### poweriq_get_inlet_readings
```
Get power readings for inlet ID 30
```
```
What is the current input power on inlet 30?
```

---

## 11. Circuits

### poweriq_list_circuits
```
List all circuits for PDU ID 50
```
```
Show me the circuits on PDU 100
```

### poweriq_get_circuit_readings
```
Get power readings for circuit ID 40
```

---

## 12. Panels

### poweriq_list_panels
```
List all panels in Power IQ
```

### poweriq_get_panel
```
Get details for panel ID 10
```

---

## 13. Sensors

### poweriq_list_sensors
```
List all sensors in Power IQ
```
```
Show me all environmental sensors
```

### poweriq_get_sensor_readings
```
Get the current readings for sensor ID 25
```
```
What is the temperature reading from sensor 25?
```

---

## 14. Events & Alerts

### poweriq_list_events
```
List all events in Power IQ
```
```
Show me recent Power IQ events
```

### poweriq_get_event
```
Get details for event ID 500
```

### poweriq_clear_event
```
Clear event ID 500
```

### poweriq_clear_events_batch
```
Clear all events older than 7 days
```

### poweriq_list_alerts
```
List all active alerts in Power IQ
```
```
Show me current Power IQ alerts
```

---

## 15. Power Control

### poweriq_power_control_outlets
```
Turn off outlet ID 200 on PDU 50
```
```
Power cycle outlet 201
```

### poweriq_power_control_device
```
Power off the device connected to outlet 200
```

### poweriq_power_control_rack
```
Power cycle all outlets in rack ID 100
```

---

## 16. Readings & Rollups

### poweriq_get_readings_rollup
```
Get hourly power readings rollup for PDU ID 50 over the last 24 hours
```
```
Show me daily power consumption trends for PDU 100
```

### poweriq_get_latest_reading
```
Get the latest reading for PDU ID 50
```

---

## 17. PUE (Power Usage Effectiveness)

### poweriq_get_pue
```
What is the current PUE in Power IQ?
```
```
Show me the PUE metrics
```

### poweriq_get_pue_calculations
```
Get the PUE calculation details and breakdown
```

---

## 18. IT Devices

### poweriq_list_it_devices
```
List all IT devices tracked in Power IQ
```
```
Show me servers monitored by Power IQ
```

---

## 19. Asset Strips

### poweriq_list_asset_strips
```
List all asset strips in Power IQ
```

### poweriq_get_asset_strip
```
Get details for asset strip ID 10
```

### poweriq_update_asset_strip
```
Update asset strip ID 10 to change the label to "Row-A-Strip"
```

### poweriq_get_asset_strip_rack_units
```
Get rack units for asset strip ID 10
```

---

## 20. Rack Units

### poweriq_list_rack_units
```
List all rack units in Power IQ
```

### poweriq_get_rack_unit
```
Get details for rack unit ID 500
```

### poweriq_update_rack_unit
```
Update rack unit ID 500 to change the label to "U10-GPU-Server"
```

### poweriq_get_rack_unit_blade_slots
```
Get blade slots for rack unit ID 500
```

### poweriq_list_blade_slots
```
List all blade slots in Power IQ
```

---

## 21. Tags

### poweriq_list_tag_groups
```
List all tag groups in Power IQ
```

### poweriq_get_tag_group
```
Get details for tag group ID 5
```

### poweriq_create_tag_group
```
Create a new tag group called "AI Infrastructure"
```

### poweriq_update_tag_group
```
Update tag group ID 5 to rename it to "AI Infrastructure - GPU"
```

### poweriq_delete_tag_group
```
Delete tag group ID 9999
```

### poweriq_list_tags
```
List all tags in Power IQ
```
```
Show tags in tag group ID 5
```

### poweriq_get_tag
```
Get details for tag ID 20
```

### poweriq_create_tag
```
Create a new tag called "GPU-Cluster" in tag group ID 5
```

### poweriq_update_tag
```
Update tag ID 20 to change the name to "GPU-Cluster-v2"
```

### poweriq_delete_tag
```
Delete tag ID 9999
```

### poweriq_create_tag_entry
```
Apply tag ID 20 to PDU ID 50
```

### poweriq_delete_tag_entry
```
Remove tag ID 20 from PDU ID 50
```

---

## 22. Transfer Switches

### poweriq_list_transfer_switches
```
List all transfer switches in Power IQ
```

### poweriq_get_transfer_switch
```
Get details for transfer switch ID 10
```

### poweriq_get_transfer_switch_states
```
Get the current states for transfer switch ID 10
```

---

## 23. Floor Maps

### poweriq_get_floor_map_mappable
```
Get floor map data for a mappable resource
```

---

## 24. Integration

### poweriq_get_integration_registration
```
Show the Power IQ integration registration status
```

### poweriq_get_integration_status
```
What is the current integration sync status?
```

### poweriq_list_integration_entities
```
List all entities managed by the integration
```

---

## 25. System

### poweriq_get_system_info
```
Show me Power IQ system information
```
```
What version of Power IQ is running?
```

### poweriq_get_job
```
Get status of job ID 100
```

---

## Smoke Test Sequence (Quick Validation)

Run these prompts in order to quickly validate the core Power IQ tools work:

1. `List all data centers in Power IQ`
2. `List all PDUs in Power IQ`
3. `Get the current power readings for PDU ID 50`
4. `List all outlets for PDU ID 50`
5. `List all sensors in Power IQ`
6. `Show me recent Power IQ events`
7. `List all active alerts in Power IQ`
8. `What is the current PUE?`
9. `Show me Power IQ system information`
10. `List all racks in Power IQ`
