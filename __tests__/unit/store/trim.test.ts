import { useEditorStore } from '@/store/editor';
import type { Scene } from '@/store/editor';

describe('Trim Functionality', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  describe('trimSceneLeft', () => {
    it('should trim scene from the left', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneLeft('scene-1', 50);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene).toBeDefined();
      expect(updatedScene?.startFrame).toBe(50);
      expect(updatedScene?.durationFrames).toBe(250);
      expect(updatedScene?.trimStart).toBe(50);
    });

    it('should not trim below minimum duration', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 60,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneLeft('scene-1', 50);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene).toBeDefined();
      expect(updatedScene?.durationFrames).toBeGreaterThanOrEqual(30);
    });

    it('should handle trimming beyond available duration', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 100,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneLeft('scene-1', 200);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene).toBeDefined();
      expect(updatedScene?.durationFrames).toBe(30); // minimum duration
    });

    it('should update scene in tracks', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneLeft('scene-1', 50);

      const tracks = useEditorStore.getState().tracks;
      const videoTrack = tracks.find(t => t.type === 'video');
      const trackScene = videoTrack?.scenes.find(s => s.id === 'scene-1');

      expect(trackScene).toBeDefined();
      expect(trackScene?.startFrame).toBe(50);
      expect(trackScene?.durationFrames).toBe(250);
      expect(trackScene?.trimStart).toBe(50);
    });
  });

  describe('trimSceneRight', () => {
    it('should trim scene from the right', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneRight('scene-1', 200);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene).toBeDefined();
      expect(updatedScene?.startFrame).toBe(0);
      expect(updatedScene?.durationFrames).toBe(200);
    });

    it('should not trim below minimum duration', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 100,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneRight('scene-1', 10);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene).toBeDefined();
      expect(updatedScene?.durationFrames).toBe(30); // minimum duration
    });

    it('should update scene in tracks', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneRight('scene-1', 200);

      const tracks = useEditorStore.getState().tracks;
      const videoTrack = tracks.find(t => t.type === 'video');
      const trackScene = videoTrack?.scenes.find(s => s.id === 'scene-1');

      expect(trackScene).toBeDefined();
      expect(trackScene?.startFrame).toBe(0);
      expect(trackScene?.durationFrames).toBe(200);
    });
  });

  describe('Combined trim operations', () => {
    it('should handle multiple trim operations', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);

      // Trim from left
      useEditorStore.getState().trimSceneLeft('scene-1', 50);
      let updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene?.startFrame).toBe(50);
      expect(updatedScene?.durationFrames).toBe(250);
      expect(updatedScene?.trimStart).toBe(50);

      // Trim from right
      useEditorStore.getState().trimSceneRight('scene-1', 200);
      updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene?.startFrame).toBe(50);
      expect(updatedScene?.durationFrames).toBe(150);
    });

    it('should preserve trimStart when trimming from right', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 0,
        durationFrames: 300,
        trimStart: 20,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneRight('scene-1', 200);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene?.trimStart).toBe(20);
      expect(updatedScene?.durationFrames).toBe(200);
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent scene', () => {
      useEditorStore.getState().trimSceneLeft('non-existent', 50);
      expect(useEditorStore.getState().scenes).toHaveLength(0);
    });

    it('should handle negative trim values', () => {
      const scene: Scene = {
        id: 'scene-1',
        name: 'Test Scene',
        type: 'video',
        startFrame: 100,
        durationFrames: 300,
      };

      useEditorStore.getState().addScene(scene);
      useEditorStore.getState().trimSceneLeft('scene-1', 50);

      const updatedScene = useEditorStore.getState().scenes.find(s => s.id === 'scene-1');
      expect(updatedScene?.startFrame).toBe(100); // Should not move backwards
      expect(updatedScene?.durationFrames).toBe(300); // Should not change
    });
  });
});
