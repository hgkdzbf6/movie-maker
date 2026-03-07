/**
 * 项目文件序列化工具
 * 负责将项目数据序列化为 JSON 文件和反序列化
 */

import { Project, Scene, Asset } from './db';
import fs from 'fs/promises';
import path from 'path';

export interface ProjectFile {
  version: string;
  metadata: {
    name: string;
    description?: string;
    thumbnail?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  };
  config: {
    width: number;
    height: number;
    fps: number;
    duration: number;
  };
  scenes: SerializedScene[];
  assets: SerializedAsset[];
  tracks: TrackConfig[];
}

export interface SerializedScene {
  id: string;
  name: string;
  type: 'video' | 'image' | 'text' | 'transition';
  startFrame: number;
  durationFrames: number;
  content: any;
  keyframes: SerializedKeyframe[];
}

export interface SerializedKeyframe {
  id: string;
  frame: number;
  properties: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
  };
  interpolation: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step';
}

export interface SerializedAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  createdAt: string;
}

export interface TrackConfig {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  visible: boolean;
  locked: boolean;
  volume?: number;
}

// 项目文件版本
const CURRENT_VERSION = '1.0.0';

/**
 * 将项目数据序列化为 JSON 文件
 */
export async function serializeProject(
  projectId: string,
  outputPath?: string
): Promise<string> {
  // 获取项目数据
  const project = Project.findById(projectId);
  if (!project) {
    throw new Error('项目不存在');
  }

  const scenes = Scene.findByProjectId(projectId);
  const assets = Asset.findByProjectId(projectId);

  // 序列化场景
  const serializedScenes = scenes.map(scene => ({
    id: scene.id,
    name: scene.name,
    type: scene.type,
    startFrame: scene.start_frame,
    durationFrames: scene.duration_frames,
    content: scene.content,
    keyframes: scene.keyframes.map(kf => ({
      id: kf.id,
      frame: kf.frame,
      properties: kf.properties,
      interpolation: kf.interpolation,
    })),
  }));

  // 序列化素材
  const serializedAssets = assets.map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    url: asset.url,
    duration: asset.duration,
    width: asset.width,
    height: asset.height,
    thumbnail: asset.thumbnail,
    createdAt: asset.created_at,
  }));

  // 轨道配置（从项目的 tracks 字段中获取）
  const tracks = project.tracks || [];

  // 构建项目文件
  const projectFile: ProjectFile = {
    version: CURRENT_VERSION,
    metadata: {
      name: project.name,
      description: project.description,
      thumbnail: project.thumbnail,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      createdBy: project.user_id,
    },
    config: project.config,
    scenes: serializedScenes,
    assets: serializedAssets,
    tracks,
  };

  // 保存到文件
  const fileName = `${project.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.json`;
  const filePath = outputPath || path.join(process.cwd(), 'projects', fileName);

  // 确保目录存在
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // 写入文件
  await fs.writeFile(filePath, JSON.stringify(projectFile, null, 2), 'utf-8');

  return filePath;
}

/**
 * 从 JSON 文件反序列化项目
 */
export async function deserializeProject(
  filePath: string,
  userId?: string
): Promise<{ projectId: string; projectFile: ProjectFile }> {
  // 读取文件
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const projectFile: ProjectFile = JSON.parse(fileContent);

  // 验证版本
  if (!isVersionCompatible(projectFile.version)) {
    throw new Error(`不兼容的项目文件版本: ${projectFile.version}`);
  }

  // 创建项目
  const project = Project.create({
    userId: userId || 'default-user',
    name: projectFile.metadata.name,
    thumbnail: projectFile.metadata.thumbnail,
    config: projectFile.config,
  });

  // 反序列化素材
  for (const serializedAsset of projectFile.assets) {
    await Asset.create({
      projectId: project.id,
      name: serializedAsset.name,
      type: serializedAsset.type,
      url: serializedAsset.url,
      duration: serializedAsset.duration,
      width: serializedAsset.width,
      height: serializedAsset.height,
      thumbnail: serializedAsset.thumbnail,
    });
  }

  // 反序列化场景
  for (const serializedScene of projectFile.scenes) {
    const scene = await Scene.create({
      projectId: project.id,
      name: serializedScene.name,
      type: serializedScene.type,
      startFrame: serializedScene.startFrame,
      durationFrames: serializedScene.durationFrames,
      content: serializedScene.content,
    });

    // 反序列化关键帧
    for (const serializedKeyframe of serializedScene.keyframes) {
      const { Keyframe } = await import('./db');
      await Keyframe.create({
        sceneId: scene.id,
        frame: serializedKeyframe.frame,
        properties: serializedKeyframe.properties,
        interpolation: serializedKeyframe.interpolation,
      });
    }
  }

  // 更新项目的 tracks
  await Project.update(project.id, {
    tracks: projectFile.tracks,
  });

  return {
    projectId: project.id,
    projectFile,
  };
}

/**
 * 验证项目文件版本是否兼容
 */
function isVersionCompatible(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [currentMajor] = CURRENT_VERSION.split('.').map(Number);

  // 主版本号必须相同
  return major === currentMajor;
}

/**
 * 获取项目文件信息（不加载完整数据）
 */
export async function getProjectFileInfo(
  filePath: string
): Promise<ProjectFile['metadata'] & { version: string; scenes: number; assets: number }> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const projectFile: ProjectFile = JSON.parse(fileContent);

  return {
    version: projectFile.version,
    ...projectFile.metadata,
    scenes: projectFile.scenes.length,
    assets: projectFile.assets.length,
  };
}

/**
 * 列出所有项目文件
 */
export async function listProjectFiles(): Promise<
  Array<{ filePath: string; info: any }>
> {
  const projectsDir = path.join(process.cwd(), 'projects');

  try {
    await fs.access(projectsDir);
  } catch {
    return [];
  }

  const files = await fs.readdir(projectsDir);
  const projectFiles = files.filter(f => f.endsWith('.json'));

  const result = [];
  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file);
    const info = await getProjectFileInfo(filePath);
    result.push({ filePath, info });
  }

  return result.sort((a, b) =>
    new Date(b.info.updatedAt).getTime() - new Date(a.info.updatedAt).getTime()
  );
}

/**
 * 自动保存项目（定期调用）
 */
export async function autoSaveProject(projectId: string): Promise<string> {
  const filePath = await serializeProject(projectId);
  console.log(`[自动保存] 项目已保存: ${filePath}`);
  return filePath;
}
