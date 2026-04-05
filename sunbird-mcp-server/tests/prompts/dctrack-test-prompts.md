# dcTrack MCP Server — CRUD Test Prompts

Test prompts for all dcTrack MCP tools. Send each prompt through the chat UI and verify the expected tool is called and returns a valid response.

**Test Environment:**
- Location: `AI-ROOM-01`
- Known cabinets: `178B-01`, `178B-02`, `178B-03`, `178B-04`
- dcTrack URL: `https://192.168.200.202`

---

## 1. Locations (Read)

### dctrack_list_locations
```
List all locations in dcTrack
```
```
Show me all the sites in dcTrack
```
```
List all floors in dcTrack
```
```
Show locations with type Room
```

### dctrack_get_location
```
Get details for location AI-ROOM-01
```
```
Show me the full information for location ID 100
```

### dctrack_create_location
```
Create a new room called "AI-TEST-ROOM-99" under the existing building
```

---

## 2. Cabinets

### dctrack_list_cabinets
```
List all cabinets in dcTrack
```
```
Show me all cabinets in location AI-ROOM-01
```

### dctrack_get_cabinet
```
Get details for cabinet 178B-02
```
```
Show me cabinet ID 500
```

### dctrack_get_cabinet_items
```
What items are installed in cabinet 178B-02?
```
```
Show me all devices in cabinet 178B-01
```

### dctrack_get_cabinet_u_map
```
Show me the U-position map for cabinet 178B-02
```
```
Show all U slots in cabinet 178B-02
```
```
Which U positions are occupied in cabinet 178B-01?
```

### dctrack_get_cabinet_capacity
```
What space is available in cabinet 178B-02?
```
```
Show me the capacity and power utilization for cabinet 178B-01
```
```
How many U positions are free in cabinet 178B-03?
```

### dctrack_create_cabinet
```
Create a new cabinet called "AI-TEST-CAB-01" in location AI-ROOM-01 with 42U capacity
```

### dctrack_find_available_cabinets
```
Find cabinets in AI-ROOM-01 that have at least 4U of free space
```

### dctrack_find_available_upositions
```
What U positions are available in cabinet 178B-02?
```

---

## 3. Items / Devices

### dctrack_search_items
```
Search for all devices in dcTrack
```
```
Search for all items in cabinet 178B-02
```
```
Find all installed PDUs
```
```
Search for items with status Planned
```
```
Search for all Network devices
```
```
Find all items in location AI-ROOM-01
```

### dctrack_get_item
```
Show me details for item ID 1001
```
```
Get full information about device ID 2050
```

### dctrack_create_item
```
Create a new server item called "AI-GPU-Server-01" in cabinet 178B-02 at U position 10 using model ID 100
```

### dctrack_update_item
```
Update item ID 1001 to change its name to "AI-GPU-Server-01-Updated"
```
```
Change the status of item 1001 to Planned
```

### dctrack_move_item
```
Move item ID 1001 from cabinet 178B-02 to cabinet 178B-03 at U position 20
```

### dctrack_delete_item
```
Delete item ID 9999 from dcTrack
```

---

## 4. Connections

### dctrack_list_connections
```
List all connections for item ID 1001
```
```
Show me the network connections in dcTrack
```

### dctrack_get_connection
```
Get details for connection ID 500
```

### dctrack_create_connection
```
Create a data connection from item 1001 port "eth0" to item 1002 port "eth1"
```

### dctrack_delete_connection
```
Delete connection ID 500
```

---

## 5. Makes (Manufacturers)

### dctrack_list_makes
```
List all manufacturers in dcTrack
```
```
Show me all equipment makes
```

### dctrack_get_make
```
Get details for make ID 10
```

### dctrack_search_makes
```
Search for manufacturer "Dell"
```
```
Find makes matching "Cisco"
```

### dctrack_create_make
```
Create a new manufacturer called "AI-Test-Vendor" in dcTrack
```

### dctrack_update_make
```
Update make ID 999 to change the name to "AI-Test-Vendor-Updated"
```

### dctrack_delete_make
```
Delete make ID 999 from dcTrack
```

---

## 6. Models

### dctrack_list_models
```
List all equipment models in dcTrack
```
```
Show models from manufacturer Dell
```
```
List all models with class "Device"
```
```
List all models with C6100 in the name
```
```
Search for models matching "PowerEdge"
```

### dctrack_get_model
```
Get details for model ID 50
```

