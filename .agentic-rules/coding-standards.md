# Coding Standards: TypeScript & Functional Patterns

Marketplace Lite utiliza un estilo funcional-declarativo sobre uno imperativo, priorizando la inmutabilidad y la seguridad de tipos.

## 1. TypeScript Strict Config
Configuración obligatoria en `tsconfig.json`:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `exactOptionalPropertyTypes: true`

## 2. Manejo de Errores: Result Pattern
No usamos `try/catch` para lógica de negocio. Usamos el tipo `Result<Success, Failure>`.

```typescript
// @marketplace/shared
type Result<T, E = Error> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

// Ejemplo de uso
const getProduct = (id: string): Result<Product, ProductNotFoundError> => {
  const product = repo.findById(id);
  return product 
    ? { ok: true, value: product }
    : { ok: false, error: new ProductNotFoundError(id) };
};
```

## 3. Validación de Datos (Zod)
Zod es nuestra fuente de verdad para validación en runtime y tipado estático.

```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
});

export type ProductDTO = z.infer<typeof ProductSchema>;
```

## 4. Inmutabilidad
- Usa `readonly` para propiedades de clases y interfaces.
- Usa `as const` para configuraciones y objetos literales.
- Prefiere `map`, `filter`, `reduce` sobre `forEach` o bucles `for`.

## 5. Clean Code Essentials
- **Funciones Pequeñas:** Máximo 20 líneas.
- **Argumentos:** Máximo 3 por función (usa objetos para más).
- **Comentarios:** Solo para explicar el "por qué", nunca el "qué". El código debe ser auto-explicativo.
- **Early Returns:** Evita anidamiento de `if/else`.
