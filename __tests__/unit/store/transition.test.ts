/**
 * 转场功能测试
 * 测试转场的创建、删除、更新等功能
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '../../../src/store/editor';

describe('Transition Functionality', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.resetEditor();
    });
  });

  describe('addTransition', () => {
    it('should add a fade transition', () => {
      const { result } = renderHook(() => useEditorStore());

      const initialSceneCount = result.current.scenes.length;

      act(() => {
        result.current.addTransition({
          name: 'Fade Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      expect(result.current.scenes).toHaveLength(initialSceneCount + 1);
      const transition = result.current.scenes.find(s => s.type === 'transition');
      expect(transition).toBeDefined();
      expect(transition?.name).toBe('Fade Transition');
      expect(transition?.transitionType).toBe('fade');
      expect(transition?.durationFrames).toBe(30);
    });

    it('should add a cross dissolve transition', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTransition({
          name: 'Cross Dissolve',
          type: 'transition',
          startFrame: 60,
          durationFrames: 45,
          transitionType: 'crossDissolve',
        });
      });

      const transition = result.current.scenes.find(s => s.transitionType === 'crossDissolve');
      expect(transition).toBeDefined();
      expect(transition?.startFrame).toBe(60);
      expect(transition?.durationFrames).toBe(45);
    });

    it('should add a push transition with direction', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTransition({
          name: 'Push Left',
          type: 'transition',
          startFrame: 90,
          durationFrames: 30,
          transitionType: 'push',
          transitionDirection: 'left',
        });
      });

      const transition = result.current.scenes.find(s => s.transitionType === 'push');
      expect(transition).toBeDefined();
      expect(transition?.transitionDirection).toBe('left');
    });

    it('should add transition to first video track', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTransition({
          name: 'Zoom Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'zoom',
        });
      });

      const videoTrack = result.current.tracks.find(t => t.type === 'video');
      expect(videoTrack).toBeDefined();
      expect(videoTrack?.scenes).toHaveLength(1);
      expect(videoTrack?.scenes[0].type).toBe('transition');
    });
  });

  describe('deleteTransition', () => {
    it('should delete a transition', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Test Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');
      expect(transition).toBeDefined();

      // 删除转场
      act(() => {
        result.current.deleteTransition(transition!.id);
      });

      expect(result.current.scenes.find(s => s.id === transition!.id)).toBeUndefined();
    });

    it('should remove transition from tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Test Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');
      const videoTrack = result.current.tracks.find(t => t.type === 'video');
      expect(videoTrack?.scenes).toHaveLength(1);

      // 删除转场
      act(() => {
        result.current.deleteTransition(transition!.id);
      });

      const updatedVideoTrack = result.current.tracks.find(t => t.type === 'video');
      expect(updatedVideoTrack?.scenes).toHaveLength(0);
    });
  });

  describe('updateTransition', () => {
    it('should update transition duration', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Test Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');

      // 更新时长
      act(() => {
        result.current.updateTransition(transition!.id, {
          durationFrames: 60,
        });
      });

      const updatedTransition = result.current.scenes.find(s => s.id === transition!.id);
      expect(updatedTransition?.durationFrames).toBe(60);
    });

    it('should update transition type', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Test Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');

      // 更新转场类型
      act(() => {
        result.current.updateTransition(transition!.id, {
          transitionType: 'zoom',
        });
      });

      const updatedTransition = result.current.scenes.find(s => s.id === transition!.id);
      expect(updatedTransition?.transitionType).toBe('zoom');
    });

    it('should update transition direction', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Push Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'push',
          transitionDirection: 'right',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');

      // 更新方向
      act(() => {
        result.current.updateTransition(transition!.id, {
          transitionDirection: 'left',
        });
      });

      const updatedTransition = result.current.scenes.find(s => s.id === transition!.id);
      expect(updatedTransition?.transitionDirection).toBe('left');
    });

    it('should update transition in tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加转场
      act(() => {
        result.current.addTransition({
          name: 'Test Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');

      // 更新转场
      act(() => {
        result.current.updateTransition(transition!.id, {
          name: 'Updated Transition',
          durationFrames: 60,
        });
      });

      const videoTrack = result.current.tracks.find(t => t.type === 'video');
      const trackTransition = videoTrack?.scenes.find(s => s.id === transition!.id);
      expect(trackTransition?.name).toBe('Updated Transition');
      expect(trackTransition?.durationFrames).toBe(60);
    });
  });

  describe('transition duration constraints', () => {
    it('should support minimum duration (0.5 seconds)', () => {
      const { result } = renderHook(() => useEditorStore());

      const minDuration = Math.floor(result.current.fps * 0.5); // 0.5 秒

      act(() => {
        result.current.addTransition({
          name: 'Short Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: minDuration,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');
      expect(transition?.durationFrames).toBe(minDuration);
    });

    it('should support maximum duration (2 seconds)', () => {
      const { result } = renderHook(() => useEditorStore());

      const maxDuration = result.current.fps * 2; // 2 秒

      act(() => {
        result.current.addTransition({
          name: 'Long Transition',
          type: 'transition',
          startFrame: 0,
          durationFrames: maxDuration,
          transitionType: 'fade',
        });
      });

      const transition = result.current.scenes.find(s => s.type === 'transition');
      expect(transition?.durationFrames).toBe(maxDuration);
    });
  });

  describe('multiple transitions', () => {
    it('should support multiple transitions', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTransition({
          name: 'Transition 1',
          type: 'transition',
          startFrame: 0,
          durationFrames: 30,
          transitionType: 'fade',
        });

        result.current.addTransition({
          name: 'Transition 2',
          type: 'transition',
          startFrame: 100,
          durationFrames: 30,
          transitionType: 'zoom',
        });

        result.current.addTransition({
          name: 'Transition 3',
          type: 'transition',
          startFrame: 200,
          durationFrames: 30,
          transitionType: 'push',
        });
      });

      const transitions = result.current.scenes.filter(s => s.type === 'transition');
      expect(transitions).toHaveLength(3);
      expect(transitions.map(t => t.transitionType)).toEqual(['fade', 'zoom', 'push']);
    });
  });
});
