# Docker

Docker configuration is split by purpose so future services can be added without growing the repository root.

## Files

| Path | Purpose |
| --- | --- |
| `../docker-compose.yml` | Root entrypoint for default local Compose commands |
| `compose/docker-compose.dev.yml` | Local development services for the pnpm workspace |

Future Compose files should be added under `docker/compose/`, for example:

- `docker-compose.test.yml`
- `docker-compose.firebase.yml`
- `docker-compose.observability.yml`

## Local development ports

Ports are registered in the external Obsidian vault `projects/port-management-registry.md` with `PROJECT_ID=37`.

| Service | Container port | Host port | URL |
| --- | ---: | ---: | --- |
| frontend | 3000 | 13700 | http://localhost:13700 |
| backend | 8787 | 13701 | http://localhost:13701 |

## Commands

Start a workspace shell container:

```bash
docker compose up -d workspace
docker compose exec workspace sh
```

Start the app services after the frontend and backend packages exist:

```bash
docker compose --profile app up frontend backend
```

Backend health check after implementation:

```bash
curl http://localhost:13701/api/health
```
