#!/bin/bash
# Cleanup all items in AI-DEMO-DC via MCP JSON-RPC endpoint
# Usage: ./cleanup-ai-demo.sh

MCP="https://sunbird-mcp.apps.ocp419.crucible.iisl.com/mcp"

call_mcp() {
  local tool="$1"
  local args="$2"
  curl -sk -X POST "$MCP" \
    -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool\",\"arguments\":$args}}"
}

extract_json() {
  python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result']['content'][0]['text'])"
}

echo "=== Fetching AI-DEMO-DC items ==="

# Get all items — search with broad query, pageSize 1000
ALL_DATA=$(call_mcp "dctrack_search_items" '{"query":"AI-DEMO-DC","pageSize":1000}' | extract_json)
TOTAL=$(echo "$ALL_DATA" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalRows', len(d.get('data',[]))))")
echo "Found $TOTAL items in AI-DEMO-DC"

# Delete non-cabinet items first
echo ""
echo "=== Deleting non-cabinet items first ==="
IDS=$(echo "$ALL_DATA" | python3 -c "
import sys,json
d = json.load(sys.stdin)
for item in d.get('data', []):
    loc = item.get('cmbLocation', '')
    cls = item.get('tiClass', '')
    if 'AI-DEMO-DC' in loc and cls != 'Cabinet':
        print(item['id'], item.get('tiName',''), cls)
")

count=0
while IFS=' ' read -r id name cls; do
  [ -z "$id" ] && continue
  echo -n "Deleting $name ($cls, id=$id)... "
  result=$(call_mcp "dctrack_delete_item" "{\"itemId\":$id}" | extract_json)
  success=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null)
  if [ "$success" = "True" ] || [ "$success" = "true" ]; then
    echo "OK"
  else
    error=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error', d.get('message','unknown')))" 2>/dev/null)
    echo "FAILED: $error"
  fi
  ((count++))
done <<< "$IDS"
echo "Processed $count non-cabinet items"

# Now delete cabinets
echo ""
echo "=== Deleting cabinets ==="
CAB_IDS=$(echo "$ALL_DATA" | python3 -c "
import sys,json
d = json.load(sys.stdin)
for item in d.get('data', []):
    loc = item.get('cmbLocation', '')
    cls = item.get('tiClass', '')
    if 'AI-DEMO-DC' in loc and cls == 'Cabinet':
        print(item['id'], item.get('tiName',''))
")

cab_count=0
while IFS=' ' read -r id name; do
  [ -z "$id" ] && continue
  echo -n "Deleting cabinet $name (id=$id)... "
  result=$(call_mcp "dctrack_delete_item" "{\"itemId\":$id}" | extract_json)
  success=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null)
  if [ "$success" = "True" ] || [ "$success" = "true" ]; then
    echo "OK"
  else
    error=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error', d.get('message','unknown')))" 2>/dev/null)
    echo "FAILED: $error"
  fi
  ((cab_count++))
done <<< "$CAB_IDS"

echo ""
echo "=== Done ==="
echo "Deleted $count items + $cab_count cabinets"
