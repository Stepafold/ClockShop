import fs from 'fs/promises';
import path from 'path';
import type { Cart, CartItem } from '../shared/types/cart';
import { productsDB } from './productsDB';

const CARTS_FILE = path.join(__dirname, '../../data/carts.json');

async function readCarts(): Promise<Cart[]> {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCarts(carts: Cart[]): Promise<void> {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

async function getCartByUserId(userId: string): Promise<Cart | undefined> {
  const carts = await readCarts();
  return carts.find(c => c.userId === userId);
}

async function saveCart(cart: Cart): Promise<void> {
  const carts = await readCarts();
  const index = carts.findIndex(c => c.userId === cart.userId);
  if (index !== -1) {
    carts[index] = cart;
  } else {
    carts.push(cart);
  }
  await writeCarts(carts);
}

export const cartService = {
  async getCart(userId: string): Promise<Cart> {
    let cart = await getCartByUserId(userId);
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
      await saveCart(cart);
    }
    
    const enrichedItems: CartItem[] = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productsDB.getById(item.productId);
        return {
          ...item,
          product: product!,
        };
      })
    );
    
    return { ...cart, items: enrichedItems };
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<void> {
    let cart = await getCartByUserId(userId);
    const now = new Date().toISOString();
    
    if (!cart) {
      cart = { userId, items: [], updatedAt: now };
    }
    
    const existingItem = cart.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.addedAt = now;
    } else {
      cart.items.push({
        productId,
        quantity,
        addedAt: now,
        product: {} as any, 
      });
    }
    
    cart.updatedAt = now;
    await saveCart(cart);
  },

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    const cart = await getCartByUserId(userId);
    if (!cart) return;
    
    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId !== productId);
      } else {
        item.quantity = quantity;
        item.addedAt = new Date().toISOString();
      }
      cart.updatedAt = new Date().toISOString();
      await saveCart(cart);
    }
  },

  async removeItem(userId: string, productId: string): Promise<void> {
    const cart = await getCartByUserId(userId);
    if (!cart) return;
    
    cart.items = cart.items.filter(i => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    await saveCart(cart);
  },

  async clearCart(userId: string): Promise<void> {
    const cart = await getCartByUserId(userId);
    if (!cart) return;
    
    cart.items = [];
    cart.updatedAt = new Date().toISOString();
    await saveCart(cart);
  },
};