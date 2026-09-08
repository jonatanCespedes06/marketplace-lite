# Code Review: Calidad y Arquitectura

El Code Review en Marketplace Lite no es solo una formalidad, es una **puerta de calidad** que asegura que el código cumpla con los estándares de Clean Architecture, DDD y los patrones establecidos. Su objetivo es validar diseño, seguridad y mantenimiento, no encontrar errores de sintaxis (para eso están los linters).

## 1. Checklist Obligatorio por PR

Cada pull request debe pasar por los siguientes puntos. Marcar como `Listo` o `Necesita cambios`.

### 📐 Arquitectura y Diseño
- [ ] **Dependency Rule:** Verificar que las dependencias fluyen hacia adentro (Domain ← Application ← Infrastructure ← Interfaces). No debe haber importaciones circulares.
- [ ] **Clean Architecture:** Confirmar que la lógica de negocio crítica reside en la capa de **Domain** y **Application**, no en los controladores (Interfaces).
- [ ] **DDD Validity:** 
    - ¿Los Value Objects son inmutables (`readonly`)?
    - ¿Las entidades tienen comportamiento o son anémicas?
    - ¿Los Aggregates tienen límites (bounded contexts) claros?
- [ ] **Pattern Result/Either:** Validar que el manejo de errores use el patrón `Result<T, E>` y no excepciones para el control de flujo normal.

### 🧪 Testing
- [ ] **Cobertura de Dominio:** ¿Las reglas de negocio (Domain) tienen tests unitarios sin mocks externos?
- [ ] **Fakes vs Mocks:** En la capa Application, ¿se usan Fakes (repositorios en memoria) en lugar de Mocks estrictos?
- [ ] **Edge Cases:** ¿Se han probado los casos límite (errores, vacíos, valores nulos)?
- [ ] **Tests Integrados:** Para Infrastructure, ¿se validan los adaptadores contra la realidad (o Testcontainers)?

### 🔒 Seguridad
- [ ] **Validación Zod:** ¿Toda entrada HTTP (body, params, query) ha sido validada con Zod antes de procesarse?
- [ ] **Ownership:** ¿Se verifica que el usuario actual tiene permiso para la acción (update/delete) en los casos de uso?
- [ ] **Input Sanitization:** ¿Se están sanitizando strings para prevenir XSS si se muestran en UI?

### 📦 Calidad de Código
- [ ] **TypeScript Strict:** ¿El código respeta `strict: true`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`?
- [ ] **Naming Convention:** ¿Se usa `camelCase` para variables/funciones y `PascalCase` para clases/archivos?
- [ ] **Documentación:** ¿Los casos de uso y funciones complejas tienen comentarios explicando el "por qué"?

## 2. Etiquetas (Labels) Estandarizadas

Utilizar siempre estas etiquetas al crear la PR. Ayudan a la automatización y al triaje.

| Etiqueta | Descuándo usarla |
| :--- | :--- |
| `feat` | Nueva funcionalidad para el negocio. |
| `fix` | Corrección de un bug reportado o detectado. |
| `refactor` | Mejora interna del código sin cambio de comportamiento externo. |
| `docs` | Actualización o creación de documentación/archivos `.md`. |
| `perf` | Cambio orientado a mejorar rendimiento. |
| `security` | Parcheo de vulnerabilidades o implementación de nuevas reglas de seguridad. |
| `breaking-change` | Cambios que requieren migración en el consumidor (ej: cambio de API, esquema DB). |

## 3. Proceso de Pull Request

1.  **Self-Review Obligatorio:** El autor **debe** revisar su propio código antes de solicitar la revisión externa. Buscar las propias faltas es buena práctica.
2.  **Commit atómico:** Un commit debe hacer una sola cosa. Los mensajes deben seguir el formato: `<tipo>(<scope>): <descripción>` (ej: `feat(catalog): add product search [SPEC-1.2]`).
3.  **Estado de CI:** La PR **no debe** ser revisada si el pipeline de `lint`, `type-check` o `test` está en rojo.
4.  **Aprobación:** Se requiere al menos una aprobación de un miembro del equipo (preferiblemente senior o owner) antes de mergear.
5.  **Conventional Commits:** Usar el formato definido para que los agentes de lanzamiento (MCP) puedan generar changelogs automáticamente.

## 4. Feedback Constructivo y Efectivo

### Malos ejemplos de comentario en review:
> "Esto está mal hecho."
> "No entiendo por qué pusiste esto aquí."
> "Arregla esto."

### Mejores ejemplos:
> "Moveré esta lógica a la entidad `Product` porque es una regla de negocio que se repetirá en el `CheckoutUseCase` y el `AdminPanel`. De esta manera mantenemos la capa de Application limpia."
> "Sugiero usar el patrón `Result` aquí en lugar de lanzar un `Exception`. Así el caso de uso queda más predecible y tipado estrictamente."
> "He añadido un test unitario en `product.entity.spec.ts` para cubrir el caso de límite de stock. Fíjate en el setup que usé con `InMemoryProductRepository`."

## 5. Integración con Agentes MCP (IA)

- **Pass Automático:** Los agentes pueden realizar un "pass" inicial revisando:
    - ¿Hay imports cruzados prohibidos?
    - ¿Todos los DTOs tienen validación Zod?
    - ¿El patrón Result está siendo usado?
- **Referencia Cruzada:** El agente debe mencionar la regla específica violada (ej: *"Violación de `.agentic-rules/coding-standards.md: validación de entrada"`*).
- **No reemplaza al humano:** El agente marca los problemas obvios, pero el revisor humano valida la arquitectura y el negocio.

## 6. Checklist Rápido para el Revisor (1 minuto)

Si tienes poco tiempo, asegúrate mínimo de:
1.  El `Result` pattern se usa en la firma de la función.
2.  No hay `console.log` en el código (usar logger estructurado).
3.  La etiqueta `feat` o `fix` está presente.
4.  El título de la PR es claro y descriptivo.