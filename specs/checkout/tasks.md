# Checkout - Atomic Tasks

## Phase 1: Domain Layer
- [ ] **T-001**: Definir la entidad `Cart` con propiedades: `id`, `userId`, `items` (CartItem[]), `createdAt`, `updatedAt`
- [ ] **T-002**: Definir la entidad `CartItem` con propiedades: `productId`, `quantity`, `unitPrice`
- [ ] **T-003**: Definir el aggregate root `Order` con propiedades: `id`, `userId`, `status`, `items`, `subtotal`, `tax`, `shipping`, `total`, `shippingAddress`, `paymentMethod`, `createdAt`, `updatedAt`, `statusHistory`
- [ ] **T-004**: Definir la entidad `OrderItem` con propiedades: `productId`, `productName`, `productSku`, `unitPrice`, `quantity`
- [ ] **T-005**: Definir repositorios interfaces: `CartRepository`, `OrderRepository`
- [ ] **T-006**: Definir Value Objects: `Money`, `ShippingAddress`, `OrderStatus` (con transiciones válidas)
- [ ] **T-007**: Definir Domain Events: `CartItemAdded`, `CartItemUpdated`, `CartItemRemoved`, `CheckoutInitiated`, `OrderCreated`, `OrderStatusChanged`
- [ ] **T-008**: Definir interfaces de servicios externos: `PaymentGateway`, `InventoryService`, `EmailService`

## Phase 2: Application Layer (Use Cases)
- [ ] **T-009**: Implementar `AddCartItem` use case con validación de stock via `InventoryService`
- [ ] **T-010**: Implementar `GetCart` use case
- [ ] **T-011**: Implementar `UpdateCartItem` use case
- [ ] **T-012**: Implementar `RemoveCartItem` use case
- [ ] **T-013**: Implementar `ClearCart` use case
- [ ] **T-014**: Implementar `ProcessCheckout` use case (reserva stock, procesa pago, crea orden, limpia carrito, emite evento)
- [ ] **T-015**: Implementar `ListOrders` use case con paginación y filtro por estado
- [ ] **T-016**: Implementar `GetOrderById` use case con verificación de ownership
- [ ] **T-017**: Implementar `UpdateOrderStatus` use case (para webhooks de pago / admin)

## Phase 3: Infrastructure Layer
- [ ] **T-018**: Implementar `CartRepository` usando Prisma ORM
- [ ] **T-019**: Implementar `OrderRepository` usando Prisma ORM
- [ ] **T-020**: Crear migraciones para tablas: `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`
- [ ] **T-021**: Implementar `InventoryService` adapter (integración con catálogo de productos)
- [ ] **T-022**: Implementar `PaymentGateway` adapter (Stripe/MercadoPago - mock para desarrollo)
- [ ] **T-023**: Implementar `EmailService` adapter (nodemailer / mock para desarrollo)
- [ ] **T-024**: Configurar Event Bus para Domain Events (in-memory para dev, Kafka/RabbitMQ para prod)

## Phase 4: Interfaces (HTTP Layer)
- [ ] **T-025**: Implementar controlador Express `CartController` (POST /cart/items, GET /cart, DELETE /cart/items/:productId)
- [ ] **T-026**: Implementar controlador Express `CheckoutController` (POST /checkout)
- [ ] **T-027**: Implementar controlador Express `OrderController` (GET /orders, GET /orders/:id)
- [ ] **T-028**: Configurar middleware de autenticación JWT para todas las rutas de checkout
- [ ] **T-029**: Configurar validación Zod middleware para POST /cart/items y POST /checkout
- [ ] **T-030**: Agregar documentación OpenAPI/JSDoc para todos los endpoints

## Phase 5: Testing
- [ ] **T-031**: Tests unitarios para Domain: Cart, CartItem, Order, OrderItem, Value Objects, OrderStatus transitions
- [ ] **T-032**: Tests unitarios para Use Cases: AddCartItem, GetCart, UpdateCartItem, RemoveCartItem, ClearCart
- [ ] **T-033**: Tests unitarios para Use Cases: ProcessCheckout (éxito, stock insuficiente, pago fallido, carrito vacío)
- [ ] **T-034**: Tests unitarios para Use Cases: ListOrders, GetOrderById, UpdateOrderStatus
- [ ] **T-035**: Tests de integración para Controladores HTTP (Cart, Checkout, Orders)
- [ ] **T-036**: Tests de integración para Repositories (Prisma)
- [ ] **T-037**: Configurar cobertura de tests en Vitest (target > 80%)

## Phase 6: Quality & DevOps
- [ ] **T-038**: Ejecutar y corregir `pnpm lint` en todo el código nuevo
- [ ] **T-039**: Ejecutar y corregir `pnpm typecheck` en todo el código nuevo
- [ ] **T-040**: Verificar que `pnpm sdd validate` pase exitosamente
- [ ] **T-041**: Actualizar CHANGELOG.md con cambios del feature checkout