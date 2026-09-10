# Checkout - Technical Specification

## API Contracts

### POST /cart/items
Agrega o actualiza un item en el carrito.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Request Body (Zod validation):**
```typescript
const AddCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});
```

**Responses:**
- `200 OK`: `{ data: CartDTO }` (carrito actualizado)
- `400 Bad Request`: Datos de validación inválidos
- `401 Unauthorized`: Token inválido o ausente
- `404 Not Found`: Producto no existe
- `409 Conflict`: Stock insuficiente

---

### GET /cart
Obtiene el carrito actual del usuario.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Responses:**
- `200 OK`: `{ data: CartDTO }`
- `401 Unauthorized`: Token inválido o ausente

---

### DELETE /cart/items/:productId
Elimina un item del carrito.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Path Parameters:**
- `productId` (string, uuid): ID del producto a eliminar

**Responses:**
- `200 OK`: `{ data: CartDTO }` (carrito actualizado)
- `401 Unauthorized`: Token inválido o ausente
- `404 Not Found`: Item no está en el carrito

---

### POST /checkout
Procesa el checkout y crea una orden.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Request Body (Zod validation):**
```typescript
const CheckoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).toUpperCase(), // ISO 3166-1 alpha-2
  }),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'paypal']),
  paymentDetails: z.object({}).passthrough(), // Detalles específicos por método
});
```

**Responses:**
- `201 Created`: `{ data: OrderDTO }`
- `400 Bad Request`: Datos de validación inválidos
- `401 Unauthorized`: Token inválido o ausente
- `409 Conflict`: Carrito vacío o stock insuficiente en algún item
- `422 Unprocessable Entity`: Error de procesamiento de pago

---

### GET /orders
Lista las órdenes del usuario autenticado.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Query Parameters:**
- `page` (number, opcional): Número de página. Default: 1
- `limit` (number, opcional): Elementos por página. Default: 10, Máximo: 50
- `status` (string, opcional): Filtrar por estado (`pending_payment`, `paid`, `shipped`, `delivered`, `cancelled`)

**Responses:**
- `200 OK`: `{ data: OrderDTO[], meta: { page: number, limit: number, total: number } }`
- `401 Unauthorized`: Token inválido o ausente
- `400 Bad Request`: Parámetros de paginación inválidos

---

### GET /orders/:id
Obtiene el detalle de una orden específica.

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Path Parameters:**
- `id` (string, uuid): ID de la orden

**Responses:**
- `200 OK`: `{ data: OrderDetailDTO }`
- `401 Unauthorized`: Token inválido o ausente
- `403 Forbidden`: La orden no pertenece al usuario
- `404 Not Found`: Orden no encontrada

---

## Esquemas Zod (Validación)

```typescript
// Cart
export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().positive(),
});

export const CartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type CartDTO = z.infer<typeof CartSchema>;

// Orders
export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().positive(),
});

export const ShippingAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string().length(2),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled']),
  items: z.array(OrderItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statusHistory: z.array(z.object({
    status: z.string(),
    timestamp: z.string().datetime(),
    note: z.string().optional(),
  })),
});

export type OrderDTO = z.infer<typeof OrderSchema>;

export const OrderDetailSchema = OrderSchema.extend({
  // Extiende con campos adicionales si necesarios para el detalle
});

export type OrderDetailDTO = z.infer<typeof OrderDetailSchema>;
```

---

## Capa Domain

### Entities
- **Cart**: Entity con `id`, `userId`, `items` (CartItem[]), `createdAt`, `updatedAt`
- **CartItem**: Entity con `productId`, `quantity`, `unitPrice` (precio al momento de agregar)
- **Order**: Aggregate Root con `id`, `userId`, `status`, `items`, `subtotal`, `tax`, `shipping`, `total`, `shippingAddress`, `paymentMethod`, `createdAt`, `updatedAt`, `statusHistory`
- **OrderItem**: Entity con `productId`, `productName`, `productSku`, `unitPrice`, `quantity`

### Value Objects
- **Money**: Value object para manejo de montos monetarios (cents, currency)
- **ShippingAddress**: Value object con validación de campos requeridos
- **OrderStatus**: Enum/VO para estados válidos y transiciones permitidas

### Domain Events
- `CartItemAdded`: Cuando se agrega item al carrito
- `CartItemUpdated`: Cuando cambia cantidad
- `CartItemRemoved`: Cuando se elimina item
- `CheckoutInitiated`: Cuando inicia proceso de checkout
- `OrderCreated`: Cuando se crea la orden exitosamente
- `OrderStatusChanged`: Cuando cambia estado de la orden

---

## Capa Application (Use Cases)

