/**
 * Jest 测试配置
 * 配置测试环境和全局测试工具
 */

import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(process.cwd(), '.test-data', 'test.db');

// 模拟 window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: number | number[] = 0;
  disconnect: () => {};
  observe: () => {};
  takeRecords: () => [];
  unobserve: () => {};
} as any;

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect: () => {};
  observe: () => {};
  unobserve: () => {};
} as any;

// 全局测试工具
;(global as any).testUtils = {
  // 等待异步操作
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 生成随机 ID
  generateId: () => Math.random().toString(36).substr(2, 9),
  
  // 生成随机数字
  randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // 创建模拟的场景
  createMockScene: (overrides: any = {}) => ({
    id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试场景',
    type: 'video' as const,
    startFrame: 0,
    durationFrames: 90,
    content: {},
    ...overrides,
  }),
  
  // 创建模拟的素材
  createMockAsset: (overrides: any = {}) => ({
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试素材',
    type: 'video' as const,
    url: 'https://example.com/test.mp4',
    duration: 5,
    width: 1920,
    height: 1080,
    thumbnail: 'https://example.com/test.jpg',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
  
  // 创建模拟的项目
  createMockProject: (overrides: any = {}) => ({
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试项目',
    thumbnail: 'https://example.com/thumbnail.jpg',
    config: {
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 180,
    },
    scenes: [],
    assets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),
};

// 每个测试文件前运行
beforeEach(async () => {
  const testPath = expect.getState().testPath || '';
  const shouldCleanup =
    testPath.includes('/__tests__/unit/') ||
    (testPath.includes('/__tests__/integration/') && !testPath.endsWith('mp4-export.test.ts'));

  if (shouldCleanup) {
    try {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    } catch {
      // ignore cleanup errors before test DB is created
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  
  // 重置 console
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

// 每个测试文件后运行
afterEach(() => {
  // 恢复 console
  jest.restoreAllMocks();
});
