/**
 * 集成测试 - 生成可播放的 MP4 文件
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { register, login } from '@/lib/auth';
import { Project, Scene, Asset, Export } from '@/lib/db';
import { exportToMP4 } from '@/lib/remotion-exporter';
import { serializeProject } from '@/lib/serializer';
import path from 'path';
import fs from 'fs/promises';

describe('MP4 Export Integration Tests', () => {
  let user: any;
  let token: string;
  let project: any;
  let scene: any;
  let asset: any;

  beforeAll(async () => {
    // 创建测试用户
    user = await register({
      email: 'export-test@example.com',
      password: 'password123',
      name: '导出测试用户',
    });

    const result = await login('export-test@example.com', 'password123');
    token = result.token;

    // 创建测试项目
    project = Project.create({
      userId: user.id,
      name: 'MP4 导出测试项目',
      config: {
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5, // 5秒视频
      },
    });

    // 创建测试素材
    asset = Asset.create({
      projectId: project.id,
      name: 'test-video.mp4',
      type: 'video',
      url: '/assets/test-video.mp4',
      duration: 5,
      width: 1920,
      height: 1080,
    });

    // 创建测试场景
    scene = Scene.create({
      projectId: project.id,
      name: '测试场景',
      type: 'video',
      startFrame: 0,
      durationFrames: 150, // 5秒 * 30fps
      content: {
        assetId: asset.id,
        x: 960,
        y: 540,
        width: 1920,
        height: 1080,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
    });
  });

  afterAll(() => {
    // 清理测试数据
    Project.delete(project.id);
    // 由于外键约束，场景和素材会自动删除
  });

  describe('项目文件序列化', () => {
    it('应该成功序列化项目为 JSON 文件', async () => {
      const filePath = await serializeProject(project.id);

      expect(filePath).toBeDefined();
      expect(filePath.endsWith('.json')).toBe(true);

      // 验证文件存在
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // 读取并验证文件内容
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const projectFile = JSON.parse(fileContent);

      expect(projectFile.version).toBeDefined();
      expect(projectFile.metadata.name).toBe('MP4 导出测试项目');
      expect(projectFile.config).toEqual(project.config);
      expect(projectFile.scenes).toHaveLength(1);
      expect(projectFile.assets).toHaveLength(1);

      console.log(`[测试] 项目文件已保存: ${filePath}`);
    });

    it('应该包含所有必要的元数据', async () => {
      const filePath = await serializeProject(project.id);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const projectFile = JSON.parse(fileContent);

      expect(projectFile.metadata).toHaveProperty('name');
      expect(projectFile.metadata).toHaveProperty('createdAt');
      expect(projectFile.metadata).toHaveProperty('updatedAt');
      expect(projectFile.metadata).toHaveProperty('createdBy');
      expect(projectFile.metadata.name).toBe('MP4 导出测试项目');

      console.log(`[测试] 元数据验证通过`);
    });

    it('应该正确序列化场景数据', async () => {
      const filePath = await serializeProject(project.id);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const projectFile = JSON.parse(fileContent);

      expect(projectFile.scenes).toHaveLength(1);

      const serializedScene = projectFile.scenes[0];
      expect(serializedScene.id).toBe(scene.id);
      expect(serializedScene.name).toBe('测试场景');
      expect(serializedScene.type).toBe('video');
      expect(serializedScene.startFrame).toBe(0);
      expect(serializedScene.durationFrames).toBe(150);
      expect(serializedScene.content).toEqual(scene.content);

      console.log(`[测试] 场景数据验证通过`);
    });

    it('应该正确序列化素材数据', async () => {
      const filePath = await serializeProject(project.id);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const projectFile = JSON.parse(fileContent);

      expect(projectFile.assets).toHaveLength(1);

      const serializedAsset = projectFile.assets[0];
      expect(serializedAsset.id).toBe(asset.id);
      expect(serializedAsset.name).toBe('test-video.mp4');
      expect(serializedAsset.type).toBe('video');
      expect(serializedAsset.url).toBe('/assets/test-video.mp4');
      expect(serializedAsset.duration).toBe(5);

      console.log(`[测试] 素材数据验证通过`);
    });
  });

  describe('MP4 导出功能', () => {
    it('应该成功创建导出任务', () => {
      const exportTask = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'test-export.mp4',
        outputPath: '/exports/test-export.mp4',
      });

      expect(exportTask).toBeDefined();
      expect(exportTask.format).toBe('mp4');
      expect(exportTask.quality).toBe('high');
      expect(exportTask.status).toBe('pending');

      console.log(`[测试] 导出任务已创建: ${exportTask.id}`);
    });

    it('应该更新导出任务状态', () => {
      const exportTask = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'test-export-update.mp4',
        outputPath: '/exports/test-export-update.mp4',
      });

      const updatedExport = Export.update(exportTask.id, {
        status: 'processing',
        progress: 50,
      });

      expect(updatedExport).toBeDefined();
      expect(updatedExport?.status).toBe('processing');
      expect(updatedExport?.progress).toBe(50);

      console.log(`[测试] 导出状态已更新`);
    });

    it('应该完成导出任务', () => {
      const exportTask = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'test-export-complete.mp4',
        outputPath: '/exports/test-export-complete.mp4',
      });

      const completedExport = Export.update(exportTask.id, {
        status: 'completed',
        progress: 100,
      });

      expect(completedExport).toBeDefined();
      expect(completedExport?.status).toBe('completed');
      expect(completedExport?.progress).toBe(100);

      console.log(`[测试] 导出任务已完成`);
    });

    it('应该生成可播放的 MP4 文件', async () => {
      const outputPath = path.join(
        process.cwd(),
        'test-exports',
        'integration-test.mp4'
      );

      // 确保输出目录存在
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const exportOptions = {
        projectId: project.id,
        format: 'mp4' as const,
        quality: 'medium' as const,
        outputPath,
        onProgress: (progress: number) => {
          console.log(`[导出进度] ${progress.toFixed(1)}%`);
        },
        onComplete: (outputPath: string) => {
          console.log(`[导出完成] ${outputPath}`);
        },
        onError: (error: Error) => {
          console.error(`[导出失败]`, error);
        },
      };

      // 执行导出
      const result = await exportToMP4(exportOptions);

      expect(result).toBeDefined();
      expect(result.endsWith('.mp4')).toBe(true);

      // 验证文件存在
      const fileExists = await fs
        .access(result)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // 获取文件大小
      const stats = await fs.stat(result);
      expect(stats.size).toBeGreaterThan(0);

      console.log(`[测试] MP4 文件已生成: ${result}`);
      console.log(`[测试] 文件大小: ${stats.size} bytes`);
    }, 30000); // 30秒超时
  });

  describe('导出进度跟踪', () => {
    it('应该跟踪导出进度', async () => {
      const progressUpdates: number[] = [];

      const exportOptions = {
        projectId: project.id,
        format: 'mp4' as const,
        quality: 'medium' as const,
        outputPath: path.join(process.cwd(), 'test-exports', 'progress-test.mp4'),
        onProgress: (progress: number) => {
          progressUpdates.push(progress);
        },
      };

      await exportToMP4(exportOptions);

      // 验证有进度更新
      expect(progressUpdates.length).toBeGreaterThan(0);

      // 验证进度递增
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1]);
      }

      // 验证最终进度为 100%
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);

      console.log(`[测试] 进度更新次数: ${progressUpdates.length}`);
    }, 30000);
  });

  describe('不同导出格式', () => {
    it('应该支持不同质量级别', async () => {
      const qualities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const files: string[] = [];

      for (const quality of qualities) {
        const outputPath = path.join(
          process.cwd(),
          'test-exports',
          `quality-test-${quality}.mp4`
        );

        await exportToMP4({
          projectId: project.id,
          format: 'mp4',
          quality,
          outputPath,
        });

        const stats = await fs.stat(outputPath);
        files.push({ quality, size: stats.size });

        console.log(`[测试] 质量 ${quality}: ${stats.size} bytes`);
      }

      // 验证不同质量生成不同大小的文件
      expect(files[0].size).toBeLessThan(files[1].size);
      expect(files[1].size).toBeLessThan(files[2].size);
    }, 60000);
  });

  describe('错误处理', () => {
    it('应该处理项目不存在的错误', async () => {
      await expect(
        exportToMP4({
          projectId: 'non-existent-id',
          format: 'mp4',
          quality: 'medium',
          outputPath: '/exports/fail.mp4',
        })
      ).rejects.toThrow('项目不存在');
    });

    it('应该处理导出失败', async () => {
      // 使用无效的输出路径
      const invalidPath = '/invalid/path/that/does/not/exist/test.mp4';

      await expect(
        exportToMP4({
          projectId: project.id,
          format: 'mp4',
          quality: 'medium',
          outputPath: invalidPath,
        })
      ).rejects.toThrow();
    });
  });

  describe('完整工作流程', () => {
    it('应该完成从创建到导出的完整流程', async () => {
      // 1. 创建项目
      const testProject = Project.create({
        userId: user.id,
        name: '完整流程测试项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 3,
        },
      });

      // 2. 添加素材
      const testAsset = Asset.create({
        projectId: testProject.id,
        name: 'integration-test.mp4',
        type: 'video',
        url: '/assets/integration-test.mp4',
        duration: 3,
      });

      // 3. 添加场景
      const testScene = Scene.create({
        projectId: testProject.id,
        name: '完整流程场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 90,
        content: {
          assetId: testAsset.id,
          x: 960,
          y: 540,
        },
      });

      // 4. 序列化项目
      const projectFile = await serializeProject(testProject.id);
      expect(projectFile).toBeDefined();

      // 5. 创建导出任务
      const exportTask = Export.create({
        projectId: testProject.id,
        format: 'mp4',
        quality: 'medium',
        filename: 'complete-flow-test.mp4',
        outputPath: path.join(
          process.cwd(),
          'test-exports',
          'complete-flow-test.mp4'
        ),
      });

      expect(exportTask).toBeDefined();

      // 6. 执行导出
      const outputPath = await exportToMP4({
        projectId: testProject.id,
        format: 'mp4',
        quality: 'medium',
        outputPath: exportTask.outputPath,
      });

      expect(outputPath).toBeDefined();
      expect(outputPath.endsWith('.mp4')).toBe(true);

      // 7. 验证文件存在
      const fileExists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      console.log(`[测试] 完整流程测试通过`);
      console.log(`[测试] 项目文件: ${projectFile}`);
      console.log(`[测试] 导出文件: ${outputPath}`);

      // 清理
      Project.delete(testProject.id);
    }, 60000);
  });
});
