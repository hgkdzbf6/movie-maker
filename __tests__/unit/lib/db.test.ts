/**
 * 数据库层单元测试
 * 测试所有数据库模型和操作
 */

import { describe, it, expect } from '@jest/globals';
import { User, Project, Scene, Asset, Export, Keyframe, db } from '@/lib/db';
import path from 'path';

describe('Database Tests', () => {
  it('应该使用独立的测试数据库', () => {
    expect(db.name).toContain(path.join('.test-data', 'test.db'));
    expect(db.name).not.toContain(path.join('data', 'remotion.db'));
  });

  describe('User Model', () => {
    it('应该创建用户', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      };

      const user = User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).toBe(userData.password);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('应该通过 ID 查找用户', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      };

      const createdUser = User.create(userData);
      const foundUser = User.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('应该通过邮箱查找用户', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      };

      User.create(userData);
      const foundUser = User.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
    });

    it('应该更新用户信息', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });

      const updatedUser = User.update(user.id, {
        name: '更新的用户名',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('更新的用户名');
      expect(updatedUser?.email).toBe(user.email);
    });

    it('应该删除用户', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });

      User.delete(user.id);
      const foundUser = User.findById(user.id);

      expect(foundUser).toBeUndefined();
    });

    it('应该拒绝创建重复邮箱的用户', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      };

      User.create(userData);

      expect(() => {
        User.create(userData);
      }).toThrow();
    });
  });

  describe('Project Model', () => {
    let userId: string;

    beforeEach(() => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });
      userId = user.id;
    });

    it('应该创建项目', () => {
      const projectData = {
        userId,
        name: '测试项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      };

      const project = Project.create(projectData);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.user_id).toBe(userId);
      expect(project.config).toEqual(projectData.config);
    });

    it('应该通过 ID 查找项目', () => {
      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      const foundProject = Project.findById(project.id);

      expect(foundProject).toBeDefined();
      expect(foundProject?.id).toBe(project.id);
      expect(foundProject?.name).toBe(project.name);
    });

    it('应该通过用户 ID 查找项目', () => {
      Project.create({
        userId,
        name: '项目 1',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      Project.create({
        userId,
        name: '项目 2',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      const projects = Project.findByUserId(userId);

      expect(projects).toHaveLength(2);
      expect(projects[0].user_id).toBe(userId);
      expect(projects[1].user_id).toBe(userId);
    });

    it('应该更新项目', () => {
      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      const updatedProject = Project.update(project.id, {
        name: '更新的项目名',
      });

      expect(updatedProject).toBeDefined();
      expect(updatedProject?.name).toBe('更新的项目名');
    });

    it('应该删除项目', () => {
      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      Project.delete(project.id);
      const foundProject = Project.findById(project.id);

      expect(foundProject).toBeNull();
    });

    it('应该搜索项目', () => {
      Project.create({
        userId,
        name: '测试项目 A',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      Project.create({
        userId,
        name: '测试项目 B',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });

      const projects = Project.search(userId, 'A');

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toContain('A');
    });
  });

  describe('Scene Model', () => {
    let projectId: string;
    let userId: string;

    beforeEach(() => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });
      userId = user.id;

      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });
      projectId = project.id;
    });

    it('应该创建场景', () => {
      const sceneData = {
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      };

      const scene = Scene.create(sceneData);

      expect(scene).toBeDefined();
      expect(scene.id).toBeDefined();
      expect(scene.name).toBe(sceneData.name);
      expect(scene.type).toBe(sceneData.type);
      expect(scene.start_frame).toBe(sceneData.startFrame);
      expect(scene.duration_frames).toBe(sceneData.durationFrames);
    });

    it('应该通过 ID 查找场景', () => {
      const scene = Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      const foundScene = Scene.findById(scene.id);

      expect(foundScene).toBeDefined();
      expect(foundScene?.id).toBe(scene.id);
      expect(foundScene?.name).toBe(scene.name);
    });

    it('应该通过项目 ID 查找场景', () => {
      Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      Scene.create({
        projectId,
        name: '场景 2',
        type: 'video' as const,
        startFrame: 90,
        durationFrames: 90,
        content: {},
      });

      const scenes = Scene.findByProjectId(projectId);

      expect(scenes).toHaveLength(2);
    });

    it('应该更新场景', () => {
      const scene = Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      const updatedScene = Scene.update(scene.id, {
        name: '更新的场景名',
        durationFrames: 120,
      });

      expect(updatedScene).toBeDefined();
      expect(updatedScene?.name).toBe('更新的场景名');
      expect(updatedScene?.duration_frames).toBe(120);
    });

    it('应该删除场景', () => {
      const scene = Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      Scene.delete(scene.id);
      const foundScene = Scene.findById(scene.id);

      expect(foundScene).toBeNull();
    });

    it('应该重新排序场景', () => {
      const scene1 = Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      const scene2 = Scene.create({
        projectId,
        name: '场景 2',
        type: 'video' as const,
        startFrame: 90,
        durationFrames: 90,
        content: {},
      });

      const scenes = Scene.reorder(projectId, 0, 1);

      expect(scenes).toHaveLength(2);
      expect(scenes[0].id).toBe(scene2.id);
      expect(scenes[1].id).toBe(scene1.id);
    });

    it('应该在重新排序时更新 start_frame', () => {
      Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      Scene.create({
        projectId,
        name: '场景 2',
        type: 'video' as const,
        startFrame: 90,
        durationFrames: 90,
        content: {},
      });

      const scenes = Scene.reorder(projectId, 0, 1);

      expect(scenes[0].startFrame).toBe(0);
      expect(scenes[1].startFrame).toBe(90);
    });

    it('应该拒绝无效的重新排序索引', () => {
      expect(() => {
        Scene.reorder(projectId, -1, 0);
      }).toThrow('Invalid index');

      expect(() => {
        Scene.reorder(projectId, 0, 100);
      }).toThrow('Invalid index');
    });
  });

  describe('Asset Model', () => {
    it('应该创建素材', () => {
      const assetData = {
        name: '测试视频.mp4',
        type: 'video' as const,
        url: '/uploads/test.mp4',
        duration: 5,
        width: 1920,
        height: 1080,
      };

      const asset = Asset.create(assetData);

      expect(asset).toBeDefined();
      expect(asset.id).toBeDefined();
      expect(asset.name).toBe(assetData.name);
      expect(asset.type).toBe(assetData.type);
      expect(asset.url).toBe(assetData.url);
    });

    it('应该通过 ID 查找素材', () => {
      const asset = Asset.create({
        name: '测试视频.mp4',
        type: 'video' as const,
        url: '/uploads/test.mp4',
      });

      const foundAsset = Asset.findById(asset.id);

      expect(foundAsset).toBeDefined();
      expect(foundAsset?.id).toBe(asset.id);
    });

    it('应该通过类型查找素材', () => {
      Asset.create({
        name: '视频 1.mp4',
        type: 'video' as const,
        url: '/uploads/video1.mp4',
      });

      Asset.create({
        name: '视频 2.mp4',
        type: 'video' as const,
        url: '/uploads/video2.mp4',
      });

      Asset.create({
        name: '图片 1.jpg',
        type: 'image' as const,
        url: '/uploads/image1.jpg',
      });

      const videoAssets = Asset.findByType('video');

      expect(videoAssets).toHaveLength(2);
      expect(videoAssets[0].type).toBe('video');
      expect(videoAssets[1].type).toBe('video');
    });

    it('应该搜索素材', () => {
      Asset.create({
        name: '风景视频.mp4',
        type: 'video' as const,
        url: '/uploads/landscape.mp4',
      });

      Asset.create({
        name: '人物视频.mp4',
        type: 'video' as const,
        url: '/uploads/people.mp4',
      });

      const assets = Asset.search('风景');

      expect(assets).toHaveLength(1);
      expect(assets[0].name).toContain('风景');
    });

    it('应该更新素材', () => {
      const asset = Asset.create({
        name: '测试视频.mp4',
        type: 'video' as const,
        url: '/uploads/test.mp4',
      });

      const updatedAsset = Asset.update(asset.id, {
        name: '更新的视频名.mp4',
      });

      expect(updatedAsset).toBeDefined();
      expect(updatedAsset?.name).toBe('更新的视频名.mp4');
    });

    it('应该删除素材', () => {
      const asset = Asset.create({
        name: '测试视频.mp4',
        type: 'video' as const,
        url: '/uploads/test.mp4',
      });

      Asset.delete(asset.id);
      const foundAsset = Asset.findById(asset.id);

      expect(foundAsset).toBeUndefined();
    });
  });

  describe('Export Model', () => {
    let projectId: string;
    let userId: string;

    beforeEach(() => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });
      userId = user.id;

      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });
      projectId = project.id;
    });

    it('应该创建导出任务', () => {
      const exportData = {
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video.mp4',
        outputPath: '/exports/video.mp4',
      };

      const exportTask = Export.create(exportData);

      expect(exportTask).toBeDefined();
      expect(exportTask.id).toBeDefined();
      expect(exportTask.project_id).toBe(projectId);
      expect(exportTask.format).toBe(exportData.format);
      expect(exportTask.quality).toBe(exportData.quality);
      expect(exportTask.status).toBe('pending');
    });

    it('应该通过 ID 查找导出任务', () => {
      const exportTask = Export.create({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video.mp4',
        outputPath: '/exports/video.mp4',
      });

      const foundExport = Export.findById(exportTask.id);

      expect(foundExport).toBeDefined();
      expect(foundExport?.id).toBe(exportTask.id);
    });

    it('应该通过状态查找导出任务', () => {
      Export.create({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video1.mp4',
        outputPath: '/exports/video1.mp4',
      });

      Export.create({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video2.mp4',
        outputPath: '/exports/video2.mp4',
      });

      const exports = Export.findByStatus('pending');

      expect(exports).toHaveLength(2);
      expect(exports[0].status).toBe('pending');
      expect(exports[1].status).toBe('pending');
    });

    it('应该更新导出任务', () => {
      const exportTask = Export.create({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video.mp4',
        outputPath: '/exports/video.mp4',
      });

      const updatedExport = Export.update(exportTask.id, {
        status: 'processing' as const,
        progress: 50,
      });

      expect(updatedExport).toBeDefined();
      expect(updatedExport?.status).toBe('processing');
      expect(updatedExport?.progress).toBe(50);
    });

    it('应该删除导出任务', () => {
      const exportTask = Export.create({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
        filename: 'video.mp4',
        outputPath: '/exports/video.mp4',
      });

      Export.delete(exportTask.id);
      const foundExport = Export.findById(exportTask.id);

      expect(foundExport).toBeUndefined();
    });
  });

  describe('Keyframe Model', () => {
    let sceneId: string;
    let projectId: string;
    let userId: string;

    beforeEach(() => {
      const user = User.create({
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户',
      });
      userId = user.id;

      const project = Project.create({
        userId,
        name: '测试项目',
        config: { width: 1920, height: 1080, fps: 30, duration: 180 },
      });
      projectId = project.id;

      const scene = Scene.create({
        projectId,
        name: '场景 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });
      sceneId = scene.id;
    });

    it('应该创建关键帧', () => {
      const keyframeData = {
        sceneId,
        frame: 30,
        properties: { x: 100, y: 100, opacity: 1 },
        interpolation: 'linear' as const,
      };

      const keyframe = Keyframe.create(keyframeData);

      expect(keyframe).toBeDefined();
      expect(keyframe.id).toBeDefined();
      expect(keyframe.scene_id).toBe(sceneId);
      expect(keyframe.frame).toBe(keyframeData.frame);
      expect(keyframe.interpolation).toBe(keyframeData.interpolation);
    });

    it('应该通过 ID 查找关键帧', () => {
      const keyframe = Keyframe.create({
        sceneId,
        frame: 30,
        properties: { x: 100 },
        interpolation: 'linear' as const,
      });

      const foundKeyframe = Keyframe.findById(keyframe.id);

      expect(foundKeyframe).toBeDefined();
      expect(foundKeyframe?.id).toBe(keyframe.id);
    });

    it('应该通过场景 ID 查找关键帧', () => {
      Keyframe.create({
        sceneId,
        frame: 30,
        properties: { x: 100 },
        interpolation: 'linear' as const,
      });

      Keyframe.create({
        sceneId,
        frame: 60,
        properties: { x: 200 },
        interpolation: 'ease-in' as const,
      });

      const keyframes = Keyframe.findBySceneId(sceneId);

      expect(keyframes).toHaveLength(2);
      expect(keyframes[0].frame).toBe(30);
      expect(keyframes[1].frame).toBe(60);
    });

    it('应该更新关键帧', () => {
      const keyframe = Keyframe.create({
        sceneId,
        frame: 30,
        properties: { x: 100 },
        interpolation: 'linear' as const,
      });

      const updatedKeyframe = Keyframe.update(keyframe.id, {
        frame: 45,
        properties: { x: 150, y: 150 },
      });

      expect(updatedKeyframe).toBeDefined();
      expect(updatedKeyframe?.frame).toBe(45);
      expect(updatedKeyframe?.properties).toEqual({ x: 150, y: 150 });
    });

    it('应该删除关键帧', () => {
      const keyframe = Keyframe.create({
        sceneId,
        frame: 30,
        properties: { x: 100 },
        interpolation: 'linear' as const,
      });

      Keyframe.delete(keyframe.id);
      const foundKeyframe = Keyframe.findById(keyframe.id);

      expect(foundKeyframe).toBeNull();
    });
  });
});
