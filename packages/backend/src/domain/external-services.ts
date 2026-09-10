import type { Result } from './result.js';
import type { CheckoutDomainEvent } from './events.js';

export interface StockLine {
  readonly productId: string;
  readonly quantity: number;
}

// Ports: external services behind interfaces so domain/application stay pure.

export interface ProductInfo {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly unitPrice: number;
  readonly stock: number;
}

export interface InventoryError {
  readonly code: 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK';
  readonly message: string;
  readonly productId?: string;
}

export interface InventoryService {
  getProduct(productId: string): Promise<Result<ProductInfo, InventoryError>>;
  reserveStock(items: readonly StockLine[]): Promise<Result<void, InventoryError>>;
  releaseStock(items: readonly StockLine[]): Promise<void>;
}

export interface PaymentError {
  readonly code: 'PAYMENT_FAILED';
  readonly message: string;
}

export interface PaymentGateway {
  charge(args: {
    amount: number;
    method: string;
    details: Record<string, unknown>;
  }): Promise<Result<{ transactionId: string }, PaymentError>>;
}

export interface EmailService {
  sendOrderConfirmation(args: { toUserId: string; orderId: string; total: number }): Promise<void>;
}

export interface EventBus {
  publish(event: CheckoutDomainEvent): void;
  readonly published: readonly CheckoutDomainEvent[];
}
