export type { Result } from './result.js';
export { ok, err } from './result.js';
export * from './money.js';
export * from './shipping-address.js';
export * from './order-status.js';
export * from './cart.js';
export * from './order.js';
export * from './payment.js';
export * from './events.js';
export type { CartRepository } from './cart-repository.js';
export type { OrderRepository, OrderPagination, PaginatedOrders } from './order-repository.js';
export type {
  ProductInfo,
  StockLine,
  InventoryError,
  InventoryService,
  PaymentError,
  PaymentGateway,
  EmailService,
  EventBus,
} from './external-services.js';
export type { ProductCatalogEntity } from './product-catalog.js';
export type { ProductCatalogRepository } from './product-catalogRepository.js';
