import { saveAssetFile, assetFileExists, deleteAssetFile, cleanupProjectAssets, getAssetFileInfo, ensureUploadDir } from '../../../src/lib/asset-storage';
import fs from 'fs';
import path from 'path';

const TEST_PROJECT_ID = 'test-project-' + Date.now();

describe('Asset Storage', () => {
  afterEach(() => {
    // Cleanup test files
    try {
      cleanupProjectAssets(TEST_PROJECT_ID);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('ensureUploadDir', () => {
    it('should create upload directory if it does not exist', () => {
      const dir = ensureUploadDir(TEST_PROJECT_ID);
      expect(fs.existsSync(dir)).toBe(true);
    });

    it('should return existing directory', () => {
      const dir1 = ensureUploadDir(TEST_PROJECT_ID);
      const dir2 = ensureUploadDir(TEST_PROJECT_ID);
      expect(dir1).toBe(dir2);
    });
  });

  describe('saveAssetFile', () => {
    it('should save file to persistent storage', async () => {
      const buffer = Buffer.from('test content');
      const result = await saveAssetFile(buffer, 'test.txt', TEST_PROJECT_ID);

      expect(result.assetId).toBeDefined();
      expect(result.relativePath).toContain('/uploads/');
      expect(result.relativePath).toContain(TEST_PROJECT_ID);
      expect(result.absolutePath).toBeDefined();
      expect(fs.existsSync(result.absolutePath)).toBe(true);
    });

    it('should preserve file extension', async () => {
      const buffer = Buffer.from('test video');
      const result = await saveAssetFile(buffer, 'video.mp4', TEST_PROJECT_ID);

      expect(result.relativePath).toMatch(/\.mp4$/);
    });

    it('should generate unique asset IDs', async () => {
      const buffer = Buffer.from('test');
      const result1 = await saveAssetFile(buffer, 'file1.txt', TEST_PROJECT_ID);
      const result2 = await saveAssetFile(buffer, 'file2.txt', TEST_PROJECT_ID);

      expect(result1.assetId).not.toBe(result2.assetId);
    });
  });

  describe('assetFileExists', () => {
    it('should return true for existing file', async () => {
      const buffer = Buffer.from('test');
      const result = await saveAssetFile(buffer, 'test.txt', TEST_PROJECT_ID);

      expect(assetFileExists(result.relativePath)).toBe(true);
    });

    it('should return false for non-existing file', () => {
      expect(assetFileExists('/uploads/non-existent/file.txt')).toBe(false);
    });
  });

  describe('deleteAssetFile', () => {
    it('should delete existing file', async () => {
      const buffer = Buffer.from('test');
      const result = await saveAssetFile(buffer, 'test.txt', TEST_PROJECT_ID);

      expect(assetFileExists(result.relativePath)).toBe(true);
      const deleted = deleteAssetFile(result.relativePath);
      expect(deleted).toBe(true);
      expect(assetFileExists(result.relativePath)).toBe(false);
    });

    it('should return false for non-existing file', () => {
      const deleted = deleteAssetFile('/uploads/non-existent/file.txt');
      expect(deleted).toBe(false);
    });
  });

  describe('cleanupProjectAssets', () => {
    it('should delete all files in project directory', async () => {
      const buffer = Buffer.from('test');
      const result1 = await saveAssetFile(buffer, 'file1.txt', TEST_PROJECT_ID);
      const result2 = await saveAssetFile(buffer, 'file2.txt', TEST_PROJECT_ID);

      expect(assetFileExists(result1.relativePath)).toBe(true);
      expect(assetFileExists(result2.relativePath)).toBe(true);

      cleanupProjectAssets(TEST_PROJECT_ID);

      expect(assetFileExists(result1.relativePath)).toBe(false);
      expect(assetFileExists(result2.relativePath)).toBe(false);
    });

    it('should handle non-existing project directory', () => {
      expect(() => cleanupProjectAssets('non-existent-project')).not.toThrow();
    });
  });

  describe('getAssetFileInfo', () => {
    it('should return file info for existing file', async () => {
      const buffer = Buffer.from('test content');
      const result = await saveAssetFile(buffer, 'test.txt', TEST_PROJECT_ID);

      const info = getAssetFileInfo(result.relativePath);
      expect(info.exists).toBe(true);
      expect(info.size).toBe(buffer.length);
      expect(info.absolutePath).toBeDefined();
    });

    it('should return exists false for non-existing file', () => {
      const info = getAssetFileInfo('/uploads/non-existent/file.txt');
      expect(info.exists).toBe(false);
      expect(info.size).toBeUndefined();
      expect(info.absolutePath).toBeUndefined();
    });
  });
});
