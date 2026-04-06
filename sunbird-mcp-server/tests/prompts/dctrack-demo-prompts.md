# dcTrack Full Functionality Demo Prompts

> **Objective**: Demonstrate full DCIM AI Assistant functionality by populating 3 cabinets with realistic data center equipment, querying/modifying everything, then cleaning up to original state.
>
> **Target Location**: `AI-DEMO-DC > AI-ROOM-01` (exists, completely empty — no cabinets)
>
> **Scenario**: A new data center room is being commissioned from scratch — create cabinets, populate with mixed compute, network, power, and infrastructure equipment, then clean up completely.

---

## Equipment Plan — Realistic Inventory

All makes/models below are **verified to exist** in the dcTrack model library.

### Cabinet 1: `AI-CAB-01` — Compute Cabinet (42U)
| U-Position | Item Name | Class | Make | Model | RU |
|-----------|-----------|-------|------|-------|----|
| ZeroU | AI-PDU-A1 | Rack PDU | APC | AP8861 | ZeroU |
| ZeroU | AI-PDU-A2 | Rack PDU | APC | AP8865 | ZeroU |
| U1 | AI-PROBE-01 | Probe | Geist | RSE-B | 1U |
| U2-U3 | AI-PATCH-01 | Data Panel | Panduit | 1RU-CP Panel RJ45 24-port CAT6 | 1U |
| U3 | AI-WM-01 | Passive | APC | 1RU-Wire Manager AR8602 | 1U |
| U4-U5 | AI-SRV-01 | Device | Dell | PowerEdge R740 | 2U |
| U6-U7 | AI-SRV-02 | Device | Dell | PowerEdge R740 | 2U |
| U8-U9 | AI-SRV-03 | Device | Dell | PowerEdge R640 | 1U |
| U10 | AI-SRV-04 | Device | Dell | PowerEdge R650 | 1U |
| U11 | AI-BLANK-01 | Passive | APC | 1RU-Blanking Plate-APC | 1U |
| | | | | **Used: ~11U / 42U = 26%** | |

### Cabinet 2: `AI-CAB-02` — Network Cabinet (42U)
| U-Position | Item Name | Class | Make | Model | RU |
|-----------|-----------|-------|------|-------|----|
| ZeroU | AI-PDU-B1 | Rack PDU | APC | AP8841 | ZeroU |
| ZeroU | AI-PDU-B2 | Rack PDU | APC | AP8841 | ZeroU |
| U1 | AI-TOR-01 | Network | Cisco | Nexus N9K-C9372PX | 1U |
| U2 | AI-TOR-02 | Network | Cisco | Nexus N9K-C93180YC-EX | 1U |
| U3 | AI-PATCH-02 | Data Panel | Panduit | 1RU-DP6 Panel RJ45 24-port CAT6 | 1U |
| U4 | AI-WM-02 | Passive | APC | 1RU-Wire Manager AR8602 | 1U |
| U5 | AI-PATCH-03 | Data Panel | Panduit | 1RU-CP Panel RJ45 24-port CAT6A | 1U |
| U6-U7 | AI-SRV-05 | Device | Dell | PowerEdge R730 | 2U |
| U8-U9 | AI-SRV-06 | Device | Dell | PowerEdge R720 | 2U |
| U10 | AI-BLANK-02 | Passive | APC | 2RU-Blanking Plate-APC | 2U |
| | | | | **Used: ~12U / 42U = 29%** | |

