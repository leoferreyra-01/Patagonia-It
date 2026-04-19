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
- `GET /api/companies`
- `GET /api/companies/joined-last-month`
- `GET /api/companies/with-transfers/last-month`
- `GET /api/health`
- `GET /api/health/ready`

## Modelo de manejo de errores

Clases de estado principales:

- `400`: Validacion o input invalido
- `409`: Conflicto de negocio (por ejemplo, taxId duplicado)
- `500`: Falla inesperada de infraestructura o ejecucion

Las respuestas de validacion incluyen:

```json
{
  "code": "VALIDATION_ERROR",
  "message": ["..."],
  "statusCode": 400
}
```

## Chequeos operativos comunes

### Verificar arranque de API y docs

1. Abrir `http://localhost:3000/docs`
2. Verificar que todas las rutas sean visibles y ejecutables.

### Verificar flujo create + read

1. Crear una company por `POST /api/companies`
2. Recuperarla por `GET /api/companies`
3. Confirmar que `total` y el mapping de items sean correctos.

### Verificar comportamiento de errores

1. Enviar payload invalido a `POST /api/companies`
2. Confirmar `400` y `code: VALIDATION_ERROR`.

## Checklist de seguridad para release

1. `npm test` pasa
2. `npm run test:cov` cumple el umbral del equipo
3. Swagger carga y las rutas coinciden con los contratos esperados
4. Smoke test manual en endpoints de create/list
5. No hay cambios inesperados en el formato JSON persistido
