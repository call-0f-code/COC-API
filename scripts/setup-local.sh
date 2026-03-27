# =============================================================================
# setup-local.sh
#
# Sets up the local development environment:
#   1. Starts the local postgres container 
#   2. Waits for postgres to be healthy
#   3. Installs required extensions (pgcrypto, uuid-ossp, pg_stat_statements)
#   4. Checks whether the DB already has data — skips seeding if so
#   5. Dumps the remote database into ./seed/dump.sql using pg_dump
#   6. Strips Supabase-only extensions from the dump
#   7. Loads the dump into the running postgres container
#   8. Starts the API container
#
#   --skip-dump   Skip the pg_dump step (reuse an existing ./seed/dump.sql)
#   --skip-seed   Skip seeding entirely (just start containers)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
SEED_DIR="$PROJECT_ROOT/seed"
DUMP_FILE="$SEED_DIR/dump.sql"
SKIP_DUMP=false
SKIP_SEED=false

# ---- Parse args ----
for arg in "$@"; do
  case $arg in
    --skip-dump) SKIP_DUMP=true ;;
    --skip-seed) SKIP_SEED=true ;;
    *) echo "Unknown argument: $arg" && exit 1 ;;
  esac
done

# ---- Colour helpers ----
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; RESET='\033[0m'
info()  { echo -e "${GREEN}[setup]${RESET} $*"; }
warn()  { echo -e "${YELLOW}[setup]${RESET} $*"; }
error() { echo -e "${RED}[setup]${RESET} $*" >&2; exit 1; }

# ---- Sanity checks ----
command -v docker  >/dev/null 2>&1 || error "docker is not installed or not in PATH"

# ---- Load .env ----
if [[ ! -f "$ENV_FILE" ]]; then
  error ".env file not found at $ENV_FILE. Copy .env.example and fill in your values."
fi

info "Loading environment from $ENV_FILE"
set -o allexport
# shellcheck disable=SC1090
source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | sed 's/\r//')
set +o allexport

# ---- Local postgres URL ----
LOCAL_DATABASE_URL="postgresql://postgres:example@db:5432/coc?sslmode=disable"


# ========================================================
# 1. Start the DB container
# ========================================================
info "Starting postgres container..."
cd "$PROJECT_ROOT"
docker compose up db --build -d


# ========================================================
# 2. Wait for postgres to be healthy
# ========================================================
info "Waiting for postgres to be healthy..."
RETRIES=20
until docker compose exec -T db pg_isready -U postgres -d coc -h 127.0.0.1 -p 5432 -q 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -le 0 ]]; then
    error "Postgres did not become healthy in time. Check logs: docker compose logs db"
  fi
  sleep 2
done
info "Postgres is healthy."


# ========================================================
# 3. Install required extensions
# ========================================================
info "Installing required extensions into postgres..."
docker compose exec -T db psql -U postgres -d coc <<'EXTSQL'
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto         WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"      WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;
EXTSQL
info "Extensions installed."


# ========================================================
# 4. Check if DB already has data (skip seeding if so)
# ========================================================
if [[ "$SKIP_SEED" == true ]]; then
  warn "--skip-seed passed. Skipping dump and load."
