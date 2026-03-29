FROM oven/bun:1.3 AS base
WORKDIR /app

# -----------------------------
# deps stage - cache dependencies
# -----------------------------
FROM base AS deps

COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# -----------------------------
# build stage - compile TypeScript to JavaScript
# -----------------------------
FROM deps AS build

COPY . .
RUN bun build src/server.ts --outdir dist

# -----------------------------
# prod deps stage - install only production dependencies
# -----------------------------
FROM base AS prod-deps

COPY package.json bun.lock* ./
RUN bun install --production --frozen-lockfile

# -----------------------------
# development stage
# -----------------------------
FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["bun", "src/server.ts"]

# -----------------------------
# production stage
# -----------------------------

    
FROM prod-deps AS production

RUN addgroup -g 1001 -S nodejs && adduser -S bunjs -u 1001

COPY --from=deps --chown=bunjs:nodejs /app/src/generated ./src/generated
COPY --from=build --chown=bunjs:nodejs /app/dist ./dist

USER bunjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["bun", "dist/server.js"]