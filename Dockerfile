# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps

WORKDIR /app

# Copy package manifests
COPY package.json bun.lock* ./

# Install production dependencies only
RUN bun install --frozen-lockfile
# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Install all deps (including dev) for Prisma client generation
RUN bun install --frozen-lockfile

# prisma generate doesn't connect to the DB, but prisma.config.ts uses env("DATABASE_URL")
# which throws at config-load time if the var is absent. Satisfy it with a dummy placeholder.
# The real DATABASE_URL is injected at runtime via env_file / --env-file / -e flags.
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
RUN bunx prisma generate

# Unset the dummy URL so it doesn't leak into downstream stages via ENV
ENV DATABASE_URL=

# ─── Stage 3: Production runner
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 cocgroup && \
    adduser  --system --uid 1001 cocuser

# Copy production node_modules from deps stage
COPY --from=deps --chown=cocuser:cocgroup /app/node_modules ./node_modules

# Copy application source
COPY --chown=cocuser:cocgroup . .

COPY --from=builder --chown=cocuser:cocgroup /app/src/generated/prisma ./src/generated/prisma

USER cocuser

EXPOSE 3000

# Run Prisma migrations then start the server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/server.ts"]
