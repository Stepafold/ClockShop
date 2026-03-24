import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
const app = express();

// middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', orderRoutes);


// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


export default app;