# Guia operativa

## Objetivo

Guia operativa para ejecutar y dar soporte a la API en entornos locales o no productivos.

## Inicio del servicio

### Iniciar

```bash
npm run start:dev
```

### Detener

Interrumpir el proceso (`Ctrl+C`) en la terminal donde esta corriendo.

### Verificacion de health

```bash
curl -i http://localhost:3000/api/health
```

Esperado: `200 OK`

### Verificacion de readiness

```bash
curl -i http://localhost:3000/api/health/ready
```

Esperado: `200 OK` con `checks.persistence: up`.
Si la dependencia de persistencia falla, esperado: `503 Service Unavailable`.

## Almacenamiento de datos

La app usa archivos JSON para persistencia a traves del adaptador de almacenamiento en archivos.

- Empresas: `companies.json`
- Transferencias: `transfers.json`

La resolucion de rutas se controla con `DATA_DIR` cuando esta presente; si no, se usan los valores por defecto del adaptador.

## Endpoints principales

- `POST /api/companies`
- `POST /api/transfers`
- `GET /api/companies`
- `GET /api/companies/joined-last-month`
- `GET /api/companies/with-transfers/last-month`
- `GET /api/health`
- `GET /api/health/ready`

## Modelo de manejo de errores

Clases de estado principales:

- `400`: Validacion o input invalido
- `409`: Conflicto de negocio (por ejemplo, taxId duplicado)
- `503`: Dependencia no disponible temporalmente (retryable)
- `500`: Falla inesperada de infraestructura o ejecucion

Las respuestas de validacion incluyen:

```json
{
  "code": "VALIDATION_ERROR",
  "message": ["..."],
  "statusCode": 400
}
```

## Respuesta operativa por codigo

Esta matriz define que hacer segun el codigo recibido en el error envelope.

| Codigo | Estado | Retryable | Diagnostico rapido | Accion inmediata |
| --- | --- | --- | --- | --- |
| VALIDATION_ERROR | 400 | No | Input invalido en request | Corregir payload y reintentar manualmente |
| COMPANY_ID_NOT_FOUND | 404 | No | companyId no existe en companies | Validar referencia y corregir companyId |
| COMPANY_TAX_ID_ALREADY_EXISTS | 409 | No | Conflicto de negocio por taxId existente | Usar taxId nuevo o evitar doble submit |
| JOINED_LAST_MONTH_FETCH_FAILED | 500 | No | Falla interna del caso de uso (no clasificada) | Revisar logs, traza y causa raiz |
| WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED | 500 | No | Falla interna del caso de uso (no clasificada) | Revisar logs, traza y causa raiz |
| PERSISTENCE_READ_FAILED | 503 | Si | Error transitorio al leer persistencia | Reintentar con backoff; verificar permisos/disco |
| PERSISTENCE_WRITE_FAILED | 503 | Si | Error transitorio al escribir persistencia | Reintentar con backoff; verificar espacio/disco |
| PERSISTED_DATA_INVALID | 500 | No | JSON o estructura persistida corrupta | Escalar a on-call, restaurar/repair data |
| READINESS_PERSISTENCE_CHECK_FAILED | 503 | Si | Health readiness no puede validar persistencia | Sacar instancia de rotacion y diagnosticar storage |
| UNEXPECTED_CREATE_COMPANY_ERROR | 500 | No | Falla no catalogada | Escalar con contexto de correlation id |

### Politica de reintentos recomendada

- Reintentar solo para `503` retryable (`PERSISTENCE_READ_FAILED`, `PERSISTENCE_WRITE_FAILED`, `READINESS_PERSISTENCE_CHECK_FAILED`).
- Evitar reintentos para `400` y `409`.
- Para `500` no retryable (`PERSISTED_DATA_INVALID` y errores internos no clasificados), abrir incidente.
- Estrategia sugerida: hasta 3 intentos con backoff exponencial (por ejemplo 250ms, 500ms, 1000ms).

### Datos minimos para incidentes

- `code`
- `statusCode`
- `x-correlation-id`
- Endpoint afectado
- Timestamp UTC del primer fallo

## Chequeos operativos comunes

### Verificar arranque de API y docs

1. Abrir `http://localhost:3000/docs`
2. Verificar que todas las rutas sean visibles y ejecutables.

### Verificar flujo create + read

1. Crear una company por `POST /api/companies`
2. Crear una transferencia valida por `POST /api/transfers`
3. Recuperar por `GET /api/companies`
4. Confirmar que `total` y el mapping de items sean correctos.

### Verificar validacion de companyId en transferencias

1. Enviar `POST /api/transfers` con un `companyId` inexistente
2. Confirmar `404` y `code: COMPANY_ID_NOT_FOUND`

### Verificar comportamiento de errores

1. Enviar payload invalido a `POST /api/companies`
2. Confirmar `400` y `code: VALIDATION_ERROR`.
3. Enviar `GET /api/companies/with-transfers/last-month?status=UNKNOWN`
4. Confirmar `400` y `code: VALIDATION_ERROR`.

## Checklist de seguridad para release

1. `npm run test` pasa
2. `npm run test:cov` cumple el umbral del equipo
3. Swagger carga y las rutas coinciden con los contratos esperados
4. Smoke test manual en endpoints de create/list
5. No hay cambios inesperados en el formato JSON persistido

## Criterios iniciales de alerta

Estos umbrales son baseline para ambientes no productivos y pueden ajustarse segun trafico real.

- Critica: `READINESS_PERSISTENCE_CHECK_FAILED` en cualquier instancia por mas de 2 minutos.
- Alta: `PERSISTENCE_READ_FAILED` o `PERSISTENCE_WRITE_FAILED` >= 5 eventos en 5 minutos.
- Alta: `PERSISTED_DATA_INVALID` >= 1 evento (accion inmediata).
- Media: `UNEXPECTED_CREATE_COMPANY_ERROR` >= 3 eventos en 10 minutos.
- Baja: `VALIDATION_ERROR` alto volumen; revisar cliente pero sin incidente de infraestructura.

### Verificacion post-incidente

1. `GET /api/health/ready` vuelve a `200`.
2. No hay nuevos `503` de persistencia durante 10 minutos.
3. Endpoints `GET /api/companies` y `POST /api/companies` responden correctamente en smoke test.
