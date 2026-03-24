import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController';

const router = Router();

router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

export default router;