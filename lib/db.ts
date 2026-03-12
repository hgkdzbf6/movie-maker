/**
 * 数据库模块
 * 使用 SQLite 作为数据库
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// 数据库路径
const isTestEnv = process.env.NODE_ENV === 'test';
const defaultDbDir = isTestEnv ? path.join(process.cwd(), '.test-data') : path.join(process.cwd(), 'data');
const defaultDbPath = path.join(defaultDbDir, isTestEnv ? 'test.db' : 'remotion.db');
const configuredDbPath = process.env.DATABASE_PATH;
const DB_PATH = configuredDbPath ? path.resolve(configuredDbPath) : defaultDbPath;
const DB_DIR = path.dirname(DB_PATH);

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    thumbnail TEXT,
    description TEXT,
    config TEXT NOT NULL,
    scenes TEXT NOT NULL,
    assets TEXT NOT NULL,
    tracks TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    start_frame INTEGER NOT NULL,
    duration_frames INTEGER NOT NULL,
    trim_start INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    keyframes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    duration REAL,
    width INTEGER,
    height INTEGER,
    thumbnail TEXT,
    sample_rate INTEGER,
    number_of_channels INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    format TEXT NOT NULL,
    quality TEXT NOT NULL,
    filename TEXT NOT NULL,
    output_path TEXT NOT NULL,
    status TEXT NOT NULL,
    progress REAL DEFAULT 0,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS keyframes (
    id TEXT PRIMARY KEY,
    scene_id TEXT NOT NULL,
    frame INTEGER NOT NULL,
    properties TEXT NOT NULL,
    interpolation TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
  CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
  CREATE INDEX IF NOT EXISTS idx_exports_project_id ON exports(project_id);
  CREATE INDEX IF NOT EXISTS idx_keyframes_scene_id ON keyframes(scene_id);
`);

// 工具函数：生成当前时间戳
const now = () => new Date().toISOString();

// ============================================
// User 模型
// ============================================

export const User = {
  create: (data: { email: string; password: string; name: string }) => {
    const id = randomUUID();
    const user = {
      id,
      email: data.email,
      password: data.password,
      name: data.name,
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO users (id, email, password, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.email, user.password, user.name, user.created_at, user.updated_at);

    return user;
  },

  findById: (id: string) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  },

  findByEmail: (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  },

  update: (id: string, data: Partial<{ name: string; password: string }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.password) {
      updates.push('password = ?');
      values.push(data.password);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};

// ============================================
// Project 模型
// ============================================

export const Project = {
  create: (data: {
    userId: string;
    name: string;
    thumbnail?: string;
    description?: string;
    config: any;
  }) => {
    const id = randomUUID();
    const project = {
      id,
      user_id: data.userId,
      name: data.name,
      thumbnail: data.thumbnail || null,
      description: data.description || null,
      config: JSON.stringify(data.config),
      scenes: JSON.stringify([]),
      assets: JSON.stringify([]),
      tracks: JSON.stringify([]),
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO projects (id, user_id, name, thumbnail, description, config, scenes, assets, tracks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.user_id,
      project.name,
      project.thumbnail,
      project.description,
      project.config,
      project.scenes,
      project.assets,
      project.tracks,
      project.created_at,
      project.updated_at
    );

    return { ...project, config: data.config, scenes: [], assets: [], tracks: [] };
  },

  findById: (id: string) => {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (project) {
      return {
        ...project,
        config: JSON.parse(project.config),
        scenes: JSON.parse(project.scenes),
        assets: JSON.parse(project.assets),
        tracks: JSON.parse(project.tracks || '[]'),
      };
    }
    return null;
  },

  findByUserId: (userId: string, page = 1, limit = 10) => {
    const projects = db.prepare(`
      SELECT * FROM projects WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, (page - 1) * limit) as any[];

    return projects.map(project => ({
      ...project,
      config: JSON.parse(project.config),
      scenes: JSON.parse(project.scenes),
      assets: JSON.parse(project.assets),
      tracks: JSON.parse(project.tracks || '[]'),
    }));
  },

  update: (id: string, data: Partial<{
    name: string;
    thumbnail: string;
    description: string;
    config: any;
    scenes: any[];
    assets: any[];
    tracks: any[];
  }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.thumbnail !== undefined) {
      updates.push('thumbnail = ?');
      values.push(data.thumbnail);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.config !== undefined) {
      updates.push('config = ?');
      values.push(JSON.stringify(data.config));
    }
    if (data.scenes !== undefined) {
      updates.push('scenes = ?');
      values.push(JSON.stringify(data.scenes));
    }
    if (data.assets !== undefined) {
      updates.push('assets = ?');
      values.push(JSON.stringify(data.assets));
    }
    if (data.tracks !== undefined) {
      updates.push('tracks = ?');
      values.push(JSON.stringify(data.tracks));
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`
      UPDATE projects SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return Project.findById(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  },

  search: (userId: string, query: string, page = 1, limit = 10) => {
    const projects = db.prepare(`
      SELECT * FROM projects WHERE user_id = ? AND name LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, `%${query}%`, limit, (page - 1) * limit) as any[];

    return projects.map(project => ({
      ...project,
      config: JSON.parse(project.config),
      scenes: JSON.parse(project.scenes),
      assets: JSON.parse(project.assets),
      tracks: JSON.parse(project.tracks || '[]'),
    }));
  },
};

// ============================================
// Scene 模型
// ============================================

export const Scene = {
  create: (data: {
    projectId: string;
    name: string;
    type: 'video' | 'image' | 'text' | 'transition';
    startFrame: number;
    durationFrames: number;
    trimStart?: number;
    content: any;
  }) => {
    const id = randomUUID();
    const scene = {
      id,
      project_id: data.projectId,
      name: data.name,
      type: data.type,
      start_frame: data.startFrame,
      duration_frames: data.durationFrames,
      trim_start: data.trimStart || 0,
      content: JSON.stringify(data.content || {}),
      keyframes: JSON.stringify([]),
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO scenes (id, project_id, name, type, start_frame, duration_frames, trim_start, content, keyframes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scene.id,
      scene.project_id,
      scene.name,
      scene.type,
      scene.start_frame,
      scene.duration_frames,
      scene.trim_start,
      scene.content,
      scene.keyframes,
      scene.created_at,
      scene.updated_at
    );

    return { ...scene, content: data.content || {}, keyframes: [], trimStart: scene.trim_start };
  },

  findById: (id: string) => {
    const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(id) as any;
    if (scene) {
      return {
        ...scene,
        content: JSON.parse(scene.content),
        keyframes: JSON.parse(scene.keyframes),
      };
    }
    return null;
  },

  findByProjectId: (projectId: string) => {
    const scenes = db.prepare(`
      SELECT * FROM scenes WHERE project_id = ?
      ORDER BY start_frame ASC
    `).all(projectId) as any[];

    return scenes.map(scene => ({
      ...scene,
      content: JSON.parse(scene.content),
      keyframes: JSON.parse(scene.keyframes),
    }));
  },

  update: (id: string, data: Partial<{
    name: string;
    startFrame: number;
    durationFrames: number;
    trimStart: number;
    content: any;
    keyframes: any[];
  }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.startFrame !== undefined) {
      updates.push('start_frame = ?');
      values.push(data.startFrame);
    }
    if (data.durationFrames !== undefined) {
      updates.push('duration_frames = ?');
      values.push(data.durationFrames);
    }
    if (data.trimStart !== undefined) {
      updates.push('trim_start = ?');
      values.push(data.trimStart);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(JSON.stringify(data.content));
    }
    if (data.keyframes !== undefined) {
      updates.push('keyframes = ?');
      values.push(JSON.stringify(data.keyframes));
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`
      UPDATE scenes SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return Scene.findById(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
  },

  reorder: (projectId: string, fromIndex: number, toIndex: number) => {
    const scenes = Scene.findByProjectId(projectId);

    if (fromIndex < 0 || fromIndex >= scenes.length || toIndex < 0 || toIndex >= scenes.length) {
      throw new Error('Invalid index');
    }

    const [movedScene] = scenes.splice(fromIndex, 1);
    scenes.splice(toIndex, 0, movedScene);

    // 更新 start_frame
    let currentFrame = 0;
    for (const scene of scenes) {
      const durationFrames = scene.duration_frames ?? scene.durationFrames ?? 0;
      scene.startFrame = currentFrame;
      scene.durationFrames = durationFrames;
      currentFrame += durationFrames;

      Scene.update(scene.id, {
        startFrame: scene.startFrame,
        durationFrames,
      });
    }

    return scenes;
  },
};

// ============================================
// Asset 模型
// ============================================

export const Asset = {
  create: (data: {
    projectId?: string;
    name: string;
    type: 'video' | 'image' | 'audio';
    url: string;
    duration?: number;
    width?: number;
    height?: number;
    thumbnail?: string;
    sampleRate?: number;
    numberOfChannels?: number;
  }) => {
    const id = randomUUID();
    const asset = {
      id,
      project_id: data.projectId || null,
      name: data.name,
      type: data.type,
      url: data.url,
      duration: data.duration || null,
      width: data.width || null,
      height: data.height || null,
      thumbnail: data.thumbnail || null,
      sample_rate: data.sampleRate || null,
      number_of_channels: data.numberOfChannels || null,
      created_at: now(),
    };

    db.prepare(`
      INSERT INTO assets (id, project_id, name, type, url, duration, width, height, thumbnail, sample_rate, number_of_channels, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      asset.id,
      asset.project_id,
      asset.name,
      asset.type,
      asset.url,
      asset.duration,
      asset.width,
      asset.height,
      asset.thumbnail,
      asset.sample_rate,
      asset.number_of_channels,
      asset.created_at
    );

    return asset;
  },

  findById: (id: string) => {
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as any;
  },

  findByProjectId: (projectId: string, page = 1, limit = 10) => {
    return db.prepare(`
      SELECT * FROM assets WHERE project_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `).all(projectId, limit, (page - 1) * limit) as any[];
  },

  findByType: (type: 'video' | 'image' | 'audio', page = 1, limit = 10) => {
    return db.prepare(`
      SELECT * FROM assets WHERE type = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(type, limit, (page - 1) * limit) as any[];
  },

  search: (query: string, page = 1, limit = 10) => {
    return db.prepare(`
      SELECT * FROM assets WHERE name LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(`%${query}%`, limit, (page - 1) * limit) as any[];
  },

  update: (id: string, data: Partial<{
    name: string;
    thumbnail: string;
    duration: number;
    width: number;
    height: number;
    sampleRate: number;
    numberOfChannels: number;
  }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.thumbnail !== undefined) {
      updates.push('thumbnail = ?');
      values.push(data.thumbnail);
    }
    if (data.duration !== undefined) {
      updates.push('duration = ?');
      values.push(data.duration);
    }
    if (data.width !== undefined) {
      updates.push('width = ?');
      values.push(data.width);
    }
    if (data.height !== undefined) {
      updates.push('height = ?');
      values.push(data.height);
    }
    if (data.sampleRate !== undefined) {
      updates.push('sample_rate = ?');
      values.push(data.sampleRate);
    }
    if (data.numberOfChannels !== undefined) {
      updates.push('number_of_channels = ?');
      values.push(data.numberOfChannels);
    }

    if (updates.length === 0) {
      return null;
    }

    values.push(id);

    db.prepare(`
      UPDATE assets SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return Asset.findById(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  },
};

// ============================================
// Export 模型
// ============================================

export const Export = {
  create: (data: {
    projectId: string;
    format: 'mp4' | 'gif' | 'webm' | 'png';
    quality: 'low' | 'medium' | 'high';
    filename: string;
    outputPath: string;
  }) => {
    const id = randomUUID();
    const exportData = {
      id,
      project_id: data.projectId,
      format: data.format,
      quality: data.quality,
      filename: data.filename,
      output_path: data.outputPath,
      status: 'pending',
      progress: 0,
      error: null,
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO exports (id, project_id, format, quality, filename, output_path, status, progress, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      exportData.id,
      exportData.project_id,
      exportData.format,
      exportData.quality,
      exportData.filename,
      exportData.output_path,
      exportData.status,
      exportData.progress,
      exportData.error,
      exportData.created_at,
      exportData.updated_at
    );

    return {
      ...exportData,
      outputPath: exportData.output_path,
      createdAt: exportData.created_at,
      updatedAt: exportData.updated_at,
    };
  },

  findById: (id: string) => {
    return db.prepare('SELECT * FROM exports WHERE id = ?').get(id) as any;
  },

  findByProjectId: (projectId: string) => {
    return db.prepare(`
      SELECT * FROM exports WHERE project_id = ?
      ORDER BY created_at DESC
    `).all(projectId) as any[];
  },

  findByStatus: (status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled') => {
    return db.prepare(`
      SELECT * FROM exports WHERE status = ?
      ORDER BY created_at ASC
    `).all(status) as any[];
  },

  update: (id: string, data: Partial<{
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    error: string;
    outputPath: string;
  }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.progress !== undefined) {
      updates.push('progress = ?');
      values.push(data.progress);
    }
    if (data.error !== undefined) {
      updates.push('error = ?');
      values.push(data.error);
    }
    if (data.outputPath !== undefined) {
      updates.push('output_path = ?');
      values.push(data.outputPath);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`
      UPDATE exports SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return Export.findById(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM exports WHERE id = ?').run(id);
  },
};

// ============================================
// Keyframe 模型
// ============================================

export const Keyframe = {
  create: (data: {
    sceneId: string;
    frame: number;
    properties: any;
    interpolation: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step';
  }) => {
    const id = randomUUID();
    const keyframe = {
      id,
      scene_id: data.sceneId,
      frame: data.frame,
      properties: JSON.stringify(data.properties),
      interpolation: data.interpolation,
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO keyframes (id, scene_id, frame, properties, interpolation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      keyframe.id,
      keyframe.scene_id,
      keyframe.frame,
      keyframe.properties,
      keyframe.interpolation,
      keyframe.created_at,
      keyframe.updated_at
    );

    return { ...keyframe, properties: data.properties };
  },

  findById: (id: string) => {
    const keyframe = db.prepare('SELECT * FROM keyframes WHERE id = ?').get(id) as any;
    if (keyframe) {
      return {
        ...keyframe,
        properties: JSON.parse(keyframe.properties),
      };
    }
    return null;
  },

  findBySceneId: (sceneId: string) => {
    const keyframes = db.prepare(`
      SELECT * FROM keyframes WHERE scene_id = ?
      ORDER BY frame ASC
    `).all(sceneId) as any[];

    return keyframes.map(keyframe => ({
      ...keyframe,
      properties: JSON.parse(keyframe.properties),
    }));
  },

  update: (id: string, data: Partial<{
    frame: number;
    properties: any;
    interpolation: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step';
  }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.frame !== undefined) {
      updates.push('frame = ?');
      values.push(data.frame);
    }
    if (data.properties !== undefined) {
      updates.push('properties = ?');
      values.push(JSON.stringify(data.properties));
    }
    if (data.interpolation !== undefined) {
      updates.push('interpolation = ?');
      values.push(data.interpolation);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = ?');
    values.push(now());
    values.push(id);

    db.prepare(`
      UPDATE keyframes SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return Keyframe.findById(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM keyframes WHERE id = ?').run(id);
  },
};

// ============================================
// 数据库工具函数
// ============================================

export const DatabaseUtils = {
  backup: async (backupPath: string) => {
    return db.backup(backupPath);
  },

  close: () => {
    db.close();
  },
};

export { db };
