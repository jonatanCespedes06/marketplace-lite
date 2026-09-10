// Domain unit tests (T-031): pure logic, no mocks allowed.
import { describe, expect, it } from 'vitest';
import { Cart } from '../src/domain/cart.js';
import { Order } from '../src/domain/order.js';
import { ShippingAddressSchema } from '../src/domain/shipping-address.js';
import { canTransitionOrderStatus } from '../src/domain/order-status.js';
import { moneyAdd, moneyFromDecimal, moneyMultiply, moneyToDecimal } from '../src/domain/money.js';

const USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const address = ShippingAddressSchema.parse({
  street: 'Av Siempre Viva 742',
  city: 'Springfield',
  postalCode: '12345',
  country: 'US',
});

describe('Cart', () => {
  it('adds an item and computes totals', () => {
    const cart = Cart.create({ id: PRODUCT_ID, userId: USER_ID });
    const result = cart.addItem({
      productId: PRODUCT_ID,
      productName: 'Demo',
      productSku: 'DEM-0001',
      unitPrice: 100,
      quantity: 2,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total).toBe(200);
    expect(result.value.itemCount).toBe(2);
    expect(result.value.toDTO().items).toHaveLength(1);
  });

  it('merges quantities when adding the same product', () => {
    const cart = Cart.create({ id: PRODUCT_ID, userId: USER_ID });
    const first = cart.addItem({ productId: PRODUCT_ID, productName: 'Demo', productSku: 'DEM-0001', unitPrice: 50, quantity: 1 });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = first.value.addItem({ productId: PRODUCT_ID, productName: 'Demo', productSku: 'DEM-0001', unitPrice: 50, quantity: 2 });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.value.itemCount).toBe(3);
    expect(second.value.total).toBe(150);
  });

  it('rejects invalid quantities without exceptions for flow control', () => {
    const cart = Cart.create({ id: PRODUCT_ID, userId: USER_ID });
    const result = cart.addItem({ productId: PRODUCT_ID, productName: 'Demo', productSku: 'DEM-0001', unitPrice: 10, quantity: 0 });
    expect(result.ok).toBe(false);
  });

  it('removes items and reports missing items as errors', () => {
    const cart = Cart.create({ id: PRODUCT_ID, userId: USER_ID });
    const missing = cart.removeItem(PRODUCT_ID);
    expect(missing.ok).toBe(false);
    const added = cart.addItem({ productId: PRODUCT_ID, productName: 'Demo', productSku: 'DEM-0001', unitPrice: 10, quantity: 1 });
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    const removed = added.value.removeItem(PRODUCT_ID);
    expect(removed.ok).toBe(true);
    if (removed.ok) expect(removed.value.isEmpty).toBe(true);
  });
});

describe('Order', () => {
  it('computes subtotal, tax and shipping on creation', () => {
    const created = Order.create({
      id: PRODUCT_ID,
      userId: USER_ID,
      items: [{ productId: PRODUCT_ID, productName: 'Demo', productSku: 'DEM-0001', unitPrice: 100, quantity: 2, subtotal: 200 }],
      shippingAddress: address,
      paymentMethod: 'credit_card',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.subtotal).toBe(200);
    expect(created.value.tax).toBe(32);
    expect(created.value.shipping).toBe(99);
    expect(created.value.total).toBe(331);
    expect(created.value.status).toBe('pending_payment');
  });

  it('rejects empty orders', () => {
    const created = Order.create({ id: PRODUCT_ID, userId: USER_ID, items: [], shippingAddress: address, paymentMethod: 'paypal' });
    expect(created.ok).toBe(false);
  });

  it('enforces valid status transitions', () => {
    expect(canTransitionOrderStatus('pending_payment', 'paid')).toBe(true);
    expect(canTransitionOrderStatus('pending_payment', 'delivered')).toBe(false);
    expect(canTransitionOrderStatus('delivered', 'cancelled')).toBe(false);
  });
});

describe('Money', () => {
  it('avoids float errors with integer cents', () => {
    const total = moneyAdd(moneyFromDecimal(0.1), moneyFromDecimal(0.2));
    expect(moneyToDecimal(total)).toBe(0.3);
    expect(moneyToDecimal(moneyMultiply(moneyFromDecimal(19.99), 3))).toBe(59.97);
  });
});
