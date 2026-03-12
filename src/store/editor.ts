import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DraggableScene {
  id: string;
  isDragging: boolean;
  dragOffsetX: number;
  originalStartFrame: number;
}

export interface Scene {
  id: string;
  name: string;
  type: 'video' | 'image' | 'text' | 'transition' | 'audio';
  startFrame: number;
  durationFrames: number;
  trimStart?: number;
  transitionType?: 'fade' | 'crossDissolve' | 'push' | 'zoom' | 'wipe';
  transitionDirection?: 'left' | 'right' | 'up' | 'down';
  // 音频控制
  volume?: number; // 基础音量 (0-1)
  fadeInDuration?: number; // 淡入时长（帧数）
  fadeOutDuration?: number; // 淡出时长（帧数）
  volumeKeyframes?: Array<{ frame: number; volume: number }>; // 音量关键帧
  audioEffect?: 'none' | 'noise-reduction' | 'equalizer-bass' | 'equalizer-treble' | 'compressor';
  content?: {
    text?: string;
    assetId?: string;
    animation?: 'fadeIn' | 'flyIn' | 'typewriter' | 'none';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
    borderWidth?: number;
    borderColor?: string;
    shadow?: 'none' | 'small' | 'medium' | 'large';
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    // 文本高级样式
    strokeWidth?: number;
    strokeColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  isDragging?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  relativePath?: string;
  missing?: boolean;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  createdAt?: string;
  sampleRate?: number;
  numberOfChannels?: number;
}

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  config: {
    width: number;
    height: number;
    fps: number;
    duration: number;
  };
  scenes: Scene[];
  assets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportSettings {
  format: 'mp4' | 'gif' | 'webm' | 'png-sequence';
  quality: 'low' | 'medium' | 'high';
  filename: string;
  outputPath: string;
  resolution: { width: number; height: number };
  fps: number;
}

export interface Keyframe {
  id: string;
  sceneId: string;
  frame: number;
  properties: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
  };
  interpolation: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step';
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  scenes: Scene[];
  visible: boolean;
  locked: boolean;
  volume?: number;
  height?: number; // 轨道高度（像素），默认 64px，范围 60-200
}

// 历史记录状态快照
interface HistorySnapshot {
  scenes: Scene[];
  tracks: Track[];
  assets: Asset[];
  selectedSceneId: string | null;
}

interface EditorState {
  project: Project | null;
  scenes: Scene[];
  assets: Asset[];
  selectedSceneId: string | null;
  currentFrame: number;
  isPlaying: boolean;
  fps: number;
  draggedScene: DraggableScene | null;

  // 素材库状态
  assetFilter: 'all' | 'image' | 'video' | 'audio';
  selectedAssetId: string | null;

  // 导出设置
  exportSettings: ExportSettings;

  // 时间轴状态
  tracks: Track[];
  selectedTrackId: string | null;
  timelineZoom: number;
  snapEnabled: boolean;
  snapType: 'none' | 'keyframe' | 'track' | 'frame' | 'second';
  keyframes: Keyframe[];
  selectedKeyframeId: string | null;

  // 撤销/重做状态
  history: HistorySnapshot[];
  historyIndex: number;
  maxHistorySize: number;

  // Actions
  setProject: (project: Project) => void;
  addScene: (scene: Scene) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  selectScene: (id: string | null) => void;
  duplicateScene: (id: string) => void;
  splitScene: (id: string, frame: number) => void;
  trimSceneLeft: (id: string, newStartFrame: number) => void;
  trimSceneRight: (id: string, newEndFrame: number) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  setCurrentFrame: (frame: number) => void;
  togglePlayback: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  exportProject: () => void;
  setDraggedScene: (scene: DraggableScene | null) => void;
  updateScenePosition: (sceneId: string, newStartFrame: number) => void;
  endSceneDrag: () => void;

  // 素材库操作
  setAssetFilter: (filter: 'all' | 'image' | 'video' | 'audio') => void;
  selectAsset: (id: string | null) => void;

  // 导出设置
  setExportSettings: (settings: Partial<ExportSettings>) => void;

