# Architecture: Clean Architecture & DDD

Marketplace Lite sigue los principios de **Clean Architecture** y **Domain-Driven Design (DDD)** para asegurar desacoplamiento, testabilidad y mantenibilidad.

## 1. Capas del Sistema (The Dependency Rule)
Las dependencias solo pueden apuntar hacia adentro. El **Domain** es el núcleo y no conoce nada de las capas exteriores.

```
Interfaces (Web/API) → Infrastructure (Adapters) → Application (Use Cases) → Domain (Core)
```

### 1.1 Domain (Núcleo)
Contiene la lógica de negocio pura, independiente de frameworks.
- **Entities:** Objetos con identidad propia (ej: `Product`, `Order`).
- **Value Objects:** Objetos definidos por sus atributos, inmutables (ej: `Price`, `Email`).
- **Aggregates:** Grupos de objetos que se tratan como una unidad (ej: `Order` + `OrderItems`).
- **Domain Events:** Notificaciones de cambios significativos (ej: `OrderPlaced`).
- **Repository Ports:** Interfaces que definen cómo se guardan/recuperan los datos.

### 1.2 Application (Casos de Uso)
Orquestan el flujo de datos desde/hacia el dominio.
- **Use Cases:** Implementan la lógica de aplicación (ej: `CheckoutUseCase`).
- **DTOs:** Objetos de transferencia de datos para entrada/salida.
- **Services:** Lógica que no encaja en una entidad pero pertenece a la aplicación.

### 1.3 Infrastructure (Adaptadores)
Implementaciones técnicas de los puertos definidos en el dominio.
- **Repositories:** Implementaciones concretas (TypeORM, Prisma, In-Memory).
- **External Services:** Adaptadores para APIs externas (Stripe, Email Services).
- **Persistence:** Configuración de base de datos.

### 1.4 Interfaces (Entrada/Salida)
Puntos de contacto con el mundo exterior.
- **HTTP:** Controladores Express/Fastify.
- **UI:** Componentes React.
- **CLI:** Scripts de mantenimiento.

## 2. Flujo de Datos
1. El **Controller** recibe un Request.
2. Valida el input con **Zod**.
3. Llama al **Use Case**.
4. El **Use Case** pide datos al **Repository** (Puerto).
5. El **Repository** (Adaptador) devuelve una **Entidad**.
6. El **Use Case** ejecuta lógica en la **Entidad**.
7. El **Use Case** persiste cambios via **Repository**.
8. El **Use Case** devuelve un **Result** al **Controller**.

## 3. Reglas de Oro
- **No exceptions for flow control:** Usa el patrón `Result<T, E>` (ver `coding-standards.md`).
- **Anemic Domain Models:** ¡Prohibido! Las entidades deben tener comportamiento, no solo getters/setters.
- **Strict Typing:** No se permite `any`. Uso obligatorio de `readonly` en Value Objects.
