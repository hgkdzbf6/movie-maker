/**
 * 多轨编辑功能测试
 * 测试轨道添加、删除、重命名、高度调整等功能
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '../../../src/store/editor';

describe('Multi-Track Editing', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.resetEditor();
    });
  });

  describe('addTrack', () => {
    it('should add a new video track', () => {
      const { result } = renderHook(() => useEditorStore());

      const initialTrackCount = result.current.tracks.length;

      act(() => {
        result.current.addTrack({
          id: 'track-video-new',
          name: 'Video Track 4',
          type: 'video',
          visible: true,
          locked: false,
          height: 64,
        });
      });

      expect(result.current.tracks).toHaveLength(initialTrackCount + 1);
      const newTrack = result.current.tracks.find(t => t.id === 'track-video-new');
      expect(newTrack).toBeDefined();
      expect(newTrack?.name).toBe('Video Track 4');
      expect(newTrack?.type).toBe('video');
      expect(newTrack?.scenes).toEqual([]);
    });

    it('should add a new audio track', () => {
      const { result } = renderHook(() => useEditorStore());

      const initialTrackCount = result.current.tracks.length;

      act(() => {
        result.current.addTrack({
          id: 'track-audio-new',
          name: 'Audio Track 4',
          type: 'audio',
          visible: true,
          locked: false,
          volume: 1.0,
          height: 64,
        });
      });

      expect(result.current.tracks).toHaveLength(initialTrackCount + 1);
      const newTrack = result.current.tracks.find(t => t.id === 'track-audio-new');
      expect(newTrack).toBeDefined();
      expect(newTrack?.name).toBe('Audio Track 4');
      expect(newTrack?.type).toBe('audio');
      expect(newTrack?.volume).toBe(1.0);
      expect(newTrack?.scenes).toEqual([]);
    });
  });

  describe('deleteTrack', () => {
    it('should delete a track', () => {
      const { result } = renderHook(() => useEditorStore());

      const initialTrackCount = result.current.tracks.length;
      const trackToDelete = result.current.tracks[0];

      act(() => {
        result.current.deleteTrack(trackToDelete.id);
      });

      expect(result.current.tracks).toHaveLength(initialTrackCount - 1);
      expect(result.current.tracks.find(t => t.id === trackToDelete.id)).toBeUndefined();
    });

    it('should delete scenes when deleting a track', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加一个场景到第一个轨道
      const track = result.current.tracks[0];
      const scene = {
        id: 'scene-1',
        name: 'Scene 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
      };

      act(() => {
        result.current.addScene(scene);
      });

      expect(result.current.scenes).toHaveLength(1);

      // 删除轨道
      act(() => {
        result.current.deleteTrack(track.id);
      });

      // 场景应该被删除
      expect(result.current.scenes).toHaveLength(0);
    });

    it('should not delete the last track', () => {
      const { result } = renderHook(() => useEditorStore());

      // 删除所有轨道，只保留一个
      const tracks = result.current.tracks;
      for (let i = 0; i < tracks.length - 1; i++) {
        act(() => {
          result.current.deleteTrack(tracks[i].id);
        });
      }

      expect(result.current.tracks).toHaveLength(1);

      // 尝试删除最后一个轨道
      const lastTrack = result.current.tracks[0];
      act(() => {
        result.current.deleteTrack(lastTrack.id);
      });

      // 应该仍然有一个轨道
      expect(result.current.tracks).toHaveLength(1);
    });
  });

  describe('renameTrack', () => {
    it('should rename a track', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];
      const newName = 'My Custom Track';

      act(() => {
        result.current.renameTrack(track.id, newName);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.name).toBe(newName);
    });
  });

  describe('setTrackHeight', () => {
    it('should set track height', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];

      act(() => {
        result.current.setTrackHeight(track.id, 120);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.height).toBe(120);
    });

    it('should clamp height to minimum 60px', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];

      act(() => {
        result.current.setTrackHeight(track.id, 30);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.height).toBe(60);
    });

    it('should clamp height to maximum 200px', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];

      act(() => {
        result.current.setTrackHeight(track.id, 300);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.height).toBe(200);
    });
  });

  describe('toggleTrackVisibility', () => {
    it('should toggle track visibility', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];
      const initialVisibility = track.visible;

      act(() => {
        result.current.toggleTrackVisibility(track.id);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.visible).toBe(!initialVisibility);

      act(() => {
        result.current.toggleTrackVisibility(track.id);
      });

      const revertedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(revertedTrack?.visible).toBe(initialVisibility);
    });
  });

  describe('toggleTrackLock', () => {
    it('should toggle track lock', () => {
      const { result } = renderHook(() => useEditorStore());

      const track = result.current.tracks[0];
      const initialLock = track.locked;

      act(() => {
        result.current.toggleTrackLock(track.id);
      });

      const updatedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(updatedTrack?.locked).toBe(!initialLock);

      act(() => {
        result.current.toggleTrackLock(track.id);
      });

      const revertedTrack = result.current.tracks.find(t => t.id === track.id);
      expect(revertedTrack?.locked).toBe(initialLock);
    });
  });

  describe('moveSceneToTrack', () => {
    it('should move scene from one track to another', () => {
      const { result } = renderHook(() => useEditorStore());

      const videoTrack1 = result.current.tracks.find(t => t.type === 'video' && t.id === 'track-video-1');
      const videoTrack2 = result.current.tracks.find(t => t.type === 'video' && t.id === 'track-video-2');

      if (!videoTrack1 || !videoTrack2) {
        throw new Error('Video tracks not found');
      }

      // 添加场景到第一个视频轨道
      const scene = {
        id: 'scene-1',
        name: 'Scene 1',
        type: 'video' as const,
        startFrame: 0,
        durationFrames: 90,
      };

      act(() => {
        result.current.addScene(scene);
      });

      // 验证场景在第一个轨道
      const track1 = result.current.tracks.find(t => t.id === videoTrack1.id);
      expect(track1?.scenes).toHaveLength(1);
      expect(track1?.scenes[0].id).toBe(scene.id);

      // 移动场景到第二个轨道
      act(() => {
        result.current.moveSceneToTrack(scene.id, videoTrack1.id, videoTrack2.id);
      });

      // 验证场景已移动
      const updatedTrack1 = result.current.tracks.find(t => t.id === videoTrack1.id);
      const updatedTrack2 = result.current.tracks.find(t => t.id === videoTrack2.id);

      expect(updatedTrack1?.scenes).toHaveLength(0);
      expect(updatedTrack2?.scenes).toHaveLength(1);
      expect(updatedTrack2?.scenes[0].id).toBe(scene.id);
    });
  });
});
