# Product Catalog - Atomic Tasks

## Phase 1: Domain Layer
- [ ] **T-001**: Definir la entidad `Product` con propiedades: `id`, `name`, `price`, `sku`, `createdAt`, `updatedAt`
- [ ] **T-002**: Definir el repositorio `ProductRepository` interface con métodos: `findAll`, `findById`, `create`
- [ ] **T-003**: Definir los Value Objects necesarios (ej. `ProductSku` con validación de formato)

## Phase 2: Application Layer (Use Cases)
- [ ] **T-004**: Implementar `ListProducts` use case con paginación
- [ ] **T-005**: Implementar `CreateProduct` use case con validación Zod
- [ ] **T-006**: Implementar `GetProductById` use case con manejo de "not found"

## Phase 3: Infrastructure Layer
- [ ] **T-007**: Implementar `ProductRepository` usando Prisma ORM
- [ ] **T-008**: Configurar conexión a base de datos (PostgreSQL)
- [ ] **T-009**: Crear migraciones iniciales para la tabla `products`

## Phase 4: Interfaces (HTTP Layer)
- [ ] **T-010**: Implementar controladores Express para los 3 endpoints (GET /products, POST /products, GET /products/:id)
- [ ] **T-011**: Configurar validación Zod middleware para POST /products
- [ ] **T-012**: Agregar documentación de rutas y schemas OpenAPI/JSDoc

## Phase 5: Testing
- [ ] **T-013**: Escribir tests unitarios para los use cases (sin mocks, pure domain)
- [ ] **T-014**: Escribir tests de integración para los controladores HTTP
- [ ] **T-015**: Configurar cobertura de tests en Vitest

## Phase 6: Quality & DevOps
- [ ] **T-016**: Ejecutar y corregir `pnpm lint` en todo el código nuevo
- [ ] **T-017**: Ejecutar y corregir `pnpm typecheck` en todo el código nuevo
- [ ] **T-018**: Verificar que `pnpm sdd validate` pase exitosamente