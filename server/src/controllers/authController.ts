import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';
import { User } from '../shared/types';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Email, password and name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: Date.now().toString(),
      email,
      passwordHash,
      name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    await userService.create(newUser);

    const token = sessionService.createToken(newUser.id);
    
    res.cookie('session', token, {
      httpOnly: true,
      maxAge: sessionService.getSessionDuration(),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'Registration successful', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sessionService.createToken(user.id);
    
    res.cookie('session', token, {
      httpOnly: true,
      maxAge: sessionService.getSessionDuration(),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('session');
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { passwordHash: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
};