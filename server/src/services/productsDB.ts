import fs from 'fs/promises';
import path from 'path';
import type { Product } from '../../../shared/types/product';

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

export const productsDB = {
  async getAll(): Promise<Product[]> {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  },

  async getById(id: string): Promise<Product | undefined> {
    const products = await this.getAll();
    return products.find(p => p.id === id);
  },
};