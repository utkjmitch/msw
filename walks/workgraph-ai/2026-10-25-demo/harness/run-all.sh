#!/usr/bin/env bash
# Marcus's three team walks, in parallel. From the walk folder.
cd /wt/.msw-walks/workgraph-ai/2026-10-25-demo
export CI=1
harness/walk.sh team-operator team-operator-work-map desktop &
harness/walk.sh team-operator team-operator-people desktop &
harness/walk.sh team-operator team-operator-engagement-sidebar desktop &
wait
