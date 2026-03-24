import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';
import { optionalAuthMiddleware } from './middleware/auth';
import { healthCheck, ping } from './controllers/healthController';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(optionalAuthMiddleware);

app.get('/api/health', healthCheck);
app.get('/api/ping', ping);

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use(errorHandler);

export default app;