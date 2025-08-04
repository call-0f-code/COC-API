# Docker Setup for COC API

This guide explains how to containerize and run the COC API using Docker.

## Prerequisites

- Docker and Docker Compose installed
- `.env` file with required environment variables

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_supabase_direct_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
```

## Quick Start

### Automated Development Setup (Recommended)

For the easiest development experience, use the automation scripts:

```bash
# Start Supabase + extract env vars + start Docker dev container
./scripts/start-dev.sh

# View logs
./scripts/logs.sh

# Stop everything
./scripts/stop-dev.sh
```

See `scripts/README.md` for detailed documentation.

### Manual Development Setup

```bash
# Build and run development container
docker compose up -d coc-api-dev
```

## Build Targets

The Dockerfile includes multiple stages:

- **`base`**: Alpine Node + Bun installation
- **`deps`**: Dependencies and Prisma client generation
- **`development`**: Development setup with source mounting
- **`production`**: Optimized production build

### Building Specific Targets

```bash
# Development build
docker build --target development -t coc-api:dev .

# Production build (default)
docker build --target production -t coc-api:prod .
```


## Health Check

The container includes a health check endpoint:

```bash
# Check container health
curl http://localhost:3000/api/v1/health

# Response
{
  "status": "OK",
  "message": "COC API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## Docker Compose Commands

```bash
# Start production services
docker compose up -d

# Start development services
docker compose --profile dev up -d

# View logs
docker compose logs -f coc-api

# Stop services
docker compose down

# Rebuild services
docker compose up -d --build
```

## Optimization Features

- **Multi-stage builds** for smaller production images
- **Layer caching** for faster rebuilds
- **Non-root user** for security
- **Alpine Linux** for minimal image size
- **Bun** for fast JavaScript runtime
- **Health checks** for container monitoring

## Troubleshooting

### Container won't start

1. Check environment variables are set correctly
2. Verify Supabase connection details
3. Check logs: `docker-compose logs coc-api`

### Prisma issues

1. Ensure DATABASE_URL is accessible from container
2. Run `docker-compose exec coc-api bunx prisma generate`
3. Check if migrations need to be applied

### Port conflicts

1. Change port mapping in docker-compose.yml
2. Or use different ports: `docker run -p 8080:3000 coc-api`

## Production Deployment

For production deployment:

1. Use production target: `--target production`
2. Set `NODE_ENV=production`
3. Use proper secrets management
4. Configure reverse proxy (nginx/traefik)
5. Set up monitoring and logging
6. Use Docker Swarm or Kubernetes for orchestration

## File Structure

```
.
├── Dockerfile              # Multi-stage Dockerfile
├── docker-compose.yml      # Compose configuration
├── .dockerignore          # Build context exclusions
└── DOCKER.md              # This documentation
``` 