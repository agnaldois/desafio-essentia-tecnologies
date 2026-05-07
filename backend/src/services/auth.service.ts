import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

const SALT_ROUNDS = 12;

// Build sign options once — expiresIn requires StringValue (ms template literal type).
// Runtime value from env is always a valid StringValue string (e.g. '24h', '7d').
const JWT_OPTIONS: SignOptions = {
  algorithm: 'HS256',
  expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
};

export class AuthService {
  async register(dto: RegisterDto): Promise<{ token: string }> {
    const existing = await UserRepository.findByEmail(dto.email);
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { status: 409 });
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = UserRepository.create({ email: dto.email, passwordHash });
    const saved = await UserRepository.save(user);
    const token = jwt.sign(
      { id: saved.id, email: saved.email },
      config.jwt.secret,
      JWT_OPTIONS,
    );
    return { token };
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await UserRepository.findByEmail(dto.email);
    const isValid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !isValid) {
      // Generic message — do not reveal whether email exists (credential enumeration prevention)
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      JWT_OPTIONS,
    );
    return { token };
  }
}

export const authService = new AuthService();
