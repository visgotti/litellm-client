#!/usr/bin/env bash
# Run each e2e test file in isolation with a proxy restart between.
# Workaround for a LiteLLM proxy segfault (exit 139) under sustained load —
# it dies after a few hundred requests and any subsequent tests fail with
# `TypeError: fetch failed`. This script restarts the proxy before each
# file so the suite reaches 100% pass.
#
# Usage: ./scripts/run-e2e-isolated.sh [optional file pattern]

set -euo pipefail

cd "$(dirname "$0")/.."

# Ensure docker is on PATH (different across shells / sandboxes).
if ! command -v docker >/dev/null 2>&1; then
  for p in /usr/local/bin /Applications/Docker.app/Contents/Resources/bin; do
    if [ -x "$p/docker" ]; then PATH="$p:$PATH"; break; fi
  done
fi

# Bring up proxy once (with E2E_KEEP_PROXY the per-file runs reuse it).
docker compose -f tests/e2e/docker-compose.yml -p litellm-client-e2e down -v --remove-orphans >/dev/null 2>&1 || true
set -a; source .env 2>/dev/null || true; set +a
docker compose -f tests/e2e/docker-compose.yml -p litellm-client-e2e up -d --wait >/dev/null

restart_proxy() {
  docker compose -f tests/e2e/docker-compose.yml -p litellm-client-e2e restart litellm-proxy >/dev/null 2>&1
  until curl -sf http://localhost:14000/health/liveliness >/dev/null 2>&1; do sleep 2; done
}

cleanup() {
  docker compose -f tests/e2e/docker-compose.yml -p litellm-client-e2e down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

PATTERN="${1:-.}"

# Collect e2e files (alphabetical for determinism).
FILES=()
for f in tests/e2e/*.e2e.test.ts tests/e2e/e2e.test.ts; do
  [ -e "$f" ] || continue
  case "$f" in *"$PATTERN"*) FILES+=("$f");; esac
done

TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_SKIP=0
declare -a FAILED_FILES=()

for file in "${FILES[@]}"; do
  basename=$(basename "$file" .ts)
  echo
  echo "═══════════════════════════════════════════════════════════════════════"
  echo "  $basename"
  echo "═══════════════════════════════════════════════════════════════════════"
  restart_proxy
  out="/tmp/e2e-$basename.json"
  E2E_KEEP_PROXY=1 npx jest \
    --config jest.e2e.config.ts \
    --group=e2e \
    --runInBand \
    --json \
    --outputFile="$out" \
    "$file" >/dev/null 2>&1 || true

  if [ ! -s "$out" ]; then
    echo "  ✗ no JSON output (run failed)"
    FAILED_FILES+=("$basename")
    continue
  fi

  read -r pass fail skip <<< "$(node -e "
    const r = require('$out');
    process.stdout.write(r.numPassedTests + ' ' + r.numFailedTests + ' ' + r.numPendingTests);
  ")"
  TOTAL_PASS=$((TOTAL_PASS + pass))
  TOTAL_FAIL=$((TOTAL_FAIL + fail))
  TOTAL_SKIP=$((TOTAL_SKIP + skip))
  if [ "$fail" -gt 0 ]; then
    FAILED_FILES+=("$basename")
    echo "  ✗ $pass passed / $fail failed / $skip skipped"
    node -e "
      const r = require('$out');
      for (const tr of r.testResults) for (const t of tr.assertionResults) {
        if (t.status !== 'failed') continue;
        console.log('    ✗', t.fullName);
        for (const m of (t.failureMessages || [])) {
          for (const line of m.split('\n').slice(0, 8)) console.log('      ', line);
        }
      }
    "
  else
    echo "  ✓ $pass passed / $skip skipped"
  fi
done

echo
echo "═══════════════════════════════════════════════════════════════════════"
echo "  Summary: $TOTAL_PASS passed / $TOTAL_FAIL failed / $TOTAL_SKIP skipped"
if [ "${#FAILED_FILES[@]}" -gt 0 ]; then
  echo "  Failed files: ${FAILED_FILES[*]}"
  exit 1
fi
echo "═══════════════════════════════════════════════════════════════════════"
