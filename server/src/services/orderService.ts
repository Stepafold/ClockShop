import fs from 'fs/promises';
import path from 'path';
import type { Order } from '../shared/types/order';

const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const data = await fs.readFile(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },

  async getById(id: string): Promise<Order | undefined> {
    const orders = await this.getAll();
    return orders.find(o => o.id === id);
  },

  async getByUserId(userId: string): Promise<Order[]> {
    const orders = await this.getAll();
    return orders.filter(o => o.userId === userId);
  },

  async create(orderData: Omit<Order, 'id'>): Promise<Order> {
    const orders = await this.getAll();
    const newOrder: Order = {
      id: Date.now().toString(),
      ...orderData,
    };
    orders.push(newOrder);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return newOrder;
  },
};