### Cabinet 3: `AI-CAB-03` — Power & Infrastructure Cabinet (42U)
| U-Position | Item Name | Class | Make | Model | RU |
|-----------|-----------|-------|------|-------|----|
| ZeroU | AI-PDU-C1 | Rack PDU | APC | AP8853 | ZeroU |
| U1-U2 | AI-SRV-07 | Device | Dell | PowerEdge R740xd | 2U |
| U3-U4 | AI-SRV-08 | Device | Dell | PowerEdge R730xd | 2U |
| U5 | AI-TOR-03 | Network | Cisco | Nexus N9K-C9372TX | 1U |
| U6 | AI-PROBE-02 | Probe | APC | AP9340 | 1U |
| U7 | AI-PATCH-04 | Data Panel | Panduit | 1RU-CPP Panel RJ45 24-port CAT6 | 1U |
| U8 | AI-WM-03 | Passive | APC | 2RU-Wire Manager AR8600 | 2U |
| U10-U13 | AI-BLANK-03 | Passive | APC | 4RU-Blanking Plate-APC | 4U |
| | | | | **Used: ~13U / 42U = 31%** | |

**Total Items**: 28 (8 servers, 3 switches, 5 PDUs, 4 patch panels, 2 probes, 3 wire managers/blanking plates, 3 blanking plates)

---

## PHASE 1: VERIFY CLEAN STATE (3 prompts)

### 1.1 List Locations
```
List all locations in dcTrack
```
**Expected**: `AI-DEMO-DC > AI-ROOM-01` visible in hierarchy.

### 1.2 Confirm Location is Empty
```
Search for all items in location AI-ROOM-01
```
**Expected**: No items found. If items exist, skip to PHASE 6 cleanup first.

### 1.3 Confirm No Cabinets
```
Find cabinets in AI-ROOM-01
```
**Expected**: No cabinets found — location is completely empty.

---

## PHASE 2: CREATE CABINETS (3 prompts)

### 2.C1 Create Cabinet 1 — Compute
```
Create a new cabinet named "AI-CAB-01" in location AI-ROOM-01 with make Rittal and model "42RU-Cabinet"
```
**Expected**: Cabinet AI-CAB-01 created (42U).

### 2.C2 Create Cabinet 2 — Network
```
Create a new cabinet named "AI-CAB-02" in location AI-ROOM-01 with make Rittal and model "42RU-Cabinet"
```
**Expected**: Cabinet AI-CAB-02 created (42U).

### 2.C3 Create Cabinet 3 — Power & Infrastructure
```
Create a new cabinet named "AI-CAB-03" in location AI-ROOM-01 with make Rittal and model "42RU-Cabinet"
```
**Expected**: Cabinet AI-CAB-03 created (42U).

### 2.C4 Verify Cabinets Created
```
List all cabinets in AI-ROOM-01
```
**Expected**: AI-CAB-01, AI-CAB-02, AI-CAB-03 visible.

---

## PHASE 2A: CREATE — CABINET 1 (Compute) — 10 prompts

### 2.1 Install Rack PDU A1 (ZeroU)
```
Create a new item named "AI-PDU-A1" in cabinet AI-CAB-01 with make APC, model AP8861, class Rack PDU, mounting ZeroU, status Planned
```

### 2.2 Install Rack PDU A2 (ZeroU)
```
Create a new item named "AI-PDU-A2" in cabinet AI-CAB-01 with make APC, model AP8865, class Rack PDU, mounting ZeroU, status Planned
```

### 2.3 Install Environmental Probe
```
Create a new item named "AI-PROBE-01" in cabinet AI-CAB-01 with make Geist, model RSE-B, class Probe, status Planned
```

### 2.4 Install Patch Panel
```
Create a new item named "AI-PATCH-01" in cabinet AI-CAB-01 with make Panduit, model "1RU-CP Panel RJ45 24-port CAT6", class Data Panel, status Planned
```

### 2.5 Install Wire Manager
```
Create a new item named "AI-WM-01" in cabinet AI-CAB-01 with make APC, model "1RU-Wire Manager AR8602", class Passive, status Planned
```

### 2.6 Install Server 1 (Dell R740)
```
Create a new item named "AI-SRV-01" in cabinet AI-CAB-01 with make Dell, model "PowerEdge R740", class Device, status Planned
```

### 2.7 Install Server 2 (Dell R740)
```
Create a new item named "AI-SRV-02" in cabinet AI-CAB-01 with make Dell, model "PowerEdge R740", class Device, status Planned
```

