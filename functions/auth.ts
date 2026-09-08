import jwt from 'jsonwebtoken';
import { AdminUser } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'skxmovies_super_secure_jwt_secret_change_me_in_production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAdminToken(user: AdminUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
