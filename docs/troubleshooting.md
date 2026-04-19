# Resolucion de problemas

## La API no inicia

Sintomas:

- El proceso termina al iniciar
- El puerto 3000 no responde

Chequeos:

1. Verificar que la version de Node (`node -v`) sea 24.x
2. Ejecutar `npm install`
3. Reintentar `npm run start:dev`
4. Confirmar que el puerto 3000 este libre

## La validacion falla de forma inesperada

Sintomas:

- `400` con `VALIDATION_ERROR`

Chequeos:

1. Confirmar el formato del payload y los campos requeridos
2. Confirmar que el formato de `taxId` sea `NN-NNNNNNNN-N`
3. Para el endpoint de listado, verificar que `limit` y `offset` sean enteros
4. Para `GET /api/companies/with-transfers/last-month`, usar `status` valido (`COMPLETED`, `PENDING`, `FAILED`)
5. Quitar campos desconocidos del request payload

## Conflicto por taxId duplicado

Sintomas:

- `409 Conflict` en `POST /api/companies`

Causa:

- El `taxId` ya existe en el store de companies

Acciones:

1. Usar un taxId nuevo
2. Revisar `companies.json` en el directorio de datos activo

## Creacion de transferencia devuelve 404

Sintomas:

- `POST /api/transfers` responde `404`

Causa:

- El `companyId` no existe en `companies.json`

Codigo esperado:

- `COMPANY_ID_NOT_FOUND`

Acciones:

1. Verificar el `companyId` enviado en el request
2. Confirmar existencia de la empresa en el directorio de datos activo
3. Reintentar con un `companyId` valido

## Resultados vacios al listar companies

Sintomas:

- `GET /api/companies` devuelve `items` vacio

Chequeos:

1. Quitar filtros para verificar si hay datos base
2. Validar valores de filtros (`type`, `country`)
3. Revisar paginacion (`offset` puede saltar todos los registros)

## Endpoints de joined/transfers devuelven 500

Sintomas:

- `GET /api/companies/joined-last-month` o `GET /api/companies/with-transfers/last-month` devuelve 500

Chequeos:

1. Confirmar que los archivos JSON de storage sean JSON valido
2. Verificar permisos de lectura en el directorio de datos
3. Ejecutar los unit tests relacionados a repository y use cases

Codigos a observar:

- `JOINED_LAST_MONTH_FETCH_FAILED`
- `WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED`
- `PERSISTED_DATA_INVALID`
- `PERSISTENCE_READ_FAILED`

Decision operativa:

- Si aparece `PERSISTENCE_READ_FAILED` (503): reintentar con backoff y revisar disponibilidad del storage.
- Si aparece `PERSISTED_DATA_INVALID` (500): detener reintentos y reparar contenido JSON.

## Fallas de tests luego de cambios de interfaz

Sintomas:

- Errores de TypeScript en unit mocks (faltan metodos del repository)

Causa:

- El contrato del repository se amplio pero los mocks viejos no se actualizaron

Acciones:

1. Agregar metodos faltantes en los objetos repository mockeados
2. Re-ejecutar `npm run test`

## El coverage bajo de forma inesperada

Chequeos:

1. Ejecutar `npm run test:cov`
2. Revisar el reporte de lineas no cubiertas
3. Agregar tests focalizados en el unit spec correspondiente antes de refactors grandes

## Readiness devuelve 503

Sintomas:

- `GET /api/health/ready` responde `503`
- Codigo esperado: `READINESS_PERSISTENCE_CHECK_FAILED`

Chequeos:

1. Verificar permisos de lectura/escritura en `DATA_DIR`
2. Verificar espacio en disco y estado del filesystem
3. Verificar consistencia JSON en archivos persistidos

Acciones:

1. Sacar instancia de rotacion mientras dure el fallo
2. Corregir causa de storage
3. Confirmar recuperacion con `GET /api/health/ready` en `200`
