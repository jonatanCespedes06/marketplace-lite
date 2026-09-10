import type { CartDTO } from './cart.js';
import type { OrderDTO } from './order.js';
import type { OrderStatus } from './order-status.js';

// Domain events: emitted by use cases, consumed via EventBus port.
export interface DomainEvent<TType extends string, TPayload> {
  readonly type: TType;
  readonly occurredAt: string;
  readonly payload: TPayload;
}

export type CartItemAdded = DomainEvent<'CartItemAdded', { cart: CartDTO; productId: string; quantity: number }>;
export type CartItemUpdated = DomainEvent<'CartItemUpdated', { cart: CartDTO; productId: string; quantity: number }>;
export type CartItemRemoved = DomainEvent<'CartItemRemoved', { cart: CartDTO; productId: string }>;
export type CheckoutInitiated = DomainEvent<'CheckoutInitiated', { userId: string; itemCount: number }>;
export type OrderCreated = DomainEvent<'OrderCreated', { order: OrderDTO }>;
export type OrderStatusChanged = DomainEvent<
  'OrderStatusChanged',
  { orderId: string; from: OrderStatus; to: OrderStatus }
>;

export type CheckoutDomainEvent =
  | CartItemAdded
  | CartItemUpdated
  | CartItemRemoved
  | CheckoutInitiated
  | OrderCreated
  | OrderStatusChanged;

export const domainEvent = <TType extends string, TPayload>(
  type: TType,
  payload: TPayload,
): DomainEvent<TType, TPayload> => ({
  type,
  occurredAt: new Date().toISOString(),
  payload,
});
