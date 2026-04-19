# Primeros Pasos

## Resumen

Esta guia te ayuda a ejecutar la API en local, correr tests y validar los endpoints principales.

## Prerrequisitos

- Node.js 24.x
- npm 10+

## Instalar dependencias

```bash
npm install
```

## Ejecutar en modo desarrollo

```bash
npm run start:dev
```

URLs por defecto:

- API base: `http://localhost:3000/api`
- Health: `http://localhost:3000/api/health`
- Readiness: `http://localhost:3000/api/health/ready`
- Swagger: `http://localhost:3000/docs`

## Ejecutar tests

Ejecutar todos los tests:

```bash
npm test
```

Ejecutar coverage:

```bash
npm run test:cov
```

## Validar flujo principal de la API

### 1. Verificar health

```bash
curl -i http://localhost:3000/api/health
```

Esperado: `200 OK`

### 2. Crear company

```bash
curl -i -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "30-87654321-0",
    "name": "New Co",
    "type": "CORPORATIVA",
    "country": "AR"
  }'
```

Esperado: `201 Created` y un payload con `id` y `registrationDate`.

### 3. Listar companies con filtros y paginacion

```bash
curl -i "http://localhost:3000/api/companies?type=PYME&country=AR&limit=10&offset=0"
```

Esperado: `200 OK` con `total`, `limit`, `offset`, `items`.

### 4. Companies registradas en el ultimo mes

```bash
curl -i http://localhost:3000/api/companies/joined-last-month
```

### 5. Companies con transferencias en el ultimo mes

```bash
curl -i http://localhost:3000/api/companies/with-transfers/last-month
```

## Comportamiento de validacion

La validacion de requests se aplica mediante el `ValidationPipe` global.

- Campos desconocidos son rechazados.
- Query params se transforman a los tipos esperados.
- Los errores de validacion devuelven `400` con codigo `VALIDATION_ERROR`.

Ejemplo de error de validacion:

```json
{
  "code": "VALIDATION_ERROR",
  "message": ["taxId format must be NN-NNNNNNNN-N"],
  "statusCode": 400
}
```
