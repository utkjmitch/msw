#!/usr/bin/env bash
# Runs one Walker as a headless Claude Code session whose only tools are the msw server's.
# usage: run-walk.sh <walker-id> <journey-id> <viewport>   (from the repo root)
set -euo pipefail
W=$1 J=$2 V=$3
DIR=walks/mclaren-accord
LIVE=$DIR/2026-10-15-live
WF=$DIR/walkers/$W.yaml JF=$DIR/journeys/$J.yaml
OUT=$LIVE/narration/$W-$J-$V.md
LOG=${MSW_LOG_DIR:-/tmp/msw-walk-logs}/$W-$J-$V.jsonl
mkdir -p "$(dirname "$OUT")" "$(dirname "$LOG")"
PROMPT=$(W="$WF" J="$JF" V="$V" python3 - "$LIVE/walk-brief.md" <<'PY'
import os, sys
brief = open(sys.argv[1]).read().split("\n---\n", 1)[1]
for k, v in {"{{DOSSIER}}": open(os.environ["W"]).read(), "{{JOURNEY}}": open(os.environ["J"]).read(),
             "{{WALKER_FILE}}": os.environ["W"], "{{JOURNEY_FILE}}": os.environ["J"], "{{VIEWPORT}}": os.environ["V"]}.items():
    brief = brief.replace(k, v.strip())
print(brief)
PY
)
CFG=$(mktemp)
cat > "$CFG" <<JSON
{"mcpServers":{"msw":{"command":"node","args":["$PWD/server/dist/mcp/server.js","--run","$LIVE/run.json"],"env":{"PLAYWRIGHT_BROWSERS_PATH":"${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"}}}}
JSON
CI=1 timeout 2400 claude -p "$PROMPT" --mcp-config "$CFG" --strict-mcp-config --tools "" \
  --allowedTools "mcp__msw" --max-turns 80 --output-format stream-json --verbose < /dev/null > "$LOG"
rm -f "$CFG"
python3 - "$LOG" "$OUT" <<'PY'
import json, sys
res = [json.loads(l) for l in open(sys.argv[1]) if l.strip().startswith("{")]
final = [r for r in res if r.get("type") == "result"][-1]
open(sys.argv[2], "w").write(final.get("result", "") + "\n")
u = final.get("usage", {})
print(sys.argv[2], final.get("subtype"), "turns", final.get("num_turns"), "cost", final.get("total_cost_usd"),
      "in", u.get("input_tokens"), "cache_read", u.get("cache_read_input_tokens"), "out", u.get("output_tokens"))
PY
