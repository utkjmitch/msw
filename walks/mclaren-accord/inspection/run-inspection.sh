#!/usr/bin/env bash
# Runs the Inspection as a separate headless Claude Code session: a different model, no shared context,
# only the msw tools (so no web access except the site, through the server).
# usage: run-inspection.sh <guide.md> <journey.yaml> <viewport>   (from the repo root)
set -euo pipefail
G=$1 JF=$2 V=$3
DIR=walks/mclaren-accord
OUT=$DIR/inspection/$(basename "$G" .md)-$V-result.md
LOG=${MSW_LOG_DIR:-/tmp/msw-walk-logs}/inspect-$(basename "$G" .md)-$V.jsonl
PROMPT=$(G="$G" J="$JF" V="$V" python3 - "$DIR/inspection/inspect-brief.md" <<'PY'
import os, sys
brief = open(sys.argv[1]).read().split("\n---\n", 1)[1]
for k, v in {"{{GUIDE}}": open(os.environ["G"]).read(), "{{JOURNEY_FILE}}": os.environ["J"], "{{VIEWPORT}}": os.environ["V"]}.items():
    brief = brief.replace(k, v.strip())
print(brief)
PY
)
CFG=$(mktemp)
cat > "$CFG" <<JSON
{"mcpServers":{"msw":{"command":"node","args":["$PWD/server/dist/mcp/server.js","--run","$DIR/2026-10-15-live/run.json"],"env":{"PLAYWRIGHT_BROWSERS_PATH":"${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"}}}}
JSON
CI=1 timeout 2400 claude -p "$PROMPT" --model sonnet --mcp-config "$CFG" --strict-mcp-config --tools "" \
  --allowedTools "mcp__msw" --max-turns 60 --output-format stream-json --verbose < /dev/null > "$LOG"
rm -f "$CFG"
python3 - "$LOG" "$OUT" <<'PY'
import json, sys
res = [json.loads(l) for l in open(sys.argv[1]) if l.strip().startswith("{")]
final = [r for r in res if r.get("type") == "result"][-1]
open(sys.argv[2], "w").write(final.get("result", "") + "\n")
print(sys.argv[2], final.get("subtype"), "turns", final.get("num_turns"), "cost", final.get("total_cost_usd"))
PY
