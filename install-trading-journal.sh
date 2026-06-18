#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ -t 1 ]]; then
  BOLD="$(printf '\033[1m')"
  DIM="$(printf '\033[2m')"
  GREEN="$(printf '\033[32m')"
  CYAN="$(printf '\033[36m')"
  BLUE="$(printf '\033[34m')"
  RED="$(printf '\033[31m')"
  RESET="$(printf '\033[0m')"
else
  BOLD=""
  DIM=""
  GREEN=""
  CYAN=""
  BLUE=""
  RED=""
  RESET=""
fi

LOG_FILE=".install-trading-journal.log"

banner() {
  echo "${CYAN}******************************************************************************${RESET}"
  echo "${CYAN}******************************************************************************${RESET}"
  echo "${CYAN}**${RESET}"
  echo "${CYAN}**${RESET}  ${BOLD}Trading Journal${RESET}"
  echo "${CYAN}**${RESET}"
  echo "${CYAN}**${RESET}  A local-first trading journal built around the review habit first:"
  echo "${CYAN}**${RESET}  write the recap, see the day in context, and drill into the trade"
  echo "${CYAN}**${RESET}  evidence only when it matters."
  echo "${CYAN}**${RESET}"
  echo "${CYAN}******************************************************************************${RESET}"
  echo "${CYAN}******************************************************************************${RESET}"
}

run_quiet() {
  local label="$1"
  shift

  printf "%s" "${BOLD}${label}${RESET}${DIM}...${RESET}"
  if "$@" >"$LOG_FILE" 2>&1; then
    printf " %s\n" "${GREEN}done${RESET}"
  else
    printf " %s\n\n" "${RED}failed${RESET}"
    echo "The install command failed. Last log lines:"
    echo
    tail -n 80 "$LOG_FILE"
    echo
    echo "Full log: $LOG_FILE"
    exit 1
  fi
}

banner
echo
echo "This installs project dependencies."
echo "It sets up a local database inside this folder."
echo "You can safely rerun this installer later."
echo
echo "${DIM}------------------------------------------------------------${RESET}"
echo

if ! command -v npm >/dev/null 2>&1; then
  echo "${RED}npm was not found.${RESET} Install Node.js 20 or newer first, then run this script again."
  exit 1
fi

run_quiet "Step 1 of 3: Installing dependencies" npm install --no-audit --fund=false

echo
echo "${BLUE}${BOLD}Setup${RESET}"
npm run --silent setup:local

echo
echo "${GREEN}${BOLD}Step 3 of 3: Starting Trading Journal locally${RESET}"
echo "Local app: ${BLUE}http://localhost:3000${RESET}"
echo "${DIM}If port 3000 is already in use, Next.js will print the available localhost URL below.${RESET}"
echo
npm run dev
