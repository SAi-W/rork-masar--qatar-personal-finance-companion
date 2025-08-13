#!/usr/bin/env bash
set -euo pipefail

echo "▶ Running git integrity checks…"
git fsck --full || true

echo "▶ Checking for critical file issues…"
CRITICAL_ISSUES=0

# Check if critical files exist and are readable
CRITICAL_FILES=(
  "package.json"
  "tsconfig.json"
  "backend/tsconfig.json"
  "app/_layout.tsx"
  "backend/server.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Critical file missing: $file"
    CRITICAL_ISSUES=1
  elif [ ! -r "$file" ]; then
    echo "❌ Critical file not readable: $file"
    CRITICAL_ISSUES=1
  fi
done

# Check for extremely large files that might cause issues
find . -type f -not -path "./.git/*" -not -path "./.git.backup/*" -not -path "./.husky/*" -not -path "./node_modules/*" -not -path "./.expo/*" -size +10M | while read -r file; do
  echo "⚠️  Large file detected: $file ($(du -h "$file" | cut -f1))"
done

if [ "$CRITICAL_ISSUES" -ne 0 ]; then
  echo "❌ Critical issues detected. See list above."
  exit 2
else
  echo "✅ No critical issues detected."
fi
