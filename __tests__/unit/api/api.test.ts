/**
 * API 路由单元测试
 * 测试项目、场景、素材管理 API
 */

import { expect } from '@jest/globals';

import { GET, POST, PUT, DELETE } from '@/app/api/projects/route';
import { POST as POSTScenes, PUT as PUTScenes, DELETE as DELETEScenes } from '@/app/api/projects/[id]/scenes/route';
import { GET as GETAssets, POST as POSTAssets, DELETE as DELETEAssets } from '@/app/api/assets/route';

describe('Projects API', () => {
  describe('GET /api/projects', () => {
    it('应该返回项目列表', async () => {
      const request = new Request('http://localhost:3000/api/projects', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('应该支持分页', async () => {
      const request = new Request('http://localhost:3000/api/projects?page=1&limit=10', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.length).toBeLessThanOrEqual(10);
    });

    it('应该支持搜索', async () => {
      const request = new Request('http://localhost:3000/api/projects?search=test', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.every((project: any) =>
        project.name.includes('test')
      )).toBe(true);
    });
  });

  describe('POST /api/projects', () => {
    it('应该创建新项目', async () => {
      const newProject = {
        name: '测试项目',
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      };

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(newProject.name);
      expect(data.config).toEqual(newProject.config);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('应该验证必填字段', async () => {
      const invalidProject = {
        name: '', // 无效的项目名称
        config: {} as any,
      };

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidProject),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('应该验证项目名称长度', async () => {
      const invalidProject = {
        name: 'a'.repeat(101), // 太长的项目名称
        config: {
          width: 1920,
          height: 1080,
          fps: 30,
          duration: 180,
        },
      };

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidProject),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('应该返回项目详情', async () => {
      const projectId = 'project-123';
      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'GET',
      });

      // Mock 项目数据
      jest.mock('@/lib/db', () => ({
        getProject: jest.fn().mockResolvedValue({
          id: projectId,
          name: '测试项目',
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
        }),
      }));

      const response = await GET(request, { params: { id: projectId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.id).toBe(projectId);
    });

    it('应该返回 404 如果项目不存在', async () => {
      const projectId = 'non-existent';
      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: projectId } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('应该更新项目', async () => {
      const projectId = 'project-123';
      const updates = {
        name: '更新的项目名称',
      };

      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const response = await PUT(request, { params: { id: projectId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.id).toBe(projectId);
      expect(data.name).toBe(updates.name);
      expect(data.updatedAt).toBeDefined();
    });

    it('应该验证项目所有权', async () => {
      const projectId = 'project-123';
      const updates = {
        name: '更新的项目名称',
      };

      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify(updates),
      });

      const response = await PUT(request, { params: { id: projectId } });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('应该删除项目', async () => {
      const projectId = 'project-123';
      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: projectId } });

      expect(response.status).toBe(200);
    });

    it('应该验证项目所有权', async () => {
      const projectId = 'project-123';
      const request = new Request(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      const response = await DELETE(request, { params: { id: projectId } });

      expect(response.status).toBe(401);
    });
  });
});

describe('Scenes API', () => {
  describe('POST /api/projects/[id]/scenes', () => {
    it('应该创建新场景', async () => {
      const projectId = 'project-123';
      const newScene = {
        name: '测试场景',
        type: 'video',
        startFrame: 0,
        durationFrames: 90,
        content: {},
      };

      const request = new Request(`http://localhost:3000/api/projects/${projectId}/scenes`, {
        method: 'POST',
        body: JSON.stringify(newScene),
      });

      const response = await POSTScenes(request, { params: { id: projectId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(newScene.name);
      expect(data.type).toBe(newScene.type);
      expect(data.startFrame).toBe(newScene.startFrame);
      expect(data.durationFrames).toBe(newScene.durationFrames);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('应该验证场景时长', async () => {
      const projectId = 'project-123';
      const invalidScene = {
        name: '测试场景',
        type: 'video',
        startFrame: 0,
        durationFrames: -1, // 无效的时长
        content: {},
      };

      const request = new Request(`http://localhost:3000/api/projects/${projectId}/scenes`, {
        method: 'POST',
        body: JSON.stringify(invalidScene),
      });

      const response = await POSTScenes(request, { params: { id: projectId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('PUT /api/scenes/[id]', () => {
    it('应该更新场景', async () => {
      const sceneId = 'scene-123';
      const updates = {
        name: '更新的场景名称',
        startFrame: 30,
        durationFrames: 120,
      };

      const request = new Request(`http://localhost:3000/api/scenes/${sceneId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const response = await PUTScenes(request, { params: { id: sceneId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.id).toBe(sceneId);
      expect(data.name).toBe(updates.name);
      expect(data.startFrame).toBe(updates.startFrame);
      expect(data.durationFrames).toBe(updates.durationFrames);
      expect(data.updatedAt).toBeDefined();
    });

    it('应该验证场景开始帧', async () => {
      const sceneId = 'scene-123';
      const invalidUpdates = {
        startFrame: -1, // 无效的开始帧
      };

      const request = new Request(`http://localhost:3000/api/scenes/${sceneId}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdates),
      });

      const response = await PUTScenes(request, { params: { id: sceneId } });

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBeDefined();
    });
  });

  describe('DELETE /api/scenes/[id]', () => {
    it('应该删除场景', async () => {
      const sceneId = 'scene-123';
      const request = new Request(`http://localhost:3000/api/scenes/${sceneId}`, {
        method: 'DELETE',
      });

      const response = await DELETEScenes(request, { params: { id: sceneId } });

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/scenes/reorder', () => {
    it('应该重新排序场景', async () => {
      const request = new Request('http://localhost:3000/api/scenes/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          fromIndex: 0,
          toIndex: 1,
        }),
      });

      const response = await (await import('@/app/api/scenes/reorder/route')).PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('应该验证索引范围', async () => {
      const invalidReorder = {
        fromIndex: -1, // 无效的索引
        toIndex: 1,
      };

      const request = new Request('http://localhost:3000/api/scenes/reorder', {
        method: 'PUT',
        body: JSON.stringify(invalidReorder),
      });

      const response = await (await import('@/app/api/scenes/reorder/route')).PUT(request);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBeDefined();
    });
  });
});

describe('Assets API', () => {
  describe('GET /api/assets', () => {
    it('应该返回素材列表', async () => {
      const request = new Request('http://localhost:3000/api/assets', {
        method: 'GET',
      });

      const response = await GETAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('应该支持分页', async () => {
      const request = new Request('http://localhost:3000/api/assets?page=1&limit=20', {
        method: 'GET',
      });

      const response = await GETAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.length).toBeLessThanOrEqual(20);
    });

    it('应该支持类型过滤', async () => {
      const request = new Request('http://localhost:3000/api/assets?type=video', {
        method: 'GET',
      });

      const response = await GETAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.every((asset: any) => asset.type === 'video')).toBe(true);
    });

    it('应该支持搜索', async () => {
      const request = new Request('http://localhost:3000/api/assets?search=test', {
        method: 'GET',
      });

      const response = await GETAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.every((asset: any) => asset.name.includes('test'))).toBe(true);
    });
  });

  describe('POST /api/assets/upload', () => {
    it('应该上传新素材', async () => {
      const file = new File(['test'], 'test.mp4', {
        type: 'video/mp4',
      });

      const formData = new FormData();
      formData.append('file', file);

      const request = new Request('http://localhost:3000/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POSTAssets(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBe('test.mp4');
      expect(data.type).toBe('video');
      expect(data.url).toBeDefined();
      expect(data.createdAt).toBeDefined();
    });

    it('应该验证文件类型', async () => {
      const file = new File(['test'], 'test.xyz', {
        type: 'application/xyz', // 无效的文件类型
      });

      const formData = new FormData();
      formData.append('file', file);

      const request = new Request('http://localhost:3000/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POSTAssets(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('应该验证文件大小', async () => {
      const largeFile = new File([new Array(101 * 1024 * 1024).join('a')], 'test.mp4', {
        type: 'video/mp4',
      });

      const formData = new FormData();
      formData.append('file', largeFile);

      const request = new Request('http://localhost:3000/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POSTAssets(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE /api/assets/[id]', () => {
    it('应该删除素材', async () => {
      const assetId = 'asset-123';
      const request = new Request(`http://localhost:3000/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      const response = await DELETEAssets(request, { params: { id: assetId } });

      expect(response.status).toBe(200);
    });
  });
});
