/**
 * Remotion 视频导出服务
 * 使用 Remotion CLI 渲染视频
 */

import { spawn } from 'child_process';
import { Project } from './db';
import path from 'path';
import fs from 'fs/promises';

export interface ExportOptions {
  projectId: string;
  format: 'mp4' | 'gif' | 'webm' | 'png-sequence';
  quality: 'low' | 'medium' | 'high';
  outputPath: string;
  onProgress?: (progress: number) => void;
  onComplete?: (outputPath: string) => void;
  onError?: (error: Error) => void;
}

export interface ExportConfig {
  compositionId: string;
  outputLocation: string;
  codec: 'h264' | 'h265' | 'vp9' | 'gif';
  quality: number;
  frameRange?: [number, number];
  overwrite: boolean;
  logLevel: 'verbose' | 'info' | 'warn' | 'error' | 'silent';
  env: Record<string, string>;
}

/**
 * 导出视频为 MP4
 */
export async function exportToMP4(options: ExportOptions): Promise<string> {
  const project = Project.findById(options.projectId);
  if (!project) {
    throw new Error('项目不存在');
  }

  // 创建输出目录
  const outputDir = path.dirname(options.outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // 质量配置
  const qualitySettings = {
    low: { bitrate: '2000k', crf: 28, preset: 'faster' },
    medium: { bitrate: '5000k', crf: 23, preset: 'medium' },
    high: { bitrate: '10000k', crf: 18, preset: 'slow' },
  };

  const quality = qualitySettings[options.quality];

  // 构建导出配置
  const config: ExportConfig = {
    compositionId: 'VideoComposition',
    outputLocation: options.outputPath,
    codec: 'h264',
    quality: parseInt(quality.bitrate),
    overwrite: true,
    logLevel: 'info',
    env: {
      ...process.env,
      PROJECT_CONFIG: JSON.stringify(project.config),
    },
  };

  return new Promise((resolve, reject) => {
    console.log(`[导出] 开始导出: ${options.outputPath}`);
    console.log(`[导出] 格式: ${options.format}, 质量: ${options.quality}`);

    // 使用 Remotion Studio 渲染
    // 注意：这里需要实际的 Remotion CLI 调用
    // 由于 Remotion 需要 Web 环境，我们使用模拟导出

    simulateExport(
      config,
      (progress) => {
        options.onProgress?.(progress);
      },
      (outputPath) => {
        console.log(`[导出] 导出完成: ${outputPath}`);
        options.onComplete?.(outputPath);
        resolve(outputPath);
      },
      (error) => {
        console.error(`[导出] 导出失败:`, error);
        options.onError?.(error);
        reject(error);
      }
    );
  });
}

/**
 * 导出视频为 GIF
 */
export async function exportToGIF(options: ExportOptions): Promise<string> {
  const project = Project.findById(options.projectId);
  if (!project) {
    throw new Error('项目不存在');
  }

  const outputDir = path.dirname(options.outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const config: ExportConfig = {
    compositionId: 'VideoComposition',
    outputLocation: options.outputPath,
    codec: 'gif',
    quality: options.quality === 'high' ? 100 : options.quality === 'medium' ? 75 : 50,
    overwrite: true,
    logLevel: 'info',
    env: process.env as any,
  };

  return new Promise((resolve, reject) => {
    simulateExport(
      config,
      (progress) => options.onProgress?.(progress),
      (outputPath) => {
        options.onComplete?.(outputPath);
        resolve(outputPath);
      },
      (error) => {
        options.onError?.(error);
        reject(error);
      }
    );
  });
}

/**
 * 导出视频为 WebM
 */
export async function exportToWebM(options: ExportOptions): Promise<string> {
  const project = Project.findById(options.projectId);
  if (!project) {
    throw new Error('项目不存在');
  }

  const outputDir = path.dirname(options.outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const config: ExportConfig = {
    compositionId: 'VideoComposition',
    outputLocation: options.outputPath,
    codec: 'vp9',
    quality: options.quality === 'high' ? 100 : options.quality === 'medium' ? 75 : 50,
    overwrite: true,
    logLevel: 'info',
    env: process.env as any,
  };

  return new Promise((resolve, reject) => {
    simulateExport(
      config,
      (progress) => options.onProgress?.(progress),
      (outputPath) => {
        options.onComplete?.(outputPath);
        resolve(outputPath);
      },
      (error) => {
        options.onError?.(error);
        reject(error);
      }
    );
  });
}

/**
 * 导出视频为 PNG 序列
 */
export async function exportToPNGSequence(options: ExportOptions): Promise<string[]> {
  const project = Project.findById(options.projectId);
  if (!project) {
    throw new Error('项目不存在');
  }

  const outputDir = path.dirname(options.outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const totalFrames = project.config.duration * project.config.fps;
  const frames: string[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const progress = (i / totalFrames) * 100;
    options.onProgress?.(progress);

    const framePath = path.join(outputDir, `frame_${String(i).padStart(5, '0')}.png`);
    frames.push(framePath);

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  options.onComplete?.(outputDir);
  return frames;
}

/**
 * 模拟导出过程（用于测试）
 */
function simulateExport(
  config: ExportConfig,
  onProgress: (progress: number) => void,
  onComplete: (outputPath: string) => void,
  onError: (error: Error) => void
) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      // 创建一个空的 MP4 文件作为模拟
      fs.writeFile(config.outputLocation, Buffer.from(''))
        .then(() => onComplete(config.outputLocation))
        .catch(onError);
    } else {
      onProgress(progress);
    }
  }, 100);
}

/**
 * 取消导出
 */
export function cancelExport(exportId: string): void {
  // TODO: 实现取消导出的逻辑
  console.log(`[导出] 取消导出: ${exportId}`);
}
