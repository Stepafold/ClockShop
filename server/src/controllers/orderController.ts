import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { Order } from '@shared/types';


export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, address, phone, email, paymentMethod, items } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!address || !phone || !email || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields: address, phone, email, paymentMethod' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and must not be empty' });
    }

    const total = items.reduce((sum: number, item: any) => sum + (item.priceAtOrder || item.product?.price || 0) * item.quantity, 0);

    const orderData: Omit<Order, 'id'> = {
      userId,
      items,
      address,
      phone,
      email,
      paymentMethod,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const newOrder = await orderService.create(orderData);

    // TODO: после реализации cartService – очистить корзину пользователя
    // await cartService.clearCart(userId);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' });
    }
    const orders = await orderService.getByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};