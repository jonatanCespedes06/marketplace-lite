// product-catalog Use Case
import { z } from 'zod';
import type { ProductCatalogEntity } from '../domain';
import type { ProductCatalogRepository } from '../domain/product-catalogRepository';

const createProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
  stock: z.number().int().nonnegative(),
});

const productDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
  stock: z.number().int().nonnegative(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;
type ProductDTO = z.infer<typeof productDtoSchema>;

type CreateProductError = { message: string; issues: z.ZodIssue[] };

interface ListProductsInput {
  page?: number;
  limit?: number;
}

type ListProductsError = { message: string };

type ListProductsResult =
  | { ok: true; data: ProductDTO[]; meta: { page: number; limit: number; total: number; totalPages: number } }
  | { ok: false; error: ListProductsError };

interface CreateProductOutput {
  ok: true;
  data: ProductDTO;
}

interface CreateProductErrorOutput {
  ok: false;
  error: CreateProductError;
}

interface GetProductByIdOutput {
  ok: true;
  data: ProductDTO;
}

interface GetProductByIdErrorOutput {
  ok: false;
  error: { message: string; id: string };
}

export class ProductCatalogUseCase {
  constructor(private repository: ProductCatalogRepository) {}

  async listProducts(input: ListProductsInput): Promise<ListProductsResult> {
    try {
      const page = input.page ?? 1;
      const limit = input.limit ?? 10;
      const all = await this.repository.findAll();
      const items = await this.repository.findAll({ page, limit });
      const dtoItems: ProductDTO[] = items.map((item: ProductCatalogEntity) =>
        productDtoSchema.parse({
          id: item.id,
          name: item.name,
          price: item.price,
          sku: item.sku,
          stock: item.stock,
        }),
      );
      return {
        ok: true,
        data: dtoItems,
        meta: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) },
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: (error as Error).message },
      };
    }
  }

  async createProduct(input: CreateProductInput): Promise<CreateProductOutput | CreateProductErrorOutput> {
    const validation = createProductSchema.safeParse(input);
    if (!validation.success) {
      return {
        ok: false,
        error: {
          message: 'Validation failed',
          issues: validation.error.issues,
        },
      };
    }
    const entity: ProductCatalogEntity = {
      id: crypto.randomUUID(),
      name: validation.data.name,
      price: validation.data.price,
      sku: validation.data.sku,
      stock: validation.data.stock,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const created = await this.repository.create(entity);
    const dto: ProductDTO = productDtoSchema.parse({
      id: created.id,
      name: created.name,
      price: created.price,
      sku: created.sku,
      stock: created.stock,
    });
    return {
      ok: true,
      data: dto,
    };
  }

  async getProductById(id: string): Promise<GetProductByIdOutput | GetProductByIdErrorOutput> {
    const product = await this.repository.findById(id);
    if (!product) {
      return {
        ok: false,
        error: { message: 'Product not found', id },
      };
    }
    const dto: ProductDTO = productDtoSchema.parse({
      id: product.id,
      name: product.name,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
    });
    return {
      ok: true,
      data: dto,
    };
  }
}
