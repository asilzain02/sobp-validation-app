# FoodFlow

FoodFlow is a lightweight mini food delivery platform created only for SOBP V0.4 discovery testing.

It is **not production software**, contains **no business logic**, and exists only to validate service, port, dependency, health endpoint, environment variable, and Dockerfile detection.

## ZIP-ready folder structure

```text
FoodFlow/
├── README.md
├── docker-compose.yml
├── gateway-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
├── food-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       └── data/
│           └── foods.json
├── order-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
├── payment-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
└── tracking-service/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── index.js
```

## Services

| Service | Purpose | Port | Health | Dependencies | Environment references |
| --- | --- | ---: | --- | --- | --- |
| `gateway-service` | Single application entry and request router | `8080` | `/health` | `food-service`, `order-service`, `payment-service`, `tracking-service` | `FOOD_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL`, `TRACKING_SERVICE_URL` |
| `food-service` | Lists foods from a JSON file only | `3001` | `/health` | none | `PORT` |
| `order-service` | Creates and lists mock orders | `3002` | `/health` | `food-service` | `FOOD_SERVICE_URL` |
| `payment-service` | Accepts mock payments | `3003` | `/health` | `order-service` | `ORDER_SERVICE_URL` |
| `tracking-service` | Tracks order progress | `3004` | `/health` | `payment-service` | `PAYMENT_SERVICE_URL` |

## Endpoints

### gateway-service (`8080`)

- `GET /`
- `GET /health`
- `GET /api/foods`
- `GET /api/food/:id`
- `POST /api/order`
- `GET /api/order`
- `POST /api/pay`
- `GET /api/payment/status`
- `GET /api/track`

### food-service (`3001`)

- `GET /health`
- `GET /foods`
- `GET /food/:id`

### order-service (`3002`)

- `GET /health`
- `POST /order`
- `GET /order`

### payment-service (`3003`)

- `GET /health`
- `POST /pay`
- `GET /payment/status`

### tracking-service (`3004`)

- `GET /health`
- `GET /track`

## Dependency graph

```text
gateway-service
├── food-service
├── order-service
├── payment-service
└── tracking-service

order-service ──> food-service
payment-service ──> order-service
tracking-service ──> payment-service
```

## Docker discovery signals

Each service contains:

- `Dockerfile`
- `package.json`
- `src/index.js`
- `npm start` startup command
- `EXPOSE` statement for the expected port
- `/health` endpoint
- JSON structured startup logs
- Environment variable references for dependency discovery

Every Dockerfile is a Node.js multi-stage build with a `dependencies` stage and a `runtime` stage.

## Run all services with Docker Compose

```bash
docker compose up --build
```

The compose file defines exactly five services and mirrors the expected dependency graph with `depends_on`, ports, environment variables, and health checks.

## Run a service locally

From any service folder:

```bash
npm install
npm start
```

Example:

```bash
cd food-service
npm install
npm start
curl http://localhost:3001/health
curl http://localhost:3001/foods
```

## Build containers independently

```bash
docker build -t foodflow-gateway ./gateway-service
docker build -t foodflow-food ./food-service
docker build -t foodflow-order ./order-service
docker build -t foodflow-payment ./payment-service
docker build -t foodflow-tracking ./tracking-service
```

## SOBP V0.4 discovery test cases

Use this directory as a ZIP or folder upload fixture.

| Test case | Input | Expected result |
| --- | --- | --- |
| ZIP upload | Zip the `FoodFlow/` directory and upload it | Detect application `FoodFlow` and exactly 5 services |
| Single folder upload | Upload the `FoodFlow/` folder | Detect the same services and metadata |
| Nested folders | Upload a parent folder containing `FoodFlow/` | Recursively detect service folders |
| Missing Dockerfile | Temporarily remove one service Dockerfile before upload | Detect missing Dockerfile for that service while preserving other services |

## Expected SOBP detection

Application:

```text
FoodFlow
```

Detected services:

```text
gateway-service
food-service
order-service
payment-service
tracking-service
```

Ports:

```text
8080
3001
3002
3003
3004
```

Health paths:

```text
/health
```

Dependencies:

```text
gateway-service -> food-service
gateway-service -> order-service
gateway-service -> payment-service
gateway-service -> tracking-service
order-service -> food-service
payment-service -> order-service
tracking-service -> payment-service
```

## Notes

- The food catalog uses `food-service/src/data/foods.json` only.
- No real database is required.
- No deployment is required.
- This project is intentionally small and deterministic for analyzer validation.
