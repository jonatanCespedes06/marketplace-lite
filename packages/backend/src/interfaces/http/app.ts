// Marketplace Lite - Backend entry point.
// Wires Express (helmet, cors, rate-limit, json) with checkout + product-catalog routes.

import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ProductCatalogController } from '../../infrastructure/product-catalogController.js';
import {
  InMemoryCartRepository,
  InMemoryEventBus,
  InMemoryInventoryService,
  InMemoryOrderRepository,
  MockPaymentGateway,
  NoopEmailService,
} from '../../infrastructure/checkout-memory.js';
import { registerCheckoutRoutes } from './checkout-routes.js';
import type { CheckoutRouterDeps } from './checkout-routes.js';

export interface AppDeps {
  readonly checkout: CheckoutRouterDeps;
}

const DEMO_PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

export const createCheckoutDeps = (): CheckoutRouterDeps => {
  const carts = new InMemoryCartRepository();
  const orders = new InMemoryOrderRepository();
  const inventory = new InMemoryInventoryService();
  inventory.seed({
    id: DEMO_PRODUCT_ID,
    name: 'Demo Product',
    sku: 'DEM-0001',
    unitPrice: 199.99,
    stock: 100,
  });
  return {
    carts,
    orders,
    inventory,
    payments: new MockPaymentGateway(),
    email: new NoopEmailService(),
    events: new InMemoryEventBus(),
  };
};

export const createApp = (deps: AppDeps = { checkout: createCheckoutDeps() }): Express => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  ProductCatalogController(app);
  registerCheckoutRoutes(app, deps.checkout);

  return app;
};

export const app = createApp();
export const demoProductId = DEMO_PRODUCT_ID;

const isDirectRun = process.argv[1]?.endsWith('app.ts') === true || process.argv[1]?.endsWith('app.js') === true;
if (isDirectRun) {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    console.log(`Marketplace Lite Backend API running on :${port}`);
  });
}
