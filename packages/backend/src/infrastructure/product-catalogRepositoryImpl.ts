import type { ProductCatalogEntity } from '../domain/product-catalog';
import type { ProductCatalogRepository } from '../domain/product-catalogRepository';

export class InMemoryProductCatalogRepository implements ProductCatalogRepository {
  private readonly store = new Map<string, ProductCatalogEntity>();

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
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
