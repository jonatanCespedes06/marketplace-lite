// Order use cases (T-015..T-017): list with pagination, detail with ownership, status transitions.

import type { ZodIssue } from 'zod';
import type { OrderDetailDTO, OrderDTO } from '../domain/order.js';
import type { OrderPagination, OrderRepository } from '../domain/order-repository.js';
import type { OrderStatus } from '../domain/order-status.js';
import { OrderStatusSchema } from '../domain/order-status.js';
import type { EventBus } from '../domain/external-services.js';
import type { Result } from '../domain/result.js';
import { err, ok } from '../domain/result.js';
import { domainEvent } from '../domain/events.js';

export interface OrderFailure {
  readonly code: 'VALIDATION' | 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATUS_TRANSITION';
  readonly message: string;
  readonly issues?: ZodIssue[];
}

export interface OrderDeps {
  readonly orders: OrderRepository;
  readonly events: EventBus;
}

export interface PaginatedOrderDTO {
  readonly data: readonly OrderDTO[];
  readonly meta: { readonly page: number; readonly limit: number; readonly total: number };
}

const clampPagination = (input: { page?: unknown; limit?: unknown; status?: unknown }): OrderPagination => {
  const page = typeof input.page === 'number' && Number.isInteger(input.page) && input.page > 0 ? input.page : 1;
  const rawLimit = typeof input.limit === 'number' && Number.isInteger(input.limit) && input.limit > 0 ? input.limit : 10;
  const limit = Math.min(rawLimit, 50);
  const statusParsed = OrderStatusSchema.safeParse(input.status);
  return statusParsed.success
    ? { page, limit, status: statusParsed.data }
    : { page, limit };
};

export const listOrders = async (
  deps: Pick<OrderDeps, 'orders'>,
  args: { userId: string; page?: unknown; limit?: unknown; status?: unknown },
): Promise<Result<PaginatedOrderDTO, OrderFailure>> => {
  const pagination = clampPagination(args);
  const { orders, total } = await deps.orders.findByUserId(args.userId, pagination);
  return ok({
    data: orders.map((order) => order.toDTO()),
    meta: { page: pagination.page, limit: pagination.limit, total },
  });
};

export const getOrderById = async (
  deps: Pick<OrderDeps, 'orders'>,
  args: { userId: string; orderId: string },
): Promise<Result<OrderDetailDTO, OrderFailure>> => {
  const order = await deps.orders.findById(args.orderId);
  if (order === null) {
    return err({ code: 'NOT_FOUND', message: `Order ${args.orderId} not found` });
  }
  if (!order.belongsTo(args.userId)) {
    return err({ code: 'FORBIDDEN', message: 'Order does not belong to user' });
  }
  return ok(order.toDTO());
};

export const updateOrderStatus = async (
  deps: OrderDeps,
  args: { orderId: string; newStatus: OrderStatus; note?: string | undefined },
): Promise<Result<OrderDTO, OrderFailure>> => {
  const order = await deps.orders.findById(args.orderId);
  if (order === null) {
    return err({ code: 'NOT_FOUND', message: `Order ${args.orderId} not found` });
  }
  const from = order.status;
  const updated = order.changeStatus(args.newStatus, args.note);
  if (!updated.ok) {
    return updated.error.code === 'INVALID_STATUS_TRANSITION'
      ? err({ code: updated.error.code, message: updated.error.message })
      : err({ code: 'VALIDATION', message: updated.error.message });
  }
  const saved = await deps.orders.save(updated.value);
  deps.events.publish(domainEvent('OrderStatusChanged', { orderId: saved.id, from, to: saved.status }));
  return ok(saved.toDTO());
};
