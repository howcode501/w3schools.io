#!/bin/bash

# TODO - validate envvar
# Assume 'ULS_API_POSTGRES_URI' is of the form:
#   postgres://<user>:<password>@<host>:<port>/<dbname>?schema=<schema>

set -e

if [[ ${NODE_ENV} = "test" ]]; then
  if [ -n "$ULS_API_TEST_POSTGRES_MIGRATE_URI" ]; then
    echo "+++ Using Migration DB URL: $ULS_API_TEST_POSTGRES_MIGRATE_URI"
    export ULS_API_TEST_POSTGRES_URI="$ULS_API_TEST_POSTGRES_MIGRATE_URI"
  fi

  DB=$(echo $ULS_API_TEST_POSTGRES_URI | cut -d '?' -f 1)
  SCHEMA=$(echo $ULS_API_TEST_POSTGRES_URI | perl -ne 'print $1 if /schema=(\w+)/')
  export DB_URI=$ULS_API_TEST_POSTGRES_URI
else
  if [ -n "$ULS_API_POSTGRES_MIGRATE_URI" ]; then
    echo "+++ Using Migration DB URL: $ULS_API_POSTGRES_MIGRATE_URI"
    export ULS_API_POSTGRES_URI="$ULS_API_POSTGRES_MIGRATE_URI"
  fi

  DB=$(echo $ULS_API_POSTGRES_URI | cut -d '?' -f 1)
  SCHEMA=$(echo $ULS_API_POSTGRES_URI | perl -ne 'print $1 if /schema=(\w+)/')
  export DB_URI=$ULS_API_POSTGRES_URI
fi

if [[ -z $DB || -z $SCHEMA ]]; then
  echo "No Database URI specfied"
  exit 1
else
  echo "DB: $DB"
  echo "SCHEMA: $SCHEMA"
fi

## -- functions --

function create_schema() {
  echo "Create schema '${SCHEMA}' if it does not exists.."
  psql $DB <<EOF
  DO \$\$
  BEGIN

      IF NOT EXISTS(
          SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name = '${SCHEMA}'
        )
      THEN
        EXECUTE 'CREATE SCHEMA ${SCHEMA}';
      END IF;

  END
  \$\$;
EOF
}

function drop_schema() {
  echo "Dropping schema '${SCHEMA}'.."
  psql $DB -c "drop schema ${SCHEMA} cascade;" 2>&1 >/dev/null
}

function migrate_db() {
  echo "Migrating database to latest schema version.."
  npx prisma migrate deploy
}

function db_push() {
  echo "Generating New Shema File, then Attempting Push"
  npx prismerge -i prismerge.json && npx prisma db push
}

function generate_migration() {
  echo "Generating New database migration version.."
  npx prismerge -i prismerge.json && npx prisma migrate dev
}

function generate_client() {
  echo "Regenerate prisma client.."
  npx prisma generate
}

function seed_db() {
  echo "Seeding database with static data.."
  npx prisma db seed
} 

# -- main --

cmd=$1
case $cmd in
  reset)
    drop_schema
    create_schema
    migrate_db
    generate_client
    seed_db
    ;;
  initialize)
    create_schema
    migrate_db
    generate_client
    seed_db
    ;;
  interactive)
    #PGOPTIONS="--search_path=$SCHEMA" exec psql $DB 
    exec psql $DB 
    ;;
  create)
    create_schema
    ;;
  drop)
    drop_schema
    ;;
  dump)
    pg_dump $DB -n $SCHEMA > dump.sql
    ;;
  load)
    psql $DB  <$2
    ;;
  migrate)
    migrate_db
    ;;
  migrate-create)
    generate_migration
    ;;
  push)
    db_push
    ;;
  generate)
    generate_client
    ;;
  seed)
    seed_db
    ;;
  *)
    echo " "
    echo "Syntax: database.sh [COMMAND]"
    echo " "
    echo "Valid commands are:"
    echo " "
    echo " --- SAFE / Non destructive ---"
    echo " initialize     - create schema, migrate and seed"
    echo " interactive    - launch interactive shell"
    echo " create         - create empty schema"
    echo " migrate-create - generates database migration"
    echo " migrate        - execute schema migration"
    echo " seed           - seed database with static data"
    echo " "
    echo " --- DANGEROUS / Destructive ---"
    echo " reset          - drop schema and initialize"
    echo " drop           - drop existing schema"
    echo " "
    echo " All commands are idempotent and can be safely executed repeatedly. "
    exit 1
    ;;
esac
exit 0
