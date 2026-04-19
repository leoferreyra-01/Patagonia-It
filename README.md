# Patagonia-It

NestJS standalone API for the technical challenge.

## Requirements

- Node 24

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start in dev mode:

```bash
npm run start:dev
```

## API URLs

- API base URL: http://localhost:3000/api
- Health endpoint: http://localhost:3000/api/health
- Swagger UI: http://localhost:3000/docs

## Tests

```bash
npm test
```

For coverage

```bash
npm run test:cov
```

## Design docs

- Architecture: [docs/architecture.md](docs/architecture.md)
- Error catalog: [docs/errors.md](docs/errors.md)
- Lambda contract: [lambda.md](lambda.md)