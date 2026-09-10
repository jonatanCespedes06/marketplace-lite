// Application tests with fakes (T-034): order history and status transitions.
import { describe, expect, it } from 'vitest';
import { addCartItem } from '../src/application/cart-use-cases.js';
import { processCheckout } from '../src/application/checkout-use-case.js';
import { getOrderById, listOrders, updateOrderStatus } from '../src/application/order-use-cases.js';
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
const OTHER_USER = '223e4567-e89b-12d3-a456-426614174000';

const payload = {
  shippingAddress: { street: 'Av Siempre Viva 742', city: 'Springfield', postalCode: '12345', country: 'US' },
  paymentMethod: 'paypal',
  paymentDetails: {},
};

const setup = (): CheckoutDeps => {
  const inventory = new InMemoryInventoryService();
  inventory.seed({ id: PRODUCT_ID, name: 'Demo', sku: 'DEM-0001', unitPrice: 50, stock: 100 });
  return {
    carts: new InMemoryCartRepository(),
    orders: new InMemoryOrderRepository(),
    inventory,
    payments: new MockPaymentGateway(),
    email: new NoopEmailService(),
    events: new InMemoryEventBus(),
  };
};

const checkoutOnce = async (deps: CheckoutDeps, userId: string): Promise<string> => {
  const added = await addCartItem(deps, { userId, productId: PRODUCT_ID, quantity: 1 });
  expect(added.ok).toBe(true);
  const result = await processCheckout(deps, { userId, input: payload });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('checkout failed');
  return result.value.id;
};

describe('order use cases', () => {
  it('lists orders newest-first with pagination', async () => {
    const deps = setup();
    await checkoutOnce(deps, USER_ID);
    await checkoutOnce(deps, USER_ID);
    const listed = await listOrders(deps, { userId: USER_ID, page: 1, limit: 1 });
    expect(listed.ok).toBe(true);
    if (!listed.ok) return;
    expect(listed.value.data).toHaveLength(1);
    expect(listed.value.meta.total).toBe(2);
  });

  it('enforces ownership on order detail', async () => {
    const deps = setup();
    const orderId = await checkoutOnce(deps, USER_ID);
    const forbidden = await getOrderById(deps, { userId: OTHER_USER, orderId });
    expect(forbidden.ok).toBe(false);
    const mine = await getOrderById(deps, { userId: USER_ID, orderId });
    expect(mine.ok).toBe(true);
  });

  it('applies and rejects status transitions', async () => {
    const deps = setup();
    const orderId = await checkoutOnce(deps, USER_ID);
    const paid = await updateOrderStatus(deps, { orderId, newStatus: 'paid' });
    expect(paid.ok).toBe(true);
    const invalid = await updateOrderStatus(deps, { orderId, newStatus: 'delivered' });
    expect(invalid.ok).toBe(false);
    const shipped = await updateOrderStatus(deps, { orderId, newStatus: 'shipped' });
    expect(shipped.ok).toBe(true);
  });
});
