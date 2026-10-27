#!/usr/bin/env bash
# Run the Inspection as its own Claude Code session: a different model, the guide only, the msw tools only, no web.
# Usage: OUT=<attempt folder> harness/inspect.sh <guide.md> [model]   (from the repository root)
set -euo pipefail
GUIDE=$1 MODEL=${2:-sonnet}
OUT=${OUT:?set OUT to the inspection attempt folder}; LOG=$OUT/harness-logs; mkdir -p "$LOG"
NAME=$(basename "$GUIDE" .md)
CFG=$(mktemp); cat > "$CFG" <<JSON
{"mcpServers":{"msw":{"command":"node","args":["$PWD/server/dist/mcp/server.js","--run","$PWD/$OUT/run.json"],"env":{"PLAYWRIGHT_BROWSERS_PATH":"${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"}}}}
JSON
PROMPT="$(cat walks/comunidad-connect/2026-10-14-live/harness/inspect-prompt.md; cat "$GUIDE")"
claude -p "$PROMPT" --model "$MODEL" --tools "" --strict-mcp-config --mcp-config "$CFG" \
  --allowedTools mcp__msw__start_walk mcp__msw__look mcp__msw__act mcp__msw__note mcp__msw__quit \
  --max-turns 120 --output-format stream-json --verbose > "$LOG/$NAME.jsonl" 2> "$LOG/$NAME.err" || echo "claude exit $?" >> "$LOG/$NAME.err"
node -e '
const fs=require("fs");const L=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const r=L.filter(x=>x.type==="result").pop();const s=L.find(x=>x.type==="system"&&x.model);fs.writeFileSync(process.argv[2],"<!-- model: "+(s&&s.model)+" -->\n"+((r&&r.result)||"(no result)\n"));
console.log(process.argv[3], r?("turns="+r.num_turns+" cost="+r.total_cost_usd+" subtype="+r.subtype):"no result")' "$LOG/$NAME.jsonl" "$OUT/$NAME-result.md" "$NAME"
rm -f "$CFG"
