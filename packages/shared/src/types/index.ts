// Shared domain-level types (pure TS, no framework imports).

export type Currency = 'USD' | 'ARS' | 'EUR';

export interface Money {
  readonly amount: number;
  readonly currency: Currency;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: Money;
  readonly stock: number;
}

export interface CartItem {
  readonly productId: string;
  readonly quantity: number;
}

export interface Cart {
  readonly id: string;
  readonly items: readonly CartItem[];
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  readonly id: string;
  readonly cartId: string;
  readonly total: Money;
  readonly status: OrderStatus;
}