  // 时间轴操作
  addTrack: (track: Omit<Track, 'scenes'>) => void;
  deleteTrack: (trackId: string) => void;
  selectTrack: (trackId: string | null) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  renameTrack: (trackId: string, name: string) => void;
  setTrackHeight: (trackId: string, height: number) => void;
  moveSceneToTrack: (sceneId: string, fromTrackId: string, toTrackId: string) => void;
  setTimelineZoom: (zoom: number) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapType: (type: 'none' | 'keyframe' | 'track' | 'frame' | 'second') => void;
  addKeyframe: (keyframe: Omit<Keyframe, 'id'>) => void;
  deleteKeyframe: (keyframeId: string) => void;
  updateKeyframe: (keyframeId: string, updates: Partial<Keyframe>) => void;
  selectKeyframe: (keyframeId: string | null) => void;

  // 转场操作
  addTransition: (transition: Omit<Scene, 'id'>) => void;
  deleteTransition: (transitionId: string) => void;
  updateTransition: (transitionId: string, updates: Partial<Scene>) => void;

  // 文本操作
  addTextScene: (text: Omit<Scene, 'id'>) => void;
  updateTextContent: (sceneId: string, content: Partial<Scene['content']>) => void;

  // 音频操作
  updateAudioVolume: (sceneId: string, volume: number) => void;
  setAudioFade: (sceneId: string, fadeInDuration?: number, fadeOutDuration?: number) => void;
  addVolumeKeyframe: (sceneId: string, frame: number, volume: number) => void;
  removeVolumeKeyframe: (sceneId: string, frame: number) => void;
  updateVolumeKeyframe: (sceneId: string, oldFrame: number, newFrame: number, volume: number) => void;
  setAudioEffect: (sceneId: string, effect: Scene['audioEffect']) => void;

  // Debug / Project file
  resetEditor: () => void;
  exportProjectFile: () => EditorProjectFile;
  loadProjectFile: (file: EditorProjectFile) => void;