### 2.8 Install Server 3 (Dell R640 — 1U)
```
Create a new item named "AI-SRV-03" in cabinet AI-CAB-01 with make Dell, model "PowerEdge R640", class Device, status Planned
```

### 2.9 Install Server 4 (Dell R650 — 1U)
```
Create a new item named "AI-SRV-04" in cabinet AI-CAB-01 with make Dell, model "PowerEdge R650", class Device, status Planned
```

### 2.10 Install Blanking Plate
```
Create a new item named "AI-BLANK-01" in cabinet AI-CAB-01 with make APC, model "1RU-Blanking Plate-APC", class Passive, status Planned
```

---

## PHASE 2B: CREATE — CABINET 2 (Network) — 10 prompts

### 2.11 Install Rack PDU B1 (ZeroU)
```
Create a new item named "AI-PDU-B1" in cabinet AI-CAB-02 with make APC, model AP8841, class Rack PDU, mounting ZeroU, status Planned
```

### 2.12 Install Rack PDU B2 (ZeroU)
```
Create a new item named "AI-PDU-B2" in cabinet AI-CAB-02 with make APC, model AP8841, class Rack PDU, mounting ZeroU, status Planned
```

### 2.13 Install Top-of-Rack Switch 1 (Nexus 9K)
```
Create a new item named "AI-TOR-01" in cabinet AI-CAB-02 with make Cisco, model "Nexus N9K-C9372PX", class Network, status Planned
```

### 2.14 Install Top-of-Rack Switch 2 (Nexus 9K)
```
Create a new item named "AI-TOR-02" in cabinet AI-CAB-02 with make Cisco, model "Nexus N9K-C93180YC-EX", class Network, status Planned
```

### 2.15 Install Patch Panel (RJ45)
```
Create a new item named "AI-PATCH-02" in cabinet AI-CAB-02 with make Panduit, model "1RU-DP6 Panel RJ45 24-port CAT6", class Data Panel, status Planned
```

### 2.16 Install Wire Manager
```
Create a new item named "AI-WM-02" in cabinet AI-CAB-02 with make APC, model "1RU-Wire Manager AR8602", class Passive, status Planned
```

### 2.17 Install Patch Panel (CAT6A)
```
Create a new item named "AI-PATCH-03" in cabinet AI-CAB-02 with make Panduit, model "1RU-CP Panel RJ45 24-port CAT6A", class Data Panel, status Planned
```

### 2.18 Install Server 5 (Dell R730)
```
Create a new item named "AI-SRV-05" in cabinet AI-CAB-02 with make Dell, model "PowerEdge R730", class Device, status Planned
```

### 2.19 Install Server 6 (Dell R720)
```
Create a new item named "AI-SRV-06" in cabinet AI-CAB-02 with make Dell, model "PowerEdge R720", class Device, status Planned
```

### 2.20 Install 2U Blanking Plate
```
Create a new item named "AI-BLANK-02" in cabinet AI-CAB-02 with make APC, model "2RU-Blanking Plate-APC", class Passive, status Planned
```

---

## PHASE 2C: CREATE — CABINET 3 (Power & Infra) — 8 prompts

### 2.21 Install Rack PDU C1 (ZeroU)
```
Create a new item named "AI-PDU-C1" in cabinet AI-CAB-03 with make APC, model AP8853, class Rack PDU, mounting ZeroU, status Planned
```

### 2.22 Install Server 7 (Dell R740xd — Storage server)
```
Create a new item named "AI-SRV-07" in cabinet AI-CAB-03 with make Dell, model "PowerEdge R740xd", class Device, status Planned
```

### 2.23 Install Server 8 (Dell R730xd — Storage server)
```
Create a new item named "AI-SRV-08" in cabinet AI-CAB-03 with make Dell, model "PowerEdge R730xd", class Device, status Planned
```

