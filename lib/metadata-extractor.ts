/**
 * Metadata extraction utilities for video, audio, and image files
 */

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
}

export type AssetMetadata = Partial<VideoMetadata & AudioMetadata & ImageMetadata>;

/**
 * Extract video metadata using HTML5 video element
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract audio metadata using Web Audio API
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error('Web Audio API not supported');
  }

  const audioContext = new AudioContextCtor();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
    };
  } finally {
    await audioContext.close();
  }
}

/**
 * Extract image metadata using HTML5 image element
 */
export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image metadata'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract metadata from any asset type
 */
export async function extractAssetMetadata(
  file: File,
  type: 'video' | 'audio' | 'image'
): Promise<AssetMetadata> {
  try {
    switch (type) {
      case 'video':
        return await extractVideoMetadata(file);
      case 'audio':
        return await extractAudioMetadata(file);
      case 'image':
        return await extractImageMetadata(file);
      default:
        throw new Error('Unsupported asset type');
    }
  } catch (error) {
    console.error(`Failed to extract ${type} metadata:`, error);
    throw error;
  }
}
