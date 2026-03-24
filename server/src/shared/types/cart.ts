import { Product } from './product';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}