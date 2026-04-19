# Catalogo de errores y criterio de respuesta

## Objetivo

Definir un lenguaje comun para errores del sistema, aunque la respuesta HTTP actual todavia use principalmente el formato por defecto de NestJS.

## Criterio general

- Errores de entrada invalida: `400`
- Conflictos de negocio: `409`
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

### COMPANY_TAX_ID_ALREADY_EXISTS
- Estado: `409`
- Mensaje base: `Company with taxId %s already exists`

### UNEXPECTED_CREATE_COMPANY_ERROR
- Estado: `500`
- Mensaje: `Unexpected error creating company`

## Respuesta actual

### API NestJS

Hoy la API devuelve el formato por defecto de NestJS para excepciones HTTP.

Ejemplo de validacion/logica:

```json
{
  "message": "taxId format must be NN-NNNNNNNN-N",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Lambda

Hoy la Lambda devuelve una respuesta simplificada:

```json
{
  "message": "Company with taxId 30-12345678-9 already exists"
}
```

## Siguiente evolucion recomendada

En la siguiente fase de contratos/endpoints, se recomienda estandarizar una respuesta de error explicita:

```json
{
  "code": "INVALID_TAX_ID_FORMAT",
  "message": "taxId format must be NN-NNNNNNNN-N",
  "statusCode": 400
}
```

Esto dejaria alineados API y Lambda bajo la misma taxonomia.
