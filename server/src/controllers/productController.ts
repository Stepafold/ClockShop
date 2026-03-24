import { Request, Response } from 'express';
import type { ProductFilter } from '../shared/types/product';
import { productsDB } from '../services/productsDB';

export const productController = {
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, inStock, sort } = req.query;

      const filter: ProductFilter = {
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        inStock: inStock ? inStock === 'true' : undefined,
        sort: (sort === 'asc' || sort === 'desc') ? sort : undefined,
      };

      const products = await productsDB.filter(filter);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  },

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: 'Product ID is required' });
        return;
      }

      const product = await productsDB.getById(id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  },
};
