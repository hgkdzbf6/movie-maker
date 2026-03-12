/**
 * 撤销/重做功能测试
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '@/store/editor';

describe('Undo/Redo Functionality', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.resetEditor();
    });
  });

  it('should save history when adding a scene', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene);
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.canUndo()).toBe(true);
    expect(result.current.canRedo()).toBe(false);
  });

  it('should undo scene addition', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene);
    });

    expect(result.current.scenes).toHaveLength(1);

    act(() => {
      result.current.undo();
    });

    expect(result.current.scenes).toHaveLength(0);
    expect(result.current.canUndo()).toBe(false);
    expect(result.current.canRedo()).toBe(true);
  });

  it('should redo scene addition', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene);
      result.current.undo();
    });

    expect(result.current.scenes).toHaveLength(0);

    act(() => {
      result.current.redo();
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].id).toBe('scene-1');
    expect(result.current.canUndo()).toBe(true);
    expect(result.current.canRedo()).toBe(false);
  });

  it('should handle multiple undo/redo operations', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene1 = {
      id: 'scene-1',
      name: 'Scene 1',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    const scene2 = {
      id: 'scene-2',
      name: 'Scene 2',
      type: 'video' as const,
      startFrame: 90,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene1);
      result.current.addScene(scene2);
    });

    expect(result.current.scenes).toHaveLength(2);

    // Undo twice
    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.scenes).toHaveLength(0);

    // Redo once
    act(() => {
      result.current.redo();
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].id).toBe('scene-1');
  });

  it('should save history when deleting a scene', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene);
      result.current.deleteScene('scene-1');
    });

    expect(result.current.scenes).toHaveLength(0);
    expect(result.current.canUndo()).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.scenes).toHaveLength(1);
  });

  it('should save history when updating a scene', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene);
      result.current.updateScene('scene-1', { name: 'Updated Scene' });
    });

    expect(result.current.scenes[0].name).toBe('Updated Scene');

    act(() => {
      result.current.undo();
    });

    expect(result.current.scenes[0].name).toBe('Test Scene');
  });

  it('should save history when splitting a scene', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 120,
    };

    act(() => {
      result.current.addScene(scene);
      result.current.splitScene('scene-1', 60);
    });

    expect(result.current.scenes).toHaveLength(2);

    act(() => {
      result.current.undo();
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].durationFrames).toBe(120);
  });

  it('should clear redo history when performing new action after undo', () => {
    const { result } = renderHook(() => useEditorStore());

    const scene1 = {
      id: 'scene-1',
      name: 'Scene 1',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
    };

    const scene2 = {
      id: 'scene-2',
      name: 'Scene 2',
      type: 'video' as const,
      startFrame: 90,
      durationFrames: 90,
    };

    act(() => {
      result.current.addScene(scene1);
      result.current.undo();
    });

    expect(result.current.canRedo()).toBe(true);

    // Perform new action
    act(() => {
      result.current.addScene(scene2);
    });

    // Redo should no longer be available
    expect(result.current.canRedo()).toBe(false);
  });

  it('should respect maximum history size', () => {
    const { result } = renderHook(() => useEditorStore());

    // Add more than maxHistorySize (50) scenes
    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.addScene({
          id: `scene-${i}`,
          name: `Scene ${i}`,
          type: 'video' as const,
          startFrame: i * 90,
          durationFrames: 90,
        });
      }
    });

    // Should only be able to undo up to maxHistorySize times
    let undoCount = 0;
    act(() => {
      while (result.current.canUndo() && undoCount < 60) {
        result.current.undo();
        undoCount++;
      }
    });

    // Should have undone at most 50 times (maxHistorySize)
    expect(undoCount).toBeLessThanOrEqual(50);
  });
});
