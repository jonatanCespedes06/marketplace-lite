// HTTP integration tests (T-035): auth, cart, checkout and orders over a live port.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createApp, demoProductId } from '../src/interfaces/http/app.js';

const TOKEN = 'Bearer test-token-123';
const HEADERS = { Authorization: TOKEN, 'Content-Type': 'application/json' };

let baseUrl = '';
let server: ReturnType<ReturnType<typeof createApp>['listen']> | undefined;

const request = async (path: string, init?: RequestInit): Promise<{ status: number; body: unknown }> => {
  const res = await fetch(`${baseUrl}${path}`, init);
  const body = (await res.json().catch(() => null)) as unknown;
  return { status: res.status, body };
};

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server?.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    if (server === undefined) {
      resolve();
      return;
    }
    server.close((error?: Error) => (error === undefined ? resolve() : reject(error)));
  });
});

describe('checkout HTTP', () => {
  it('requires authentication', async () => {
    const res = await request('/cart');
    expect(res.status).toBe(401);
  });

  it('runs the full cart -> checkout -> orders flow', async () => {
    const added = await request('/cart/items', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ productId: demoProductId, quantity: 2 }),
    });
    expect(added.status).toBe(200);

    const cart = await request('/cart', { headers: HEADERS });
    expect(cart.status).toBe(200);

    const checkout = await request('/checkout', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        shippingAddress: { street: 'Av Siempre Viva 742', city: 'Springfield', postalCode: '12345', country: 'US' },
        paymentMethod: 'credit_card',
        paymentDetails: {},
      }),
    });
    expect(checkout.status).toBe(201);
    const orderId = (checkout.body as { data: { id: string } }).data.id;
    expect(typeof orderId).toBe('string');

    const orders = await request('/orders?page=1&limit=10', { headers: HEADERS });
    expect(orders.status).toBe(200);
    expect((orders.body as { meta: { total: number } }).meta.total).toBe(1);

    const detail = await request(`/orders/${orderId}`, { headers: HEADERS });
    expect(detail.status).toBe(200);
  });

  it('rejects invalid payloads with 400', async () => {
    const res = await request('/cart/items', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ productId: 'not-a-uuid', quantity: 0 }),
    });
    expect(res.status).toBe(400);
  });
});
