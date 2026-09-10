// Thin HTTP adapters: validate with Zod, call use cases, map Result -> status codes.
// No business logic lives here (Clean Architecture dependency rule).

import type { Express, Response } from 'express';
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../application/cart-use-cases.js';
import type { CartDeps, CartFailure } from '../../application/cart-use-cases.js';
import { processCheckout } from '../../application/checkout-use-case.js';
import type { CheckoutDeps, CheckoutFailure } from '../../application/checkout-use-case.js';
import { getOrderById, listOrders, updateOrderStatus } from '../../application/order-use-cases.js';
import type { OrderDeps, OrderFailure } from '../../application/order-use-cases.js';
import { AddCartItemSchema, CheckoutSchema, UpdateCartItemSchema } from '../../application/checkout-schemas.js';
import { OrderStatusSchema } from '../../domain/order-status.js';
import type { AuthenticatedRequest } from './auth-middleware.js';
import { authMiddleware, requireUserId } from './auth-middleware.js';
import { validateBody } from './validate-middleware.js';

export interface CheckoutRouterDeps extends CartDeps, CheckoutDeps, OrderDeps {}

const cartErrorStatus = (code: CartFailure['code']): number => {
  switch (code) {
    case 'VALIDATION':
    case 'INVALID_QUANTITY':
      return 400;
    case 'PRODUCT_NOT_FOUND':
    case 'ITEM_NOT_FOUND':
      return 404;
    case 'INSUFFICIENT_STOCK':
      return 409;
  }
};

const checkoutErrorStatus = (code: CheckoutFailure['code']): number => {
  switch (code) {
    case 'VALIDATION':
    case 'EMPTY_CART':
      return 400;
    case 'INSUFFICIENT_STOCK':
      return 409;
    case 'PAYMENT_FAILED':
      return 422;
  }
};

const orderErrorStatus = (code: OrderFailure['code']): number => {
  switch (code) {
    case 'VALIDATION':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'FORBIDDEN':
      return 403;
    case 'INVALID_STATUS_TRANSITION':
      return 409;
  }
};

const sendFailure = (res: Response, status: number, error: { message: string }): void => {
  res.status(status).json({ error: error.message });
};

export const registerCheckoutRoutes = (app: Express, deps: CheckoutRouterDeps): void => {
  // POST /cart/items - add or increment item
  app.post('/cart/items', authMiddleware, validateBody(AddCartItemSchema), async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await addCartItem(deps, {
      userId,
      productId: (req.body as { productId: string }).productId,
      quantity: (req.body as { quantity: number }).quantity,
    });
    if (!result.ok) {
      sendFailure(res, cartErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });

  // GET /cart - current cart
  app.get('/cart', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await getCart(deps, { userId });
    if (!result.ok) {
      sendFailure(res, cartErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });

  // PATCH /cart/items/:productId - update quantity
  app.patch('/cart/items/:productId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const parsed = UpdateCartItemSchema.safeParse({ productId: req.params.productId, quantity: req.body?.quantity });
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const result = await updateCartItem(deps, { userId, ...parsed.data });
    if (!result.ok) {
      sendFailure(res, cartErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });

  // DELETE /cart/items/:productId - remove item
  app.delete('/cart/items/:productId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await removeCartItem(deps, { userId, productId: req.params.productId ?? '' });
    if (!result.ok) {
      sendFailure(res, cartErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });

  // POST /checkout - convert cart into order
  app.post('/checkout', authMiddleware, validateBody(CheckoutSchema), async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await processCheckout(deps, { userId, input: req.body });
    if (!result.ok) {
      sendFailure(res, checkoutErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(201).json({ data: result.value });
  });

  // GET /orders - paginated history
  app.get('/orders', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await listOrders(deps, {
      userId,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    if (!result.ok) {
      sendFailure(res, orderErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value.data, meta: result.value.meta });
  });

  // GET /orders/:id - order detail with ownership check
  app.get('/orders/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireUserId(req, res);
    if (userId === null) return;
    const result = await getOrderById(deps, { userId, orderId: req.params.id ?? '' });
    if (!result.ok) {
      sendFailure(res, orderErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });

  // PATCH /orders/:id/status - internal/admin status transitions (e.g. payment webhooks)
  app.patch('/orders/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const parsed = OrderStatusSchema.safeParse(req.body?.newStatus ?? req.body?.status);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status', issues: parsed.error.issues });
      return;
    }
    const result = await updateOrderStatus(deps, {
      orderId: req.params.id ?? '',
      newStatus: parsed.data,
      note: typeof req.body?.note === 'string' ? req.body.note : undefined,
    });
    if (!result.ok) {
      sendFailure(res, orderErrorStatus(result.error.code), result.error);
      return;
    }
    res.status(200).json({ data: result.value });
  });
};
