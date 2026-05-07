import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result, message: 'Registration successful' });
  }

  async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await authService.login(req.body);
    res.status(200).json({ data: result, message: 'Login successful' });
  }
}

export const authController = new AuthController();
