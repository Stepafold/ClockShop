import path from 'path';
import type { Cart, CartStorage, CartItem, CartItemStorage } from '../shared/types/cart';
import type { Product } from '../shared/types/product';
import { FileService } from './fileService';
import { productsDB } from './productsDB';

const CARTS_FILE = path.join(__dirname, '../../data/carts.json');

class CartService extends FileService<CartStorage> {
  constructor() {
    super(CARTS_FILE);
  }

  async getCartByUserId(userId: string): Promise<CartStorage | undefined> {
    const carts = await this.read();
    return carts.find(c => c.userId === userId);
  }

  private async enrichCart(cartStorage: CartStorage): Promise<Cart> {
    const enrichedItems: CartItem[] = await Promise.all(
      cartStorage.items.map(async (item) => {
        const product = await productsDB.getById(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt,
          product: product || ({} as Product),
        };
      })
    );

    return {
      userId: cartStorage.userId,
      items: enrichedItems,
      updatedAt: cartStorage.updatedAt,
    };
  }

  async getCart(userId: string): Promise<Cart> {
    let cartStorage = await this.getCartByUserId(userId);
    if (!cartStorage) {
      const now = new Date().toISOString();
      cartStorage = { userId, items: [], updatedAt: now };
      const carts = await this.read();
      carts.push(cartStorage);
      await this.write(carts);
    }

    return this.enrichCart(cartStorage);
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');

    const carts = await this.read();
    let cartStorage = carts.find(c => c.userId === userId);
    const now = new Date().toISOString();

    if (!cartStorage) {
      cartStorage = { userId, items: [], updatedAt: now };
      carts.push(cartStorage);
    }

    const existingItem = cartStorage.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartStorage.items.push({
        productId,
        quantity,
        addedAt: now,
      });
    }

    cartStorage.updatedAt = now;
    await this.write(carts);
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    const carts = await this.read();
    const cartStorage = carts.find(c => c.userId === userId);
    if (!cartStorage) return;

    const item = cartStorage.items.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        cartStorage.items = cartStorage.items.filter(i => i.productId !== productId);
      } else {
        item.quantity = quantity;
      }
      cartStorage.updatedAt = new Date().toISOString();
      await this.write(carts);
    }
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const carts = await this.read();
    const cartStorage = carts.find(c => c.userId === userId);
    if (!cartStorage) return;

    cartStorage.items = cartStorage.items.filter(i => i.productId !== productId);
    cartStorage.updatedAt = new Date().toISOString();
    await this.write(carts);
  }

  async clearCart(userId: string): Promise<void> {
    const carts = await this.read();
    const cartStorage = carts.find(c => c.userId === userId);
    if (!cartStorage) return;

    cartStorage.items = [];
    cartStorage.updatedAt = new Date().toISOString();
    await this.write(carts);
  }
}

export const cartService = new CartService();