# ============================================
# Multi-stage Dockerfile for Next.js + Prisma
# Bypasses Prisma CDN ECONNRESET by caching
# engine binaries in the builder layer
# ============================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
# Using npm install instead of npm ci for resilience
RUN npm install --prefer-offline --no-audit --no-fund

# Generate Prisma Client (this downloads engine binaries once)
RUN npx prisma generate

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy node_modules from deps stage (includes Prisma engines)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Skip static page generation that requires DB
# The app will generate pages on-demand at runtime
ENV SKIP_ENV_VALIDATION=1

# Database URL for Prisma client initialization during build
# Static pages that access DB will be generated on-demand at runtime
ENV DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2"

# Build Next.js
RUN npm run build

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client for runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
