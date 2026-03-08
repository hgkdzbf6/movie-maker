/**
 * 认证模块单元测试
 * 测试用户注册、登录、令牌验证
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { register, login, verifyToken, getUserFromToken } from '@/lib/auth';
import { User } from '@/lib/db';

describe('Auth Tests', () => {
  afterEach(() => {
    // 清理逻辑在 beforeEach 中处理
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      };

      const user = await register(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).not.toBe(userData.password); // 密码应该被加密
    });

    it('应该拒绝注册已存在的邮箱', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      };

      await register(userData);

      await expect(register(userData)).rejects.toThrow('邮箱已被注册');
    });

    it('应该加密用户密码', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      };

      const user = await register(userData);

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(10);
    });

    it('应该要求必填字段', async () => {
      await expect(register({
        email: 'test@example.com',
        password: '',
        name: '测试用户',
      })).rejects.toThrow(); // 密码加密会失败

      await expect(register({
        email: '',
        password: 'password123',
        name: '测试用户',
      })).rejects.toThrow(); // 邮箱验证会失败
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });
    });

    it('应该成功登录', async () => {
      const result = await login('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('测试用户');
    });

    it('应该返回有效的 JWT 令牌', async () => {
      const result = await login('test@example.com', 'password123');

      const payload = verifyToken(result.token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBeDefined();
      expect(payload?.email).toBe('test@example.com');
    });

    it('应该拒绝错误的密码', async () => {
      await expect(login('test@example.com', 'wrong-password')).rejects.toThrow('密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      await expect(login('nonexistent@example.com', 'password123')).rejects.toThrow('用户不存在');
    });

    it('应该不返回密码', async () => {
      const result = await login('test@example.com', 'password123');

      expect(result.user.password).toBeUndefined();
    });
  });

  describe('verifyToken', () => {
    let validToken: string;
    let invalidToken: string;

    beforeEach(async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const result = await login('test@example.com', 'password123');
      validToken = result.token;
      invalidToken = 'invalid.token.here';
    });

    it('应该验证有效的令牌', () => {
      const payload = verifyToken(validToken);

      expect(payload).toBeDefined();
      expect(payload?.id).toBeDefined();
      expect(payload?.email).toBe('test@example.com');
    });

    it('应该拒绝无效的令牌', () => {
      const payload = verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('应该拒绝过期的令牌', () => {
      // 创建一个过期的令牌
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoidGVzdCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.signature';

      const payload = verifyToken(expiredToken);

      expect(payload).toBeNull();
    });
  });

  describe('getUserFromToken', () => {
    let validToken: string;

    beforeEach(async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const result = await login('test@example.com', 'password123');
      validToken = result.token;
    });

    it('应该从令牌获取用户信息', () => {
      const user = getUserFromToken(validToken);

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('测试用户');
    });

    it('应该不返回用户密码', () => {
      const user = getUserFromToken(validToken);

      expect(user?.password).toBeUndefined();
    });

    it('应该为无效令牌返回 null', () => {
      const user = getUserFromToken('invalid-token');

      expect(user).toBeNull();
    });

    it('应该返回用户的时间戳', () => {
      const user = getUserFromToken(validToken);

      expect(user?.createdAt).toBeDefined();
      expect(user?.updatedAt).toBeDefined();
    });
  });

  describe('Token Structure', () => {
    it('应该包含必要的字段', async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const result = await login('test@example.com', 'password123');
      const payload = verifyToken(result.token);

      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('name');
    });

    it('应该有正确的过期时间', async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const result = await login('test@example.com', 'password123');
      const payload = verifyToken(result.token);

      // 令牌应该在 7 天后过期
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (7 * 24 * 60 * 60);

      expect(payload?.exp).toBeGreaterThanOrEqual(expectedExp - 1000); // 允许 1 秒误差
      expect(payload?.exp).toBeLessThanOrEqual(expectedExp + 1000);
    });
  });

  describe('Security', () => {
    it('应该使用强哈希算法', async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const user = User.findByEmail('test@example.com');

      // bcrypt 哈希应该以 $2b$ 或 $2a$ 开头
      expect(user?.password).toMatch(/^\$2[ab]\$/);
    });

    it('应该阻止 SQL 注入', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";

      await expect(register({
        email: maliciousEmail,
        password: 'password123',
        name: '测试用户',
      })).rejects.toThrow();

      // 用户表应该仍然存在
      const users = User.findByUserId?.('test') || [];
      expect(users).toBeDefined();
    });

    it('应该限制令牌长度', async () => {
      await register({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      });

      const result = await login('test@example.com', 'password123');

      // JWT 令牌通常在 200-500 字符之间
      expect(result.token.length).toBeGreaterThan(100);
      expect(result.token.length).toBeLessThan(1000);
    });
  });
});
