// product-catalog Repository Interface
import type { ProductCatalogEntity } from './product-catalog';

export interface ProductCatalogRepository {
  findAll(pagination?: { page: number; limit: number }): Promise<ProductCatalogEntity[]>;
  findById(id: string): Promise<ProductCatalogEntity | null>;
  create(entity: ProductCatalogEntity): Promise<ProductCatalogEntity>;
  update(id: string, entity: Partial<ProductCatalogEntity>): Promise<ProductCatalogEntity | null>;
  delete(id: string): Promise<boolean>;
}
