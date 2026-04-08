#!/bin/bash
# ============================================================
# Cleanup AI-DEMO-DC — Full BRS Demo Reset
# Deletes: connections, data ports, items, tickets, projects
# Handles: Installed→Planned reset, stuck data ports, force delete
# Usage: ./cleanup-ai-demo.sh
# ============================================================
set -uo pipefail

MCP="https://sunbird-mcp.apps.ocp419.crucible.iisl.com/tools"

call_tool() {
  curl -sk -X POST "$MCP/$1" \
    -H "Content-Type: application/json" \
    -d "$2" --max-time 15 2>/dev/null
}

echo "=================================================="
echo "  AI-DEMO-DC Full Cleanup"
echo "=================================================="

# ── STEP 1: Get all items ──
echo ""
echo "[1/8] Fetching items in AI-ROOM-01..."
ALL_ITEMS=$(call_tool "dctrack_search_items" '{"location":"AI-ROOM-01","pageSize":200}')
ITEM_IDS=$(echo "$ALL_ITEMS" | python3 -c "
import sys,json
r = json.load(sys.stdin)
data = r.get('result',{}).get('data',[]) if isinstance(r.get('result'),dict) else []
for item in data:
    print(item.get('id',''), item.get('tiName',''), item.get('tiClass',''))
" 2>/dev/null)
item_total=$(echo "$ITEM_IDS" | grep -c . 2>/dev/null || echo 0)
echo "      Found $item_total items"

# ── STEP 2: Delete ALL connections on every item ──
echo ""
echo "[2/8] Deleting connections..."
conn_count=0
while IFS=' ' read -r id name cls; do
  [ -z "$id" ] && continue
  CONNS=$(call_tool "dctrack_list_connections" "{\"itemId\":$id}" | python3 -c "
import sys,json
conns = json.load(sys.stdin).get('result',[])
if isinstance(conns, list):
    for c in conns:
        cid = c.get('connectionId', c.get('id',''))
        if cid: print(cid)
" 2>/dev/null)
  for cid in $CONNS; do
    [ -z "$cid" ] && continue
    call_tool "dctrack_delete_connection" "{\"connectionId\":$cid}" > /dev/null 2>&1
    ((conn_count++)) || true
  done
done <<< "$ITEM_IDS"
echo "      Deleted $conn_count connections"

# ── STEP 3: Reset ALL items to Planned status ──
echo ""
echo "[3/8] Resetting items to Planned..."
reset_count=0
while IFS=' ' read -r id name cls; do
  [ -z "$id" ] && continue
  call_tool "dctrack_update_item" "{\"itemId\":$id,\"updates\":{\"cmbStatus\":\"Planned\"}}" > /dev/null 2>&1
  ((reset_count++)) || true
done <<< "$ITEM_IDS"
echo "      Reset $reset_count items"

# ── STEP 4: Delete non-cabinet items (first pass) ──
echo ""
echo "[4/8] Deleting non-cabinet items..."
item_count=0
fail_ids=""
while IFS=' ' read -r id name cls; do
  [ -z "$id" ] && continue
  [ "$cls" = "Cabinet" ] && continue
  result=$(call_tool "dctrack_delete_item" "{\"itemId\":$id}" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('success','false'))" 2>/dev/null)
  if [ "$result" = "True" ] || [ "$result" = "true" ]; then
    echo "      $name -> OK"
  else
    echo "      $name -> RETRY LATER (connected ports)"
    fail_ids="$fail_ids $id"
  fi
  ((item_count++)) || true
done <<< "$ITEM_IDS"
echo "      Processed $item_count items"

# ── STEP 5: Retry failed deletes (stuck data port items) ──
if [ -n "$fail_ids" ]; then
  echo ""
  echo "[5/8] Retrying failed items (disconnecting ports)..."
  for id in $fail_ids; do
    [ -z "$id" ] && continue
    # Try deleting all data ports first
    PORTS=$(call_tool "dctrack_list_data_ports" "{\"itemId\":$id}" | python3 -c "
import sys,json
for p in json.load(sys.stdin).get('result',[]):
    pid = p.get('portId', p.get('id',''))
    if pid: print(pid)
" 2>/dev/null)
    for pid in $PORTS; do
      call_tool "dctrack_delete_data_port" "{\"itemId\":$id,\"portId\":$pid}" > /dev/null 2>&1
    done
    # Retry delete
    result=$(call_tool "dctrack_delete_item" "{\"itemId\":$id}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success','false'))" 2>/dev/null)
    echo "      Item $id retry -> $result"
  done
else
  echo ""
  echo "[5/8] No failed items to retry"
fi

# ── STEP 6: Delete cabinets ──
echo ""
echo "[6/8] Deleting cabinets..."
cab_count=0
while IFS=' ' read -r id name cls; do
  [ -z "$id" ] && continue
  [ "$cls" != "Cabinet" ] && continue
  result=$(call_tool "dctrack_delete_item" "{\"itemId\":$id}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success','false'))" 2>/dev/null)
  if [ "$result" = "True" ] || [ "$result" = "true" ]; then
    echo "      $name -> OK"
  else
    echo "      $name -> FAILED (delete from dcTrack UI)"
  fi
  ((cab_count++)) || true
done <<< "$ITEM_IDS"
echo "      Processed $cab_count cabinets"

# ── STEP 7: Delete ALL tickets (scan by ID) ──
echo ""
echo "[7/8] Deleting tickets..."
ticket_count=0
for tid in $(seq 1 100); do
  ticket=$(call_tool "dctrack_get_ticket" "{\"ticketId\":$tid}" | python3 -c "
import sys,json
r = json.load(sys.stdin)
t = r.get('result',{})
if t and isinstance(t,dict) and t.get('ticketNumber',''):
    print(t.get('ticketNumber',''))
" 2>/dev/null)
  [ -z "$ticket" ] && continue
  result=$(call_tool "dctrack_delete_ticket" "{\"ticketId\":$tid}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success','false'))" 2>/dev/null)
  echo "      Ticket $tid ($ticket) -> $result"
  ((ticket_count++)) || true
done
echo "      Deleted $ticket_count tickets"

# ── STEP 8: Delete ALL projects (scan by ID) ──
echo ""
echo "[8/8] Deleting projects..."
proj_count=0
for pid in $(seq 1 50); do
  proj=$(call_tool "dctrack_get_project" "{\"projectId\":$pid}" | python3 -c "
import sys,json
r = json.load(sys.stdin)
p = r.get('result',{})
if p and isinstance(p,dict) and p.get('projectName',''):
    print(p['projectName'])
" 2>/dev/null)
  [ -z "$proj" ] && continue
  result=$(call_tool "dctrack_delete_project" "{\"projectId\":$pid}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success','false'))" 2>/dev/null)
  echo "      Project $pid ($proj) -> $result"
  ((proj_count++)) || true
done
echo "      Deleted $proj_count projects"

# ── VERIFY ──
echo ""
echo "=================================================="
echo "  Verification"
echo "=================================================="
REMAINING=$(call_tool "dctrack_search_items" '{"location":"AI-ROOM-01","pageSize":100}' | python3 -c "
import sys,json
r = json.load(sys.stdin)
data = r.get('result',{}).get('data',[]) if isinstance(r.get('result'),dict) else []
print(f'Items remaining: {len(data)}')
for d in data:
    print(f'  {d.get(\"tiName\",\"?\")} ({d.get(\"tiClass\",\"?\")})')
" 2>/dev/null)
echo "$REMAINING"
echo ""
echo "=================================================="
echo "  DONE"
echo "  Connections: $conn_count"
echo "  Items: $item_count | Cabinets: $cab_count"
echo "  Tickets: $ticket_count | Projects: $proj_count"
echo "=================================================="
