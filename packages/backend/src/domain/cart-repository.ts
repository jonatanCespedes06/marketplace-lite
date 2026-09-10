import type { Cart } from './cart.js';

// Port: persistence for Cart aggregates keyed by user.
export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<Cart>;
  delete(userId: string): Promise<void>;
}
