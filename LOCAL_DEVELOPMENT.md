# Local Development Environment Setup

This document explains how to set up and manage the local development environment for the COC-API project.

## Prerequisites

- **Docker & Docker Compose**: Ensure you have Docker installed and running.
- **PostgreSQL Client (`pg_dump`)**: Optional. The current local setup prefers loading a local `seed/dump.sql` file. `pg_dump` is only required if you want to create a fresh dump from a remote database manually.

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

The `scripts/setup-local.sh` script automates the local environment bring-up. By default it will load the local `seed/dump.sql` into the local Postgres instance.

```bash
bun run local
```

#### What the script does:
1. **Starts Postgres**: Launches the `db` container.
2. **Installs Extensions**: Pre-installs `pgcrypto`, `uuid-ossp`, and `pg_stat_statements` into the `public` schema.
3. **Loads Local Seed**: If `public` has no tables, the script loads `seed/dump.sql` into the DB. This is the default and recommended local flow.
4. **Starts the API**: Launches the `api` container and waits for it to be healthy.

Flags:
  - `--skip-dump`: reuse existing `seed/dump.sql` (no remote dump step)
  - `--skip-seed`: skip loading the seed and just start containers

### 3. Useful Commands

- **Start environment**: `bash scripts/setup-local.sh`
- **Skip dump (reuse existing `seed/dump.sql`)**: `bash scripts/setup-local.sh --skip-dump`
- **Skip seeding (just start containers)**: `bash scripts/setup-local.sh --skip-seed`
- **View logs**: `docker compose logs -f`
- **Stop containers**: `docker compose down`
- **Wipe local data (force re-seed)**: `docker compose down -v`

## Troubleshooting

### Tables not in `public` schema
The script automatically patches the dump to ensure tables are placed in the `public` schema. If you manually imported a dump, ensure you've installed the required extensions first.