else
  TABLE_COUNT=$(docker compose exec -T db psql -U postgres -d coc -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null || echo "0")
  TABLE_COUNT="${TABLE_COUNT//[[:space:]]/}"

  if [[ "$TABLE_COUNT" -gt 0 ]]; then
    warn "Database already has $TABLE_COUNT table(s) in public schema. Skipping seed."
    warn "To re-seed, run:  docker compose down -v  then re-run this script."
  else
    info "Database is empty — proceeding with seed."


    # ======================================================
    # 5. pg_dump remote database
    # ======================================================
    command -v pg_dump >/dev/null 2>&1 || error "pg_dump is not installed. Install postgresql-client and retry."

    if [[ -n "${SESSION_POOLER:-}" ]]; then
      REMOTE_URL="$SESSION_POOLER"
      info "Using SESSION_POOLER for database dump"
    else
      error "Set SESSION_POOLER in $ENV_FILE"
    fi

    mkdir -p "$SEED_DIR"

    if [[ "$SKIP_DUMP" == true ]]; then
      if [[ ! -f "$DUMP_FILE" ]]; then
        error "--skip-dump was passed but $DUMP_FILE does not exist. Run without --skip-dump first."
      fi
      warn "Skipping pg_dump — reusing existing $DUMP_FILE"
    else
      info "Dumping remote database to $DUMP_FILE ..."
      info "(This may take a moment depending on database size)"

      PGDUMP_ERR_LOG="/tmp/pgdump_err_$$.log"
      if pg_dump \
          --no-owner \
          --no-acl \
          --if-exists \
          --clean \
          "$REMOTE_URL" \
          > "$DUMP_FILE" 2>"$PGDUMP_ERR_LOG"; then
        info "Dump complete: $DUMP_FILE ($(du -sh "$DUMP_FILE" | cut -f1))"

        # ---- Strip Supabase-only extensions ----
        info "Stripping Supabase-only extensions from dump..."
        SUPABASE_EXTS="pg_graphql|pg_net|pgsodium|supabase_vault|wrappers|pg_stat_monitor|hypopg"

        sed -i -E \
          "s#^(CREATE EXTENSION IF NOT EXISTS ($SUPABASE_EXTS).*)#-- [local] \1#g" \
          "$DUMP_FILE"
        sed -i -E \
          "s#^(DROP EXTENSION IF EXISTS ($SUPABASE_EXTS).*)#-- [local] \1#g" \
          "$DUMP_FILE"

        # Strip COMMENT ON EXTENSION for stripped extensions
        sed -i -E \
          "s#^(COMMENT ON EXTENSION ($SUPABASE_EXTS) .*)#-- [local] \1#g" \
          "$DUMP_FILE"
        info "Supabase-only extension cleanup done."

        # ---- Patch extension schema: 'extensions' -> 'public' ----
        info "Patching extension schema references (extensions -> public)..."
        sed -i -E \
          "s#WITH SCHEMA extensions#WITH SCHEMA public#g" \
          "$DUMP_FILE"
        info "Extension schema patch done."

      else
        DUMP_ERR="$(cat "$PGDUMP_ERR_LOG")"
        rm -f "$DUMP_FILE" "$PGDUMP_ERR_LOG"
        warn "pg_dump failed:"
        warn "  $DUMP_ERR"
        warn ""
        if echo "$DUMP_ERR" | grep -qi "tenant or user not found"; then
          warn "Tip: The session pooler requires username format: postgres.PROJECT_REF"
          warn "     e.g. postgres.riqqtbuoaycwwiemnmri  (not just: postgres)"
          warn "     Update SESSION_POOLER in $ENV_FILE."
        elif echo "$DUMP_ERR" | grep -qi "network is unreachable\|no route to host"; then
          warn "Tip: The host appears unreachable (IPv6-only?). Try a VPN or an IPv4 URL."
        fi
        warn ""
        warn "Options:"
        warn "  1. Fix SESSION_POOLER in $ENV_FILE"
        warn "  2. Manually copy a dump to $DUMP_FILE and re-run with: bash scripts/setup-local.sh --skip-dump"
        error "Aborting: cannot seed without a database dump."
      fi
    fi # end skip-dump


    # ======================================================
    # 6. Load dump into running postgres container
    # ======================================================
    info "Loading dump into postgres..."
    docker compose exec -T db psql -U postgres -d coc < "$DUMP_FILE"
    info "Seed complete."

  fi # end table count check
fi # end skip-seed


# ========================================================
# 7. Start the API container
# ========================================================
info "Starting API container..."
DATABASE_URL="$LOCAL_DATABASE_URL" \
  docker compose up api --build -d

info "Waiting for api to be healthy..."
RETRIES=15
until curl -sf http://localhost:3000/health >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -le 0 ]]; then
    warn "API health check timed out — it may still be starting. Check: docker compose logs api"
    break
  fi
  sleep 3
done


echo ""
echo -e "${GREEN}======================================================${RESET}"
echo -e "${GREEN}  Local development environment is up!${RESET}"
echo -e "${GREEN}======================================================${RESET}"
echo -e "  API:      http://localhost:3000"
echo -e "  Postgres: localhost:5432  (user=postgres, db=coc)"
echo -e ""
echo -e "  Useful commands:"
echo -e "    docker compose logs -f          # stream all logs"
echo -e "    docker compose logs -f api       # api logs only"
echo -e "    docker compose down              # stop containers (keep data)"
echo -e "    docker compose down -v           # stop and wipe local DB volume"
echo -e "${GREEN}======================================================${RESET}"
