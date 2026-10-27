#!/usr/bin/env bash
# Run one Walker as its own Claude Code session, with only the msw tools.
# Usage: harness/walk.sh <walker-id> <journey-id> <viewport> [model]   (from the walk folder)
set -euo pipefail
W=$1 J=$2 VP=$3 MODEL=${4:-opus}
D=/wt/.msw-walks/workgraph-ai/2026-10-25-demo; SRV=/wt/msw/msw-mfx-msw-wg-team-walk-1/server
OUT=${OUT:-$D}
WP=$D/walkers/$W.yaml JP=$D/journeys/$J.yaml NAME=$W-$J-$VP-en-US
LOG=$OUT/harness-logs; mkdir -p "$LOG" "$OUT/narrations"
case $W in
  keyboard-sr-user) EXTRA="You use a screen reader and the keyboard. Judge each page only by its text and the numbered list of controls, which is close to what your screen reader announces. Do not use the screenshot to decide anything: you cannot see it. A control with no name, or a picture or map with no text equivalent, is a barrier for you; note it. Moving from control to control in the list is like tabbing.";;
  team-operator) EXTRA="You are signed in already. Find things from the sidebar and the pages; you cannot type addresses. Write down exactly where you look and where you get stuck: which sidebar item, which page, what you expected to find there.";;
  *) EXTRA="The home page tells its story in chapters as you scroll. Scroll through every chapter. The site has a normal light look and a darker look called Space; find the switch and see the story in both.";;
esac
CFG=$(mktemp); cat > "$CFG" <<JSON
{"mcpServers":{"msw":{"command":"node","args":["$SRV/dist/mcp/server.js","--run","$OUT/run.json"],"env":{"PLAYWRIGHT_BROWSERS_PATH":"/ms-playwright","HTTPS_PROXY":"${HTTPS_PROXY:-}","HTTP_PROXY":"${HTTP_PROXY:-}","NO_PROXY":"${NO_PROXY:-}"}}}}
JSON
PROMPT=$(W="$(cat "$WP")" J="$(cat "$JP")" python3 - "$D/harness/walk-prompt.md" "$WP" "$JP" "$VP" "$EXTRA" <<'PY'
import os, sys
t = open(sys.argv[1]).read()
for k, v in {"WALKER": os.environ["W"], "JOURNEY": os.environ["J"], "WALKER_PATH": sys.argv[2], "JOURNEY_PATH": sys.argv[3],
             "VIEWPORT": sys.argv[4], "LOCALE": "en-US", "EXTRA_NOTE": sys.argv[5]}.items():
    t = t.replace("{{" + k + "}}", v)
print(t)
PY
)
cd "$D"
MCP_TOOL_TIMEOUT=7200000 timeout 9000 claude -p "$PROMPT" --model "$MODEL" --tools "" --strict-mcp-config --mcp-config "$CFG" \
  --allowedTools mcp__msw__start_walk mcp__msw__look mcp__msw__act mcp__msw__note mcp__msw__quit \
  --max-turns 150 --output-format stream-json --verbose > "$LOG/$NAME.jsonl" 2> "$LOG/$NAME.err" || echo "claude exit $?" >> "$LOG/$NAME.err"
node -e '
const fs=require("fs");const L=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const r=L.filter(x=>x.type==="result").pop();fs.writeFileSync(process.argv[2],(r&&r.result)||"(no result)\n");
console.log(process.argv[3], r?("turns="+r.num_turns+" cost="+r.total_cost_usd+" subtype="+r.subtype):"no result")' "$LOG/$NAME.jsonl" "$OUT/narrations/$NAME.md" "$NAME"
rm -f "$CFG"
