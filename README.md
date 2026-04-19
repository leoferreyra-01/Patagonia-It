# Patagonia-It

API standalone en NestJS para el challenge tecnico.

## Requisitos

- Node 24

## Ejecucion local

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar en modo desarrollo:

```bash
npm run start:dev
```

## URLs de la API

- URL base API: http://localhost:3000/api
- Endpoint de health: http://localhost:3000/api/health
- Endpoint de readiness: http://localhost:3000/api/health/ready
- Endpoint de creacion de transferencias: http://localhost:3000/api/transfers
- Swagger UI: http://localhost:3000/docs

## Tests

```bash
npm test
```

Para ver logs durante tests (debug):

```bash
JEST_SILENT=false npm run test
```

Para coverage

```bash
npm run test:cov
```

## Documentacion

- Arquitectura: [docs/architecture.md](docs/architecture.md)
- Catalogo de errores: [docs/errors.md](docs/errors.md)
- Primeros pasos: [docs/getting-started.md](docs/getting-started.md)
- Guia operativa: [docs/runbook.md](docs/runbook.md)
- Resolucion de problemas: [docs/troubleshooting.md](docs/troubleshooting.md)
- Politica de cambios de API: [docs/api-change-policy.md](docs/api-change-policy.md)
- Contrato Lambda: [docs/lambda.md](docs/lambda.md)

## Colaboracion

- Guia de contribucion: [CONTRIBUTING.md](CONTRIBUTING.md)
- Historial de cambios: [CHANGELOG.md](CHANGELOG.md)