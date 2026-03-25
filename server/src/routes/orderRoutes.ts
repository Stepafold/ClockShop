import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;