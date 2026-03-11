/**
 * Unit tests for metadata extractor
 * @jest-environment jsdom
 */

import {
  extractVideoMetadata,
  extractAudioMetadata,
  extractImageMetadata,
  extractAssetMetadata,
} from '../../src/lib/metadata-extractor';

// Mock DOM APIs
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('Metadata Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractVideoMetadata', () => {
    it('should extract video duration and resolution', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });

      // Mock video element
      const mockVideo = {
        preload: '',
        src: '',
        duration: 10.5,
        videoWidth: 1920,
        videoHeight: 1080,
        onloadedmetadata: null as any,
        onerror: null as any,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);

      const promise = extractVideoMetadata(mockFile);

      // Simulate metadata loaded
      setTimeout(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      }, 0);

      const metadata = await promise;

      expect(metadata.duration).toBe(10.5);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle invalid video files', async () => {
      const mockFile = new File(['invalid'], 'test.mp4', { type: 'video/mp4' });

      const mockVideo = {
        preload: '',
        src: '',
        onloadedmetadata: null as any,
        onerror: null as any,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);

      const promise = extractVideoMetadata(mockFile);

      // Simulate error
      setTimeout(() => {
        if (mockVideo.onerror) {
          mockVideo.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow('Failed to load video metadata');
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('extractAudioMetadata', () => {
    it('should extract audio duration and sample rate', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
      mockFile.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer);

      const mockAudioBuffer = {
        duration: 30.5,
        sampleRate: 44100,
        numberOfChannels: 2,
      };

      const mockAudioContext = {
        decodeAudioData: jest.fn().mockResolvedValue(mockAudioBuffer),
        close: jest.fn().mockResolvedValue(undefined),
      };

      (global as any).AudioContext = jest.fn(() => mockAudioContext);

      const metadata = await extractAudioMetadata(mockFile);

      expect(metadata.duration).toBe(30.5);
      expect(metadata.sampleRate).toBe(44100);
      expect(metadata.numberOfChannels).toBe(2);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle invalid audio files', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFile = new File(['invalid'], 'test.mp3', { type: 'audio/mp3' });
      mockFile.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer);

      const mockAudioContext = {
        decodeAudioData: jest.fn().mockRejectedValue(new Error('Invalid audio')),
        close: jest.fn().mockResolvedValue(undefined),
      };

      (global as any).AudioContext = jest.fn(() => mockAudioContext);

      await expect(extractAudioMetadata(mockFile)).rejects.toThrow('Invalid audio');
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('extractImageMetadata', () => {
    it('should extract image dimensions', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      // Mock Image constructor
      const mockImage = {
        src: '',
        naturalWidth: 1920,
        naturalHeight: 1080,
        onload: null as any,
        onerror: null as any,
      };

      (global as any).Image = jest.fn(() => mockImage);

      const promise = extractImageMetadata(mockFile);

      // Simulate image loaded
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const metadata = await promise;

      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle invalid image files', async () => {
      const mockFile = new File(['invalid'], 'test.jpg', { type: 'image/jpeg' });

      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
      };

      (global as any).Image = jest.fn(() => mockImage);

      const promise = extractImageMetadata(mockFile);

      // Simulate error
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror();
        }
      }, 0);

      await expect(promise).rejects.toThrow('Failed to load image metadata');
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('extractAssetMetadata', () => {
    it('should extract video metadata', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });

      const mockVideo = {
        preload: '',
        src: '',
        duration: 10,
        videoWidth: 1920,
        videoHeight: 1080,
        onloadedmetadata: null as any,
        onerror: null as any,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);

      const promise = extractAssetMetadata(mockFile, 'video');

      setTimeout(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      }, 0);

      const metadata = await promise;

      expect(metadata.duration).toBe(10);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
    });

    it('should extract audio metadata', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
      mockFile.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer);

      const mockAudioBuffer = {
        duration: 30,
        sampleRate: 44100,
        numberOfChannels: 2,
      };

      const mockAudioContext = {
        decodeAudioData: jest.fn().mockResolvedValue(mockAudioBuffer),
        close: jest.fn().mockResolvedValue(undefined),
      };

      (global as any).AudioContext = jest.fn(() => mockAudioContext);

      const metadata = await extractAssetMetadata(mockFile, 'audio');

      expect(metadata.duration).toBe(30);
      expect(metadata.sampleRate).toBe(44100);
      expect(metadata.numberOfChannels).toBe(2);
    });

    it('should extract image metadata', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      const mockImage = {
        src: '',
        naturalWidth: 1920,
        naturalHeight: 1080,
        onload: null as any,
        onerror: null as any,
      };

      (global as any).Image = jest.fn(() => mockImage);

      const promise = extractAssetMetadata(mockFile, 'image');

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const metadata = await promise;

      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
    });

    it('should throw error for unsupported type', async () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });

      await expect(
        extractAssetMetadata(mockFile, 'unsupported' as any)
      ).rejects.toThrow('Unsupported asset type');
    });
  });
});
