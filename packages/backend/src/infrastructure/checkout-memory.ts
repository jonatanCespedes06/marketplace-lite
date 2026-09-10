// In-memory adapters for persistence and external services.
// Production would swap these for Prisma/Stripe implementations behind the same ports.

import { randomUUID } from 'node:crypto';
import type { Cart } from '../domain/cart.js';
import type { CartRepository } from '../domain/cart-repository.js';
import type { Order } from '../domain/order.js';
import type { OrderPagination, OrderRepository, PaginatedOrders } from '../domain/order-repository.js';
import type { CheckoutDomainEvent } from '../domain/events.js';
import type {
  EmailService,
  EventBus,
  InventoryError,
  InventoryService,
  PaymentError,
  PaymentGateway,
  ProductInfo,
} from '../domain/external-services.js';
import type { Result } from '../domain/result.js';
import { err, ok } from '../domain/result.js';

export class InMemoryCartRepository implements CartRepository {
  private readonly store = new Map<string, Cart>();

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.store.get(userId) ?? null;
  }

  async save(cart: Cart): Promise<Cart> {
    this.store.set(cart.userId, cart);
    return cart;
  }

  async delete(userId: string): Promise<void> {
    this.store.delete(userId);
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string, pagination: OrderPagination): Promise<PaginatedOrders> {
    const mine = [...this.store.values()]
      .filter((order) => order.userId === userId)
      .filter((order) => (pagination.status === undefined ? true : order.status === pagination.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const start = (pagination.page - 1) * pagination.limit;
    return { orders: mine.slice(start, start + pagination.limit), total: mine.length };
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }
}

export class InMemoryInventoryService implements InventoryService {
  private readonly products = new Map<string, ProductInfo>();

  seed(product: ProductInfo): void {
    this.products.set(product.id, { ...product });
  }

  async getProduct(productId: string): Promise<Result<ProductInfo, InventoryError>> {
    const product = this.products.get(productId);
    if (product === undefined) {
      return err({ code: 'PRODUCT_NOT_FOUND', message: `Product ${productId} not found`, productId });
    }
    return ok({ ...product });
  }

  async reserveStock(items: readonly { productId: string; quantity: number }[]): Promise<Result<void, InventoryError>> {
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product === undefined) {
        return err({ code: 'PRODUCT_NOT_FOUND', message: `Product ${item.productId} not found`, productId: item.productId });
      }
      if (product.stock < item.quantity) {
        return err({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${item.productId}`,
          productId: item.productId,
        });
      }
    }
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product !== undefined) {
        this.products.set(item.productId, { ...product, stock: product.stock - item.quantity });
      }
    }
    return ok(undefined);
  }

  async releaseStock(items: readonly { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product !== undefined) {
        this.products.set(item.productId, { ...product, stock: product.stock + item.quantity });
      }
    }
  }
}

export class MockPaymentGateway implements PaymentGateway {
  constructor(private readonly shouldFail = false) {}

  async charge(args: {
    amount: number;
    method: string;
    details: Record<string, unknown>;
  }): Promise<Result<{ transactionId: string }, PaymentError>> {
    if (this.shouldFail || args.amount <= 0) {
      return err({ code: 'PAYMENT_FAILED', message: 'Payment was declined' });
    }
    return ok({ transactionId: randomUUID() });
  }
}

export class NoopEmailService implements EmailService {
  readonly sent: { toUserId: string; orderId: string; total: number }[] = [];

  async sendOrderConfirmation(args: { toUserId: string; orderId: string; total: number }): Promise<void> {
    this.sent.push({ ...args });
  }
}

export class InMemoryEventBus implements EventBus {
  private readonly events: CheckoutDomainEvent[] = [];

  publish(event: CheckoutDomainEvent): void {
    this.events.push(event);
  }

  get published(): readonly CheckoutDomainEvent[] {
    return [...this.events];
  }
}
