#!/usr/bin/env bash
# Regenerates src/schema.gen.ts from the vendored OpenAPI spec.
# The spec (openapi/qpost-v3-openapi.yaml) is synced from the QPost API repo; run this after updating it.
set -euo pipefail
cd "$(dirname "$0")/.."
npx openapi-typescript ./openapi/qpost-v3-openapi.yaml -o src/schema.gen.ts
