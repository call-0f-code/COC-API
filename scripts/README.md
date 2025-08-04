# Development Scripts

This directory contains automation scripts for the COC API development environment.

## Prerequisites

Before using these scripts, ensure you have:

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- Node.js and npm/bun installed

## Available Scripts

### 🚀 `start-dev.sh`

**Main development environment startup script**

This script automates the complete development environment setup:

1. Starts Supabase local development instance
2. Extracts environment variables from `supabase status`
3. Creates `.env.local` file with the required variables:
   - `DATABASE_URL` (Postgres URL)
   - `DIRECT_URL` (Same as DATABASE_URL)
   - `SUPABASE_URL` (API URL)
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Starts the Docker development container

```bash
./scripts/start-dev.sh
```

### 🛑 `stop-dev.sh`

**Development environment shutdown script**

Stops all development services:

1. Stops Docker containers
2. Stops Supabase local instance

```bash
./scripts/stop-dev.sh
```

### 🔄 `restart-dev.sh`

**Development environment restart script**

Restarts the entire development environment by running stop and start scripts in sequence.

```bash
./scripts/restart-dev.sh
```

### 📋 `logs.sh`

**View development container logs**

Shows real-time logs from the COC API development container.

```bash
./scripts/logs.sh
```

## Quick Start

1. **First time setup:**
   ```bash
   ./scripts/start-dev.sh
   ```

2. **View your running services:**
   - COC API: http://localhost:3000
   - Supabase Studio: http://localhost:54323 (usually)

3. **View logs:**
   ```bash
   ./scripts/logs.sh
   ```

4. **Stop everything:**
   ```bash
   ./scripts/stop-dev.sh
   ```

## Environment Variables

The `start-dev.sh` script automatically creates a `.env.local` file with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Troubleshooting

### Supabase CLI not found
```bash
npm install -g supabase
```

### Docker not found
Install Docker from: https://docs.docker.com/get-docker/

### Port conflicts
If you encounter port conflicts, stop other services or modify the ports in:
- `supabase/config.toml` (for Supabase ports)
- `docker-compose.yml` (for API port)

### Container won't start
1. Check logs: `./scripts/logs.sh`
2. Verify environment variables in `.env.local`
3. Ensure Supabase is running: `supabase status`

### Database connection issues
1. Verify DATABASE_URL in `.env.local`
2. Check if Supabase is running: `supabase status`
3. Restart the environment: `./scripts/restart-dev.sh`

## Manual Commands

If you prefer to run commands manually:

```bash
# Start Supabase
supabase start

# Check status
supabase status

# Start Docker development container
docker compose up -d coc-api-dev

# View Docker logs
docker compose logs -f coc-api-dev

# Stop everything
docker compose down
supabase stop
``` 