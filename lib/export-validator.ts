/**
 * 导出前验证模块
 * 检查时间轴、素材、音频等是否符合导出要求
 */

import { Scene, Asset } from '@/store/editor';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  details?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ExportValidationInput {
  scenes: Scene[];
  assets: Asset[];
  fps: number;
}

/**
 * 验证导出前的项目状态
 */
export function validateExport(input: ExportValidationInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. 检查时间轴是否为空
  if (input.scenes.length === 0) {
    errors.push({
      type: 'error',
      message: '时间轴为空',
      details: '请添加至少一个场景到时间轴',
    });
  }

  // 2. 检查视频总时长是否为 0
  const totalDuration = Math.max(
    0,
    ...input.scenes.map((scene) => scene.startFrame + scene.durationFrames)
  );

  if (totalDuration === 0) {
    errors.push({
      type: 'error',
      message: '视频总时长为 0',
      details: '请确保场景有有效的时长',
    });
  }

  // 3. 检查缺失素材
  const missingAssets: string[] = [];
  input.scenes.forEach((scene) => {
    if (scene.content?.assetId) {
      const asset = input.assets.find((a) => a.id === scene.content?.assetId);
      if (!asset) {
        missingAssets.push(scene.name);
      } else if (asset.missing) {
        missingAssets.push(scene.name);
      }
    }
  });

  if (missingAssets.length > 0) {
    errors.push({
      type: 'error',
      message: `${missingAssets.length} 个场景的素材缺失`,
      details: `缺失素材的场景: ${missingAssets.join(', ')}`,
    });
  }

  // 4. 检查音频轨重叠
  const audioScenes = input.scenes.filter((scene) => scene.type === 'audio');
  const overlappingAudio: string[] = [];

  for (let i = 0; i < audioScenes.length; i++) {
    for (let j = i + 1; j < audioScenes.length; j++) {
      const scene1 = audioScenes[i];
      const scene2 = audioScenes[j];

      const end1 = scene1.startFrame + scene1.durationFrames;
      const end2 = scene2.startFrame + scene2.durationFrames;

      // 检查是否重叠
      if (
        (scene1.startFrame >= scene2.startFrame && scene1.startFrame < end2) ||
        (scene2.startFrame >= scene1.startFrame && scene2.startFrame < end1)
      ) {
        overlappingAudio.push(`${scene1.name} 与 ${scene2.name}`);
      }
    }
  }

  if (overlappingAudio.length > 0) {
    warnings.push({
      type: 'warning',
      message: '音频轨有重叠',
      details: `重叠的音频: ${overlappingAudio.join(', ')}`,
    });
  }

  // 5. 检查场景时长过短
  const shortScenes = input.scenes.filter(
    (scene) => scene.durationFrames < input.fps / 2 // 少于 0.5 秒
  );

  if (shortScenes.length > 0) {
    warnings.push({
      type: 'warning',
      message: `${shortScenes.length} 个场景时长过短`,
      details: `时长过短的场景: ${shortScenes.map((s) => s.name).join(', ')}`,
    });
  }

  // 6. 检查视频分辨率不一致
  const videoAssets = input.assets.filter((a) => a.type === 'video' || a.type === 'image');
  const resolutions = new Set(
    videoAssets
      .filter((a) => a.width && a.height)
      .map((a) => `${a.width}x${a.height}`)
  );

  if (resolutions.size > 3) {
    warnings.push({
      type: 'warning',
      message: '素材分辨率差异较大',
      details: `检测到 ${resolutions.size} 种不同的分辨率，可能影响导出质量`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