### dctrack_search_models
```
Search for models matching "PowerEdge"
```
```
Find models from make "Cisco" with class "Network"
```

### dctrack_create_model
```
Create a new model called "AI-Test-Model-01" for make ID 10 with class Device and 2U height
```

### dctrack_update_model
```
Update model ID 999 to change height to 4U
```

### dctrack_delete_model
```
Delete model ID 999
```

---

## 7. Data Ports

### dctrack_list_data_ports
```
List all data ports for item ID 1001
```
```
Show me the network ports on device 2050
```

### dctrack_get_data_port
```
Get details for data port ID 300
```

### dctrack_create_data_port
```
Create a new data port called "eth2" on item ID 1001 with connector type "RJ45"
```

### dctrack_update_data_port
```
Update data port ID 300 to change the port name to "mgmt0"
```

### dctrack_delete_data_port
```
Delete data port ID 300
```

---

## 8. Power Ports

### dctrack_list_power_ports
```
List all power ports for item ID 1001
```
```
Show me the power connections on device 2050
```

---

## 9. Power Chain & Readings

### dctrack_get_location_power_chain
```
Show me the power chain for location AI-ROOM-01
```
```
Get the power distribution chain for location ID 100
```

### dctrack_get_actual_readings
```
Get the actual power readings for item ID 1001
```
```
Show me the current power consumption for device 2050
```

### dctrack_get_port_readings
```
Get the power readings for port ID 400
```

### dctrack_update_port_readings
```
Update the power reading for port ID 400 to 2.5 kW
```

### dctrack_get_power_sum
```
Get the total power summary for location AI-ROOM-01
```

---

## 10. Sub-locations

### dctrack_list_sublocations
```
List all sub-locations for location AI-ROOM-01
```
```
Show child locations under location ID 100
```

### dctrack_get_sublocation
```
Get details for sub-location ID 200
```

### dctrack_create_sublocation
```
Create a new sub-location called "AI-Zone-A" under location AI-ROOM-01
```

---

## 11. Tickets / Work Orders

### dctrack_search_tickets
```
Search for all open tickets in dcTrack
```
```
Find tickets related to location AI-ROOM-01
```

### dctrack_get_ticket
```
Show me details for ticket ID 100
```

### dctrack_create_ticket
```
Create a new work order ticket titled "Install GPU Server in AI-ROOM-01 Cabinet 178B-02" with description "Install new NVIDIA DGX server at U position 10"
```

### dctrack_update_ticket
```
Update ticket ID 100 to change status to "In Progress"
```

### dctrack_assign_ticket_entity
```
Assign item ID 1001 to ticket ID 100
```

### dctrack_unassign_ticket_entity
```
Remove item ID 1001 from ticket ID 100
```

### dctrack_delete_ticket
```
Delete ticket ID 9999
```

---

## 12. Projects

### dctrack_get_project
```
Show me project ID 10
```

### dctrack_create_project
```
Create a new project called "AI-ROOM-01 GPU Cluster Deployment" with description "Deploy 8 GPU servers in AI-ROOM-01"
```

### dctrack_update_project
```
Update project ID 10 to change status to Active
```

### dctrack_delete_project
```
Delete project ID 9999
```

---

## 13. Parts & Inventory

### dctrack_list_part_classes
```
List all part classes in dcTrack
```

### dctrack_create_part_class
```
Create a new part class called "GPU Module"
```

### dctrack_get_part_model
```
Get details for part model ID 50
```

### dctrack_create_part_model
```
Create a new part model called "NVIDIA A100 GPU" under part class ID 5
```

### dctrack_search_part_models
```
Search for part models matching "GPU"
```
```
Find all part models in class "Memory"
```

### dctrack_get_part
```
Show me part ID 200
```

### dctrack_create_part
```
Create a new part for part model ID 50 with serial number "GPU-SN-001" and assign it to item ID 1001
```

### dctrack_update_part
```
Update part ID 200 to change the serial number to "GPU-SN-001-REV2"
```

### dctrack_search_parts
```
Search for all parts with serial number containing "GPU"
```
```
Find parts assigned to item 1001
```

### dctrack_adjust_stock
```
Adjust the stock for part model ID 50 by adding 10 units
```

### dctrack_assign_parts
```
Assign part ID 200 to item ID 1001
```

### dctrack_delete_part
```
Delete part ID 9999
```

---

## 14. Custom Fields

