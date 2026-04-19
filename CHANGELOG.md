# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

El formato esta inspirado en Keep a Changelog y versionado semantico.


## [1.0.0] - 2026-04-18

### Added

- Pipeline de CI con GitHub Actions en `.github/workflows/ci.yml`.
- Estandarizacion de documentacion operativa.
- Guia de contribucion en `CONTRIBUTING.md`.
- Politica de cambios de contrato API en `docs/api-change-policy.md`.
- API NestJS con endpoints de health, creacion de company y reportes.
- Arquitectura hexagonal (domain/application/infrastructure).
- Persistencia JSON y test suite unit + e2e.
- Validacion global con `ValidationPipe` y endpoint de listado con paginacion/filtros.
