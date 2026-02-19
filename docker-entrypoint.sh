#!/bin/sh
set -e

echo "🔄 Running Prisma db push (schema sync)..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1 || echo "⚠️ Prisma db push skipped or failed"

echo "🌱 Running database seed..."
node prisma/seed.js 2>&1 || echo "⚠️ Seed skipped or already seeded"

echo "🚀 Starting Next.js server..."
exec node server.js
