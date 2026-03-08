#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FRONT_PID=""
BACK_PID=""

cleanup() {
  trap - INT TERM EXIT

  if [[ -n "$FRONT_PID" ]]; then
    kill "$FRONT_PID" 2>/dev/null || true
  fi

  if [[ -n "$BACK_PID" ]]; then
    kill "$BACK_PID" 2>/dev/null || true
  fi

  wait "$FRONT_PID" "$BACK_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "[dev:all] Starting frontend (Next.js) ..."
npm run dev &
FRONT_PID="$!"

echo "[dev:all] Starting backend scheduler ..."
npm run scheduler:watch &
BACK_PID="$!"

while true; do
  if ! kill -0 "$FRONT_PID" 2>/dev/null; then
    wait "$FRONT_PID" 2>/dev/null || true
    break
  fi

  if ! kill -0 "$BACK_PID" 2>/dev/null; then
    wait "$BACK_PID" 2>/dev/null || true
    break
  fi

  sleep 1
done
