# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl bash unzip

# Install Bun with explicit verification
RUN curl -fsSL https://bun.sh/install | bash && \
    echo "Checking Bun installation..." && \
    ls -la /root/.bun/ || echo "No .bun directory found" && \
    find /root -name "bun" -type f 2>/dev/null || echo "No bun binary found"

# Set PATH for Bun
ENV PATH="/root/.bun/bin:$PATH"

# Verify Bun installation and create bunx symlink if needed
RUN if [ -f /root/.bun/bin/bun ]; then \
        /root/.bun/bin/bun --version && \
        if [ ! -f /root/.bun/bin/bunx ]; then \
            ln -s /root/.bun/bin/bun /root/.bun/bin/bunx; \
        fi; \
    else \
        echo "ERROR: Bun not installed properly" && exit 1; \
    fi

# Set working directory
WORKDIR /app

# ================================
# Dependencies stage - for caching
# ================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Generate Prisma client with correct binary targets
RUN bunx prisma generate

# ================================
# Development stage
# ================================
FROM base AS development

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command (skip migrations for now)
CMD ["bun", "src/server.ts"]

# ================================
# Production build stage
# ================================
FROM base AS builder

# Copy node_modules and generated files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated

# Copy source code
COPY . .

# Build the application (if needed - Bun can run TS directly)
# RUN bun build src/server.ts --outdir=dist --target=node

# ================================
# Production stage
# ================================
FROM base AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunjs -u 1001

# Copy Bun installation to accessible location
RUN cp -r /root/.bun /usr/local/bun && \
    chown -R bunjs:nodejs /usr/local/bun

# Copy only production dependencies and generated files
COPY --from=deps --chown=bunjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=bunjs:nodejs /app/src/generated ./src/generated

# Copy source code and config files
COPY --chown=bunjs:nodejs src ./src
COPY --chown=bunjs:nodejs package.json ./
COPY --chown=bunjs:nodejs prisma ./prisma

# Switch to non-root user
USER bunjs

# Set environment variables for bunjs user
ENV NODE_ENV=production
ENV PORT=3000
ENV PATH="/usr/local/bun/bin:$PATH"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Production command with migrations
CMD ["sh", "-c", "bun src/server.ts"] 