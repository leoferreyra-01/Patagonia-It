# Politica de cambios de API

## Objetivo

Alinear al equipo sobre como proponer y comunicar cambios de contrato en endpoints publicos.

## Tipos de cambio

### Cambio no breaking

Cambios compatibles hacia atras.

Ejemplos:

- Agregar un campo opcional en response.
- Agregar un nuevo endpoint.
- Mejorar mensajes de error sin cambiar estructura.

### Cambio breaking

Cambios que pueden romper integraciones existentes.

Ejemplos:

- Eliminar o renombrar campos en response.
- Cambiar formato o tipo de un campo existente.
- Cambiar comportamiento por defecto sin compatibilidad.

## Reglas obligatorias para cambios de contrato

1. Documentar el cambio en `docs/`.
2. Registrar entrada en `CHANGELOG.md`.
3. Comunicar impacto y plan de migracion en el PR.
4. Evaluar versionado de API:
	- Si no hay impacto externo: mantener `/api`.
	- Si hay impacto externo breaking: planificar `/api/v1`.

## Criterios de aprobacion

1. Tests actualizados y pasando.
2. Swagger actualizado si aplica.
3. Documentacion actualizada en `docs/`.
4. Changelog actualizado.
