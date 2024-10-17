# README

## Setup Development Environment

**Strongly recommend developing under either native Linux (ubuntu 20+) or WSL2 on Windows10.**

## Windows

- Install Docker for Windows ( https://docs.docker.com/docker-for-windows/wsl/ )
- Install WSL2, use Ubuntu as linux image ( https://docs.microsoft.com/en-us/windows/wsl/install-win10#manual-installation-steps )
- Install Windows Terminal ( https://docs.microsoft.com/en-us/windows/terminal/get-started )

## Linux

- Install and setup `docker` and `docker-compose`
- Install and setup `git lfs` extension ( https://git-lfs.github.com/ )
- (optional/recommended) Install `nvm` ( https://github.com/nvm-sh/nvm )
- Install nodejs v14.16.0 (`nvm install --lts`)
- Install yarn (`npm install -g yarn`)
- (optional/recommended) `direnv` https://direnv.net/
- Install kubectl ( https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/ )

## Development setup

- use `template.envrc` as a reference when setting up your local `.envrc` or equivalent for setting up needed development environment variables

## Rules of Engagement

- Commit to feature branches of form `feature/<name>` or `bugfix/<name|JIRA>`
- Rebase against `main` regularly (`git rebase main`)
- Rebase and Squash against `main` before submitting pull-requests against `main` (`git rebase -i main`)

Direct pushes into `main` should be avoided and will be disallowed in future

## Start the development server

Start the development server:

```bash
> yarn start
```

## Database Preparation (First Time)

API is backed by a Postgres database by default. Before the service can start successfully, the database tables need to be created and static data needs to be seeded.

These instructions assume that you have:

- Installed Postgres server (either as local-service, running in a container, or remotely in the cloud)
- Installed the Postgres Client (psql)

The following steps will assume a localhost installation of Postgres with the credentials:

- **hostname**: localhost
- **database**: postgres
- **username**: postgres
- **password**: postgres

1. Initialize the schema

In Postgres the `schema` is the entity that hosts tables. This concept is equivalent to a `database` in MySQL.

To create a new schema named `tenant` in Postgres, do the following:

```bash
> psql --host=<hostname> --port=<port> --username=<username>
Password for user <username>: **secret**
postgres=# create schema tenant;
```

2. Set the environment variable

This service and prisma are configured to connect to the database specified in an environment variable. Set this environment variable to the following value:

```bash
> export ULS_API_POSTGRES_URI=postgres://postgres:postgres@localhost:15432/postgres?schema=tenant
```

You can now use the `prisma` commands to initialize the database:

3. Initialize the tables

The `prisma db push` command will take the schema definition in `prisma\schema.prisma` and populate the Postgres schema with all of the needed tables, sequences, and indexes.

```bash
> npx prisma db push
```

You can confirm the table have been created from the Postgres shell using the psql command `\dt <schema>.*`:

```bash
postgres=# \dt tenant.*
                  List of relations
 Schema |          Name           | Type  |  Owner
--------+-------------------------+-------+----------
 tenant | _prisma_migrations     | table | postgres
 tenant | _user_roles            | table | postgres
 tenant | apps                   | table | postgres
 tenant | attachments            | table | postgres
 tenant | audit_log              | table | postgres
 tenant | auth_method            | table | postgres
 tenant | auth_profiles          | table | postgres
 tenant | features               | table | postgres
 tenant | notification           | table | postgres
 tenant | notification_status    | table | postgres
 tenant | notification_type      | table | postgres
 tenant | onetimetokens          | table | postgres
 tenant | permissions            | table | postgres
 tenant | products               | table | postgres
 tenant | refreshtokens          | table | postgres
 tenant | role_option_values     | table | postgres
 tenant | role_options           | table | postgres
 tenant | roles                  | table | postgres
 tenant | user_permission_values | table | postgres
 tenant | user_profiles          | table | postgres
 tenant | users                  | table | postgres
 tenant | web_sessions           | table | postgres
(16 rows)
```

**Note:** The relation list may be different than listed here depending on which version of the schema you are using.

4. Seed the tables with static data

Now that you have the tables defined in the schema, you can seed the database with the necessary static data. This static data includes facts like baseline Roles, Permissions and Options.

```bash
> npx prisma db seed
```

Seeding is intended to be idempotent, so it is ok to run the `npx prisma db seed` command multiple times.

## Running Database Migrations in Development (after merging pull-requests)

Pull requests can change the database schema. To bring your local development database in sync, you need to run the migrations and (sometimes) reseed the database.

To catch up on all new migrations in development:

**WARNING**: Do not run this command in production, see [Running Database Migrations in Production] for the correct deployment process.

```bash
> npx prisma migrate dev
```

## Static Data like Images, Videos Uploads to AWS S3

Bucket Modes are:

development : for developers or local development
staging : for dev site
production : for live

## END

(end)
