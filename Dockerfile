FROM node:20-alpine AS base

RUN apk add --no-cache curl bash ca-certificates

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

RUN if [ -f /root/.bun/bin/bun ]; then \
      /root/.bun/bin/bun --version && \
      if [ ! -f /root/.bun/bin/bunx ]; then \
        ln -s /root/.bun/bin/bun /root/.bun/bin/bunx; \
      fi; \
    else \
      echo "ERROR: Bun not installed properly" && exit 1; \
    fi

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
# development stage
# -----------------------------


FROM deps AS development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated

COPY . .

EXPOSE 3000

CMD ["bun", "src/server.ts"]


# -----------------------------
# production stage
# -----------------------------

    
FROM deps AS production

RUN addgroup -g 1001 -S nodejs && adduser -S bunjs -u 1001
RUN cp -r /root/.bun /usr/local/bun && chown -R bunjs:nodejs /usr/local/bun

COPY --from=deps --chown=bunjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=bunjs:nodejs /app/src/generated ./src/generated

COPY --chown=bunjs:nodejs src ./src
COPY --chown=bunjs:nodejs package.json ./
COPY --chown=bunjs:nodejs prisma ./prisma

USER bunjs

ENV NODE_ENV=production
ENV PORT=3000
ENV PATH="/usr/local/bun/bin:$PATH"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -sf http://localhost:3000/health || exit 1

CMD ["sh", "-c", "bun src/server.ts"]