#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

kill_matches() {
  local pattern="$1"
  local pids

  pids="$(pgrep -f "$pattern" || true)"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 1
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

kill_port() {
  local port="$1"
  local pids

  pids="$(lsof -ti tcp:"$port" || true)"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 1
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

echo "[dev:restart] Stopping existing frontend/backend processes ..."

kill_matches "$ROOT_DIR/node_modules/next/dist/bin/next dev"
kill_matches "$ROOT_DIR/node_modules/next/dist/bin/next start"
kill_matches "nodemon --watch tasks/scheduler.ts"
kill_matches "ts-node --esm tasks/scheduler.ts"
kill_matches "$ROOT_DIR/tasks/scheduler.ts"

# Clear common Next.js dev ports used by this project.
kill_port 3000
kill_port 3001
kill_port 3002

echo "[dev:restart] Restarting services ..."
exec bash "$ROOT_DIR/scripts/dev-all.sh"
