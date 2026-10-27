# Env for the local walk server. Only the throwaway local database; no keys.
export DATABASE_URL="postgresql://walk:walk@localhost:54329/wg_demo"
export JWT_SECRET="${JWT_SECRET:-generate-a-local-secret}"  # the walk generated a throwaway value; not committed
export NEXT_PUBLIC_APP_URL="http://localhost:3000"
export NEXT_TELEMETRY_DISABLED=1
# PR #387's sidebar items and the pages behind them (as the work-evolution-nav spec needs)
export NEXT_PUBLIC_WORK_EVOLUTION_ENABLED=true
export TEAMS_TRANSCRIPTS_ENABLED=true
