export interface ExportPreset {
  id: string;
  name: string;
  platform: string;
  icon: string;
  resolution: { width: number; height: number };
  fps: number;
  format: 'mp4' | 'gif' | 'webm';
  quality: 'low' | 'medium' | 'high';
  description: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'youtube-1080p',
    name: 'YouTube 1080p',
    platform: 'YouTube',
    icon: '📺',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '适合 YouTube 的高清视频',
  },
  {
    id: 'youtube-4k',
    name: 'YouTube 4K',
    platform: 'YouTube',
    icon: '📺',
    resolution: { width: 3840, height: 2160 },
    fps: 60,
    format: 'mp4',
    quality: 'high',
    description: '适合 YouTube 的超高清视频',
  },
  {
    id: 'instagram-feed',
    name: 'Instagram 动态',
    platform: 'Instagram',
    icon: '📷',
    resolution: { width: 1080, height: 1080 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '1:1 方形视频',
  },
  {
    id: 'instagram-story',
    name: 'Instagram 故事',
    platform: 'Instagram',
    icon: '📷',
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '9:16 竖屏视频',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    icon: '🎵',
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '9:16 竖屏短视频',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    platform: 'Twitter',
    icon: '🐦',
    resolution: { width: 1280, height: 720 },
    fps: 30,
    format: 'mp4',
    quality: 'medium',
    description: '适合 Twitter 的视频',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    platform: 'Facebook',
    icon: '👥',
    resolution: { width: 1280, height: 720 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '适合 Facebook 的视频',
  },
  {
    id: 'custom-1080p',
    name: '自定义 1080p',
    platform: 'Custom',
    icon: '⚙️',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    format: 'mp4',
    quality: 'high',
    description: '通用高清格式',
  },
];
