# Testing Strategy: The Pyramid

La calidad no se negocia. Marketplace Lite sigue una estrategia de testing rigurosa basada en la pirámide de automatización.

## 1. La Pirámide

| Capa | Foco | Herramientas | Mocking |
| :--- | :--- | :--- | :--- |
| **Domain** | Lógica pura, VOs, Entidades | Vitest | **Prohibido** |
| **Application** | Casos de Uso, Orquestación | Vitest | Fakes (In-Memory) |
| **Infrastructure** | Adaptadores (DB, APIs) | Vitest + Testcontainers | Real / Mocks de red |
| **Interfaces** | E2E, UI, Contratos | Playwright / MSW | Mínimo necesario |

## 2. Domain Testing (Unit)
Testea las reglas de negocio sin dependencias externas.
- Si una entidad no se puede testear sin mocks, está mal diseñada.
- Ejemplo: Validar que un descuento no supere el 50%.

## 3. Application Testing (Integration)
Testea el flujo completo de un caso de uso.
- Usa **Fakes** en lugar de mocks (ej: `InMemoryProductRepository`).
- Verifica que se emitan los Domain Events correctos.

```typescript
// place-order.test.ts
it('should place an order successfully', async () => {
  const repo = new InMemoryOrderRepository();
  const useCase = new PlaceOrderUseCase(repo);
  const result = await useCase.execute(validDTO);
  expect(result.ok).toBe(true);
  expect(repo.items).toHaveLength(1);
});
```

## 4. Infrastructure Testing
Testea adaptadores contra instancias reales (usando Docker/Testcontainers si es posible).
- No testear el framework (ej: no testear que Express rutea).
- Testear que la query SQL devuelve lo esperado.

## 5. UI Testing
- **Componentes:** Testear comportamiento, no implementación (Testing Library).
- **E2E:** Flujos críticos (Login -> Add to Cart -> Checkout).

## 6. Reglas de Oro
- **AAA Pattern:** Arrange, Act, Assert.
- **TDD:** Altamente recomendado para capas de Domain y Application.
- **Coverage:** No perseguir el 100%, pero sí asegurar el 100% de la lógica crítica de negocio.
