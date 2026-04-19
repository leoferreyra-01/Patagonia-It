# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

El formato esta inspirado en Keep a Changelog y versionado semantico.


## [1.0.0] - 2026-04-18

- Endpoint productivo `POST /api/transfers` con DTOs, Swagger y persistencia JSON.
- Validacion de existencia de empresa al crear transferencias (`companyId`) con respuesta deterministica `404` (`COMPANY_ID_NOT_FOUND`).
- Filtro opcional `status` en `GET /api/companies/with-transfers/last-month` con soporte para `COMPLETED`, `PENDING` y `FAILED`.
- Readiness de dependencias en `GET /api/health/ready` y codigos de error operativos de persistencia.
- Hook `pre-commit` con Husky para ejecutar `dependency-check`, tests y coverage antes de commitear.
- Pipeline de CI con GitHub Actions en `.github/workflows/ci.yml`.
- Estandarizacion de documentacion operativa.
- Guia de contribucion en `CONTRIBUTING.md`.
- Politica de cambios de contrato API en `docs/api-change-policy.md`.
- API NestJS con endpoints de health, creacion de company y reportes.
- Arquitectura hexagonal (domain/application/infrastructure).
- Persistencia JSON y test suite unit + e2e.
- Validacion global con `ValidationPipe` y endpoint de listado con paginacion/filtros.
