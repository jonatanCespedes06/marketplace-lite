import type { Request, Response, Express } from "express";
import { ProductCatalogUseCase } from "../application/product-catalogUseCase";
import { InMemoryProductCatalogRepository } from "./product-catalogRepositoryImpl";

export function ProductCatalogController(app: Express) {
  const repository = new InMemoryProductCatalogRepository();
  const useCase = new ProductCatalogUseCase(repository);

  // GET /product-catalog - List products with pagination
  app.get("/product-catalog", async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await useCase.listProducts({ page, limit });
      if (!result.ok) {
        return res.status(500).json({ error: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // POST /product-catalog - Create product
  app.post("/product-catalog", async (req: Request, res: Response) => {
    try {
      const result = await useCase.createProduct(req.body);
      if (!result.ok) {
        return res.status(400).json({ error: result.error.message });
      }
      res.status(201).json(result.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // GET /product-catalog/:id - Get product by ID
  app.get("/product-catalog/:id", async (req: Request, res: Response) => {
    try {
      const result = await useCase.getProductById(req.params.id);
      if (!result.ok) {
        return res.status(404).json({ error: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
}

export default ProductCatalogController;