### 2.24 Install Top-of-Rack Switch 3
```
Create a new item named "AI-TOR-03" in cabinet AI-CAB-03 with make Cisco, model "Nexus N9K-C9372TX", class Network, status Planned
```

### 2.25 Install Environmental Probe 2
```
Create a new item named "AI-PROBE-02" in cabinet AI-CAB-03 with make APC, model AP9340, class Probe, status Planned
```

### 2.26 Install Patch Panel
```
Create a new item named "AI-PATCH-04" in cabinet AI-CAB-03 with make Panduit, model "1RU-CPP Panel RJ45 24-port CAT6", class Data Panel, status Planned
```

### 2.27 Install 2U Wire Manager
```
Create a new item named "AI-WM-03" in cabinet AI-CAB-03 with make APC, model "2RU-Wire Manager AR8600", class Passive, status Planned
```

### 2.28 Install 4U Blanking Plate
```
Create a new item named "AI-BLANK-03" in cabinet AI-CAB-03 with make APC, model "4RU-Blanking Plate-APC", class Passive, status Planned
```

---

## PHASE 2D: CREATE — TICKET — 1 prompt

### 2.29 Create Commissioning Ticket
```
Create a new ticket with description "AI-ROOM-01 Commissioning: Install and cable 3 cabinets of compute, network, and infrastructure equipment"
```
**[RECORD]**: Note the ticket ID.

---

## PHASE 3: VERIFY CREATED OBJECTS (15 prompts)

### 3.1 View Cabinet 1 Contents
```
What items are installed in cabinet AI-CAB-01?
```
**Expected**: 10 items — 2 PDUs, 1 probe, 1 patch panel, 1 wire manager, 4 servers, 1 blanking plate.

### 3.2 View Cabinet 2 Contents
```
What items are installed in cabinet AI-CAB-02?
```
**Expected**: 10 items — 2 PDUs, 2 switches, 2 patch panels, 1 wire manager, 2 servers, 1 blanking plate.

### 3.3 View Cabinet 3 Contents
```
What items are installed in cabinet AI-CAB-03?
```
**Expected**: 8 items — 1 PDU, 2 servers, 1 switch, 1 probe, 1 patch panel, 1 wire manager, 1 blanking plate.

### 3.4 Cabinet 1 U-Position Map
```
Show me the U-position map for cabinet AI-CAB-01
```
**Expected**: Occupied U positions for servers/panels/probe. ZeroU section shows 2 PDUs. ~26% utilization.

### 3.5 Cabinet 2 U-Position Map
```
Show me the U-position map for cabinet AI-CAB-02
```
**Expected**: Switches, patch panels, servers visible. ~29% utilization.

### 3.6 Cabinet 3 U-Position Map
```
Show me the U-position map for cabinet AI-CAB-03
```
**Expected**: Storage servers, switch, probe, panels visible. ~31% utilization.

### 3.7 Cabinet 1 Capacity Check
```
What space is available in cabinet AI-CAB-01?
```
**Expected**: ~11U used, ~31U available, ~26% utilization. ZeroU PDUs excluded from RU count.

### 3.8 Cabinet 2 Capacity Check
```
What space is available in cabinet AI-CAB-02?
```
**Expected**: ~12U used, ~30U available, ~29% utilization.

### 3.9 Cabinet 3 Capacity Check
```
What space is available in cabinet AI-CAB-03?
```
**Expected**: ~13U used, ~29U available, ~31% utilization.

### 3.10 Search All Items in Location
```
Search for all items in location AI-ROOM-01
```
**Expected**: 28+ items plus cabinets. Pagination shows "showing X of Y total".

### 3.11 Search by Class — All Devices
```
Search for all Device items in dcTrack
```
**Expected**: AI-SRV-01 through AI-SRV-08 appear among results.

### 3.12 Search by Class — All Network Items
```
Search for all Network items in dcTrack
```
**Expected**: AI-TOR-01, AI-TOR-02, AI-TOR-03 appear.

