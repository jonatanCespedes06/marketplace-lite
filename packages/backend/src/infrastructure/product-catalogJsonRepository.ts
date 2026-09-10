// File-backed product catalog repository for demos.
// Persists to a JSON file (write-through) so products survive backend restarts.
// On first run (missing file) it seeds a set of mock products.

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ProductCatalogEntity } from '../domain/product-catalog.js';
import type { ProductCatalogRepository } from '../domain/product-catalogRepository.js';

interface StoredProduct {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

const toStored = (entity: ProductCatalogEntity): StoredProduct => ({
  id: entity.id,
  name: entity.name,
  price: entity.price,
  sku: entity.sku,
  stock: entity.stock,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

const fromStored = (stored: StoredProduct): ProductCatalogEntity => ({
  id: stored.id,
  name: stored.name,
  price: stored.price,
  sku: stored.sku,
  stock: stored.stock,
  createdAt: new Date(stored.createdAt),
  updatedAt: new Date(stored.updatedAt),
});

const mockSeed = (): ProductCatalogEntity[] => {
  const now = new Date();
  const mocks: Array<Omit<ProductCatalogEntity, 'id' | 'createdAt' | 'updatedAt'>> = [
    { name: 'Wireless Headphones', price: 89.99, sku: 'AUD-1001', stock: 15 },
    { name: 'Mechanical Keyboard', price: 129.5, sku: 'AUD-1002', stock: 8 },
    { name: 'Ergonomic Mouse', price: 45.0, sku: 'AUD-1003', stock: 20 },
    { name: '4K Monitor 27"', price: 349.99, sku: 'MON-2001', stock: 5 },
    { name: 'Desk Lamp', price: 29.99, sku: 'LMP-3001', stock: 30 },
    { name: 'Laptop Stand', price: 39.95, sku: 'ACC-4001', stock: 12 },
    { name: 'HD Webcam', price: 69.0, sku: 'CAM-5001', stock: 0 },
    { name: 'Office Chair', price: 199.0, sku: 'CHR-6001', stock: 4 },
  ];
  return mocks.map((m) => ({ ...m, id: randomUUID(), createdAt: now, updatedAt: now }));
};

export class JsonFileProductCatalogRepository implements ProductCatalogRepository {
  private readonly store = new Map<string, ProductCatalogEntity>();

  constructor(private readonly filePath: string) {
    this.load();
  }

  /** Synchronous snapshot for startup wiring (e.g. seeding inventory). */
  getSnapshot(): ProductCatalogEntity[] {
    return [...this.store.values()].map((entity) => ({ ...entity }));
  }

  async findAll(pagination?: { page: number; limit: number }): Promise<ProductCatalogEntity[]> {
    const items = [...this.store.values()];
    if (!pagination) return items;
    const start = (pagination.page - 1) * pagination.limit;
    return items.slice(start, start + pagination.limit);
  }

  async findById(id: string): Promise<ProductCatalogEntity | null> {
    return this.store.get(id) ?? null;
  }

  async create(entity: ProductCatalogEntity): Promise<ProductCatalogEntity> {
    this.store.set(entity.id, { ...entity });
    this.persist();
    return { ...entity };
  }

  async update(
    id: string,
    partial: Partial<ProductCatalogEntity>,
  ): Promise<ProductCatalogEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: ProductCatalogEntity = {
      ...existing,
      ...partial,
      id: existing.id,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    this.persist();
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.store.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  private load(): void {
    if (!existsSync(this.filePath)) {
      for (const entity of mockSeed()) {
        this.store.set(entity.id, entity);
      }
      this.persist();
      return;
    }
    try {
      const raw = readFileSync(this.filePath, 'utf-8');
      const stored = JSON.parse(raw) as StoredProduct[];
      if (!Array.isArray(stored)) return;
      for (const item of stored) {
        this.store.set(item.id, fromStored(item));
      }
    } catch {
      // Corrupt or unreadable file: start empty rather than crashing boot.
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const stored = [...this.store.values()].map(toStored);
    writeFileSync(this.filePath, `${JSON.stringify(stored, null, 2)}\n`, 'utf-8');
  }
}
