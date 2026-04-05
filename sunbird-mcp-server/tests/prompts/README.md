# MCP Server Test Prompts

Natural language test prompts for validating all Sunbird MCP server tools through the chat UI.

## Files

| File | Tools Covered | Count |
|------|--------------|-------|
| [dctrack-test-prompts.md](dctrack-test-prompts.md) | All dcTrack tools (locations, cabinets, items, makes, models, ports, power, tickets, projects, parts, admin) | ~100 tools |
| [poweriq-test-prompts.md](poweriq-test-prompts.md) | All Power IQ tools (data centers, PDUs, outlets, sensors, events, readings, tags, assets, system) | ~80 tools |
| [combined-test-prompts.md](combined-test-prompts.md) | Combined analytics tools (health, capacity, ghost servers, power chain, thermal) | 6 tools |

## How to Use

1. Open the chat UI connected to the MCP server
2. Send each prompt and verify:
   - The correct tool is selected by the LLM
   - The API call returns data (not a 404/500 error)
   - The response is formatted and readable
3. Each file has a **Smoke Test Sequence** at the bottom for quick validation

## Test Environment

- **dcTrack**: `https://192.168.200.202` — Location: `AI-ROOM-01`, Cabinets: `178B-01` through `178B-04`
- **Power IQ**: `https://192.168.200.201`

## Testing Tips

- Start with the Smoke Test sequences to validate core connectivity
- For write/delete operations, use high IDs (9999) that likely don't exist to test error handling
- Create operations should be tested in order: create first, then update, then delete
- After fixing any API issues, re-run the failing prompts to confirm the fix