### 3.13 Search by Class — All Rack PDUs
```
Search for all Rack PDU items in dcTrack
```
**Expected**: AI-PDU-A1, A2, B1, B2, C1 appear.

### 3.14 Search by Class — All Data Panels
```
Search for all Data Panel items in dcTrack
```
**Expected**: AI-PATCH-01 through AI-PATCH-04 appear.

### 3.15 Search by Class — All Probes
```
Search for all Probe items in dcTrack
```
**Expected**: AI-PROBE-01, AI-PROBE-02 appear.

---

## PHASE 4: QUERY & SEARCH OPERATIONS (12 prompts)

### 4.1 Search Item by Exact Name
```
Search for item named "AI-SRV-01" in dcTrack
```
**Expected**: Single server result with full details (make, model, location, cabinet, status).

### 4.2 Search Items by Prefix
```
Search for items named "AI-TOR" in dcTrack
```
**Expected**: All 3 TOR switches returned.

### 4.3 Search Manufacturer — Dell
```
Search for manufacturer Dell
```
**Expected**: Dell found (filtered, not full list).

### 4.4 Search Manufacturer — Cisco
```
Search for manufacturer Cisco
```
**Expected**: Cisco found.

### 4.5 Search Manufacturer — APC
```
Search for manufacturer APC
```
**Expected**: APC found.

### 4.6 List All Manufacturers
```
List all manufacturers in dcTrack
```
**Expected**: Full list with pagination metadata.

### 4.7 Search Models by Name — Nexus
```
Search for models with name 'Nexus' in dcTrack
```
**Expected**: Multiple Cisco Nexus models returned.

### 4.8 Search Models by Name — PowerEdge
```
Search for models with name 'PowerEdge R7' in dcTrack
```
**Expected**: Dell PowerEdge R710, R720, R730, R740, R740xd etc.

### 4.9 List All Models (Pagination Test)
```
List all models in dcTrack
```
**Expected**: "showing 1000 of 40,000+ total" — confirms global pageSize 1000.

### 4.10 Find Cabinets with Free Space
```
Find cabinets in AI-ROOM-01 that have at least 4U of free space
```
**Expected**: All 3 populated cabinets + empty AI-CAB-04 through AI-CAB-07 listed with available RU.

### 4.11 Find Cabinets with 35U Free
```
Find cabinets in AI-ROOM-01 that have at least 35U of free space
```
**Expected**: Only empty cabinets AI-CAB-04 through AI-CAB-07 (42U free each).

### 4.12 Search Tickets
```
Search for all tickets in dcTrack
```
**Expected**: Commissioning ticket from step 2.29 appears.

---

## PHASE 5: MODIFY OBJECTS (13 prompts)

### --- Commission Servers (Status Change) ---

### 5.1 Get Server 1 ID
```
Search for item named "AI-SRV-01" in dcTrack
```
**[RECORD]**: Note itemId.

### 5.2 Set Server 1 to Installed
```
Update item [AI-SRV-01 ID] and set status to Installed
```
**Expected**: Status changed from Planned to Installed.

### 5.3 Verify Status Change
```
Search for item named "AI-SRV-01" in dcTrack
```
**Expected**: Status now "Installed".

### 5.4 Get Server 5 ID (in Cabinet 2)
```
Search for item named "AI-SRV-05" in dcTrack
```
**[RECORD]**: Note itemId.

### 5.5 Set Server 5 to Installed
```
Update item [AI-SRV-05 ID] and set status to Installed
```

### --- Move Equipment Between Cabinets ---

### 5.6 Get Server 8 ID (in Cabinet 3)
```
Search for item named "AI-SRV-08" in dcTrack
```
**[RECORD]**: Note itemId for AI-SRV-08.

### 5.7 Check Available Space in Cabinet 1
```
Show me the U-position map for cabinet AI-CAB-01
```
**Note**: Identify a free 2U slot for the R730xd.

