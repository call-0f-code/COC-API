# 🐳 Docker — Local Development Guide

This guide covers everything you need to run any part of the Call of Code platform locally using Docker Compose.

---

## Overview

The repository ships with **four Docker Compose configurations**:

| File | Purpose | Services |
|------|---------|----------|
| `docker-compose.yml` | **API-only** dev (standalone) | `coc-api` |
| `docker/coc-member/docker-compose.yml` | Full **COC Member** stack | `coc-api` + `server` + `web` |
| `docker/coc-admin/docker-compose.yml` | Full **COC Admin** stack | `coc-api` + `server` + `web` |
| `docker/callofcode.in/docker-compose.yml` | Full **callofcode.in** website stack | `coc-api` + `frontend` |

> All platform stacks build `coc-api` locally from the repo root `Dockerfile` and pull their respective frontend/backend images from Docker Hub.

---

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) or Docker Engine + Docker Compose plugin (v2.22+)
- Git

No need to install Bun, Node, or any other runtime locally — everything runs inside containers.

---

## Environment Setup

### 1. API environment (required by all stacks)

Copy the example and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase connection-pooling URL (Prisma runtime) |
| `DIRECT_URL` | Direct DB connection URL (Prisma Migrate) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret key |

### 2. Platform-specific environments

Each platform directory ships **example files** with all variables documented and placeholder values. Copy and fill in only the secrets you need:

```bash
# COC Member
cp docker/coc-member/.env.local.backend.example  docker/coc-member/.env.local.backend
cp docker/coc-member/.env.local.frontend.example docker/coc-member/.env.local.frontend

# COC Admin
cp docker/coc-admin/.env.local.backend.example   docker/coc-admin/.env.local.backend
cp docker/coc-admin/.env.local.frontend.example  docker/coc-admin/.env.local.frontend

# callofcode.in
cp docker/callofcode.in/.env.local.frontend.example docker/callofcode.in/.env.local.frontend
```

| Platform | File | Key Variables |
|----------|------|---------------|
| All backends | `.env.local.backend` | `JWT_SECRET`, `REFRESH_SECRET`, `RESEND_API_KEY` |
| `coc-admin` backend | `.env.local.backend` | + `WHATSAPP_LINK`, `DISCORD_LINK` |
| `coc-member` frontend | `.env.local.frontend` | `VITE_API_URL` |
| `coc-admin` frontend | `.env.local.frontend` | `VITE_API_URL`, `VITE_GIF_URL` |
| `callofcode.in` frontend | `.env.local.frontend` | `API_BASE_URL`, `GITHUB_TOKEN` (optional) |

> **Never commit real secrets.** All `*.env.local*` files are git-ignored by default.

---

## Running the Stacks

### API-only (standalone development)

Use this when you're only working on the `coc-api` itself:

```bash
# Standard mode
docker compose up --build

# Watch mode — Docker syncs src/ changes and restarts bun automatically
docker compose watch
```

The API will be available at **http://localhost:3000**

Health check: **http://localhost:3000/health**

---

### COC Member stack

```bash
cd docker/coc-member
docker compose up --build
```

| Service | URL |
|---------|-----|
| `coc-api` | http://localhost:3000 |
| `server` (member backend) | http://localhost:8000 |
| `web` (member frontend) | http://localhost:5173 |

---

### COC Admin stack

```bash
cd docker/coc-admin
docker compose up --build
```

| Service | URL |
|---------|-----|
| `coc-api` | http://localhost:3000 |
| `server` (admin backend) | http://localhost:8000 |
| `web` (admin frontend) | http://localhost:5173 |

---

### callofcode.in website

```bash
cd docker/callofcode.in
docker compose up --build
```

| Service | URL |
|---------|-----|
| `coc-api` | http://localhost:3000 |
| `frontend` | http://localhost:3001 |

---

## Startup Order & Health Checks

All stacks use health-checked `depends_on` to ensure correct startup ordering:

```
coc-api (healthy) → server/backend (healthy) → web/frontend
```

The `coc-api` health check polls `GET /health` every 30 seconds with a 15-second grace period on startup. Downstream services only start once `coc-api` reports healthy.

---

## Hot Reload (API-only stack)

The root `docker-compose.yml` supports `docker compose watch` with the following rules:

| Path changed | Action |
|---|---|
| `src/**` | **Sync** — files copied into container instantly; `bun --watch` picks up the change |
| `package.json` / `bun.lock` | **Rebuild** — full image rebuild to reinstall dependencies |
| `prisma/**` | **Rebuild** — triggers `prisma generate` on next container start |

```bash
# Start in watch mode (preferred for API development)
docker compose watch
```

---

## Common Commands

```bash
# Start in the background (detached)
docker compose up -d --build

# Follow logs
docker compose logs -f

# Follow logs for a specific service
docker compose logs -f coc-api

# Stop all containers
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Rebuild a single service without restarting others
docker compose build coc-api

# Open a shell inside a running container
docker compose exec coc-api sh

# Run Prisma Studio (from inside the coc-api container)
docker compose exec coc-api bunx prisma studio
```

---

## Dockerfile Stages

The root `Dockerfile` uses a multi-stage build:

| Stage | Target | Purpose |
|-------|--------|---------|
| `deps` | — | Installs production dependencies only |
| `builder` | `target: builder` | Installs all deps + generates Prisma client; **used by all dev compose files** |
| `runner` | — | Lean production image; runs as non-root `cocuser` |

The dev compose files use `target: builder` so that devDependencies and the Prisma CLI are available inside the container.

---

## Troubleshooting

**`open Dockerfile: no such file or directory`**
The `dockerfile:` path in compose is relative to the `context`, not the compose file. Our configs set `context: ../..` (repo root) so `dockerfile: Dockerfile` resolves correctly.

**Port already in use**
Set a custom port via the `PORT` env variable before running:
```bash
PORT=3001 docker compose up
```

**Prisma migration errors on startup**
The `coc-api` container runs `prisma migrate deploy` on every start. If the DB is unreachable, the container will exit. Verify your `DATABASE_URL` and `DIRECT_URL` in `.env.local`.

**Container exits immediately after `healthy`**
Check logs with `docker compose logs coc-api`. Common causes: missing env vars or a failed migration.

**Stale node_modules in container**
The anonymous volume `/app/node_modules` is intentionally excluded from the host mount to avoid cross-OS binary conflicts. If you change `package.json`, let Docker rebuild:
```bash
docker compose build --no-cache coc-api
```
