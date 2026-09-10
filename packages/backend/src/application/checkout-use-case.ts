// ProcessCheckout use case (T-014): reserve stock -> charge -> create order -> clear cart.
// Atomicity: on payment failure, reserved stock is released (todo o nada).

import { randomUUID } from 'node:crypto';
import type { ZodIssue } from 'zod';
import type { OrderDTO, OrderItem } from '../domain/order.js';
import { Order } from '../domain/order.js';
import type { CartRepository } from '../domain/cart-repository.js';
import type { OrderRepository } from '../domain/order-repository.js';
import type { EmailService, EventBus, InventoryService, PaymentGateway } from '../domain/external-services.js';
import type { Result } from '../domain/result.js';
import { err, ok } from '../domain/result.js';
import { domainEvent } from '../domain/events.js';
import { CheckoutSchema } from './checkout-schemas.js';
import type { CheckoutInput } from './checkout-schemas.js';

export interface CheckoutFailure {
  readonly code: 'VALIDATION' | 'EMPTY_CART' | 'INSUFFICIENT_STOCK' | 'PAYMENT_FAILED';
  readonly message: string;
  readonly issues?: ZodIssue[];
}

export interface CheckoutDeps {
  readonly carts: CartRepository;
  readonly orders: OrderRepository;
  readonly inventory: InventoryService;
  readonly payments: PaymentGateway;
  readonly email: EmailService;
  readonly events: EventBus;
}

export const processCheckout = async (
  deps: CheckoutDeps,
  args: { userId: string; input: unknown },
): Promise<Result<OrderDTO, CheckoutFailure>> => {
  const parsed: Result<CheckoutInput, CheckoutFailure> = (() => {
    const result = CheckoutSchema.safeParse(args.input);
    if (!result.success) {
      return err({ code: 'VALIDATION', message: 'Invalid checkout payload', issues: result.error.issues });
    }
    return ok(result.data);
  })();
  if (!parsed.ok) return err(parsed.error);

  const cart = await deps.carts.findByUserId(args.userId);
  if (cart === null || cart.isEmpty) {
    return err({ code: 'EMPTY_CART', message: 'Cart is empty' });
  }

  deps.events.publish(domainEvent('CheckoutInitiated', { userId: args.userId, itemCount: cart.itemCount }));

  const orderItems: OrderItem[] = cart.items.map((item) => ({ ...item }));

  const reserved = await deps.inventory.reserveStock(orderItems);
  if (!reserved.ok) {
    return err({ code: 'INSUFFICIENT_STOCK', message: reserved.error.message });
  }

  const created = Order.create({
    id: randomUUID(),
    userId: args.userId,
    items: orderItems,
    shippingAddress: parsed.value.shippingAddress,
    paymentMethod: parsed.value.paymentMethod,
  });
  if (!created.ok) {
    await deps.inventory.releaseStock(orderItems);
    return err({ code: 'VALIDATION', message: created.error.message });
  }

  const charged = await deps.payments.charge({
    amount: created.value.total,
    method: parsed.value.paymentMethod,
    details: parsed.value.paymentDetails,
  });
  if (!charged.ok) {
    await deps.inventory.releaseStock(orderItems);
    return err({ code: 'PAYMENT_FAILED', message: charged.error.message });
  }

  const saved = await deps.orders.save(created.value);
  await deps.carts.save(cart.clear());
  await deps.email.sendOrderConfirmation({ toUserId: args.userId, orderId: saved.id, total: saved.total });
  const dto = saved.toDTO();
  deps.events.publish(domainEvent('OrderCreated', { order: dto }));
  return ok(dto);
};