### 5.8 Move Server 8 from Cabinet 3 to Cabinet 1
```
Move item [AI-SRV-08 ID] to cabinet AI-CAB-01 at U-position 20
```
**Note**: Adjust U-position based on 5.7 results.

### 5.9 Verify Cabinet 3 Lost a Server
```
What items are installed in cabinet AI-CAB-03?
```
**Expected**: AI-SRV-08 no longer listed (7 items now).

### 5.10 Verify Cabinet 1 Gained a Server
```
What items are installed in cabinet AI-CAB-01?
```
**Expected**: AI-SRV-08 now visible (11 items).

### 5.11 Updated U-Map for Cabinet 1
```
Show me the U-position map for cabinet AI-CAB-01
```
**Expected**: AI-SRV-08 occupies U20-U21 (2U).

### --- Update Ticket ---

### 5.12 Find Commissioning Ticket
```
Search for tickets in dcTrack
```
**[RECORD]**: Note ticket ID.

### 5.13 Update Ticket Progress
```
Update ticket [TICKET_ID] with status "In Progress" and comments "Cabinets 1-3 populated. Servers AI-SRV-01 and AI-SRV-05 commissioned. AI-SRV-08 relocated to CAB-01."
```

---

## PHASE 6: DELETE & CLEANUP — Restore Empty State (25 prompts)

> **Goal**: Remove ALL objects created during the demo — 28 items + 3 cabinets + 1 ticket — returning AI-ROOM-01 to completely empty.
> Delete order: items first, then cabinets, then ticket.

### 6.1 Get All Item IDs — Cabinet 1
```
What items are installed in cabinet AI-CAB-01?
```
**[RECORD]**: All item IDs (now 11 items including moved AI-SRV-08).

### 6.2 Get All Item IDs — Cabinet 2
```
What items are installed in cabinet AI-CAB-02?
```
**[RECORD]**: All item IDs (10 items).

### 6.3 Get All Item IDs — Cabinet 3
```
What items are installed in cabinet AI-CAB-03?
```
**[RECORD]**: All item IDs (7 items).

### --- Delete Cabinet 1 Items (11 items) ---

### 6.4 Delete AI-PDU-A1
```
Delete item [AI-PDU-A1 ID] from dcTrack
```

### 6.5 Delete AI-PDU-A2
```
Delete item [AI-PDU-A2 ID] from dcTrack
```

### 6.6 Delete AI-PROBE-01
```
Delete item [AI-PROBE-01 ID] from dcTrack
```

### 6.7 Delete AI-PATCH-01
```
Delete item [AI-PATCH-01 ID] from dcTrack
```

### 6.8 Delete AI-WM-01
```
Delete item [AI-WM-01 ID] from dcTrack
```

### 6.9 Delete AI-SRV-01
```
Delete item [AI-SRV-01 ID] from dcTrack
```

### 6.10 Delete AI-SRV-02
```
Delete item [AI-SRV-02 ID] from dcTrack
```

### 6.11 Delete AI-SRV-03
```
Delete item [AI-SRV-03 ID] from dcTrack
```

### 6.12 Delete AI-SRV-04
```
Delete item [AI-SRV-04 ID] from dcTrack
```

### 6.13 Delete AI-BLANK-01
```
Delete item [AI-BLANK-01 ID] from dcTrack
```

### 6.14 Delete AI-SRV-08 (moved here in Phase 5)
```
Delete item [AI-SRV-08 ID] from dcTrack
```

### 6.15 Verify Cabinet 1 Empty
```
What items are installed in cabinet AI-CAB-01?
```
**Expected**: No items.

### --- Delete Cabinet 2 Items (10 items) ---

### 6.16 Delete AI-PDU-B1
```
Delete item [AI-PDU-B1 ID] from dcTrack
```

### 6.17 Delete AI-PDU-B2
```
Delete item [AI-PDU-B2 ID] from dcTrack
```

### 6.18 Delete AI-TOR-01
```
Delete item [AI-TOR-01 ID] from dcTrack
```

