/**
 * 集成测试
 * 测试完整的用户流程和工作流
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { register, login } from '@/lib/auth';
import { User, Project, Scene, Asset, Export, Keyframe } from '@/lib/db';

describe('Integration Tests', () => {
  let user: any;
  let token: string;

  beforeEach(async () => {
    // 创建测试用户并登录
    user = await register({
      email: 'test@example.com',
      password: 'password123',
      name: '测试用户',
    });

    const result = await login('test@example.com', 'password123');
    token = result.token;
  });

  afterEach(() => {
    // 清理测试数据
    // 注意：这里应该实现完整的清理逻辑
  });

  describe('完整的项目创建流程', () => {
    it('应该创建项目并添加场景', async () => {
      // 1. 创建项目
      const project = Project.create({
        userId: user.id,
        name: '我的第一个项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      expect(project).toBeDefined();
      expect(project.scenes).toHaveLength(0);

      // 2. 添加场景
      const scene1 = Scene.create({
        projectId: project.id,
        name: '开场场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 90,
        content: {
          assetId: 'video-1',
        },
      });

      const scene2 = Scene.create({
        projectId: project.id,
        name: '结束场景',
        type: 'video',
        startFrame: 90,
        durationFrames: 90,
        content: {
          assetId: 'video-2',
        },
      });

      expect(scene1).toBeDefined();
      expect(scene2).toBeDefined();

      // 3. 更新项目的场景列表
      const updatedProject = Project.update(project.id, {
        scenes: [scene1, scene2],
      });

      expect(updatedProject?.scenes).toHaveLength(2);
    });

    it('应该创建完整的项目并导出', async () => {
      // 1. 创建项目
      const project = Project.create({
        userId: user.id,
        name: '完整项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      // 2. 添加场景
      const scene = Scene.create({
        projectId: project.id,
        name: '主场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 180,
        content: {
          assetId: 'video-1',
        },
      });

      // 3. 添加关键帧
      const keyframe1 = Keyframe.create({
        sceneId: scene.id,
        frame: 0,
        properties: { x: 0, y: 0, opacity: 0 },
        interpolation: 'linear',
      });

      const keyframe2 = Keyframe.create({
        sceneId: scene.id,
        frame: 90,
        properties: { x: 960, y: 540, opacity: 1 },
        interpolation: 'ease-in-out',
      });

      // 4. 创建导出任务
      const exportTask = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'complete-project.mp4',
        outputPath: '/exports/complete-project.mp4',
      });

      expect(exportTask).toBeDefined();
      expect(exportTask.status).toBe('pending');

      // 5. 更新导出状态
      const processingExport = Export.update(exportTask.id, {
        status: 'processing',
        progress: 50,
      });

      expect(processingExport?.status).toBe('processing');
      expect(processingExport?.progress).toBe(50);

      // 6. 完成导出
      const completedExport = Export.update(exportTask.id, {
        status: 'completed',
        progress: 100,
      });

      expect(completedExport?.status).toBe('completed');
      expect(completedExport?.progress).toBe(100);
    });
  });

  describe('素材管理流程', () => {
    it('应该创建项目并添加素材', async () => {
      // 1. 创建项目
      const project = Project.create({
        userId: user.id,
        name: '素材测试项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      // 2. 添加素材
      const videoAsset = Asset.create({
        projectId: project.id,
        name: '测试视频.mp4',
        type: 'video',
        url: '/uploads/test-video.mp4',
        duration: 5,
        width: 1920,
        height: 1080,
      });

      const imageAsset = Asset.create({
        projectId: project.id,
        name: '测试图片.jpg',
        type: 'image',
        url: '/uploads/test-image.jpg',
        width: 1920,
        height: 1080,
      });

      const audioAsset = Asset.create({
        projectId: project.id,
        name: '测试音频.mp3',
        type: 'audio',
        url: '/uploads/test-audio.mp3',
        duration: 10,
      });

      expect(videoAsset).toBeDefined();
      expect(imageAsset).toBeDefined();
      expect(audioAsset).toBeDefined();

      // 3. 更新项目的素材列表
      const updatedProject = Project.update(project.id, {
        assets: [videoAsset, imageAsset, audioAsset],
      });

      expect(updatedProject?.assets).toHaveLength(3);

      // 4. 查询项目的素材
      const projectAssets = Asset.findByProjectId(project.id);

      expect(projectAssets).toHaveLength(3);
      expect(projectAssets[0].type).toBe('video');
      expect(projectAssets[1].type).toBe('image');
      expect(projectAssets[2].type).toBe('audio');
    });

    it('应该按类型查询素材', async () => {
      // 创建不同类型的素材
      Asset.create({
        name: '视频 1.mp4',
        type: 'video',
        url: '/uploads/video1.mp4',
      });

      Asset.create({
        name: '视频 2.mp4',
        type: 'video',
        url: '/uploads/video2.mp4',
      });

      Asset.create({
        name: '图片 1.jpg',
        type: 'image',
        url: '/uploads/image1.jpg',
      });

      Asset.create({
        name: '图片 2.jpg',
        type: 'image',
        url: '/uploads/image2.jpg',
      });

      Asset.create({
        name: '音频 1.mp3',
        type: 'audio',
        url: '/uploads/audio1.mp3',
      });

      // 查询视频素材
      const videoAssets = Asset.findByType('video');
      expect(videoAssets).toHaveLength(2);
      expect(videoAssets.every(a => a.type === 'video')).toBe(true);

      // 查询图片素材
      const imageAssets = Asset.findByType('image');
      expect(imageAssets).toHaveLength(2);
      expect(imageAssets.every(a => a.type === 'image')).toBe(true);

      // 查询音频素材
      const audioAssets = Asset.findByType('audio');
      expect(audioAssets).toHaveLength(1);
      expect(audioAssets[0].type).toBe('audio');
    });

    it('应该搜索素材', async () => {
      Asset.create({
        name: '风景视频.mp4',
        type: 'video',
        url: '/uploads/landscape.mp4',
      });

      Asset.create({
        name: '人物视频.mp4',
        type: 'video',
        url: '/uploads/people.mp4',
      });

      Asset.create({
        name: '风景图片.jpg',
        type: 'image',
        url: '/uploads/landscape-image.jpg',
      });

      // 搜索包含"风景"的素材
      const assets = Asset.search('风景');

      expect(assets).toHaveLength(2);
      expect(assets.every(a => a.name.includes('风景'))).toBe(true);
    });
  });

  describe('场景编辑流程', () => {
    it('应该编辑场景属性', async () => {
      // 1. 创建项目和场景
      const project = Project.create({
        userId: user.id,
        name: '场景编辑项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      const scene = Scene.create({
        projectId: project.id,
        name: '初始场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 90,
        content: {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
        },
      });

      // 2. 更新场景属性
      const updatedScene = Scene.update(scene.id, {
        name: '更新后的场景',
        durationFrames: 120,
        content: {
          x: 100,
          y: 100,
          scale: 1.5,
          rotation: 45,
          opacity: 0.8,
        },
      });

      expect(updatedScene?.name).toBe('更新后的场景');
      expect(updatedScene?.duration_frames).toBe(120);
      expect(updatedScene?.content.x).toBe(100);
      expect(updatedScene?.content.y).toBe(100);
      expect(updatedScene?.content.scale).toBe(1.5);
    });

    it('应该添加和删除关键帧', async () => {
      // 1. 创建项目和场景
      const project = Project.create({
        userId: user.id,
        name: '关键帧项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      const scene = Scene.create({
        projectId: project.id,
        name: '动画场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 180,
        content: {},
      });

      // 2. 添加多个关键帧
      const keyframes = [
        Keyframe.create({
          sceneId: scene.id,
          frame: 0,
          properties: { x: 0, y: 0, opacity: 0 },
          interpolation: 'linear',
        }),
        Keyframe.create({
          sceneId: scene.id,
          frame: 60,
          properties: { x: 480, y: 270, opacity: 0.5 },
          interpolation: 'ease-in',
        }),
        Keyframe.create({
          sceneId: scene.id,
          frame: 120,
          properties: { x: 960, y: 540, opacity: 1 },
          interpolation: 'ease-out',
        }),
      ];

      expect(keyframes).toHaveLength(3);

      // 3. 查询场景的关键帧
      const sceneKeyframes = Keyframe.findBySceneId(scene.id);

      expect(sceneKeyframes).toHaveLength(3);
      expect(sceneKeyframes[0].frame).toBe(0);
      expect(sceneKeyframes[1].frame).toBe(60);
      expect(sceneKeyframes[2].frame).toBe(120);

      // 4. 删除一个关键帧
      Keyframe.delete(keyframes[1].id);

      const updatedKeyframes = Keyframe.findBySceneId(scene.id);

      expect(updatedKeyframes).toHaveLength(2);
      expect(updatedKeyframes[0].id).toBe(keyframes[0].id);
      expect(updatedKeyframes[1].id).toBe(keyframes[2].id);
    });

    it('应该重新排序场景', async () => {
      // 1. 创建项目和多个场景
      const project = Project.create({
        userId: user.id,
        name: '场景排序项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      const scene1 = Scene.create({
        projectId: project.id,
        name: '场景 1',
        type: 'video',
        startFrame: 0,
        durationFrames: 60,
        content: {},
      });

      const scene2 = Scene.create({
        projectId: project.id,
        name: '场景 2',
        type: 'video',
        startFrame: 60,
        durationFrames: 60,
        content: {},
      });

      const scene3 = Scene.create({
        projectId: project.id,
        name: '场景 3',
        type: 'video',
        startFrame: 120,
        durationFrames: 60,
        content: {},
      });

      // 2. 重新排序场景（将场景 1 移到最后）
      const reorderedScenes = Scene.reorder(project.id, 0, 2);

      expect(reorderedScenes).toHaveLength(3);
      expect(reorderedScenes[0].id).toBe(scene2.id);
      expect(reorderedScenes[1].id).toBe(scene3.id);
      expect(reorderedScenes[2].id).toBe(scene1.id);

      // 3. 验证 start_frame 是否正确更新
      expect(reorderedScenes[0].startFrame).toBe(0);
      expect(reorderedScenes[1].startFrame).toBe(60);
      expect(reorderedScenes[2].startFrame).toBe(120);
    });
  });

  describe('导出流程', () => {
    it('应该创建和管理多个导出任务', async () => {
      // 1. 创建项目
      const project = Project.create({
        userId: user.id,
        name: '导出测试项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      // 2. 创建多个导出任务
      const export1 = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'video-high.mp4',
        outputPath: '/exports/video-high.mp4',
      });

      const export2 = Export.create({
        projectId: project.id,
        format: 'gif',
        quality: 'medium',
        filename: 'video-medium.gif',
        outputPath: '/exports/video-medium.gif',
      });

      const export3 = Export.create({
        projectId: project.id,
        format: 'webm',
        quality: 'low',
        filename: 'video-low.webm',
        outputPath: '/exports/video-low.webm',
      });

      expect(export1).toBeDefined();
      expect(export2).toBeDefined();
      expect(export3).toBeDefined();

      // 3. 查询项目的导出任务
      const projectExports = Export.findByProjectId(project.id);

      expect(projectExports).toHaveLength(3);

      // 4. 更新导出状态
      const updatedExport1 = Export.update(export1.id, {
        status: 'processing',
        progress: 75,
      });

      expect(updatedExport1?.status).toBe('processing');
      expect(updatedExport1?.progress).toBe(75);

      // 5. 完成导出
      const completedExport1 = Export.update(export1.id, {
        status: 'completed',
        progress: 100,
      });

      expect(completedExport1?.status).toBe('completed');

      // 6. 失败的导出
      const failedExport2 = Export.update(export2.id, {
        status: 'failed',
        error: '导出失败：内存不足',
      });

      expect(failedExport2?.status).toBe('failed');
      expect(failedExport2?.error).toBe('导出失败：内存不足');
    });

    it('应该查询待处理的导出任务', async () => {
      // 1. 创建项目和导出任务
      const project = Project.create({
        userId: user.id,
        name: '导出队列测试',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'video1.mp4',
        outputPath: '/exports/video1.mp4',
      });

      Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'video2.mp4',
        outputPath: '/exports/video2.mp4',
      });

      Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'video3.mp4',
        outputPath: '/exports/video3.mp4',
      });

      // 2. 查询待处理的导出任务
      const pendingExports = Export.findByStatus('pending');

      expect(pendingExports).toHaveLength(3);
      expect(pendingExports.every(e => e.status === 'pending')).toBe(true);
    });
  });

  describe('用户权限', () => {
    it('应该阻止用户访问其他用户的项目', async () => {
      // 1. 创建第一个用户和项目
      const user1 = await register({
        email: 'user1@example.com',
        password: 'password123',
        name: '用户 1',
      });

      const project1 = Project.create({
        userId: user1.id,
        name: '用户 1 的项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      // 2. 创建第二个用户
      const user2 = await register({
        email: 'user2@example.com',
        password: 'password123',
        name: '用户 2',
      });

      // 3. 用户 2 尝试访问用户 1 的项目
      const user1Projects = Project.findByUserId(user1.id);

      expect(user1Projects).toHaveLength(1);
      expect(user1Projects[0].user_id).toBe(user1.id);

      const user2Projects = Project.findByUserId(user2.id);

      expect(user2Projects).toHaveLength(0);
    });

    it('应该正确删除用户及其所有数据', async () => {
      // 1. 创建用户和项目
      const userData = await register({
        email: 'delete-test@example.com',
        password: 'password123',
        name: '待删除用户',
      });

      const project = Project.create({
        userId: userData.id,
        name: '待删除项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      });

      const scene = Scene.create({
        projectId: project.id,
        name: '待删除场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 90,
        content: {},
      });

      const exportTask = Export.create({
        projectId: project.id,
        format: 'mp4',
        quality: 'high',
        filename: 'test.mp4',
        outputPath: '/exports/test.mp4',
      });

      // 2. 删除用户
      User.delete(userData.id);

      // 3. 验证所有数据都被删除（外键约束）
      const foundUser = User.findById(userData.id);
      expect(foundUser).toBeUndefined();

      const foundProject = Project.findById(project.id);
      expect(foundProject).toBeNull();

      const foundScene = Scene.findById(scene.id);
      expect(foundScene).toBeNull();

      const foundExport = Export.findById(exportTask.id);
      expect(foundExport).toBeUndefined();
    });
  });
});
