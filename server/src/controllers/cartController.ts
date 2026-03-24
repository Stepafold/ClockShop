import { Request, Response } from 'express';
import { cartService } from '../services/cartService';

export const cartController = {
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  },

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { productId, quantity } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId || !quantity) {
        res.status(400).json({ message: 'Product ID and quantity are required' });
        return;
      }

      if (quantity <= 0) {
        res.status(400).json({ message: 'Quantity must be greater than 0' });
        return;
      }

      await cartService.addItem(userId, productId, quantity);
      const updatedCart = await cartService.getCart(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  },

  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId || quantity === undefined) {
        res.status(400).json({ message: 'Product ID and quantity are required' });
        return;
      }

      if (quantity < 0) {
        res.status(400).json({ message: 'Quantity cannot be negative' });
        return;
      }

      await cartService.updateQuantity(userId, productId, quantity);
      const updatedCart = await cartService.getCart(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: 'Failed to update cart' });
    }
  },

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId) {
        res.status(400).json({ message: 'Product ID is required' });
        return;
      }

      await cartService.removeItem(userId, productId);
      const updatedCart = await cartService.getCart(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  },

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      await cartService.clearCart(userId);
      const clearedCart = await cartService.getCart(userId);
      res.json(clearedCart);
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  },
};
