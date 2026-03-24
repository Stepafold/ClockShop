import type { Product } from './product';

export interface CartItemStorage {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface CartItem extends CartItemStorage {
  product: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CartStorage {
  userId: string;
  items: CartItemStorage[];
  updatedAt: string;
}