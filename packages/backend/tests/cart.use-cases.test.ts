// Application tests with fakes (T-032): cart use cases.
import { describe, expect, it } from 'vitest';
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../src/application/cart-use-cases.js';
import type { CartDeps } from '../src/application/cart-use-cases.js';
import { InMemoryCartRepository, InMemoryEventBus, InMemoryInventoryService } from '../src/infrastructure/checkout-memory.js';

const PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const USER_ID = '123e4567-e89b-12d3-a456-426614174000';

const setup = (): CartDeps => {
  const inventory = new InMemoryInventoryService();
  inventory.seed({ id: PRODUCT_ID, name: 'Demo', sku: 'DEM-0001', unitPrice: 100, stock: 10 });
  return { carts: new InMemoryCartRepository(), inventory, events: new InMemoryEventBus() };
};

describe('cart use cases', () => {
  it('adds an item and emits CartItemAdded', async () => {
    const deps = setup();
    const result = await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 2 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total).toBe(200);
    expect(deps.events.published.some((event) => event.type === 'CartItemAdded')).toBe(true);
  });

  it('returns 404-style error for unknown products', async () => {
    const deps = setup();
    const result = await addCartItem(deps, { userId: USER_ID, productId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', quantity: 1 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('returns conflict when stock is insufficient', async () => {
    const deps = setup();
    const result = await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 11 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('gets, updates, removes and clears the cart', async () => {
    const deps = setup();
    await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 1 });
    const updated = await updateCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 3 });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.value.itemCount).toBe(3);

    const fetched = await getCart(deps, { userId: USER_ID });
    expect(fetched.ok).toBe(true);

    const removed = await removeCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID });
    expect(removed.ok).toBe(true);
    if (!removed.ok) return;
    expect(removed.value.itemCount).toBe(0);

    const cleared = await clearCart(deps, { userId: USER_ID });
    expect(cleared.ok).toBe(true);
  });

  it('rejects invalid quantities via Zod', async () => {
    const deps = setup();
    const result = await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 0 });
    expect(result.ok).toBe(false);
  });
});
