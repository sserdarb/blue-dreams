#!/bin/sh
set -e

echo "🔄 Running Prisma db push (schema sync)..."
npx prisma db push --skip-generate 2>/dev/null || echo "⚠️ Prisma db push skipped or failed"

echo "🌱 Running database seed..."
node prisma/seed.js 2>/dev/null || echo "⚠️ Seed skipped or already seeded"

echo "🚀 Starting Next.js server..."
exec node server.js
