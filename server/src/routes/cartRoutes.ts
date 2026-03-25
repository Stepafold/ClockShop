import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addToCart);
router.put('/:productId', authMiddleware, cartController.updateCartItem);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);
router.delete('/', authMiddleware, cartController.clearCart);

export default router;
