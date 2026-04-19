# Lambda de Creacion de Company

Este documento describe el contrato esperado de la Lambda que crea una company, alineada con el comportamiento de `POST /api/companies`.

## Objetivo

La Lambda recibe una sola company desde API Gateway, valida los datos, verifica duplicados por `taxId` y persiste el registro.

## Input esperado (JSON)

API Gateway envia el payload en `event.body` como JSON stringificado.

Body esperado:

```json
{
  "taxId": "30-12345678-9",
  "name": "Acme SA",
  "type": "PYME",
  "country": "AR"
}
```

Reglas:

- `taxId`: obligatorio, formato `NN-NNNNNNNN-N`
- `name`: obligatorio, string no vacio
- `type`: obligatorio, valores permitidos `PYME` o `CORPORATIVA`
- `country`: opcional, si no se envia se usa `AR`

## Output esperado (JSON)

### Exito (201)

```json
{
  "id": "3f58f3c4-c20a-4c6f-801f-15e5c31f89ea",
  "taxId": "30-12345678-9",
  "name": "Acme SA",
  "type": "PYME",
  "country": "AR",
  "registrationDate": "2026-04-18T12:00:00.000Z"
}
```

### Error de validacion (400)

```json
{
  "message": "taxId format must be NN-NNNNNNNN-N"
}
```

### Duplicado por taxId (409)

```json
{
  "message": "Company with taxId 30-12345678-9 already exists"
}
```

## Integracion propuesta al sistema

1. API Gateway expone un endpoint HTTP (por ejemplo `POST /companies`) y dispara la Lambda.
2. API Gateway pasa el body al handler de la Lambda.
3. La Lambda ejecuta la misma logica de creacion que la API NestJS (misma validacion y misma regla de duplicados).
4. La Lambda persiste en el mismo esquema JSON (o repositorio equivalente en produccion).
5. API Gateway devuelve el `statusCode` y `body` que retorna la Lambda.

## Nota de arquitectura

- En este challenge ambos caminos (API NestJS y Lambda) comparten la logica de aplicacion (`CreateCompanyUseCase`) para mantener comportamiento consistente.
- En un entorno cloud real, se recomienda conectar ambos a una capa de persistencia compartida y transaccional (por ejemplo RDS o DynamoDB) en lugar de archivos locales.
