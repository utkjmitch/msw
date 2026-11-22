#!/usr/bin/env bash
# Tests the `tested` step in .github/workflows/ci.yml: the step that skips a
# push to main whose tree already passed `test` as a PR head.
# Offline: a fake `gh` answers from the fixtures below. Run from anywhere:
#   bash .github/tests/push-skip.test.sh
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
workflow="$here/../workflows/ci.yml"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Pull the step's script out of the workflow, so the test runs what CI runs.
awk '/- id: tested/{f=1} f&&/run: \|/{r=1;next} r&&/^      - /{exit} r{sub(/^          /,"");print}' \
  "$workflow" > "$work/step.sh"
[ -s "$work/step.sh" ] || { echo "FAIL: could not find the tested step in $workflow"; exit 1; }

mkdir -p "$work/bin"
cat > "$work/bin/gh" <<'EOF'
#!/usr/bin/env bash
# Fake gh. Fixtures come from env: TREE_<sha>, PULLS (head sha of the PR whose
# merge commit is $SHA, or empty), PASSED_<sha> (count of green `test` runs).
[ "$1" = api ] || exit 2
[ -n "${FAIL_API:-}" ] && { echo "fake gh: API error" >&2; exit 1; }
path=$2
case "$path" in
  */pulls) [ -n "${PULLS:-}" ] && echo "$PULLS"; exit 0 ;;
  */check-runs*) s=${path#*/commits/}; s=${s%%/*}; v="PASSED_$s"; echo "${!v:-0}" ;;
  */commits/*) s=${path##*/}; v="TREE_$s"; [ -n "${!v:-}" ] || exit 1; echo "${!v}" ;;
  *) exit 1 ;;
esac
EOF
chmod +x "$work/bin/gh"

fails=0
check() { # name, expected skip value, env assignments...
  local name=$1 want=$2; shift 2
  : > "$work/out"
  env -i PATH="$work/bin:$PATH" GITHUB_OUTPUT="$work/out" REPO=o/r SHA=m GITHUB_REF_NAME=main "$@" \
    bash "$work/step.sh" > /dev/null 2>&1
  local got; got=$(sed -n 's/^skip=//p' "$work/out")
  if [ "$got" = "$want" ]; then echo "ok   $name"; else echo "FAIL $name: skip=$got, want $want"; fails=$((fails+1)); fi
}

check "same tree as a passed PR head: skip"       true  TREE_m=t1 PULLS=h TREE_h=t1 PASSED_h=1
check "tree differs from the PR head: run"         false TREE_m=t2 PULLS=h TREE_h=t1 PASSED_h=1
check "PR head never passed test: run"             false TREE_m=t1 PULLS=h TREE_h=t1 PASSED_h=0
check "direct push with no PR: run"                false TREE_m=t1 PULLS=
check "any API error: run"                         false FAIL_API=1 TREE_m=t1 PULLS=h TREE_h=t1 PASSED_h=1
check "pushed commit unreadable: run"              false PULLS=h TREE_h=t1 PASSED_h=1

[ "$fails" -eq 0 ] && echo "all passed" || { echo "$fails failed"; exit 1; }
