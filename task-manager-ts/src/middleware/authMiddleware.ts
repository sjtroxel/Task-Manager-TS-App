import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel.js';

// we need to extend the Request type to include 'user'
interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // check if token exists in headers (it usually looks like "Bearer <token>")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. verify token
      const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string);

      // 3. get user from the token (the token contains the user ID)
      // .select('-password') means "get the user but don't include the hashed password"
      req.user = await User.findById(decoded.id).select('-password');

      next();       // move on to the actual controller
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed!' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token!' });
  }
};