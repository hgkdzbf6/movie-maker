/**
 * 文本/字幕功能测试
 * 测试文本场景的创建、样式更新、动画应用等功能
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '../../../src/store/editor';

describe('Text/Subtitle Functionality', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.resetEditor();
    });
  });

  describe('addTextScene', () => {
    it('should add a text scene', () => {
      const { result } = renderHook(() => useEditorStore());

      const initialSceneCount = result.current.scenes.length;

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            fontSize: 48,
            color: '#ffffff',
          },
        });
      });

      expect(result.current.scenes).toHaveLength(initialSceneCount + 1);
      const textScene = result.current.scenes.find(s => s.type === 'text');
      expect(textScene).toBeDefined();
      expect(textScene?.content?.text).toBe('Hello World');
      expect(textScene?.content?.fontSize).toBe(48);
      expect(textScene?.content?.color).toBe('#ffffff');
    });

    it('should add text scene to video track', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const videoTrack = result.current.tracks.find(t => t.type === 'video');
      expect(videoTrack).toBeDefined();
      expect(videoTrack?.scenes).toHaveLength(1);
      expect(videoTrack?.scenes[0].type).toBe('text');
    });
  });

  describe('updateTextContent', () => {
    it('should update text content', () => {
      const { result } = renderHook(() => useEditorStore());

      // 添加文本场景
      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      // 更新文本内容
      act(() => {
        result.current.updateTextContent(textScene!.id, {
          text: 'Updated Text',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.text).toBe('Updated Text');
    });

    it('should update font family', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            fontFamily: 'Arial, sans-serif',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          fontFamily: '"Times New Roman", serif',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.fontFamily).toBe('"Times New Roman", serif');
    });

    it('should update font size', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            fontSize: 48,
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          fontSize: 72,
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.fontSize).toBe(72);
    });

    it('should update font weight', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            fontWeight: 'normal',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          fontWeight: 'bold',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.fontWeight).toBe('bold');
    });

    it('should update text color', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            color: '#ffffff',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          color: '#ff0000',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.color).toBe('#ff0000');
    });

    it('should update text alignment', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            textAlign: 'center',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          textAlign: 'left',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.textAlign).toBe('left');
    });

    it('should update stroke properties', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          strokeWidth: 2,
          strokeColor: '#000000',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.strokeWidth).toBe(2);
      expect(updatedScene?.content?.strokeColor).toBe('#000000');
    });

    it('should update background properties', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          backgroundColor: '#000000',
          backgroundOpacity: 0.8,
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.backgroundColor).toBe('#000000');
      expect(updatedScene?.content?.backgroundOpacity).toBe(0.8);
    });

    it('should update shadow properties', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          shadowBlur: 10,
          shadowColor: '#000000',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.shadowBlur).toBe(10);
      expect(updatedScene?.content?.shadowColor).toBe('#000000');
      expect(updatedScene?.content?.shadowOffsetX).toBe(2);
      expect(updatedScene?.content?.shadowOffsetY).toBe(2);
    });

    it('should update animation', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            animation: 'none',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          animation: 'fadeIn',
        });
      });

      const updatedScene = result.current.scenes.find(s => s.id === textScene!.id);
      expect(updatedScene?.content?.animation).toBe('fadeIn');
    });

    it('should update text in tracks', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');

      act(() => {
        result.current.updateTextContent(textScene!.id, {
          text: 'Updated in Track',
        });
      });

      const videoTrack = result.current.tracks.find(t => t.type === 'video');
      const trackScene = videoTrack?.scenes.find(s => s.id === textScene!.id);
      expect(trackScene?.content?.text).toBe('Updated in Track');
    });
  });

  describe('text animations', () => {
    it('should support fadeIn animation', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            animation: 'fadeIn',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');
      expect(textScene?.content?.animation).toBe('fadeIn');
    });

    it('should support flyIn animation', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            animation: 'flyIn',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');
      expect(textScene?.content?.animation).toBe('flyIn');
    });

    it('should support typewriter animation', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'Hello World',
            animation: 'typewriter',
          },
        });
      });

      const textScene = result.current.scenes.find(s => s.type === 'text');
      expect(textScene?.content?.animation).toBe('typewriter');
    });
  });

  describe('multiple text scenes', () => {
    it('should support multiple text scenes', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addTextScene({
          name: 'Text 1',
          type: 'text',
          startFrame: 0,
          durationFrames: 90,
          content: {
            text: 'First Text',
          },
        });

        result.current.addTextScene({
          name: 'Text 2',
          type: 'text',
          startFrame: 100,
          durationFrames: 90,
          content: {
            text: 'Second Text',
          },
        });

        result.current.addTextScene({
          name: 'Text 3',
          type: 'text',
          startFrame: 200,
          durationFrames: 90,
          content: {
            text: 'Third Text',
          },
        });
      });

      const textScenes = result.current.scenes.filter(s => s.type === 'text');
      expect(textScenes).toHaveLength(3);
      expect(textScenes.map(t => t.content?.text)).toEqual(['First Text', 'Second Text', 'Third Text']);
    });
  });
});
