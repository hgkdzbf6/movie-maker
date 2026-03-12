/**
 * 音频精细控制功能测试
 * 测试音量调节、淡入淡出、音量关键帧、音频特效等功能
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '../../../src/store/editor';

describe('Audio Control Functionality', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.resetEditor();
    });
  });

  describe('updateAudioVolume', () => {
    it('should update audio volume', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加音频场景
      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
          volume: 1.0,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      // 更新音量
      act(() => {
        result.current.updateAudioVolume(audioScene!.id, 0.5);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volume).toBe(0.5);
    });

    it('should clamp volume to 0-1 range', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
          volume: 1.0,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      // 测试最小值
      act(() => {
        result.current.updateAudioVolume(audioScene!.id, -0.5);
      });

      let updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volume).toBe(0);

      // 测试最大值
      act(() => {
        result.current.updateAudioVolume(audioScene!.id, 1.5);
      });

      updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volume).toBe(1);
    });
  });

  describe('setAudioFade', () => {
    it('should set fade in duration', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioFade(audioScene!.id, 15, undefined);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.fadeInDuration).toBe(15);
      expect(updatedScene?.fadeOutDuration).toBeUndefined();
    });

    it('should set fade out duration', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioFade(audioScene!.id, undefined, 30);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.fadeInDuration).toBeUndefined();
      expect(updatedScene?.fadeOutDuration).toBe(30);
    });

    it('should set both fade in and fade out', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioFade(audioScene!.id, 15, 30);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.fadeInDuration).toBe(15);
      expect(updatedScene?.fadeOutDuration).toBe(30);
    });
  });

  describe('addVolumeKeyframe', () => {
    it('should add a volume keyframe', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(1);
      expect(updatedScene?.volumeKeyframes?.[0]).toEqual({ frame: 30, volume: 0.5 });
    });

    it('should add multiple keyframes and sort them', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 60, 0.3);
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.7);
        result.current.addVolumeKeyframe(audioScene!.id, 45, 0.5);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(3);
      expect(updatedScene?.volumeKeyframes?.map(kf => kf.frame)).toEqual([30, 45, 60]);
      expect(updatedScene?.volumeKeyframes?.map(kf => kf.volume)).toEqual([0.7, 0.5, 0.3]);
    });

    it('should update existing keyframe at same frame', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.8);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(1);
      expect(updatedScene?.volumeKeyframes?.[0]).toEqual({ frame: 30, volume: 0.8 });
    });

    it('should clamp keyframe volume to 0-1 range', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, -0.5);
        result.current.addVolumeKeyframe(audioScene!.id, 60, 1.5);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes?.[0].volume).toBe(0);
      expect(updatedScene?.volumeKeyframes?.[1].volume).toBe(1);
    });
  });

  describe('removeVolumeKeyframe', () => {
    it('should remove a volume keyframe', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
        result.current.addVolumeKeyframe(audioScene!.id, 60, 0.3);
      });

      let updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(2);

      act(() => {
        result.current.removeVolumeKeyframe(audioScene!.id, 30);
      });

      updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(1);
      expect(updatedScene?.volumeKeyframes?.[0].frame).toBe(60);
    });
  });

  describe('updateVolumeKeyframe', () => {
    it('should update keyframe frame and volume', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
      });

      act(() => {
        result.current.updateVolumeKeyframe(audioScene!.id, 30, 45, 0.8);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes).toHaveLength(1);
      expect(updatedScene?.volumeKeyframes?.[0]).toEqual({ frame: 45, volume: 0.8 });
    });

    it('should maintain sorted order after update', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
        result.current.addVolumeKeyframe(audioScene!.id, 60, 0.3);
      });

      act(() => {
        result.current.updateVolumeKeyframe(audioScene!.id, 30, 75, 0.8);
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.volumeKeyframes?.map(kf => kf.frame)).toEqual([60, 75]);
    });
  });

  describe('setAudioEffect', () => {
    it('should set audio effect to noise-reduction', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioEffect(audioScene!.id, 'noise-reduction');
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.audioEffect).toBe('noise-reduction');
    });

    it('should set audio effect to equalizer-bass', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioEffect(audioScene!.id, 'equalizer-bass');
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.audioEffect).toBe('equalizer-bass');
    });

    it('should set audio effect to compressor', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioEffect(audioScene!.id, 'compressor');
      });

      const updatedScene = result.current.scenes.find(s => s.id === audioScene!.id);
      expect(updatedScene?.audioEffect).toBe('compressor');
    });
  });

  describe('audio control in tracks', () => {
    it('should update audio volume in tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
          volume: 1.0,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.updateAudioVolume(audioScene!.id, 0.5);
      });

      const audioTrack = result.current.tracks.find(t => t.type === 'audio');
      const trackScene = audioTrack?.scenes.find(s => s.id === audioScene!.id);
      expect(trackScene?.volume).toBe(0.5);
    });

    it('should update fade durations in tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.setAudioFade(audioScene!.id, 15, 30);
      });

      const audioTrack = result.current.tracks.find(t => t.type === 'audio');
      const trackScene = audioTrack?.scenes.find(s => s.id === audioScene!.id);
      expect(trackScene?.fadeInDuration).toBe(15);
      expect(trackScene?.fadeOutDuration).toBe(30);
    });

    it('should update volume keyframes in tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addScene({
          id: 'audio-1',
          name: 'Audio 1',
          type: 'audio',
          startFrame: 0,
          durationFrames: 90,
        });
      });

      const audioScene = result.current.scenes.find(s => s.type === 'audio');

      act(() => {
        result.current.addVolumeKeyframe(audioScene!.id, 30, 0.5);
      });

      const audioTrack = result.current.tracks.find(t => t.type === 'audio');
      const trackScene = audioTrack?.scenes.find(s => s.id === audioScene!.id);
      expect(trackScene?.volumeKeyframes).toHaveLength(1);
      expect(trackScene?.volumeKeyframes?.[0]).toEqual({ frame: 30, volume: 0.5 });
    });
  });
});
