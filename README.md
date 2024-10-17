# README

This directory contains resources for setting up a local docker stack that provide mocks for infrastructure resources.

## Development Infrastructure

Start up reference services to emulate production infrastructure:

```bash
> docker-compose -f development-infra.yml up -d
```

This will start the following services:

 - **POSTGRES**: Port: `15432`, User: `postgres`, Password: `***`
 - **Redis**: Port: `6379`, User: `redis`, Password: `***`
 - **OPA**: Port: 8181

## SSH Tunnels

Start ssh tunnels into the development infrastructure

```bash
> .\tools\tunnel.sh
```

