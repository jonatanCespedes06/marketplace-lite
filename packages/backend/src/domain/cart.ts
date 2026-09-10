import { z } from 'zod';
import type { Result } from './result.js';
import { err, ok } from './result.js';

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive().max(99),
  subtotal: z.number().positive(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type CartDTO = z.infer<typeof CartSchema>;

export interface CartError {
  readonly code: 'CART_EMPTY' | 'ITEM_NOT_FOUND' | 'INVALID_QUANTITY';
  readonly message: string;
}

interface AddItemInput {
  readonly productId: string;
  readonly productName: string;
  readonly productSku: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

const subtotalFor = (unitPrice: number, quantity: number): number =>
  Math.round(unitPrice * quantity * 100) / 100;

const totalsFor = (items: readonly CartItem[]): { total: number; itemCount: number } => ({
  total: Math.round(items.reduce((acc, item) => acc + item.subtotal, 0) * 100) / 100,
  itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
});

// Cart aggregate: behavior lives here, never in controllers.
export class Cart {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly items: readonly CartItem[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(args: { id: string; userId: string; now?: Date }): Cart {
    const now = args.now ?? new Date();
    return new Cart(args.id, args.userId, [], now, now);
  }

  static rehydrate(args: {
    id: string;
    userId: string;
    items: readonly CartItem[];
    createdAt: Date;
    updatedAt: Date;
  }): Cart {
    return new Cart(args.id, args.userId, [...args.items], args.createdAt, args.updatedAt);
  }

  get total(): number {
    return totalsFor(this.items).total;
  }

  get itemCount(): number {
    return totalsFor(this.items).itemCount;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  addItem(input: AddItemInput): Result<Cart, CartError> {
    if (!Number.isInteger(input.quantity) || input.quantity <= 0 || input.quantity > 99) {
      return err({ code: 'INVALID_QUANTITY', message: 'Quantity must be an integer between 1 and 99' });
    }
    const existing = this.items.find((item) => item.productId === input.productId);
    if (existing === undefined) {
      const item: CartItem = {
        productId: input.productId,
        productName: input.productName,
        productSku: input.productSku,
        unitPrice: input.unitPrice,
        quantity: input.quantity,
        subtotal: subtotalFor(input.unitPrice, input.quantity),
      };
      return ok(this.withItems([...this.items, item]));
    }
    const quantity = existing.quantity + input.quantity;
    if (quantity > 99) {
      return err({ code: 'INVALID_QUANTITY', message: 'Quantity must be an integer between 1 and 99' });
    }
    const updated: CartItem = {
      ...existing,
      quantity,
      subtotal: subtotalFor(existing.unitPrice, quantity),
    };
    return ok(this.withItems(this.items.map((item) => (item.productId === input.productId ? updated : item))));
  }

  updateItemQuantity(productId: string, quantity: number): Result<Cart, CartError> {
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return err({ code: 'INVALID_QUANTITY', message: 'Quantity must be an integer between 1 and 99' });
    }
    const existing = this.items.find((item) => item.productId === productId);
    if (existing === undefined) {
      return err({ code: 'ITEM_NOT_FOUND', message: `Item ${productId} not in cart` });
    }
    const updated: CartItem = { ...existing, quantity, subtotal: subtotalFor(existing.unitPrice, quantity) };
    return ok(this.withItems(this.items.map((item) => (item.productId === productId ? updated : item))));
  }

  removeItem(productId: string): Result<Cart, CartError> {
    const exists = this.items.some((item) => item.productId === productId);
    if (!exists) {
      return err({ code: 'ITEM_NOT_FOUND', message: `Item ${productId} not in cart` });
    }
    return ok(this.withItems(this.items.filter((item) => item.productId !== productId)));
  }

  clear(): Cart {
    return this.withItems([]);
  }

  toDTO(): CartDTO {
    return {
      id: this.id,
      userId: this.userId,
      items: [...this.items],
      total: this.total,
      itemCount: this.itemCount,
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private withItems(items: readonly CartItem[]): Cart {
    return new Cart(this.id, this.userId, [...items], this.createdAt, new Date());
  }
}