### 6.19 Delete AI-TOR-02
```
Delete item [AI-TOR-02 ID] from dcTrack
```

### 6.20 Delete AI-PATCH-02
```
Delete item [AI-PATCH-02 ID] from dcTrack
```

### 6.21 Delete AI-WM-02
```
Delete item [AI-WM-02 ID] from dcTrack
```

### 6.22 Delete AI-PATCH-03
```
Delete item [AI-PATCH-03 ID] from dcTrack
```

### 6.23 Delete AI-SRV-05
```
Delete item [AI-SRV-05 ID] from dcTrack
```

### 6.24 Delete AI-SRV-06
```
Delete item [AI-SRV-06 ID] from dcTrack
```

### 6.25 Delete AI-BLANK-02
```
Delete item [AI-BLANK-02 ID] from dcTrack
```

### 6.26 Verify Cabinet 2 Empty
```
What items are installed in cabinet AI-CAB-02?
```
**Expected**: No items.

### --- Delete Cabinet 3 Items (7 items) ---

### 6.27 Delete AI-PDU-C1
```
Delete item [AI-PDU-C1 ID] from dcTrack
```

### 6.28 Delete AI-SRV-07
```
Delete item [AI-SRV-07 ID] from dcTrack
```

### 6.29 Delete AI-TOR-03
```
Delete item [AI-TOR-03 ID] from dcTrack
```

### 6.30 Delete AI-PROBE-02
```
Delete item [AI-PROBE-02 ID] from dcTrack
```

### 6.31 Delete AI-PATCH-04
```
Delete item [AI-PATCH-04 ID] from dcTrack
```

### 6.32 Delete AI-WM-03
```
Delete item [AI-WM-03 ID] from dcTrack
```

### 6.33 Delete AI-BLANK-03
```
Delete item [AI-BLANK-03 ID] from dcTrack
```

### 6.34 Verify Cabinet 3 Empty
```
What items are installed in cabinet AI-CAB-03?
```
**Expected**: No items.

### --- Delete Cabinets ---

### 6.35 Get Cabinet Item IDs
```
Search for items named "AI-CAB" with class Cabinet
```
**[RECORD]**: Note item IDs for AI-CAB-01, AI-CAB-02, AI-CAB-03.

### 6.36 Delete Cabinet 1
```
Delete item [AI-CAB-01 ID] from dcTrack
```

### 6.37 Delete Cabinet 2
```
Delete item [AI-CAB-02 ID] from dcTrack
```

### 6.38 Delete Cabinet 3
```
Delete item [AI-CAB-03 ID] from dcTrack
```

### --- Delete Ticket ---

### 6.39 Delete Commissioning Ticket
```
Delete ticket [TICKET_ID] from dcTrack
```

### --- Final Verification ---

### 6.40 Confirm Location Completely Empty
```
Search for all items in location AI-ROOM-01
```
**Expected**: No items found. Location is completely empty — restored to original state.

### 6.41 Confirm No Cabinets Remain
```
Find cabinets in AI-ROOM-01
```
**Expected**: No cabinets found.

---

## ITEM CLASS COVERAGE

| # | Class | Items Created | Count |
|---|-------|--------------|-------|
| 1 | **Device** | AI-SRV-01 to 08 (R740, R640, R650, R730, R720, R740xd, R730xd) | 8 |
| 2 | **Network** | AI-TOR-01 to 03 (Nexus N9K-C9372PX, N9K-C93180YC-EX, N9K-C9372TX) | 3 |
| 3 | **Rack PDU** | AI-PDU-A1, A2, B1, B2, C1 (AP8861, AP8865, AP8841, AP8853) | 5 |
| 4 | **Data Panel** | AI-PATCH-01 to 04 (Panduit CP, DP6, CPP CAT6/6A panels) | 4 |
| 5 | **Passive** | AI-WM-01 to 03, AI-BLANK-01 to 03 (wire managers + blanking plates) | 6 |
| 6 | **Probe** | AI-PROBE-01 (Geist RSE-B), AI-PROBE-02 (APC AP9340) | 2 |

