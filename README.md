# SOBP Validation App

A production-ready infrastructure validation application for **SOBP (Self-Operating Backend Platform)**. This app intentionally focuses on deployment platform behavior rather than business logic.

It validates:

- GitHub deployment
- Docker build and runtime behavior
- Node.js / Express / TypeScript stack detection
- `npm run start` startup command detection
- Port detection through `PORT=3000`
- Health checks
- Environment variable and secret injection
- SQLite-backed volume persistence
- Runtime log streaming
- Error handling
- Process restarts
- Rollbacks after unhealthy health checks
- Monitoring under CPU and memory pressure
- Service deletion and reconciliation

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite
- **Frontend:** Static HTML dashboard served by Express
- **Container:** Multi-stage Docker build

## Repository Structure

```text
sobp-validation-app/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── public/
│   │   └── index.html
│   └── data/
│       └── .gitkeep
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` for local development.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `APP_NAME` | No | `SOBP Validation App` | Displayed in logs and `/env`. |
| `ENVIRONMENT` | No | `unknown` | Verifies environment injection. |
| `CUSTOM_SECRET` | Recommended | none | `/env` reports `loaded` when present without exposing the secret value. |
| `PORT` | No | `3000` | HTTP listener port for platform port detection. |
| `SQLITE_PATH` | No | `backend/data/sobp-validation.sqlite` | SQLite location for persistence tests. Docker uses `/app/backend/data/sobp-validation.sqlite`. |

## Local Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open the dashboard at <http://localhost:3000>.

Build and run the production output locally:

```bash
npm run build
npm run start
```

## Docker Run

Build the image:

```bash
docker build -t sobp-validation-app .
```

Run with a named volume so the counter survives container recreation:

```bash
docker run --rm \
  --name sobp-validation-app \
  -p 3000:3000 \
  -e APP_NAME="SOBP Validation App" \
  -e ENVIRONMENT="docker" \
  -e CUSTOM_SECRET="example-secret" \
  -v sobp-validation-data:/app/backend/data \
  sobp-validation-app
```

Open <http://localhost:3000>.

## GitHub Deployment Through SOBP

1. Push this repository to GitHub.
2. Create a new SOBP service from the GitHub repository.
3. Allow SOBP to detect the Node.js/npm stack.
4. Confirm SOBP uses the startup command:

   ```bash
   npm run start
   ```

5. Configure environment variables and secrets:
   - `APP_NAME=SOBP Validation App`
   - `ENVIRONMENT=production` or another SOBP environment name
   - `CUSTOM_SECRET=<secret-value>`
   - `PORT=3000` if SOBP does not inject a port automatically
6. Attach a persistent volume at `/app/backend/data` for Docker deployments, or set `SQLITE_PATH` to a path inside the mounted volume.
7. Deploy and verify `/health` returns healthy.

## API Endpoints

### Health Check

```http
GET /health
```

Healthy response:

```json
{
  "status": "healthy",
  "timestamp": "2026-05-31T00:00:00.000Z"
}
```

During unhealthy simulation, this endpoint returns HTTP `500` for 60 seconds.

### Environment Variable Test

```http
GET /env
```

Example response:

```json
{
  "appName": "SOBP Validation App",
  "environment": "production",
  "customSecret": "loaded"
}
```

`CUSTOM_SECRET` is never returned directly. The endpoint returns `loaded` when the value exists and `missing` when it does not.

### Persistent Counter

```http
GET /counter
POST /counter/increment
```

The counter is stored in SQLite and is designed to survive restarts and redeploys when `backend/data` is persisted.

### CPU Load Simulation

```http
POST /simulate/cpu
```

Starts a 30-second CPU load simulation and returns `202 Accepted`.

### Memory Load Simulation

```http
POST /simulate/memory
```

Temporarily allocates 128MB for 30 seconds and returns `202 Accepted`.

### Crash Simulation

```http
POST /simulate/crash
```

Schedules `process.exit(1)` so SOBP can validate restarts, reconciliation, and rollback behavior.

### Delayed Healthcheck Failure

```http
POST /simulate/unhealthy
```

Forces `/health` to return HTTP `500` for 60 seconds so SOBP can validate health-based rollback behavior.

## Runtime Logs

The app emits validation logs every 10 seconds:

```text
INFO App running at <timestamp>
INFO Counter value <value>
WARNING High load simulation log entry
ERROR Fake recoverable error for log pipeline validation
```

These messages are intentionally predictable so SOBP log streaming and alerting can be validated.

## Testing Instructions

### Local API Smoke Test

```bash
curl http://localhost:3000/health
curl http://localhost:3000/env
curl http://localhost:3000/counter
curl -X POST http://localhost:3000/counter/increment
curl -X POST http://localhost:3000/simulate/cpu
curl -X POST http://localhost:3000/simulate/memory
curl -X POST http://localhost:3000/simulate/unhealthy
```

Use the crash endpoint only when you want the process to exit:

```bash
curl -X POST http://localhost:3000/simulate/crash
```

### Persistence Test

1. Increment the counter.
2. Restart the service or recreate the container while preserving the volume.
3. Call `GET /counter`.
4. Confirm the value did not reset.

### Rollback / Health Test

1. Deploy the service.
2. Call `POST /simulate/unhealthy`.
3. Confirm `/health` returns HTTP `500` for 60 seconds.
4. Confirm SOBP reports the service as unhealthy and triggers the expected rollback/reconciliation behavior.

## SOBP Test Checklist

- [ ] Deploy from GitHub
- [ ] Verify build detection
- [ ] Verify startup detection (`npm run start`)
- [ ] Verify port detection (`3000` or injected `PORT`)
- [ ] Verify `/health` healthcheck
- [ ] Verify secrets with `/env`
- [ ] Verify SQLite volume persistence with `/counter`
- [ ] Verify runtime logs stream every 10 seconds
- [ ] Verify monitoring with `POST /simulate/cpu`
- [ ] Verify monitoring with `POST /simulate/memory`
- [ ] Verify restart behavior with `POST /simulate/crash`
- [ ] Verify rollback behavior with `POST /simulate/unhealthy`
- [ ] Verify service deletion
- [ ] Verify reconciliation after manual drift or crash

## Production Notes

- The Dockerfile uses a multi-stage build and exposes port `3000`.
- The Docker healthcheck calls `GET /health`.
- The runtime image stores SQLite data under `/app/backend/data`, declared as a Docker volume.
- The static dashboard is available at `/`.
