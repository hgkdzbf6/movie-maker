/**
 * 认证模块
 * 用户注册、登录、令牌验证
 */

import { User } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 注册用户
export async function register(data: {
  email: string;
  password: string;
  name: string;
}) {
  if (!data.email || !data.password || !data.name) {
    throw new Error('必填字段缺失');
  }

  if (!isValidEmail(data.email)) {
    throw new Error('邮箱格式不正确');
  }

  // 检查邮箱是否已存在
  const existingUser = User.findByEmail(data.email);
  if (existingUser) {
    throw new Error('邮箱已被注册');
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 创建用户
  const user = User.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
  });

  return user;
}

// 登录用户
export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error('邮箱和密码不能为空');
  }

  // 查找用户
  const user = User.findByEmail(email);
  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('密码错误');
  }

  // 生成令牌
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

// 生成令牌
function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// 验证令牌
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 获取用户信息（从令牌）
export function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = User.findById(payload.id);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
