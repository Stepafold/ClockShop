import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import type { Order } from '../shared/types/order';
import type { CartItem } from '../shared/types/cart';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { address, phone, email, paymentMethod } = req.body;

    if (!address || !phone || !email || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields: address, phone, email, paymentMethod' });
    }

    const cart = await cartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = cart.items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0);

    const orderData: Omit<Order, 'id'> = {
      userId,
      items: cart.items,
      address,
      phone,
      email,
      paymentMethod,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const newOrder = await orderService.create(orderData);

    await cartService.clearCart(userId);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const order = await orderService.getById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};