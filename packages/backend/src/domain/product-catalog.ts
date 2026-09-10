// product-catalog Domain Entity
export interface ProductCatalogEntity {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
// Export concrete product-catalog entity with business fields