### dctrack_list_custom_fields
```
List all custom fields in dcTrack
```

### dctrack_get_custom_field
```
Get details for custom field ID 10
```

### dctrack_create_custom_field
```
Create a new custom field called "GPU_Count" with type Number for items
```

### dctrack_update_custom_field
```
Update custom field ID 10 to change the label to "GPU Count (Total)"
```

### dctrack_delete_custom_field
```
Delete custom field ID 9999
```

---

## 15. Audit Trail

### dctrack_search_audit_trail
```
Show the audit trail for the last 24 hours
```
```
Search audit logs for changes to items in AI-ROOM-01
```
```
Find all create actions in the audit trail
```

---

## 16. Reports / Charts

### dctrack_list_charts
```
List all available charts/reports in dcTrack
```

### dctrack_get_chart
```
Get chart configuration for chart ID 5
```

### dctrack_get_chart_data
```
Get the data for chart ID 5
```

---

## 17. Breakers

### dctrack_list_breakers
```
List all breakers in dcTrack
```

### dctrack_create_breaker
```
Create a new breaker called "AI-ROOM-01-BRK-A1" with rating 30A
```

### dctrack_update_breaker
```
Update breaker ID 100 to change the rating to 40A
```

### dctrack_delete_breaker
```
Delete breaker ID 9999
```

---

## 18. Lookups & Picklists

### dctrack_get_lookup_list
```
Get the lookup list for item classes
```
```
Show available item status options
```

### dctrack_get_picklist_options
```
Get picklist options for the "Status" field
```

---

## 19. Webhooks

### dctrack_get_webhook_config
```
Show the current webhook configuration
```

### dctrack_update_webhook_config
```
Update the webhook URL to "https://example.com/webhook"
```

### dctrack_delete_webhook_config
```
Remove the webhook configuration
```

---

## 20. Relationships

### dctrack_search_relationships
```
Search for all relationships in dcTrack
```
```
Find relationships for item ID 1001
```

### dctrack_get_relationship
```
Get details for relationship ID 50
```

### dctrack_create_relationship
```
Create a relationship between item 1001 (parent) and item 1002 (child) with type "Contains"
```

### dctrack_delete_relationship
```
Delete relationship ID 9999
```

---

## 21. Permissions

### dctrack_list_permissions
```
List all permissions in dcTrack
```

### dctrack_create_permission
```
Create a new permission for user "admin" on location AI-ROOM-01 with full access
```

### dctrack_update_permission
```
Update permission ID 10 to change access level to read-only
```

### dctrack_delete_permission
```
Delete permission ID 9999
```

---

## 22. Floormap

### dctrack_list_floormap_configs
```
List all floormap configurations
```

### dctrack_get_floormap_config
```
Get floormap configuration for location AI-ROOM-01
```

### dctrack_update_floormap_config
```
Update the floormap configuration for location ID 100
```

---

## 23. Location Favorites

### dctrack_get_location_favorites
```
Show my favorite locations in dcTrack
```

---

## 24. Import / Bulk Operations

### dctrack_list_import_templates
```
List all import templates available in dcTrack
```

### dctrack_get_import_template
```
Get import template ID 5
```

### dctrack_validate_import_data
```
Validate this import data before importing: [{"name":"AI-Server-01","cabinet":"178B-02","uPosition":10}]
```

### dctrack_bulk_import
```
Bulk import items using template ID 5 with data for 3 servers in cabinet 178B-02
```

### dctrack_bulk_update
```
Bulk update items 1001, 1002, 1003 to change status to Installed
```

---

## 25. Change Requests

### dctrack_create_change_request
```
Create a change request to move item 1001 from cabinet 178B-02 to 178B-03
```

### dctrack_update_change_request
```
Approve change request ID 50
```

---

## Smoke Test Sequence (Quick Validation)

Run these prompts in order to quickly validate the core dcTrack tools work:

1. `List all locations in dcTrack`
2. `List all cabinets`
3. `Show me all items in cabinet 178B-02`
4. `Show me the U-position map for cabinet 178B-02`
5. `What space is available in cabinet 178B-02?`
6. `List all manufacturers`
7. `List all models with C6100 in the name`
8. `List all equipment models`
9. `Search for all devices in AI-ROOM-01`
10. `Show me the power chain for location AI-ROOM-01`
11. `List all custom fields`
12. `Show the audit trail for the last 24 hours`
