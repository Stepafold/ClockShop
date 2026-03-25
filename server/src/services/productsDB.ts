import path from 'path';
import type { Product, ProductFilter } from '../shared/types/product';
import { FileService } from './fileService';

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

class ProductsDB extends FileService<Product> {
  constructor() {
    super(PRODUCTS_FILE);
  }

  async filter(filters: ProductFilter): Promise<Product[]> {
    let products = await this.read();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters.inStock !== undefined) {
      products = products.filter(p => p.inStock === filters.inStock);
    }

    if (filters.sort === 'asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'desc') {
      products.sort((a, b) => b.price - a.price);
    }

    return products;
  }
}

export const productsDB = new ProductsDB();