**6 classes, 28 items, 7 unique Dell server models, 3 Cisco switch models, 4 APC PDU models, 4 Panduit panel models.**

---

## TOOL COVERAGE

| Tool | Prompts | Phase |
|------|---------|-------|
| `dctrack_list_locations` | 1.1 | 1 |
| `dctrack_search_items` | 1.2, 3.10-3.15, 4.1-4.2, 5.1, 5.4, 5.6, 6.35, 6.40 | 1,3,4,5,6 |
| `dctrack_find_available_cabinets` | 1.3, 4.10-4.11, 6.41 | 1,4,6 |
| `dctrack_create_cabinet` | 2.C1-2.C3 | 2 |
| `dctrack_list_cabinets` | 2.C4 | 2 |
| `dctrack_create_item` | 2.1-2.28 | 2 |
| `dctrack_create_ticket` | 2.29 | 2 |
| `dctrack_get_cabinet_items` | 3.1-3.3, 5.7, 5.9-5.10, 6.1-6.3, 6.15, 6.26, 6.34 | 3,5,6 |
| `dctrack_get_cabinet_u_map` | 3.4-3.6, 5.7, 5.11 | 3,5 |
| `dctrack_get_cabinet_capacity` | 3.7-3.9 | 3 |
| `dctrack_search_makes` | 4.3-4.5 | 4 |
| `dctrack_list_makes` | 4.6 | 4 |
| `dctrack_list_models` | 4.7-4.9 | 4 |
| `dctrack_search_tickets` | 4.12, 5.12 | 4,5 |
| `dctrack_update_item` | 5.2, 5.5 | 5 |
| `dctrack_move_item` | 5.8 | 5 |
| `dctrack_update_ticket` | 5.13 | 5 |
| `dctrack_delete_item` | 6.4-6.14, 6.16-6.25, 6.27-6.33, 6.36-6.38 | 6 |
| `dctrack_delete_ticket` | 6.39 | 6 |

**19 tools covered, 95+ prompts, 6 phases, 6 item classes, 28 items + 3 cabinets + 1 ticket.**

---

## QUICK DEMO (10 Minutes — Core Workflow)

Run these 15 prompts for a condensed demo:

1. `List all locations in dcTrack`
2. `What items are installed in cabinet AI-CAB-01?` *(empty)*
3. `Create a new item named "AI-SRV-01" in cabinet AI-CAB-01 with make Dell, model "PowerEdge R740", class Device, status Planned`
4. `Create a new item named "AI-TOR-01" in cabinet AI-CAB-01 with make Cisco, model "Nexus N9K-C9372PX", class Network, status Planned`
5. `Create a new item named "AI-PDU-A1" in cabinet AI-CAB-01 with make APC, model AP8861, class Rack PDU, mounting ZeroU, status Planned`
6. `Create a new item named "AI-PATCH-01" in cabinet AI-CAB-01 with make Panduit, model "1RU-CP Panel RJ45 24-port CAT6", class Data Panel, status Planned`
7. `Create a new item named "AI-PROBE-01" in cabinet AI-CAB-01 with make Geist, model RSE-B, class Probe, status Planned`
8. `Create a new item named "AI-WM-01" in cabinet AI-CAB-01 with make APC, model "1RU-Wire Manager AR8602", class Passive, status Planned`
9. `Show me the U-position map for cabinet AI-CAB-01`
10. `What space is available in cabinet AI-CAB-01?`
11. `Search for all items in location AI-ROOM-01`
12. `Search for models with name 'Nexus' in dcTrack` *(model library)*
13. `Find cabinets in AI-ROOM-01 that have at least 4U of free space`
14. *(Cleanup)* Delete all 6 items by ID
15. `What items are installed in cabinet AI-CAB-01?` *(empty again)*
