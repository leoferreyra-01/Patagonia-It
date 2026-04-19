# Arquitectura y decisiones tecnicas

## Resumen

El proyecto implementa una API NestJS con arquitectura hexagonal para separar reglas de negocio, casos de uso e infraestructura.

## Capas

### Dominio

Ubicacion: `src/domain`

Responsabilidades:
- Entidades del negocio (`Company`, `Transfer`)
- Puertos/contratos (`CompanyRepository`, `TransferRepository`)
- Tipos y catalogo de errores de dominio

### Aplicacion

Ubicacion: `src/application`

Responsabilidades:
- Casos de uso
- Orquestacion de reglas de negocio
- Validaciones de negocio previas a persistencia

### Infraestructura

Ubicacion: `src/infrastructure`

Responsabilidades:
- Adaptadores HTTP
- Persistencia JSON
- Integracion con Lambda / API Gateway

## Flujo principal

### Alta de empresa

1. `POST /api/companies` recibe el request.
2. `CompaniesController` delega en `CreateCompanyUseCase`.
3. El caso de uso valida formato y reglas de negocio.
4. `CompanyRepository` consulta duplicados por `taxId`.
5. Si no existe, se crea la entidad `Company` y se persiste.
6. El controller devuelve `201` con la empresa creada.

## Decisiones principales

### 1. Arquitectura hexagonal

Se eligio para evitar acoplamiento entre negocio, HTTP y persistencia. Esto permite cambiar JSON por otra tecnologia sin reescribir la logica de aplicacion.

### 2. Entidades orientadas a objetos

Las entidades usan clases y factory methods para encapsular estado y reglas basicas de construccion.

### 3. Persistencia en JSON con escritura atomica

Se utiliza archivo JSON por simplicidad del challenge. La escritura se hace en `.tmp` y luego `rename` para evitar corrupcion parcial.

### 4. Tests como contrato de comportamiento

Se cubren casos de uso y endpoints con tests unitarios y e2e para fijar comportamiento observable.

## Estrategia de versionado de API

### Estado actual

La API expone rutas bajo `/api`.

### Decision

Mientras no haya clientes externos productivos, se mantiene `/api` para no agregar ruido innecesario.

### Regla futura

Ante el primer cambio incompatible en contratos publicos, se recomienda migrar a `/api/v1` y congelar el contrato anterior durante una ventana de transicion.

## Integracion Lambda

La Lambda actual replica el comportamiento de alta de company via API Gateway reutilizando `CreateCompanyUseCase`, para mantener paridad funcional entre ambos entrypoints.
