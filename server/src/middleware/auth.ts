import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';
import { User } from '../shared/types/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies['session'];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No session token' });
  }

  const decoded = sessionService.verifyToken(token);
  if (!decoded) {
    res.clearCookie('session');
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired session' });
  }

  const user = await userService.findById(decoded.userId);
  if (!user) {
    res.clearCookie('session');
    return res.status(401).json({ message: 'Unauthorized: User not found' });
  }

  req.user = user;
  next();
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies['session'];
  
  if (token) {
    const decoded = sessionService.verifyToken(token);
    if (decoded) {
      const user = await userService.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  }
  
  next();
};