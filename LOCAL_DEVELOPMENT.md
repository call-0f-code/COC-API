# Local Development Environment Setup

This document explains how to set up and manage the local development environment for the COC-API project.

## Prerequisites

- **Docker & Docker Compose**: Ensure you have Docker installed and running.
- **PostgreSQL Client (`pg_dump`)**: The setup script uses `pg_dump` to pull data from the remote database.

## Setup Instructions

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Key variables for the setup script:
- `SESSION_POOLER`: The direct connection string to your Supabase project (Session Pooler / IPv4).
  - **Format**: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

### 2. Run the Setup Script

The `scripts/setup-local.sh` script automates the entire process:

```bash
bun run local
```

#### What the script does:
1. **Starts Postgres**: Launches the `db` container.
2. **Installs Extensions**: Pre-installs `pgcrypto`, `uuid-ossp`, and `pg_stat_statements` into the `public` schema.
3. **Dumps Remote DB**: Uses `pg_dump` to create a snapshot of the production database.
4. **Cleans the Dump**: Strips Supabase-specific extensions and patches schema references to work locally.
5. **Seeds the Database**: Loads the cleaned dump into your local Postgres container.
6. **Starts the API**: Launches the `api` container and waits for it to be healthy.

### 3. Useful Commands

- **Start environment**: `bash scripts/setup-local.sh`
- **Skip dump (reuse existing `seed/dump.sql`)**: `bash scripts/setup-local.sh --skip-dump`
- **Skip seeding (just start containers)**: `bash scripts/setup-local.sh --skip-seed`
- **View logs**: `docker compose logs -f`
- **Stop containers**: `docker compose down`
- **Wipe local data (force re-seed)**: `docker compose down -v`

## Troubleshooting

### "Tenant or user not found" during dump
This usually means your `SESSION_POOLER` username is just `postgres`. Supabase requires the format `postgres.PROJECT_REF`.

### Tables not in `public` schema
The script automatically patches the dump to ensure tables are placed in the `public` schema. If you manually imported a dump, ensure you've installed the required extensions first.

### Re-seeding
The script skips seeding if it detects existing tables in the `public` schema. To force a re-seed, run `docker compose down -v` before running the setup script.
