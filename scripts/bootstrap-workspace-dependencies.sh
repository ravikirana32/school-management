#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
EXPECTED="pnpm@9.15.0"
REGISTRY="$(npm config get registry 2>/dev/null || true)"
fail() { echo "ERROR: $*" >&2; exit 1; }
command -v node >/dev/null 2>&1 || fail "Node.js 22.x is required."
command -v corepack >/dev/null 2>&1 || fail "Corepack is required to provision the pinned pnpm version."
PIN="$(node -p "require('./package.json').packageManager || ''")"
[[ "$PIN" == "$EXPECTED" ]] || fail "packageManager pin is '$PIN'; expected '$EXPECTED'."
node -e 'const major=Number(process.versions.node.split(".")[0]); if(major<22 || major>=23) process.exit(1)' || fail "Node version must be 22.x. Current: $(node --version)"
if ! corepack pnpm --version >/dev/null 2>&1; then
  echo "INFO: pnpm $EXPECTED is not currently available. Corepack provisioning may require registry access: $REGISTRY"
  corepack prepare "$EXPECTED" --activate || fail "Corepack could not provision pnpm. Check network/DNS/registry access; no install was attempted."
fi
if [[ ! -f pnpm-lock.yaml ]]; then
  echo "INFO: pnpm-lock.yaml missing; generating a lockfile from workspace manifests."
  corepack pnpm install --lockfile-only --ignore-scripts --config.network-timeout=10000 || fail "Lockfile generation failed. Confirm registry/network access and resolve manifest errors before retrying."
fi
corepack pnpm install --frozen-lockfile || fail "Frozen dependency installation failed. Check lockfile consistency and network access."
echo "SUCCESS: pinned workspace dependencies installed from frozen lockfile."