### Cart Use Cases
- **AddCartItem**: Input `{ userId, productId, quantity }` → Output `Result<CartDTO, CartError>`
- **GetCart**: Input `{ userId }` → Output `Result<CartDTO, CartNotFoundError>`
- **UpdateCartItem**: Input `{ userId, productId, quantity }` → Output `Result<CartDTO, CartError>`
- **RemoveCartItem**: Input `{ userId, productId }` → Output `Result<CartDTO, CartError>`
- **ClearCart**: Input `{ userId }` → Output `Result<void, CartError>`

### Checkout Use Cases
- **ProcessCheckout**: Input `{ userId, shippingAddress, paymentMethod, paymentDetails }` → Output `Result<OrderDTO, CheckoutError>`
  - Valida carrito no vacío
  - Reserva stock (todo o nada)
  - Calcula totales (subtotal, impuestos, envío)
  - Crea orden con estado `pending_payment`
  - Limpia carrito
  - Emite evento `OrderCreated`

### Order Use Cases
- **ListOrders**: Input `{ userId, page?, limit?, status? }` → Output `Result<Paginated<OrderDTO>, OrderError>`
- **GetOrderById**: Input `{ userId, orderId }` → Output `Result<OrderDetailDTO, OrderNotFoundError>`
- **UpdateOrderStatus**: (Internal/Admin) Input `{ orderId, newStatus, note? }` → Output `Result<OrderDTO, OrderError>`

---

## Infraestructura

### Repositorios
- `CartRepository`: `findByUserId(userId)`, `save(cart)`, `delete(userId)`
- `OrderRepository`: `findByUserId(userId, pagination)`, `findById(id)`, `save(order)`, `findByIdForUpdate(id)` (con lock optimista)

### Servicios Externos
- `PaymentGateway`: Interface para procesar pagos (implementar por proveedor: Stripe, MercadoPago, etc.)
- `InventoryService`: Interface para reservar/liberar/confirmar stock
- `EmailService`: Para notificaciones de confirmación de orden

### Base de Datos
- Tabla `carts`: `id`, `user_id`, `created_at`, `updated_at`
- Tabla `cart_items`: `id`, `cart_id`, `product_id`, `quantity`, `unit_price`
- Tabla `orders`: `id`, `user_id`, `status`, `subtotal`, `tax`, `shipping`, `total`, `shipping_address` (JSON), `payment_method`, `created_at`, `updated_at`
- Tabla `order_items`: `id`, `order_id`, `product_id`, `product_name`, `product_sku`, `unit_price`, `quantity`
- Tabla `order_status_history`: `id`, `order_id`, `status`, `note`, `created_at`

---

## Diagramas de Secuencia

### Flujo de agregar al carrito:
```sequence
User -> API: POST /cart/items {productId, quantity}
API -> Auth: Validar JWT
Auth -> API: User ID
API -> ProductService: Verificar stock
ProductService -> API: Stock disponible
API -> CartRepository: findByUserId / create
CartRepository -> DB: Buscar/crear carrito
API -> Cart: addItem(productId, quantity, unitPrice)
Cart -> API: Cart actualizado
API -> CartRepository: save(cart)
CartRepository -> DB: Persistir
API -> User: 200 OK {cart}
```

### Flujo de checkout:
```sequence
User -> API: POST /checkout {shippingAddress, paymentMethod, paymentDetails}
API -> Auth: Validar JWT
Auth -> API: User ID
API -> CartRepository: findByUserId(userId)
CartRepository -> API: Cart con items
API -> InventoryService: reserveStock(items)
alt Stock disponible
    InventoryService -> API: Stock reservado
    API -> PaymentGateway: processPayment(total, paymentDetails)
    alt Pago exitoso
        PaymentGateway -> API: Confirmación
        API -> OrderRepository: save(order)
        OrderRepository -> DB: Persistir orden
        API -> CartRepository: delete(userId)
        CartRepository -> DB: Limpiar carrito
        API -> EventBus: emit OrderCreated
        API -> User: 201 Created {order}
    else Pago fallido
        PaymentGateway -> API: Error
        API -> InventoryService: releaseStock(items)
        API -> User: 422 Error de pago
    end
else Stock insuficiente
    InventoryService -> API: Error stock
    API -> User: 409 Conflict stock insuficiente
end
```

### Flujo de listar órdenes:
```sequence
User -> API: GET /orders?page=1&limit=10
API -> Auth: Validar JWT
Auth -> API: User ID
API -> OrderRepository: findByUserId(userId, pagination)
OrderRepository -> DB: Query con paginación
DB -> OrderRepository: Orders + total
OrderRepository -> API: PaginatedResult
API -> User: 200 OK {data: orders, meta}
```