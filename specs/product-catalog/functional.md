# Product Catalog - Functional Specification

## Historias de Usuario

### HC-001: Listar productos
- **Descripción:** El usuario puede visualizar una lista paginada de productos disponibles en el marketplace.
- **Precondiciones:** El sistema debe tener al menos un producto registrado.
- **Flujo principal:**
  1. El usuario solicita la lista de productos con paginación opcional (page, limit).
  2. El sistema retorna un listado de productos con sus datos básicos (id, nombre, precio, SKU).
  3. Si no hay productos, se retorna una lista vacía con metadatos de paginación.
- **Postcondiciones:** El usuario recibe la lista de productos o un registro vacío.
- **Criterios de aceptación:**
  - [ ] Retorna productos con sus campos completos (id, name, price, sku).
  - [ ] Soporta paginación con parámetros de query: `page` y `limit`.
  - [ ] Maneja el caso de lista vacía gracefully.

### HC-002: Crear producto
- **Descripción:** Un administrador puede crear un nuevo producto en el marketplace.
- **Precondiciones:** El usuario está autenticado con rol de administrador.
- **Flujo principal:**
  1. El administrador envía los datos del producto (name, price, sku a través de un formulario o API).
  2. El sistema valida los datos de entrada (nombre requerido, precio positivo, SKU con formato único).
  3. El producto se persiste en la base de datos.
  4. Se retorna el producto creado con su ID generado.
- **Postcondiciones:** El producto está registrado en el sistema y es recuperable.
- **Criterios de aceptación:**
  - [ ] Nombre es obligatorio y debe tener mínimo 3 caracteres.
  - [ ] Precio debe ser un número positivo.
  - [ ] SKU debe tener formato `XXX-####` (3 letras mayúsculas + guion + 4 dígitos).
  - [ ] Retorna el producto creado con ID generado.

### HC-003: Obtener producto por ID
- **Descripción:** El usuario puede consultar los detalles de un producto específico usando su ID.
- **Precondiciones:** El producto con el ID especificado existe en el sistema.
- **Flujo principal:**
  1. El usuario solicita los detalles del producto usando su ID único.
  2. El sistema busca el producto en la base de datos.
  3. Si se encuentra, se retornan los datos completos del producto.
  4. Si no se encuentra, se retorna un error indicando que el producto no existe.
- **Postcondiciones:** El usuario obtiene los detalles del producto o un error de "not found".
- **Criterios de aceptación:**
  - [ ] Retorna el producto completo cuando existe.
  - [ ] Retorna error 404-like cuando el producto no existe.

## Criterios de Aceptación Globales
- Todos los precios deben ser valores positivos.
- Los SKU deben seguir el formato `^[A-Z]{3}-\d{4}$`.
- La búsqueda y filtrado deben ser case-insensitive para nombres.