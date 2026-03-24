import { CartItem } from './cart';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}