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
- Swagger UI: http://localhost:3000/docs

## Tests

```bash
npm test
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
- Contrato Lambda: [docs/lambda.md](docs/lambda.md)