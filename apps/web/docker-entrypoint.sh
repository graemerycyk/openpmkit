#!/bin/sh
set -e

echo "[Entrypoint] Running Prisma db push to sync schema..."
npx prisma db push --skip-generate

echo "[Entrypoint] Starting Next.js server..."
exec node apps/web/server.js
