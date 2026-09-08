# Scaffolding: Estructura y Convenciones

Estructura estandarizada para garantizar que cualquier agente o desarrollador sepa dónde encontrar cada pieza del rompecabezas.

## 1. Estructura de Directorios (Monorepo)

```text
/packages
  /backend
    /src
      /domain          <-- Entidades, VOs, Domain Events, Repositories (Interfaces)
      /application     <-- Use Cases, DTOs, App Services
      /infrastructure  <-- Repositories (Impl), External Adapters, DB
      /interfaces
        /http          <-- Controllers, Routes, Middlewares
  /frontend
    /src
      /app             <-- Configuración global, providers, routes
      /features        <-- Slices de negocio (ej: /cart, /catalog)
      /shared          <-- Componentes UI (Design System), hooks, utils
  /shared
    /src               <-- Tipos compartidos, constantes, validaciones Zod
```

## 2. Convenciones de Naming
- **Archivos:** `kebab-case.ts` (ej: `create-user.use-case.ts`).
- **Clases/Interfaces:** `PascalCase` (ej: `ProductRepository`).
- **Variables/Funciones:** `camelCase` (ej: `findProductById`).
- **Tests:** `name.test.ts` o `name.spec.ts`.

## 3. Boilerplate: Caso de Uso (Backend)

```typescript
// packages/backend/src/application/checkout/place-order.use-case.ts
import { Result } from '@shared/result';
import { Order } from '../../domain/entities/order';
import { IOrderRepository } from '../../domain/repositories/order.repository';

export class PlaceOrderUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order, DomainError>> {
    // 1. Lógica de orquestación
    // 2. Llamada a dominio
    // 3. Persistencia
  }
}
```

## 4. Boilerplate: Feature (Frontend)

```text
/features/cart
  /components     <-- Componentes específicos del carrito
  /hooks          <-- Lógica de estado/fetching del carrito
  /services       <-- Llamadas a API
  /index.ts       <-- Public API de la feature
```

## 5. Reglas de Importación
- Usa **Path Aliases** (ej: `@domain/`, `@application/`).
- No permitidos los imports relativos que suban más de 2 niveles (`../../../../`).
- El `shared` package se importa vía workspace: `import { ... } from '@marketplace/shared'`.
