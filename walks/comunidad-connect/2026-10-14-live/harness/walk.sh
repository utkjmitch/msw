#!/usr/bin/env bash
# Run one Walker as its own Claude Code session, with only the msw tools.
# Usage: [OUT=<run folder>] harness/walk.sh <walker-id> <journey-id> <viewport> <locale> [model]
# OUT defaults to the first pass's folder; its run.json is the run file.
# Run from the repository root: the run file's out_dir is resolved from there.
set -euo pipefail
W=$1 J=$2 VP=$3 LOC=$4 MODEL=${5:-opus}
RUN=walks/comunidad-connect/2026-10-14-live; OUT=${OUT:-$RUN}
WP=walks/comunidad-connect/walkers/$W.yaml
JP=walks/comunidad-connect/journeys/$J.yaml
NAME=$W-$J-$VP-$LOC
LOG=$OUT/harness-logs; mkdir -p "$LOG" "$OUT/walks"
if [ "$LOC" = es-419 ]; then LANG_NAME="Spanish (Latin American)"; LANG_NOTE="Your browser asks for Spanish. If the site shows English, look for the Spanish version the way you would; once you find it, you expect to stay in Spanish. Think and write your notes in English so the report can be read, but judge the Spanish as a Spanish reader."; else LANG_NAME="English"; LANG_NOTE=""; fi
CFG=$(mktemp); cat > "$CFG" <<JSON
{"mcpServers":{"msw":{"command":"node","args":["$PWD/server/dist/mcp/server.js","--run","$PWD/$OUT/run.json"],"env":{"PLAYWRIGHT_BROWSERS_PATH":"${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"}}}}
JSON
PROMPT=$(W="$(cat "$WP")" J="$(cat "$JP")" python3 - "$RUN/harness/walk-prompt.md" "$WP" "$JP" "$VP" "$LOC" "$LANG_NAME" "$LANG_NOTE" <<'PY'
import os, sys
t = open(sys.argv[1]).read()
for k, v in {"WALKER": os.environ["W"], "JOURNEY": os.environ["J"], "WALKER_PATH": sys.argv[2], "JOURNEY_PATH": sys.argv[3],
             "VIEWPORT": sys.argv[4], "LOCALE": sys.argv[5], "LANGUAGE": sys.argv[6], "LANGUAGE_NOTE": sys.argv[7]}.items():
    t = t.replace("{{" + k + "}}", v)
print(t)
PY
)
claude -p "$PROMPT" --model "$MODEL" --tools "" --strict-mcp-config --mcp-config "$CFG" \
  --allowedTools mcp__msw__start_walk mcp__msw__look mcp__msw__act mcp__msw__note mcp__msw__quit \
  --max-turns 120 --output-format stream-json --verbose > "$LOG/$NAME.jsonl" 2> "$LOG/$NAME.err" || echo "claude exit $?" >> "$LOG/$NAME.err"
node -e '
const fs=require("fs");const L=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const r=L.filter(x=>x.type==="result").pop();fs.writeFileSync(process.argv[2],(r&&r.result)||"(no result)\n");
console.log(process.argv[3], r?("turns="+r.num_turns+" cost="+r.total_cost_usd+" subtype="+r.subtype):"no result")' "$LOG/$NAME.jsonl" "$OUT/walks/$NAME.md" "$NAME"
rm -f "$CFG"