  // 撤销/重做操作
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export type EditorProjectFile = {
  version: 1;
  savedAt: string;
  fps: number;
  currentFrame: number;
  assets: Asset[];
  tracks: Track[];
};

const getInitialTracks = (): Track[] => [
  {
    id: 'track-video-1',
    name: 'Video Track 1',
    type: 'video',
    scenes: [],
    visible: true,
    locked: false,
  },
  {
    id: 'track-video-2',
    name: 'Video Track 2',
    type: 'video',
    scenes: [],
    visible: true,
    locked: false,
  },
  {
    id: 'track-video-3',
    name: 'Video Track 3',
    type: 'video',
    scenes: [],
    visible: true,
    locked: false,
  },
  {
    id: 'track-audio-1',
    name: 'Audio Track 1',
    type: 'audio',
    scenes: [],
    visible: true,
    locked: false,
    volume: 1.0,
  },
  {
    id: 'track-audio-2',
    name: 'Audio Track 2',
    type: 'audio',
    scenes: [],
    visible: true,
    locked: false,
    volume: 1.0,
  },
  {
    id: 'track-audio-3',
    name: 'Audio Track 3',
    type: 'audio',
    scenes: [],
    visible: true,
    locked: false,
    volume: 1.0,
  },
];

export const useEditorStore = create<EditorState>()(
  persist(
    (set): EditorState => ({
      project: null,
      scenes: [],
      assets: [],
      selectedSceneId: null,
      currentFrame: 0,
      isPlaying: false,
      fps: 30,
      draggedScene: null,

      // 素材库状态
      assetFilter: 'all',
      selectedAssetId: null,

      // 导出设置
      exportSettings: {
        format: 'mp4',
        quality: 'medium',
        filename: 'remotion-video.mp4',
        outputPath: '~/Downloads',
        resolution: { width: 1920, height: 1080 },
        fps: 30,
      },

      // 时间轴状态
      tracks: getInitialTracks(),
      selectedTrackId: null,
      timelineZoom: 1.0,
      snapEnabled: true,
      snapType: 'frame',
      keyframes: [],
      selectedKeyframeId: null,

      // 撤销/重做状态
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,

      setProject: (project) => set({ project }),

      addScene: (scene) => set((state) => {
        const targetTrackType = scene.type === 'audio' ? 'audio' : scene.type === 'text' ? 'text' : 'video';

        const newScenes = [...state.scenes, scene];

        // 只添加到第一个匹配类型的轨道
        let sceneAdded = false;
        const newTracks = state.tracks.map(track => {
          if (!sceneAdded && track.type === targetTrackType) {
            sceneAdded = true;
            return { ...track, scenes: [...track.scenes, scene] };
          }
          return track;
        });

        // 清除 redo 历史并保存当前状态
        const newHistory = [...state.history.slice(0, state.historyIndex + 1)];

        // 如果这是第一个操作，保存初始状态
        if (newHistory.length === 0) {
          newHistory.push({
            scenes: state.scenes,
            tracks: state.tracks,
            assets: state.assets,
            selectedSceneId: state.selectedSceneId,
          });
        }

        // 保存新状态（操作后）
        newHistory.push({
          scenes: newScenes,
          tracks: newTracks,
          assets: state.assets,
          selectedSceneId: state.selectedSceneId,
        });

        // 限制历史记录大小
        while (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        return {
          scenes: newScenes,
          tracks: newTracks,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

      updateScene: (id, updates) => set((state) => {
        // 保存历史记录
        const snapshot: HistorySnapshot = {
          scenes: state.scenes,
          tracks: state.tracks,
          assets: state.assets,
          selectedSceneId: state.selectedSceneId,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        return {
          scenes: state.scenes.map(scene =>
            scene.id === id ? { ...scene, ...updates } : scene
          ),
          tracks: state.tracks.map(track => ({
            ...track,
            scenes: track.scenes.map(scene =>
              scene.id === id ? { ...scene, ...updates } : scene
            ),
          })),
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

      updateScenePosition: (sceneId, newStartFrame) => set((state) => {
        // 应用吸附
        let finalStartFrame = newStartFrame;
        if (state.snapEnabled && state.snapType !== 'none') {
          if (state.snapType === 'frame') {
            finalStartFrame = Math.round(newStartFrame);
          } else if (state.snapType === 'second') {
            finalStartFrame = Math.round(newStartFrame / state.fps) * state.fps;
          }
        }

        return {
          scenes: state.scenes.map(scene =>
            scene.id === sceneId ? { ...scene, startFrame: finalStartFrame } : scene
          ),
          tracks: state.tracks.map(track => ({
            ...track,
            scenes: track.scenes.map(scene =>
              scene.id === sceneId ? { ...scene, startFrame: finalStartFrame } : scene
            ),
          })),
        };
      }),

      setDraggedScene: (scene) => set({ draggedScene: scene }),

      deleteScene: (id) => set((state) => {
        // 保存历史记录
        const snapshot: HistorySnapshot = {
          scenes: state.scenes,
          tracks: state.tracks,
          assets: state.assets,
          selectedSceneId: state.selectedSceneId,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        const sceneIndex = state.scenes.findIndex(s => s.id === id);
        const isSelected = state.selectedSceneId === id;

        return {
          scenes: state.scenes.filter(scene => scene.id !== id),
          tracks: state.tracks.map(track => ({
            ...track,
            scenes: track.scenes.filter(scene => scene.id !== id),
          })),
          selectedSceneId: isSelected
            ? (sceneIndex > 0 ? state.scenes[sceneIndex - 1].id : null)
            : state.selectedSceneId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

      duplicateScene: (id) => set((state) => {
        const scene = state.scenes.find(s => s.id === id);
        if (!scene) return state;

        const newScene = {
          ...scene,
          id: `scene-${Date.now()}`,
          name: `${scene.name} (副本)`,
          startFrame: scene.startFrame + scene.durationFrames,
        };

        return {
          scenes: [...state.scenes, newScene],
          tracks: state.tracks.map(track => {
            const targetTrackType = newScene.type === 'audio' ? 'audio' : newScene.type === 'text' ? 'text' : 'video';
            return track.type === targetTrackType
              ? { ...track, scenes: [...track.scenes, newScene] }
              : track;
          }),
        };
      }),

      splitScene: (id, frame) => set((state) => {
        // 保存历史记录
        const snapshot: HistorySnapshot = {
          scenes: state.scenes,
          tracks: state.tracks,
          assets: state.assets,
          selectedSceneId: state.selectedSceneId,
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        const scene = state.scenes.find(s => s.id === id);
        if (!scene) return state;

        const splitFrame = Math.max(scene.startFrame, Math.min(frame, scene.startFrame + scene.durationFrames - 1));
        const firstDuration = splitFrame - scene.startFrame;
        const secondDuration = scene.durationFrames - firstDuration;

        if (firstDuration < 30 || secondDuration < 30) return state; // 太短不分割

        const secondScene = {
          ...scene,
          id: `scene-${Date.now()}`,
          name: `${scene.name} (2)`,
          startFrame: splitFrame,
          durationFrames: secondDuration,
        };

        return {
          scenes: state.scenes.map(s =>
            s.id === id ? { ...s, durationFrames: firstDuration } : s
          ).concat(secondScene),
          tracks: state.tracks.map(track => {
            if (track.id !== 'track-1' || track.type !== 'video') return track;

            const sceneIndex = track.scenes.findIndex(s => s.id === id);
            if (sceneIndex === -1) return track;

            return {
              ...track,
              scenes: [
                ...track.scenes.slice(0, sceneIndex + 1).map(s =>
                  s.id === id ? { ...s, durationFrames: firstDuration } : s
                ),
                secondScene,
              ],
            };
          }),
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

      trimSceneLeft: (id, newStartFrame) => set((state) => {
        const scene = state.scenes.find(s => s.id === id);
        if (!scene) return state;

        const minDuration = 30; // 最小 1 秒
        const maxTrim = scene.durationFrames - minDuration;
        const trimAmount = Math.max(0, Math.min(maxTrim, newStartFrame - scene.startFrame));

        const newDuration = scene.durationFrames - trimAmount;
        const newStart = scene.startFrame + trimAmount;
        const newTrimStart = (scene.trimStart || 0) + trimAmount;

        return {
          scenes: state.scenes.map(s =>
            s.id === id ? { ...s, startFrame: newStart, durationFrames: newDuration, trimStart: newTrimStart } : s
          ),
          tracks: state.tracks.map(track => ({
            ...track,
            scenes: track.scenes.map(s =>
              s.id === id ? { ...s, startFrame: newStart, durationFrames: newDuration, trimStart: newTrimStart } : s
            ),
          })),
        };
      }),

      trimSceneRight: (id, newEndFrame) => set((state) => {
        const scene = state.scenes.find(s => s.id === id);
        if (!scene) return state;

        const minDuration = 30; // 最小 1 秒
        // const currentEndFrame = scene.startFrame + scene.durationFrames;
        const newDuration = Math.max(minDuration, newEndFrame - scene.startFrame);

        return {
          scenes: state.scenes.map(s =>
            s.id === id ? { ...s, durationFrames: newDuration } : s
          ),
          tracks: state.tracks.map(track => ({
            ...track,
            scenes: track.scenes.map(s =>
              s.id === id ? { ...s, durationFrames: newDuration } : s
            ),
          })),
        };
      }),

      reorderScenes: (fromIndex, toIndex) => set((state) => {
        const newScenes = [...state.scenes];
        const [removed] = newScenes.splice(fromIndex, 1);
        newScenes.splice(toIndex, 0, removed);

        // 同步更新轨道中的场景
        const track = state.tracks.find(t => t.type === 'video');
        if (!track) return { scenes: newScenes };

        const newTrackScenes = [...track.scenes];
        const [removedScene] = newTrackScenes.splice(fromIndex, 1);
        newTrackScenes.splice(toIndex, 0, removedScene);

        return {
          scenes: newScenes,
          tracks: state.tracks.map(t =>
            t.id === track.id ? { ...t, scenes: newTrackScenes } : t
          ),
        };
      }),

      selectScene: (id) => set({ selectedSceneId: id }),

      addAsset: (asset) => set((state) => ({
        assets: [...state.assets, asset]
      })),

      deleteAsset: (id) => set((state) => {
        const isSelected = state.selectedAssetId === id;
        return {
          assets: state.assets.filter(asset => asset.id !== id),
          selectedAssetId: isSelected ? null : state.selectedAssetId
        };
      }),

      setCurrentFrame: (frame) => set({ currentFrame: frame }),

      togglePlayback: () => set((state) => ({
        isPlaying: !state.isPlaying
      })),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      endSceneDrag: () => set({ draggedScene: null }),

      // 素材库操作
      setAssetFilter: (filter) => set({ assetFilter: filter }),

      selectAsset: (id) => set({ selectedAssetId: id }),

      // 导出设置
      setExportSettings: (settings) => set((state) => ({
        exportSettings: { ...state.exportSettings, ...settings }
      })),

      exportProject: () => {
        const state = useEditorStore.getState();
        console.log('Exporting project:', state);
        // TODO: 实现导出逻辑
      },

      // 时间轴操作
      addTrack: (track) => set((state) => ({
        tracks: [...state.tracks, { ...track, scenes: [] }],
      })),

      deleteTrack: (trackId) => set((state) => {
        // 不允许删除最后一条轨道
        if (state.tracks.length <= 1) return state;

        // 删除轨道时，移除该轨道上的所有场景
        const trackToDelete = state.tracks.find(t => t.id === trackId);
        if (!trackToDelete) return state;

        const sceneIdsToRemove = trackToDelete.scenes.map(s => s.id);

        return {
          tracks: state.tracks.filter(track => track.id !== trackId),
          scenes: state.scenes.filter(scene => !sceneIdsToRemove.includes(scene.id)),
        };
      }),

      selectTrack: (trackId) => set({ selectedTrackId: trackId }),

      toggleTrackVisibility: (trackId) => set((state) => ({
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, visible: !track.visible }
            : track
        ),
      })),

      toggleTrackLock: (trackId) => set((state) => ({
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, locked: !track.locked }
            : track
        ),
      })),

      renameTrack: (trackId, name) => set((state) => ({
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, name }
            : track
        ),
      })),

      setTrackHeight: (trackId, height) => set((state) => ({
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, height: Math.max(60, Math.min(200, height)) }
            : track
        ),
      })),

      moveSceneToTrack: (sceneId, fromTrackId, toTrackId) => set((state) => {
        const scene = state.scenes.find(s => s.id === sceneId);
        if (!scene) return state;

        return {
          tracks: state.tracks.map(track => {
            if (track.id === fromTrackId) {
              return { ...track, scenes: track.scenes.filter(s => s.id !== sceneId) };
            } else if (track.id === toTrackId) {
              return { ...track, scenes: [...track.scenes, scene] };
            }
            return track;
          }),
        };
      }),

      setTimelineZoom: (zoom) => set({
        timelineZoom: Math.max(0.1, Math.min(5, zoom))
      }),

      setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),

      setSnapType: (type) => set({ snapType: type }),

      addKeyframe: (keyframe) => set((state) => ({
        keyframes: [...state.keyframes, { ...keyframe, id: `kf-${Date.now()}` }],
      })),

      deleteKeyframe: (keyframeId) => set((state) => ({
        keyframes: state.keyframes.filter(kf => kf.id !== keyframeId),
      })),

      updateKeyframe: (keyframeId, updates) => set((state) => ({
        keyframes: state.keyframes.map(kf =>
          kf.id === keyframeId ? { ...kf, ...updates } : kf
        ),
      })),

      selectKeyframe: (keyframeId) => set({ selectedKeyframeId: keyframeId }),

      // 转场操作
      addTransition: (transition) => set((state) => {
        const newTransition = {
          ...transition,
          id: `transition-${Date.now()}`,
          type: 'transition' as const,
        };

        const newScenes = [...state.scenes, newTransition];

        // 添加到第一个视频轨道
        let transitionAdded = false;
        const newTracks = state.tracks.map(track => {
          if (!transitionAdded && track.type === 'video') {
            transitionAdded = true;
            return { ...track, scenes: [...track.scenes, newTransition] };
          }
          return track;
        });

        return {
          scenes: newScenes,
          tracks: newTracks,
        };
      }),

      deleteTransition: (transitionId) => set((state) => ({
        scenes: state.scenes.filter(scene => scene.id !== transitionId),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.filter(scene => scene.id !== transitionId),
        })),
      })),

      updateTransition: (transitionId, updates) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === transitionId ? { ...scene, ...updates } : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === transitionId ? { ...scene, ...updates } : scene
          ),
        })),
      })),

      // 文本操作
      addTextScene: (text) => set((state) => {
        const newText = {
          ...text,
          id: `text-${Date.now()}`,
          type: 'text' as const,
        };

        const newScenes = [...state.scenes, newText];

        // 添加到第一个文本轨道，如果没有则添加到第一个视频轨道
        let textAdded = false;
        const newTracks = state.tracks.map(track => {
          if (!textAdded && (track.type === 'text' || track.type === 'video')) {
            textAdded = true;
            return { ...track, scenes: [...track.scenes, newText] };
          }
          return track;
        });

        return {
          scenes: newScenes,
          tracks: newTracks,
        };
      }),

      updateTextContent: (sceneId, content) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === sceneId
            ? { ...scene, content: { ...scene.content, ...content } }
            : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === sceneId
              ? { ...scene, content: { ...scene.content, ...content } }
              : scene
          ),
        })),
      })),

      // 音频操作
      updateAudioVolume: (sceneId, volume) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === sceneId ? { ...scene, volume: Math.max(0, Math.min(1, volume)) } : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === sceneId ? { ...scene, volume: Math.max(0, Math.min(1, volume)) } : scene
          ),
        })),
      })),

      setAudioFade: (sceneId, fadeInDuration, fadeOutDuration) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === sceneId
            ? { ...scene, fadeInDuration, fadeOutDuration }
            : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === sceneId
              ? { ...scene, fadeInDuration, fadeOutDuration }
              : scene
          ),
        })),
      })),

      addVolumeKeyframe: (sceneId, frame, volume) => set((state) => ({
        scenes: state.scenes.map(scene => {
          if (scene.id !== sceneId) return scene;
          const keyframes = scene.volumeKeyframes || [];
          const existingIndex = keyframes.findIndex(kf => kf.frame === frame);
          if (existingIndex >= 0) {
            // 更新现有关键帧
            const newKeyframes = [...keyframes];
            newKeyframes[existingIndex] = { frame, volume: Math.max(0, Math.min(1, volume)) };
            return { ...scene, volumeKeyframes: newKeyframes };
          } else {
            // 添加新关键帧并排序
            const newKeyframes = [...keyframes, { frame, volume: Math.max(0, Math.min(1, volume)) }];
            newKeyframes.sort((a, b) => a.frame - b.frame);
            return { ...scene, volumeKeyframes: newKeyframes };
          }
        }),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene => {
            if (scene.id !== sceneId) return scene;
            const keyframes = scene.volumeKeyframes || [];
            const existingIndex = keyframes.findIndex(kf => kf.frame === frame);
            if (existingIndex >= 0) {
              const newKeyframes = [...keyframes];
              newKeyframes[existingIndex] = { frame, volume: Math.max(0, Math.min(1, volume)) };
              return { ...scene, volumeKeyframes: newKeyframes };
            } else {
              const newKeyframes = [...keyframes, { frame, volume: Math.max(0, Math.min(1, volume)) }];
              newKeyframes.sort((a, b) => a.frame - b.frame);
              return { ...scene, volumeKeyframes: newKeyframes };
            }
          }),
        })),
      })),

      removeVolumeKeyframe: (sceneId, frame) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === sceneId
            ? { ...scene, volumeKeyframes: (scene.volumeKeyframes || []).filter(kf => kf.frame !== frame) }
            : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === sceneId
              ? { ...scene, volumeKeyframes: (scene.volumeKeyframes || []).filter(kf => kf.frame !== frame) }
              : scene
          ),
        })),
      })),

      updateVolumeKeyframe: (sceneId, oldFrame, newFrame, volume) => set((state) => ({
        scenes: state.scenes.map(scene => {
          if (scene.id !== sceneId) return scene;
          const keyframes = (scene.volumeKeyframes || []).filter(kf => kf.frame !== oldFrame);
          keyframes.push({ frame: newFrame, volume: Math.max(0, Math.min(1, volume)) });
          keyframes.sort((a, b) => a.frame - b.frame);
          return { ...scene, volumeKeyframes: keyframes };
        }),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene => {
            if (scene.id !== sceneId) return scene;
            const keyframes = (scene.volumeKeyframes || []).filter(kf => kf.frame !== oldFrame);
            keyframes.push({ frame: newFrame, volume: Math.max(0, Math.min(1, volume)) });
            keyframes.sort((a, b) => a.frame - b.frame);
            return { ...scene, volumeKeyframes: keyframes };
          }),
        })),
      })),

      setAudioEffect: (sceneId, effect) => set((state) => ({
        scenes: state.scenes.map(scene =>
          scene.id === sceneId ? { ...scene, audioEffect: effect } : scene
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          scenes: track.scenes.map(scene =>
            scene.id === sceneId ? { ...scene, audioEffect: effect } : scene
          ),
        })),
      })),

      resetEditor: () => set(() => ({
        project: null,
        scenes: [],
        assets: [],
        selectedSceneId: null,
        currentFrame: 0,
        isPlaying: false,
        fps: 30,
        draggedScene: null,
        assetFilter: 'all',
        selectedAssetId: null,
        tracks: getInitialTracks(),
        selectedTrackId: null,
        timelineZoom: 1.0,
        snapEnabled: true,
        snapType: 'frame',
        keyframes: [],
        selectedKeyframeId: null,
        history: [],
        historyIndex: -1,
      })),

      exportProjectFile: () => {
        const state = useEditorStore.getState();
        return {
          version: 1,
          savedAt: new Date().toISOString(),
          fps: state.fps,
          currentFrame: state.currentFrame,
          assets: state.assets,
          tracks: state.tracks,
        };
      },

      loadProjectFile: (file) => set(() => {
        const tracks = Array.isArray(file.tracks) ? file.tracks : getInitialTracks();
        const scenes = tracks.flatMap((track) => track.scenes || []);
        const assets = Array.isArray(file.assets) ? file.assets : [];

        // Check for missing assets
        const assetsWithMissingFlag = assets.map(asset => {
          // If asset has relativePath, check if file exists
          if (asset.relativePath) {
            // In browser environment, we can't directly check file existence
            // This will be handled by the server or during rendering
            return {
              ...asset,
              missing: false, // Will be updated by server check
            };
          }
          return asset;
        });

        return {
          project: null,
          scenes,
          assets: assetsWithMissingFlag,
          selectedSceneId: null,
          currentFrame: Math.max(0, file.currentFrame || 0),
          isPlaying: false,
          fps: file.fps || 30,
          draggedScene: null,
          assetFilter: 'all',
          selectedAssetId: null,
          tracks,
          selectedTrackId: null,
          keyframes: [],
          selectedKeyframeId: null,
          history: [],
          historyIndex: -1,
        };
      }),

      // 撤销操作
      undo: () => set((state) => {
        if (state.historyIndex <= 0) return state;

        const snapshot = state.history[state.historyIndex - 1];
        return {
          scenes: snapshot.scenes,
          tracks: snapshot.tracks,
          assets: snapshot.assets,
          selectedSceneId: snapshot.selectedSceneId,
          historyIndex: state.historyIndex - 1,
          history: state.history,
        };
      }),

      // 重做操作
      redo: () => set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;

        const snapshot = state.history[state.historyIndex + 1];
        return {
          scenes: snapshot.scenes,
          tracks: snapshot.tracks,
          assets: snapshot.assets,
          selectedSceneId: snapshot.selectedSceneId,
          historyIndex: state.historyIndex + 1,
          history: state.history,
        };
      }),

      // 检查是否可以撤销
      canUndo: () => {
        const state = useEditorStore.getState();
        return state.historyIndex > 0;
      },

      // 检查是否可以重做
      canRedo: () => {
        const state = useEditorStore.getState();
        return state.historyIndex < state.history.length - 1;
      },
    }),
    {
      name: 'editor-storage',
    }
  )
);
