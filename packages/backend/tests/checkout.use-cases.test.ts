// Application tests with fakes (T-033): ProcessCheckout scenarios.
import { describe, expect, it } from 'vitest';
import { addCartItem } from '../src/application/cart-use-cases.js';
import { processCheckout } from '../src/application/checkout-use-case.js';
import type { CheckoutDeps } from '../src/application/checkout-use-case.js';
import {
  InMemoryCartRepository,
  InMemoryEventBus,
  InMemoryInventoryService,
  InMemoryOrderRepository,
  MockPaymentGateway,
  NoopEmailService,
} from '../src/infrastructure/checkout-memory.js';

const PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const USER_ID = '123e4567-e89b-12d3-a456-426614174000';

const payload = {
  shippingAddress: { street: 'Av Siempre Viva 742', city: 'Springfield', postalCode: '12345', country: 'US' },
  paymentMethod: 'credit_card',
  paymentDetails: {},
};

const setup = (opts: { stock?: number; failPayment?: boolean } = {}): CheckoutDeps => {
  const inventory = new InMemoryInventoryService();
  inventory.seed({ id: PRODUCT_ID, name: 'Demo', sku: 'DEM-0001', unitPrice: 100, stock: opts.stock ?? 10 });
  return {
    carts: new InMemoryCartRepository(),
    orders: new InMemoryOrderRepository(),
    inventory,
    payments: new MockPaymentGateway(opts.failPayment ?? false),
    email: new NoopEmailService(),
    events: new InMemoryEventBus(),
  };
};

describe('processCheckout', () => {
  it('creates an order, clears the cart and emits OrderCreated', async () => {
    const deps = setup();
    const added = await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 2 });
    expect(added.ok).toBe(true);

    const result = await processCheckout(deps, { userId: USER_ID, input: payload });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('pending_payment');
    expect(result.value.total).toBe(331);
    expect(deps.events.published.some((event) => event.type === 'OrderCreated')).toBe(true);

    const cart = await deps.carts.findByUserId(USER_ID);
    expect(cart?.isEmpty).toBe(true);
  });

  it('fails on empty carts', async () => {
    const deps = setup();
    const result = await processCheckout(deps, { userId: USER_ID, input: payload });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('EMPTY_CART');
  });

  it('fails when stock is insufficient', async () => {
    const deps = setup({ stock: 1 });
    await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 1 });
    // Stock drained by a concurrent buyer before checkout.
    await deps.inventory.reserveStock([{ productId: PRODUCT_ID, quantity: 1 }]);
    const result = await processCheckout(deps, { userId: USER_ID, input: payload });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('releases stock when payment fails', async () => {
    const deps = setup({ failPayment: true });
    await addCartItem(deps, { userId: USER_ID, productId: PRODUCT_ID, quantity: 2 });
    const result = await processCheckout(deps, { userId: USER_ID, input: payload });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('PAYMENT_FAILED');
    const product = await deps.inventory.getProduct(PRODUCT_ID);
    expect(product.ok).toBe(true);
    if (!product.ok) return;
    expect(product.value.stock).toBe(10);
  });
});
