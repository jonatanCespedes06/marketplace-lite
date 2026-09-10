// Marketplace Lite - Backend entry point.
// Wires Express (helmet, cors, rate-limit, json) with checkout + product-catalog routes.

import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { join } from 'node:path';
import { ProductCatalogController } from '../../infrastructure/product-catalogController.js';
import { JsonFileProductCatalogRepository } from '../../infrastructure/product-catalogJsonRepository.js';
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

  // The default wiring uses the in-memory inventory, which supports seeding.
  // The cast lives here in the composition root so domain ports stay pure.
  const inventory = deps.checkout.inventory as unknown as {
    seed(product: { id: string; name: string; sku: string; unitPrice: number; stock: number }): void;
  };
  // File-backed catalog so products (and the mock seed) survive restarts.
  // Override with PRODUCT_CATALOG_FILE; defaults to ./data/product-catalog.json.
  const catalogFile =
    process.env.PRODUCT_CATALOG_FILE ?? join(process.cwd(), 'data', 'product-catalog.json');
  const catalogRepository = new JsonFileProductCatalogRepository(catalogFile);
  ProductCatalogController(app, { inventory, repository: catalogRepository });
  // Publish the persisted catalog into inventory so carts work after a restart.
  for (const product of catalogRepository.getSnapshot()) {
    inventory.seed({
      id: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      stock: product.stock,
    });
  }
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
