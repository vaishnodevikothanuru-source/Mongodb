import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_smart_transport_jwt_key_2026_dev';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function getSessionUser(req: NextRequest): TokenPayload | null {
  // 1. Check Cookie
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload) return payload;
  }

  // 2. Check Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7);
    return verifyToken(headerToken);
  }

  return null;
}
