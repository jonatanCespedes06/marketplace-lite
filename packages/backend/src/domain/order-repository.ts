import type { Order } from './order.js';
import type { OrderStatus } from './order-status.js';

export interface OrderPagination {
  readonly page: number;
  readonly limit: number;
  readonly status?: OrderStatus;
}

export interface PaginatedOrders {
  readonly orders: readonly Order[];
  readonly total: number;
}

// Port: persistence for Order aggregates with optimistic ownership checks.
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, pagination: OrderPagination): Promise<PaginatedOrders>;
  save(order: Order): Promise<Order>;
}
