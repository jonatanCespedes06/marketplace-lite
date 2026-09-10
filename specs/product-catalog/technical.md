# Product Catalog - Technical Specification

## API Contracts

### GET /products
Obtiene la lista de productos con paginación opcional.

**Query Parameters:**
- `page` (number, opcional): Número de página. Default: 1
- `limit` (number, opcional): Elementos por página. Default: 10, Máximo: 50

**Responses:**
- `200 OK`: `{ data: ProductDTO[], meta: { page: number, limit: number, total: number } }`
- `400 Bad Request`: Parámetros de paginación inválidos

### POST /products
Crea un nuevo producto.

**Request Body (Zod validation):**
```typescript
const ProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
});
```

**Responses:**
- `201 Created`: `{ data: ProductDTO }`
- `400 Bad Request`: Datos de validación inválidos (details de Zod)
- `409 Conflict`: SKU ya existe en el sistema

### GET /products/:id
Obtiene un producto por su ID.

**Path Parameters:**
- `id` (string, uuid): El identificador único del producto

**Responses:**
- `200 OK`: `{ data: ProductDTO }`
- `404 Not Found`: Producto no encontrado

## Esquemas Zod (Validación)

```typescript
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
});

export type ProductDTO = z.infer<typeof ProductSchema>;
```

## Capa Domain

### Entities
- **Product**: Entity with `id`, `name`, `price`, `sku`, `createdAt`, `updatedAt`
- Es puro TypeScript, sin dependencias de infraestructura.

### Value Objects
- **ProductSku**: Validación y lógica de negocio relacionada con SKU.

## Capa Application (Use Cases)

### ListProducts
- Input: `{ page?: number, limit?: number }`
- Output: `Result<ProductDTO[], ProductListError>`

### CreateProduct
- Input: `{ name: string, price: number, sku: string }` (validated with Zod)
- Output: `Result<ProductDTO, CreateProductError>`

### GetProductById
- Input: `productId: string` (uuid)
- Output: `Result<ProductDTO, ProductNotFoundError>`

## Infraestructura

### Repositorio
- `ProductRepository` interface con métodos: `findAll(pagination)`, `findById(id)`, `create(product)`
- Implementación en `infrastructure/database` usando tu ORM de elección (Prisma, Drizzle, etc.)

## Diagramas de Secuencia

### Flujo de creación de producto:
```sequence
User -> API: POST /products {name, price, sku}
API -> Zod: Validar datos
Zod -> API: Datos válidos / Errores de validación
API -> Repository: create(product)
Repository -> DB: Persistir producto
DB -> Repository: Producto guardado
Repository -> API: Producto creado
API -> User: 201 Created {product}
```

### Flujo de obtención de producto:
```sequence
User -> API: GET /products/:id
API -> Repository: findById(id)
Repository -> DB: Buscar producto
DB -> Repository: Producto / null
Repository -> API: Producto encontrado / null
API -> Zod: Mapear a DTO
API -> User: 200 OK {product} o 404 Not Found
```