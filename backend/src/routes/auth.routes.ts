import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

export const authRouter = Router();

authRouter.post('/register', validateBody(RegisterDto), (req, res, next) =>
  authController.register(req, res, next),
);

authRouter.post('/login', validateBody(LoginDto), (req, res, next) =>
  authController.login(req, res, next),
);
