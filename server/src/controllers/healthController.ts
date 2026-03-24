import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dataDir = path.join(__dirname, '../../data');
    await fs.access(dataDir);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Data directory not accessible'
    });
  }
};

export const ping = async (req: Request, res: Response) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
};