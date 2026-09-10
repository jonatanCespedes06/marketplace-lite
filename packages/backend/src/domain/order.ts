import { z } from 'zod';
import type { Result } from './result.js';
import { err, ok } from './result.js';
import { OrderStatusSchema, canTransitionOrderStatus } from './order-status.js';
import type { OrderStatus } from './order-status.js';
import { ShippingAddressSchema } from './shipping-address.js';
import type { ShippingAddress } from './shipping-address.js';

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive().max(99),
  subtotal: z.number().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statusHistory: z.array(
    z.object({
      status: z.string(),
      timestamp: z.string().datetime(),
      note: z.string().optional(),
    }),
  ),
});

export type OrderDTO = z.infer<typeof OrderSchema>;
export type OrderDetailDTO = OrderDTO;

export interface OrderStatusChange {
  readonly status: OrderStatus;
  readonly timestamp: string;
  readonly note?: string;
}

export interface OrderError {
  readonly code: 'EMPTY_ORDER' | 'INVALID_STATUS_TRANSITION' | 'FORBIDDEN';
  readonly message: string;
}

export const TAX_RATE = 0.16;
export const FLAT_SHIPPING_COST = 99;

const round2 = (value: number): number => Math.round(value * 100) / 100;

// Order aggregate root: totals are always computed here (backend is source of truth).
export class Order {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly status: OrderStatus,
    readonly items: readonly OrderItem[],
    readonly subtotal: number,
    readonly tax: number,
    readonly shipping: number,
    readonly total: number,
    readonly shippingAddress: ShippingAddress,
    readonly paymentMethod: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly statusHistory: readonly OrderStatusChange[],
  ) {}

  static create(args: {
    id: string;
    userId: string;
    items: readonly OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    now?: Date;
  }): Result<Order, OrderError> {
    if (args.items.length === 0) {
      return err({ code: 'EMPTY_ORDER', message: 'Cannot create an order with no items' });
    }
    const now = args.now ?? new Date();
    const subtotal = round2(args.items.reduce((acc, item) => acc + item.subtotal, 0));
    const tax = round2(subtotal * TAX_RATE);
    const shipping = FLAT_SHIPPING_COST;
    const total = round2(subtotal + tax + shipping);
    const status: OrderStatus = 'pending_payment';
    return ok(
      new Order(
        args.id,
        args.userId,
        status,
        [...args.items],
        subtotal,
        tax,
        shipping,
        total,
        args.shippingAddress,
        args.paymentMethod,
        now,
        now,
        [{ status, timestamp: now.toISOString(), note: 'Order created' }],
      ),
    );
  }

  static rehydrate(args: {
    id: string;
    userId: string;
    status: OrderStatus;
    items: readonly OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
    statusHistory: readonly OrderStatusChange[];
  }): Order {
    return new Order(
      args.id,
      args.userId,
      args.status,
      [...args.items],
      args.subtotal,
      args.tax,
      args.shipping,
      args.total,
      args.shippingAddress,
      args.paymentMethod,
      args.createdAt,
      args.updatedAt,
      [...args.statusHistory],
    );
  }

  changeStatus(to: OrderStatus, note?: string): Result<Order, OrderError> {
    if (!canTransitionOrderStatus(this.status, to)) {
      return err({
        code: 'INVALID_STATUS_TRANSITION',
        message: `Cannot transition from ${this.status} to ${to}`,
      });
    }
    const now = new Date();
    const entry: OrderStatusChange = {
      status: to,
      timestamp: now.toISOString(),
      ...(note === undefined ? {} : { note }),
    };
    return ok(
      new Order(
        this.id,
        this.userId,
        to,
        [...this.items],
        this.subtotal,
        this.tax,
        this.shipping,
        this.total,
        this.shippingAddress,
        this.paymentMethod,
        this.createdAt,
        now,
        [...this.statusHistory, entry],
      ),
    );
  }

  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  toDTO(): OrderDTO {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      items: [...this.items],
      subtotal: this.subtotal,
      tax: this.tax,
      shipping: this.shipping,
      total: this.total,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      statusHistory: this.statusHistory.map((entry) => ({ ...entry })),
    };
  }
}
