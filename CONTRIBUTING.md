# Guia de contribucion

## Objetivo

Definir un flujo simple y repetible para proponer cambios sin romper contratos ni calidad.

## Flujo de trabajo

1. Crear rama desde `main`.
2. Nombrar la rama con prefijo descriptivo.
3. Abrir Pull Request hacia `main`.

Ejemplos de nombres de rama:

- `feat/list-companies-pagination`
- `fix/company-validation-country`
- `docs/runbook-updates`

## Convencion de commits

Usar el formato que ya venimos usando en el repo: prefijo entre corchetes en mayusculas + mensaje corto.

Formato:

- `[TIPO] descripcion breve`

Tipos sugeridos:

- `ADD`: nuevas funcionalidades, endpoints, tests o docs nuevas
- `FIX`: correcciones de bugs
- `REF`: refactors sin cambio funcional
- `DOC`: cambios de documentacion
- `CHORE`: tareas de mantenimiento

Ejemplos:

- `[ADD] Implement ListCompanies use case with filtering and pagination`
- `[ADD] Tests for coverage`
- `[FIX] Handle invalid taxId format on create-company`
- `[DOC] Update troubleshooting guide`

## Checklist antes de abrir PR

1. Ejecutar `npm run test`.
2. Ejecutar `npm run test:cov`.
3. Ejecutar `npm run build`.
4. Verificar que Swagger cargue y rutas principales respondan.
5. Actualizar documentacion si cambia comportamiento publico.

## Criterios para Pull Request

1. Explicar el problema y la solucion.
2. Indicar impacto en endpoints/contratos.
3. Adjuntar evidencia de tests (comandos ejecutados).
4. Mantener PRs pequenas y enfocadas.

## Cambios de contrato API

Si el cambio impacta requests o responses publicos:

1. Actualizar docs afectadas en `docs/`.
2. Registrar el cambio en `CHANGELOG.md`.
3. Definir si es breaking change y proponer versionado (`/api/v1` cuando corresponda).
4. Incluir plan de migracion en la descripcion del PR.
