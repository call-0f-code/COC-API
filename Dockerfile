FROM oven/bun:1.3 AS base
WORKDIR /var/www/api

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
RUN bun build src/server.ts --target=bun --production --outdir dist

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

    
FROM oven/bun:1-slim AS production

WORKDIR /var/www/api
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m bunjs

COPY --from=build --chown=bunjs:nodejs /var/www/api/dist ./dist
COPY --from=deps --chown=bunjs:nodejs /var/www/api/src/generated ./dist/generated


RUN chown -R bunjs:nodejs /var/www/api
USER bunjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["bun", "./dist/server.js"]