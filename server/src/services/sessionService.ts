import jwt from 'jsonwebtoken';
import { Session } from '../shared/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 10 * 60; // 10 minutes in seconds

export class SessionService {
  createToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'session' },
      JWT_SECRET,
      { expiresIn: SESSION_DURATION }
    );
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
      if (decoded.type !== 'session') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  getSessionDuration(): number {
    return SESSION_DURATION * 1000; // return in milliseconds for cookie maxAge
  }
}

export const sessionService = new SessionService();