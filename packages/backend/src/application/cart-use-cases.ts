// Cart use cases (T-009..T-013): Result pattern + Zod-first validation.

import { randomUUID } from 'node:crypto';
import type { ZodIssue } from 'zod';
import type { CartDTO } from '../domain/cart.js';
import { Cart } from '../domain/cart.js';
import type { CartError } from '../domain/cart.js';
import type { CartRepository } from '../domain/cart-repository.js';
import type { EventBus, InventoryService } from '../domain/external-services.js';
import type { Result } from '../domain/result.js';
import { err, ok } from '../domain/result.js';
import { domainEvent } from '../domain/events.js';
import { AddCartItemSchema, UpdateCartItemSchema } from './checkout-schemas.js';

export interface CartFailure {
  readonly code: 'VALIDATION' | 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'ITEM_NOT_FOUND' | 'INVALID_QUANTITY';
  readonly message: string;
  readonly issues?: ZodIssue[];
}

export interface CartDeps {
  readonly carts: CartRepository;
  readonly inventory: InventoryService;
  readonly events: EventBus;
}

const toCartFailure = (error: CartError): CartFailure =>
  error.code === 'CART_EMPTY'
    ? { code: 'INVALID_QUANTITY', message: error.message }
    : { code: error.code, message: error.message };

const getOrCreateCart = async (carts: CartRepository, userId: string): Promise<Cart> => {
  const existing = await carts.findByUserId(userId);
  if (existing !== null) return existing;
  return Cart.create({ id: randomUUID(), userId });
};

export const addCartItem = async (
  deps: CartDeps,
  args: { userId: string; productId: string; quantity: number },
): Promise<Result<CartDTO, CartFailure>> => {
  const parsed = AddCartItemSchema.safeParse({ productId: args.productId, quantity: args.quantity });
  if (!parsed.success) {
    return err({ code: 'VALIDATION', message: 'Invalid cart item', issues: parsed.error.issues });
  }
  const product = await deps.inventory.getProduct(parsed.data.productId);
  if (!product.ok) {
    return product.error.code === 'PRODUCT_NOT_FOUND'
      ? err({ code: 'PRODUCT_NOT_FOUND', message: product.error.message })
      : err({ code: 'INSUFFICIENT_STOCK', message: product.error.message });
  }
  if (product.value.stock < parsed.data.quantity) {
    return err({ code: 'INSUFFICIENT_STOCK', message: `Insufficient stock for ${product.value.id}` });
  }
  const cart = await getOrCreateCart(deps.carts, args.userId);
  const updated = cart.addItem({
    productId: product.value.id,
    productName: product.value.name,
    productSku: product.value.sku,
    unitPrice: product.value.unitPrice,
    quantity: parsed.data.quantity,
  });
  if (!updated.ok) {
    return err(toCartFailure(updated.error));
  }
  const saved = await deps.carts.save(updated.value);
  const dto = saved.toDTO();
  deps.events.publish(domainEvent('CartItemAdded', { cart: dto, productId: dto.items[dto.items.length - 1]?.productId ?? parsed.data.productId, quantity: parsed.data.quantity }));
  return ok(dto);
};

export const getCart = async (
  deps: Pick<CartDeps, 'carts'>,
  args: { userId: string },
): Promise<Result<CartDTO, CartFailure>> => {
  const cart = await deps.carts.findByUserId(args.userId);
  if (cart === null) {
    const fresh = Cart.create({ id: randomUUID(), userId: args.userId });
    const saved = await deps.carts.save(fresh);
    return ok(saved.toDTO());
  }
  return ok(cart.toDTO());
};

export const updateCartItem = async (
  deps: CartDeps,
  args: { userId: string; productId: string; quantity: number },
): Promise<Result<CartDTO, CartFailure>> => {
  const parsed = UpdateCartItemSchema.safeParse({ productId: args.productId, quantity: args.quantity });
  if (!parsed.success) {
    return err({ code: 'VALIDATION', message: 'Invalid cart item', issues: parsed.error.issues });
  }
  const product = await deps.inventory.getProduct(parsed.data.productId);
  if (!product.ok) {
    return product.error.code === 'PRODUCT_NOT_FOUND'
      ? err({ code: 'PRODUCT_NOT_FOUND', message: product.error.message })
      : err({ code: 'INSUFFICIENT_STOCK', message: product.error.message });
  }
  if (product.value.stock < parsed.data.quantity) {
    return err({ code: 'INSUFFICIENT_STOCK', message: `Insufficient stock for ${product.value.id}` });
  }
  const cart = await getOrCreateCart(deps.carts, args.userId);
  const updated = cart.updateItemQuantity(parsed.data.productId, parsed.data.quantity);
  if (!updated.ok) {
    return err(toCartFailure(updated.error));
  }
  const saved = await deps.carts.save(updated.value);
  const dto = saved.toDTO();
  deps.events.publish(domainEvent('CartItemUpdated', { cart: dto, productId: parsed.data.productId, quantity: parsed.data.quantity }));
  return ok(dto);
};

export const removeCartItem = async (
  deps: Pick<CartDeps, 'carts' | 'events'>,
  args: { userId: string; productId: string },
): Promise<Result<CartDTO, CartFailure>> => {
  const cart = await getOrCreateCart(deps.carts, args.userId);
  const updated = cart.removeItem(args.productId);
  if (!updated.ok) {
    return err(toCartFailure(updated.error));
  }
  const saved = await deps.carts.save(updated.value);
  const dto = saved.toDTO();
  deps.events.publish(domainEvent('CartItemRemoved', { cart: dto, productId: args.productId }));
  return ok(dto);
};

export const clearCart = async (
  deps: Pick<CartDeps, 'carts'>,
  args: { userId: string },
): Promise<Result<void, CartFailure>> => {
  const cart = await deps.carts.findByUserId(args.userId);
  if (cart === null) return ok(undefined);
  await deps.carts.save(cart.clear());
  return ok(undefined);
};
