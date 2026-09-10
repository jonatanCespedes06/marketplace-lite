# Checkout - Functional Specification

## Historias de Usuario

### HC-001: Gestionar carrito de compras
- **Descripción:** El usuario puede agregar, actualizar y eliminar productos de su carrito de compras.
- **Precondiciones:** El usuario está autenticado y los productos existen en el catálogo.
- **Flujo principal:**
  1. El usuario agrega un producto al carrito especificando cantidad.
  2. El sistema valida que el producto existe y hay stock disponible.
  3. Si el producto ya está en el carrito, se actualiza la cantidad.
  4. El usuario puede ver el contenido del carrito con subtotales.
  5. El usuario puede actualizar cantidades o eliminar items.
- **Postcondiciones:** El carrito refleja los cambios y persiste entre sesiones.
- **Criterios de aceptación:**
  - [ ] Agregar producto al carrito valida existencia y stock.
  - [ ] Actualizar cantidad recalcula subtotales.
  - [ ] Eliminar item remueve completamente del carrito.
  - [ ] Carrito persiste por usuario autenticado.
  - [ ] Retorna error si stock insuficiente.

### HC-002: Procesar checkout
- **Descripción:** El usuario puede finalizar su compra convirtiendo el carrito en una orden.
- **Precondiciones:** El usuario tiene items en el carrito con stock disponible.
- **Flujo principal:**
  1. El usuario inicia el checkout proporcionando dirección de envío y método de pago.
  2. El sistema valida la información de envío y pago.
  3. Se reserva el stock de los productos en el carrito.
  4. Se crea la orden con estado `pending_payment`.
  5. Se limpia el carrito del usuario.
  6. Se retorna la orden creada con instrucciones de pago.
- **Postcondiciones:** La orden está creada y el stock reservado temporalmente.
- **Criterios de aceptación:**
  - [ ] Valida dirección de envío completa (calle, ciudad, código postal, país).
  - [ ] Valida método de pago (tarjeta, transferencia, etc.).
  - [ ] Reserva stock atómicamente (todo o nada).
  - [ ] Crea orden con items, totales y timestamps.
  - [ ] Limpia carrito tras checkout exitoso.
  - [ ] Retorna error si algún item no tiene stock.

### HC-003: Consultar historial de órdenes
- **Descripción:** El usuario puede ver su historial de órdenes y el detalle de una orden específica.
- **Precondiciones:** El usuario está autenticado y tiene al menos una orden.
- **Flujo principal:**
  1. El usuario solicita su lista de órdenes con paginación opcional.
  2. El sistema retorna órdenes ordenadas por fecha descendente.
  3. El usuario puede consultar el detalle de una orden por ID.
  4. El detalle incluye items, precios, estado, dirección y timeline de estados.
- **Postcondiciones:** El usuario visualiza sus órdenes y detalles.
- **Criterios de aceptación:**
  - [ ] Lista órdenes con paginación (page, limit).
  - [ ] Ordena por fecha de creación descendente.
  - [ ] Detalle incluye: items, subtotal, impuestos, envío, total.
  - [ ] Muestra estado actual y historial de cambios de estado.
  - [ ] Retorna 404 si la orden no pertenece al usuario.

## Criterios de Aceptación Globales
- Todas las operaciones requieren autenticación (JWT).
- Los precios y totales se calculan en el backend (fuente de verdad).
- El stock se reserva solo durante el checkout, se confirma al pagar.
- Los estados de orden: `pending_payment` → `paid` → `shipped` → `delivered` / `cancelled`.