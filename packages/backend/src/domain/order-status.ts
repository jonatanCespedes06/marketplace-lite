import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
} as const;

export const canTransitionOrderStatus = (from: OrderStatus, to: OrderStatus): boolean =>
  ALLOWED_TRANSITIONS[from].includes(to);

export const allowedOrderTransitions = (from: OrderStatus): readonly OrderStatus[] =>
  ALLOWED_TRANSITIONS[from];
