#!/bin/sh
set -e

echo "[Entrypoint] Running Prisma db push to sync schema..."
./node_modules/.bin/prisma db push --skip-generate || echo "[Entrypoint] Warning: prisma db push failed"

echo "[Entrypoint] Starting Next.js server..."
exec node apps/web/server.js
