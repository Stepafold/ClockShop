import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.read();
    const usersWithoutPasswords = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    
    const existingUser = await userService.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.user?.id !== id) {
      return res.status(403).json({ message: 'Forbidden: Cannot update other users' });
    }
    
    const updatedUser = await userService.update(id, { name, phone });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (req.user?.id !== id) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete other users' });
    }
    
    const deleted = await userService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.clearCookie('session');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};