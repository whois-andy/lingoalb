import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Nuk jeni të autorizuar. Ju lutemi identifikohuni.', code: 'UNAUTHORIZED' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as { id: string; role: string; email: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'Tokeni është i pavlefshëm.', code: 'INVALID_TOKEN' });
      return;
    }

    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ message: 'Tokeni ka skaduar ose është i pavlefshëm.', code: 'TOKEN_EXPIRED' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Qasja e ndaluar. Keni nevojë për leje admin.', code: 'FORBIDDEN' });
    return;
  }
  next();
};
