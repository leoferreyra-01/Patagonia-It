# Catalogo de errores y criterio de respuesta

## Objetivo

Definir un lenguaje comun para errores del sistema con una respuesta uniforme entre API y Lambda.

## Criterio general

- Errores de entrada invalida: `400`
- Conflictos de negocio: `409`
- Fallas retryable de persistencia: `503`
- Errores inesperados: `500`

## Catalogo inicial

### REQUEST_BODY_REQUIRED
- Estado: `400`
- Mensaje: `Request body is required`
- Uso: Lambda/API Gateway cuando no llega `body`

### INVALID_JSON_BODY
- Estado: `400`
- Mensaje: `Request body must be valid JSON`
- Uso: Lambda/API Gateway cuando el body no es JSON valido

### TAX_ID_REQUIRED
- Estado: `400`
- Mensaje: `taxId is required and must be a string`

### INVALID_TAX_ID_FORMAT
- Estado: `400`
- Mensaje: `taxId format must be NN-NNNNNNNN-N`

### NAME_REQUIRED
- Estado: `400`
- Mensaje: `name is required and must be a non-empty string`

### INVALID_COMPANY_TYPE
- Estado: `400`
- Mensaje: `type must be PYME or CORPORATIVA`

### INVALID_COUNTRY
- Estado: `400`
- Mensaje: `country must be a non-empty string when provided`

### JOINED_LAST_MONTH_FETCH_FAILED
- Estado: `500`
- Mensaje: `Failed to fetch companies joined in the last month`
- Uso: endpoint `GET /api/companies/joined-last-month` ante fallas inesperadas de lectura

### WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED
- Estado: `500`
- Mensaje: `Failed to fetch companies with transfers in the last month`
- Uso: endpoint `GET /api/companies/with-transfers/last-month` ante fallas inesperadas de lectura

### PERSISTENCE_READ_FAILED
- Estado: `503`
- Mensaje: `Failed to read persisted data`
- Uso: fallas retryable al leer archivos/repositorios

### PERSISTENCE_WRITE_FAILED
- Estado: `503`
- Mensaje: `Failed to persist data`
- Uso: fallas retryable al escribir archivos/repositorios

### PERSISTED_DATA_INVALID
- Estado: `500`
- Mensaje: `Persisted data is invalid`
- Uso: archivos existentes con JSON invalido o estructura inesperada

### COMPANY_TAX_ID_ALREADY_EXISTS
- Estado: `409`
- Mensaje base: `Company with taxId %s already exists`

### UNEXPECTED_CREATE_COMPANY_ERROR
- Estado: `500`
- Mensaje: `Unexpected error creating company`

## Respuesta actual

### API NestJS

Hoy la API y la Lambda devuelven el mismo contrato de error estandarizado.

Ejemplo de validacion/logica:

```json
{
  "code": "INVALID_TAX_ID_FORMAT",
  "message": "taxId format must be NN-NNNNNNNN-N",
  "statusCode": 400
}
```

Ejemplo de falla retryable de persistencia:

```json
{
  "code": "PERSISTENCE_READ_FAILED",
  "message": "Failed to read persisted data",
  "statusCode": 503
}
```

## Clasificacion operativa

- `retryable: true` aplica a fallas de lectura/escritura de persistencia donde un reintento puede resolver el problema.
- `retryable: false` aplica a datos persistidos corruptos o inconsistentes, donde hace falta intervencion operativa.
- El atributo de retryabilidad se mantiene en la taxonomia interna y hoy no se expone en el body HTTP.
