'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor';
import type { Asset, Track } from '@/store/editor';
import { Plus, Scissors, Clock, Layers, Eye, EyeOff, Lock, Unlock, Trash2, Edit2, ZoomIn, ZoomOut } from 'lucide-react';

const audioWaveformCache = new Map<string, number[]>();

const resolveNonOverlappingFrame = (
  track: Track,
  desiredStartFrame: number,
  durationFrames: number,
  excludeSceneId?: string
) => {
  const sortedScenes = track.scenes
    .filter((scene) => scene.id !== excludeSceneId)
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);

  let candidateFrame = Math.max(0, desiredStartFrame);

  for (const scene of sortedScenes) {
    const sceneStart = scene.startFrame;
    const sceneEnd = scene.startFrame + scene.durationFrames;
    const candidateEnd = candidateFrame + durationFrames;

    if (candidateEnd <= sceneStart) {
      break;
    }

    if (candidateFrame < sceneEnd && candidateEnd > sceneStart) {
      candidateFrame = sceneEnd;
    }
  }

  return candidateFrame;
};

const AudioWaveform: React.FC<{ asset?: Asset; bars: number }> = ({ asset, bars }) => {
  const [waveform, setWaveform] = useState<number[] | null>(() => {
    if (!asset) return null;
    return audioWaveformCache.get(asset.id) ?? null;
  });

  useEffect(() => {
    if (!asset) {
      setWaveform(null);
      return;
    }

    const cachedWaveform = audioWaveformCache.get(asset.id);
    if (cachedWaveform) {
      setWaveform(cachedWaveform);
      return;
    }

    let cancelled = false;

    const buildWaveform = async () => {
      try {
        const response = await fetch(asset.url);
        const arrayBuffer = await response.arrayBuffer();
        const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextCtor) {
          return;
        }

        const audioContext = new AudioContextCtor();

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
          const channelData = audioBuffer.getChannelData(0);
          const blockSize = Math.max(1, Math.floor(channelData.length / 96));
          const normalized = Array.from({ length: 96 }, (_, index) => {
            const start = index * blockSize;
            const end = Math.min(channelData.length, start + blockSize);
            let sum = 0;

            for (let sample = start; sample < end; sample += 1) {
              sum += Math.abs(channelData[sample]);
            }

            const average = end > start ? sum / (end - start) : 0;
            return Math.max(0.12, Math.min(1, average * 3));
          });

          audioWaveformCache.set(asset.id, normalized);
          if (!cancelled) {
            setWaveform(normalized);
          }
        } finally {
          void audioContext.close();
        }
      } catch {
        if (!cancelled) {
          setWaveform(Array.from({ length: 96 }, (_, index) => 0.2 + ((index * 11) % 45) / 100));
        }
      }
    };

    void buildWaveform();

    return () => {
      cancelled = true;
    };
  }, [asset]);

  const source = waveform ?? Array.from({ length: 96 }, (_, index) => 0.2 + ((index * 11) % 45) / 100);
  const step = Math.max(1, Math.floor(source.length / bars));
  const visibleBars = Array.from({ length: bars }, (_, index) => {
    const slice = source.slice(index * step, Math.min(source.length, (index + 1) * step));
    const peak = slice.length > 0 ? Math.max(...slice) : 0.2;
    return Math.max(0.18, peak);
  });

  return (
    <div className="absolute inset-0 flex items-center gap-0.5 px-2 pointer-events-none opacity-80">
      {visibleBars.map((bar, index) => (
        <span
          key={`${asset?.id ?? 'audio'}-wave-${index}`}
          className="flex-1 rounded-full bg-emerald-100/80"
          style={{ height: `${Math.max(18, Math.round(bar * 100))}%` }}
        />
      ))}
    </div>
  );
};

interface TimelineProps {
  fps: number;
  isAssetDragging?: boolean;
  draggedAssetType?: 'video' | 'image' | 'audio' | null;
  draggedAssetDuration?: number;
  onAssetDrop?: (frame: number, trackType: Track['type'], event: React.DragEvent<HTMLDivElement>) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  fps,
  isAssetDragging = false,
  draggedAssetType = null,
  draggedAssetDuration,
  onAssetDrop,
}) => {
  const {
    scenes,
    assets,
    isPlaying,
    selectedSceneId,
    currentFrame,
    setCurrentFrame,
    updateScene,
    selectScene,
    draggedScene,
    setDraggedScene,
    updateScenePosition,
    endSceneDrag,
    tracks,
    selectedTrackId,
    selectTrack,
    toggleTrackVisibility,
    toggleTrackLock,
    addTrack,
    deleteTrack,
    renameTrack,
    setTrackHeight,
    timelineZoom,
    setTimelineZoom,
    snapEnabled,
    snapType,
    keyframes,
    selectedKeyframeId,
    selectKeyframe,
    trimSceneLeft,
    trimSceneRight,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartFrame, setDragStartFrame] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [resizingSide, setResizingSide] = useState<'start' | 'end'>('start');
  const [resizingSceneId, setResizingSceneId] = useState<string | null>(null);
  const [resizingStartFrame, setResizingStartFrame] = useState(0);
  const [resizingDuration, setResizingDuration] = useState(0);
  const [, setResizingTrimStart] = useState(0);
  const [dropPreview, setDropPreview] = useState<{ frame: number; trackId: string } | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState('');
  const [resizingTrackId, setResizingTrackId] = useState<string | null>(null);
  const [resizingTrackStartY, setResizingTrackStartY] = useState(0);
  const [resizingTrackStartHeight, setResizingTrackStartHeight] = useState(0);
  const [snapGuides, setSnapGuides] = useState<Array<{ frame: number; type: 'scene' | 'playhead' | 'keyframe' }>>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // 计算总帧数（按时间轴最大结束帧，而不是累加）
  const totalFrames = Math.max(
    180,
    ...scenes.map((scene) => scene.startFrame + scene.durationFrames)
  );
  const totalSeconds = Math.floor(totalFrames / fps);

  // 计算每个帧的宽度（根据缩放）
  const pixelsPerFrame = 10 * timelineZoom;

  // 计算时间轴宽度
  const timelineWidth = totalFrames * pixelsPerFrame;

  const getSnappedFrame = useCallback((frame: number) => {
    let finalFrame = frame;
    const snapThreshold = 5; // 吸附阈值（帧数）
    const guides: Array<{ frame: number; type: 'scene' | 'playhead' | 'keyframe' }> = [];

    if (snapEnabled) {
      if (snapType === 'frame') {
        finalFrame = Math.round(frame);
      } else if (snapType === 'second') {
        finalFrame = Math.round(frame / fps) * fps;
      } else if (snapType === 'keyframe' && keyframes.length > 0) {
        const nearestKeyframe = keyframes.reduce((nearest, kf) => {
          const nearestDiff = Math.abs(nearest.frame - frame);
          const kfDiff = Math.abs(kf.frame - frame);
          return kfDiff < nearestDiff ? kf : nearest;
        }, keyframes[0]);

        if (nearestKeyframe && Math.abs(nearestKeyframe.frame - frame) < snapThreshold) {
          finalFrame = nearestKeyframe.frame;
          guides.push({ frame: nearestKeyframe.frame, type: 'keyframe' });
        }
      }

      // 吸附到播放头
      if (Math.abs(currentFrame - frame) < snapThreshold) {
        finalFrame = currentFrame;
        guides.push({ frame: currentFrame, type: 'playhead' });
      }

      // 吸附到场景边缘
      for (const scene of scenes) {
        const sceneStart = scene.startFrame;
        const sceneEnd = scene.startFrame + scene.durationFrames;

        if (Math.abs(sceneStart - frame) < snapThreshold) {
          finalFrame = sceneStart;
          guides.push({ frame: sceneStart, type: 'scene' });
          break;
        } else if (Math.abs(sceneEnd - frame) < snapThreshold) {
          finalFrame = sceneEnd;
          guides.push({ frame: sceneEnd, type: 'scene' });
          break;
        }
      }
    }

    setSnapGuides(guides);
    return Math.max(0, Math.min(finalFrame, totalFrames));
  }, [fps, keyframes, snapEnabled, snapType, totalFrames, currentFrame, scenes]);

  const frameFromClientX = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    return getSnappedFrame(Math.floor(x / pixelsPerFrame));
  }, [getSnappedFrame, pixelsPerFrame]);

  useEffect(() => {
    if (!isAssetDragging) {
      setDropPreview(null);
    }
  }, [isAssetDragging]);

  useEffect(() => {
    if (!isPlaying) return;
    const container = timelineRef.current;
    if (!container) return;

    const playheadX = currentFrame * pixelsPerFrame;
    const left = container.scrollLeft;
    const right = left + container.clientWidth;
    const margin = 80;
    const maxScroll = Math.max(0, timelineWidth - container.clientWidth);

    if (playheadX < left + margin) {
      container.scrollLeft = Math.max(0, Math.min(maxScroll, playheadX - margin));
    } else if (playheadX > right - margin) {
      container.scrollLeft = Math.max(0, Math.min(maxScroll, playheadX - container.clientWidth + margin));
    }
  }, [currentFrame, isPlaying, pixelsPerFrame, timelineWidth]);

  useEffect(() => {
    if (!isScrubbing) return;

    const onMouseMove = (event: MouseEvent) => {
      setCurrentFrame(frameFromClientX(event.clientX));
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isScrubbing, frameFromClientX, setCurrentFrame]);

  // 处理时间轴点击
  const handleTimelineClick = (e: React.MouseEvent) => {
    setCurrentFrame(frameFromClientX(e.clientX));
  };

  // 处理场景拖拽开始
  const handleSceneDragStart = (sceneId: string, e: React.MouseEvent) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartFrame(scene.startFrame);
    setDraggedScene({
      id: sceneId,
      isDragging: true,
      dragOffsetX: 0,
      originalStartFrame: scene.startFrame,
    });
    selectScene(sceneId);
  };

  // 处理场景拖拽结束
  const handleSceneDragEnd = useCallback(() => {
    setIsDragging(false);
    endSceneDrag();
  }, [endSceneDrag]);

  useEffect(() => {
    if (!isDragging || !draggedScene) return;

    const onMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - dragStartX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);
      const newStartFrame = Math.max(0, dragStartFrame + deltaFrames);
      updateScenePosition(draggedScene.id, newStartFrame);
    };

    const onMouseUp = () => {
      handleSceneDragEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragStartFrame, dragStartX, draggedScene, handleSceneDragEnd, isDragging, pixelsPerFrame, updateScenePosition]);

  // 处理场景延伸开始
  const handleResizeStart = (sceneId: string, side: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const trimMode = e.shiftKey;

    setIsResizing(true);
    setIsTrimming(trimMode);
    setResizingSide(side);
    setResizingSceneId(sceneId);
    setResizingStartFrame(scene.startFrame);
    setResizingDuration(scene.durationFrames);
    setResizingTrimStart(scene.trimStart || 0);
    setDragStartX(e.clientX);
    selectScene(sceneId);
  };

  // 处理场景延伸中
  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || !resizingSceneId) return;

    const scene = scenes.find(s => s.id === resizingSceneId);
    if (!scene) return;

    // const asset = assets.find(a => a.id === scene.content?.assetId);
    // const maxSourceFrames = asset?.duration ? Math.floor(asset.duration * fps) : Infinity;

    const deltaX = e.clientX - dragStartX;
    const deltaFrames = Math.round(deltaX / pixelsPerFrame);

    if (isTrimming) {
      // TRIM MODE: 使用 store 的 trim 方法
      if (resizingSide === 'start') {
        const newStartFrame = resizingStartFrame + deltaFrames;
        trimSceneLeft(resizingSceneId, newStartFrame);
      } else {
        const newEndFrame = resizingStartFrame + resizingDuration + deltaFrames;
        trimSceneRight(resizingSceneId, newEndFrame);
      }
    } else {
      // RESIZE MODE: 原有的调整时间轴位置逻辑
      let newStartFrame = resizingStartFrame;
      let newDurationFrames = resizingDuration;

      if (resizingSide === 'start') {
        newStartFrame = Math.max(0, resizingStartFrame + deltaFrames);
        const frameChange = newStartFrame - resizingStartFrame;
        newDurationFrames = Math.max(30, resizingDuration - frameChange);
      } else {
        newDurationFrames = Math.max(30, resizingDuration + deltaFrames);
      }

      // 应用吸附
      if (snapEnabled && snapType !== 'none') {
        if (snapType === 'frame') {
          newDurationFrames = Math.round(newDurationFrames);
        } else if (snapType === 'second') {
          newDurationFrames = Math.round(newDurationFrames / fps) * fps;
        }
      }

      // 更新场景
      updateScene(resizingSceneId, {
        startFrame: newStartFrame,
        durationFrames: newDurationFrames,
      });
    }
  };

  // 处理场景延伸结束
  const handleResizeEnd = () => {
    setIsResizing(false);
    setIsTrimming(false);
    setResizingSceneId(null);
  };

  // 添加场景
  const handleAddScene = () => {
    const newScene = {
      id: `scene-${Date.now()}`,
      name: `场景 ${scenes.length + 1}`,
      type: 'video' as const,
      startFrame: currentFrame,
      durationFrames: 90,
    };
    useEditorStore.getState().addScene(newScene);
  };

  // 分割场景
  const handleSplitScene = () => {
    const currentScene = scenes.find(s => currentFrame >= s.startFrame && currentFrame < s.startFrame + s.durationFrames);
    if (!currentScene) return;

    const splitFrame = currentFrame;
    const firstDuration = splitFrame - currentScene.startFrame;
    const secondDuration = currentScene.durationFrames - firstDuration;

    if (firstDuration < 10 || secondDuration < 10) return; // 太短不分割

    const secondScene = {
      ...currentScene,
      id: `scene-${Date.now()}`,
      name: `${currentScene.name} (2)`,
      startFrame: splitFrame,
      durationFrames: secondDuration,
    };

    // 更新第一个场景
    updateScene(currentScene.id, {
      durationFrames: firstDuration,
    });

    // 添加第二个场景
    useEditorStore.getState().addScene(secondScene);
  };

  // 删除场景
  const handleDeleteScene = (sceneId: string) => {
    if (confirm('确定要删除这个场景吗？')) {
      useEditorStore.getState().deleteScene(sceneId);
    }
  };

  // 复制场景
  const handleDuplicateScene = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newScene = {
      ...scene,
      id: `scene-${Date.now()}`,
      name: `${scene.name} (副本)`,
      startFrame: scene.startFrame + scene.durationFrames,
    };
    useEditorStore.getState().addScene(newScene);
  };

  // 切换轨道可见性
  const handleToggleTrackVisibility = (trackId: string) => {
    toggleTrackVisibility(trackId);
  };

  // 切换轨道锁定
  const handleToggleTrackLock = (trackId: string) => {
    toggleTrackLock(trackId);
  };

  // 添加轨道
  const handleAddTrack = (type: 'video' | 'audio') => {
    const trackCount = tracks.filter(t => t.type === type).length;
    const newTrack = {
      id: `track-${type}-${Date.now()}`,
      name: `${type === 'video' ? 'Video' : 'Audio'} Track ${trackCount + 1}`,
      type,
      visible: true,
      locked: false,
      volume: type === 'audio' ? 1.0 : undefined,
      height: 64,
    };
    addTrack(newTrack);
  };

  // 删除轨道
  const handleDeleteTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const sceneCount = track.scenes.length;
    const message = sceneCount > 0
      ? `确定要删除轨道 "${track.name}" 吗？这将删除轨道上的 ${sceneCount} 个场景。`
      : `确定要删除轨道 "${track.name}" 吗？`;

    if (confirm(message)) {
      deleteTrack(trackId);
    }
  };

  // 开始重命名轨道
  const handleStartRenameTrack = (trackId: string, currentName: string) => {
    setEditingTrackId(trackId);
    setEditingTrackName(currentName);
  };

  // 完成重命名轨道
  const handleFinishRenameTrack = () => {
    if (editingTrackId && editingTrackName.trim()) {
      renameTrack(editingTrackId, editingTrackName.trim());
    }
    setEditingTrackId(null);
    setEditingTrackName('');
  };

  // 取消重命名轨道
  const handleCancelRenameTrack = () => {
    setEditingTrackId(null);
    setEditingTrackName('');
  };

  // 开始调整轨道高度
  const handleStartResizeTrack = (trackId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    setResizingTrackId(trackId);
    setResizingTrackStartY(e.clientY);
    setResizingTrackStartHeight(track.height || 64);
  };

  // 处理轨道高度调整
  useEffect(() => {
    if (!resizingTrackId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizingTrackStartY;
      const newHeight = Math.max(60, Math.min(200, resizingTrackStartHeight + deltaY));
      setTrackHeight(resizingTrackId, newHeight);
    };

    const handleMouseUp = () => {
      setResizingTrackId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingTrackId, resizingTrackStartY, resizingTrackStartHeight, setTrackHeight]);

  // 处理滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, timelineZoom + delta));
      setTimelineZoom(newZoom);
    }
  }, [timelineZoom, setTimelineZoom]);

  // 获取当前场景
  const currentScene = scenes.find(s => currentFrame >= s.startFrame && currentFrame < s.startFrame + s.durationFrames);
  const previewDurationFrames = Math.max(30, Math.round((draggedAssetDuration || 3) * fps));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* 时间轴头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4 text-gray-300">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="font-mono text-sm">
              {Math.floor(currentFrame / fps).toString().padStart(2, '0')}:
              {(currentFrame % fps).toString().padStart(2, '0')} / {totalSeconds}s
            </span>
          </div>
          <div className="text-xs text-gray-500">
            第 {currentFrame} 帧 / 共 {totalFrames} 帧
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded border border-gray-700">
            <button
              onClick={() => setTimelineZoom(Math.max(0.1, timelineZoom - 0.2))}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="缩小 (Ctrl + -)"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-gray-400 font-mono min-w-[3rem] text-center">
              {(timelineZoom * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setTimelineZoom(Math.min(5, timelineZoom + 0.2))}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="放大 (Ctrl + +)"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-700" />

          {/* 轨道操作按钮 */}
          <button
            onClick={() => handleAddTrack('video')}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center gap-2 transition"
            title="添加视频轨道"
          >
            <Plus size={14} />
            <span>视频轨</span>
          </button>

          <button
            onClick={() => handleAddTrack('audio')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm flex items-center gap-2 transition"
            title="添加音频轨道"
          >
            <Plus size={14} />
            <span>音频轨</span>
          </button>

          <div className="w-px h-6 bg-gray-700" />

          {/* 场景操作按钮 */}
          <button
            onClick={handleSplitScene}
            disabled={!currentScene}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="分割场景"
          >
            <Scissors size={14} />
            <span>分割</span>
          </button>

          <button
            onClick={handleAddScene}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-2 transition"
          >
            <Plus size={16} />
            <span>添加场景</span>
          </button>
        </div>
      </div>

      {/* 时间轴内容 */}
      <div
        className="flex-1 overflow-x-auto overflow-y-auto relative"
        ref={timelineRef}
        onWheel={handleWheel}
        onMouseDownCapture={(e) => {
          if (e.button !== 0) return;
          const target = e.target as HTMLElement | null;
          if (target?.closest('[data-scene-id]')) return;
          setIsScrubbing(true);
          setCurrentFrame(frameFromClientX(e.clientX));
        }}
      >
        {/* 时间标尺 */}
        <div
          className="h-8 border-b border-gray-700 bg-gray-900 sticky top-0 z-10"
          style={{ width: `${timelineWidth}px` }}
        >
          {(() => {
            // 根据缩放级别自适应刻度间隔
            let majorInterval: number; // 主刻度间隔（秒）
            let minorInterval: number; // 次刻度间隔（秒）

            if (timelineZoom >= 2) {
              // 高缩放：每秒主刻度，每 0.5 秒次刻度
              majorInterval = 1;
              minorInterval = 0.5;
            } else if (timelineZoom >= 1) {
              // 中缩放：每 5 秒主刻度，每秒次刻度
              majorInterval = 5;
              minorInterval = 1;
            } else if (timelineZoom >= 0.5) {
              // 低缩放：每 10 秒主刻度，每 5 秒次刻度
              majorInterval = 10;
              minorInterval = 5;
            } else {
              // 极低缩放：每 30 秒主刻度，每 10 秒次刻度
              majorInterval = 30;
              minorInterval = 10;
            }

            const totalSeconds = Math.ceil(totalFrames / fps);
            const marks: JSX.Element[] = [];

            // 生成主刻度和次刻度
            for (let sec = 0; sec <= totalSeconds; sec++) {
              const frame = sec * fps;
              const left = frame * pixelsPerFrame;
              const isMajor = sec % majorInterval === 0;
              const isMinor = sec % minorInterval === 0;

              if (isMajor) {
                // 主刻度：显示时间标签
                const minutes = Math.floor(sec / 60);
                const seconds = sec % 60;
                const timeLabel = minutes > 0
                  ? `${minutes}:${seconds.toString().padStart(2, '0')}`
                  : `${sec}s`;

                marks.push(
                  <div
                    key={`major-${sec}`}
                    className="absolute top-0 bottom-0 flex flex-col justify-end border-l-2 border-gray-600"
                    style={{ left: `${left}px` }}
                  >
                    <span className="text-xs text-gray-300 font-mono font-semibold px-1 pb-0.5">
                      {timeLabel}
                    </span>
                  </div>
                );
              } else if (isMinor) {
                // 次刻度：较短的刻度线
                marks.push(
                  <div
                    key={`minor-${sec}`}
                    className="absolute bottom-0 h-3 border-l border-gray-700"
                    style={{ left: `${left}px` }}
                  />
                );
              }
            }

            return marks;
          })()}
        </div>

        {/* 轨道区域 */}
        <div className="relative" style={{ width: `${timelineWidth}px` }}>
          {tracks.map((track) => (
            <div key={track.id} className="mb-2">
              {/* 轨道头部 */}
              <div
                className={`h-12 flex items-center gap-3 px-3 border-l-2 sticky left-0 bg-gray-900 border-r border-gray-700 z-20 transition-all ${
                  selectedTrackId === track.id ? 'border-blue-500' : 'border-transparent'
                }`}
                style={{ width: '200px', background: '#111827' }}
              >
                {/* 轨道类型图标 */}
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  {track.type === 'video' && <Layers size={14} className="text-gray-400" />}
                  {track.type === 'audio' && <span className="text-gray-400 text-xs">🎵</span>}
                </div>

                {/* 轨道名称 */}
                {editingTrackId === track.id ? (
                  <input
                    type="text"
                    value={editingTrackName}
                    onChange={(e) => setEditingTrackName(e.target.value)}
                    onBlur={handleFinishRenameTrack}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFinishRenameTrack();
                      } else if (e.key === 'Escape') {
                        handleCancelRenameTrack();
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm bg-gray-800 text-gray-300 border border-blue-500 rounded focus:outline-none"
                  />
                ) : (
                  <span
                    className="text-sm text-gray-300 truncate flex-1 cursor-pointer hover:text-gray-100"
                    onDoubleClick={() => handleStartRenameTrack(track.id, track.name)}
                    title="双击重命名"
                  >
                    {track.name}
                  </span>
                )}

                {/* 轨道操作按钮 */}
                <div className="flex items-center gap-1">
                  {/* 重命名按钮 */}
                  <button
                    onClick={() => handleStartRenameTrack(track.id, track.name)}
                    className="p-1 hover:bg-gray-800 rounded transition"
                    title="重命名"
                  >
                    <Edit2 size={14} className="text-gray-400" />
                  </button>

                  {/* 可见性切换 */}
                  <button
                    onClick={() => handleToggleTrackVisibility(track.id)}
                    className="p-1 hover:bg-gray-800 rounded transition"
                    title={track.visible ? '隐藏' : '显示'}
                  >
                    {track.visible ? <Eye size={14} className="text-gray-400" /> : <EyeOff size={14} className="text-gray-600" />}
                  </button>

                  {/* 锁定切换 */}
                  <button
                    onClick={() => handleToggleTrackLock(track.id)}
                    className="p-1 hover:bg-gray-800 rounded transition"
                    title={track.locked ? '解锁' : '锁定'}
                  >
                    {track.locked ? <Lock size={14} className="text-gray-400" /> : <Unlock size={14} className="text-gray-400" />}
                  </button>

                  {/* 删除轨道按钮 */}
                  {tracks.length > 1 && (
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded transition"
                      title="删除轨道"
                    >
                      <Trash2 size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* 轨道内容 */}
              <div className="relative">
                <div
                  className={`relative border-l-2 bg-gray-800/50 ${
                    selectedTrackId === track.id ? 'border-blue-500' : 'border-transparent'
                  } ${!track.visible ? 'opacity-30' : ''} ${dropPreview?.trackId === track.id ? 'bg-blue-500/10' : ''}`}
                  style={{ height: `${track.height || 64}px` }}
                  onClick={(e) => {
                    if (e.currentTarget === e.target) {
                      selectTrack(track.id);
                      handleTimelineClick(e);
                    }
                  }}
                onDragOverCapture={(e) => {
                  if (!onAssetDrop) return;

                  const types = Array.from(e.dataTransfer.types || []);
                  const looksLikeAssetDrag =
                    types.includes('application/x-movie-maker-asset+json') || types.includes('asset');

                  if (!isAssetDragging && !looksLikeAssetDrag) return;

                  // Crucial: preventDefault here so `drop` will fire.
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';

                  const rect = e.currentTarget.getBoundingClientRect();
                  const scrollLeft = timelineRef.current?.scrollLeft ?? 0;
                  const x = e.clientX - rect.left + scrollLeft;
                  const frame = getSnappedFrame(Math.round(x / pixelsPerFrame));
                  const acceptsDraggedAsset =
                    (draggedAssetType === 'audio' && track.type === 'audio') ||
                    (draggedAssetType !== 'audio' && track.type !== 'audio');
                  const resolvedFrame = acceptsDraggedAsset
                    ? resolveNonOverlappingFrame(track, frame, previewDurationFrames)
                    : frame;

                  setDropPreview({ frame: resolvedFrame, trackId: track.id });
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    return;
                  }
                  setDropPreview((current) => (current?.trackId === track.id ? null : current));
                }}
                onDropCapture={(e) => {
                  if (!onAssetDrop) return;

                  e.preventDefault();
                  e.stopPropagation();

                  const assetData =
                    e.dataTransfer.getData('application/x-movie-maker-asset+json') ||
                    e.dataTransfer.getData('asset') ||
                    e.dataTransfer.getData('text/plain');

                  if (!assetData) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const scrollLeft = timelineRef.current?.scrollLeft ?? 0;
                  const x = e.clientX - rect.left + scrollLeft;
                  const frame = getSnappedFrame(Math.round(x / pixelsPerFrame));
                  const resolvedFrame = resolveNonOverlappingFrame(track, frame, previewDurationFrames);

                  setDropPreview(null);
                  onAssetDrop(resolvedFrame, track.type, e);
                }}
              >
                {dropPreview?.trackId === track.id && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 w-px bg-cyan-300/90 pointer-events-none z-20"
                      style={{ left: `${dropPreview.frame * pixelsPerFrame}px` }}
                    />
                    <div
                      className="absolute top-1 -translate-x-1/2 rounded-md border border-cyan-400/50 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-mono text-cyan-200 pointer-events-none z-20"
                      style={{ left: `${dropPreview.frame * pixelsPerFrame}px` }}
                    >
                      {Math.floor(dropPreview.frame / fps)}s · F{dropPreview.frame}
                    </div>
                    {((draggedAssetType === 'audio' && track.type === 'audio') ||
                      (draggedAssetType !== 'audio' && track.type !== 'audio')) && (
                      <div
                        className={`absolute top-2 h-12 rounded-lg border border-dashed pointer-events-none z-10 ${
                          track.type === 'audio'
                            ? 'border-emerald-400/70 bg-emerald-500/15'
                            : 'border-blue-400/60 bg-blue-500/10'
                        }`}
                        style={{
                          left: `${dropPreview.frame * pixelsPerFrame}px`,
                          width: `${previewDurationFrames * pixelsPerFrame}px`,
                        }}
                      />
                    )}
                  </>
                )}

                {/* 场景 */}
                {track.scenes.map((scene) => (
                  (() => {
                    const sceneAsset = scene.type === 'audio'
                      ? assets.find((asset) => asset.id === scene.content?.assetId)
                      : undefined;
                    const audioBarCount = Math.max(12, Math.min(72, Math.floor((scene.durationFrames * pixelsPerFrame) / 8)));
                    const isMissing = sceneAsset?.missing || false;

                    return (
                      <div
                        key={scene.id}
                        data-scene-id={scene.id}
                        className={`absolute top-2 h-12 rounded transition-all flex items-center overflow-hidden border-2 ${
                          isMissing
                            ? 'border-red-500 bg-red-900/30'
                            : scene.type === 'audio'
                            ? selectedSceneId === scene.id
                              ? 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] z-10'
                              : 'border-emerald-700/80 bg-emerald-500/15 hover:border-emerald-500/80'
                            : selectedSceneId === scene.id
                              ? 'border-blue-500 bg-blue-900/30 z-10'
                              : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                        } ${isDragging && draggedScene?.id === scene.id ? 'opacity-50' : ''} ${track.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-move'} ${isAssetDragging ? 'pointer-events-none' : ''}`}
                        style={{
                          left: `${scene.startFrame * pixelsPerFrame}px`,
                          width: `${scene.durationFrames * pixelsPerFrame}px`,
                        }}
                        onMouseDown={(e) => {
                          if (track.locked) return;
                          if (e.button !== 0) return;
                          e.preventDefault();
                          e.stopPropagation();
                          handleSceneDragStart(scene.id, e);
                        }}
                        title={isMissing ? `${scene.name} (素材缺失)` : scene.name}
                      >
                        {!track.locked && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500/0 hover:bg-blue-500/30 cursor-ew-resize z-20 transition-all group"
                            style={{ width: '12px', left: '-6px' }}
                            onMouseDown={(e) => handleResizeStart(scene.id, 'start', e)}
                            onMouseMove={handleResize}
                            onMouseUp={handleResizeEnd}
                            onMouseLeave={handleResizeEnd}
                            title="拖拽调整位置 (Shift: 裁剪素材)"
                          >
                            <div className="absolute inset-y-2 left-2 w-1 bg-blue-400/60 group-hover:bg-blue-300 rounded transition-colors" />
                            <div className="absolute inset-y-2 left-4 w-1 bg-blue-400/60 group-hover:bg-blue-300 rounded transition-colors" />
                          </div>
                        )}

                        {!track.locked && (
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500/0 hover:bg-blue-500/30 cursor-ew-resize z-20 transition-all group"
                            style={{ width: '12px', right: '-6px' }}
                            onMouseDown={(e) => handleResizeStart(scene.id, 'end', e)}
                            onMouseMove={handleResize}
                            onMouseUp={handleResizeEnd}
                            onMouseLeave={handleResizeEnd}
                            title="拖拽调整位置 (Shift: 裁剪素材)"
                          >
                            <div className="absolute inset-y-2 right-2 w-1 bg-blue-400/60 group-hover:bg-blue-300 rounded transition-colors" />
                            <div className="absolute inset-y-2 right-4 w-1 bg-blue-400/60 group-hover:bg-blue-300 rounded transition-colors" />
                          </div>
                        )}

                        {scene.type === 'audio' && <AudioWaveform asset={sceneAsset} bars={audioBarCount} />}

                        {/* Trim duration tooltip */}
                        {isResizing && resizingSceneId === scene.id && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-30 border border-gray-700">
                            {isTrimming ? (
                              <>
                                <div className="font-semibold text-blue-400">裁剪模式</div>
                                <div>时长: {Math.floor(scene.durationFrames / fps)}s ({scene.durationFrames}f)</div>
                                {scene.trimStart ? <div>偏移: {Math.floor(scene.trimStart / fps)}s ({scene.trimStart}f)</div> : null}
                              </>
                            ) : (
                              <>
                                <div className="font-semibold text-green-400">调整位置</div>
                                <div>时长: {Math.floor(scene.durationFrames / fps)}s ({scene.durationFrames}f)</div>
                              </>
                            )}
                          </div>
                        )}

                        <div className="relative z-10 flex w-full items-center gap-2 px-2 pointer-events-none">
                          {isMissing && <span className="text-xs">⚠️</span>}
                          {scene.type === 'audio' && <span className="text-xs">🎵</span>}
                          <span className={`text-xs truncate ${isMissing ? 'text-red-300 font-medium' : scene.type === 'audio' ? 'text-emerald-50 font-medium' : 'text-gray-300'}`}>
                            {scene.name}
                          </span>
                        </div>

                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateScene(scene.id);
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition"
                            title="复制"
                          >
                            <span className="text-xs">📋</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded transition"
                            title="删除"
                          >
                            <span className="text-xs">🗑️</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ))}

                {/* 关键帧 */}
                {keyframes
                  .filter(kf => {
                    const scene = track.scenes.find(s => s.id === kf.sceneId);
                    return scene !== undefined;
                  })
                  .map((keyframe) => (
                    <div
                      key={keyframe.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectKeyframe(keyframe.id === selectedKeyframeId ? null : keyframe.id);
                        setCurrentFrame(keyframe.frame);
                      }}
                      className={`absolute top-0 w-2 h-2 rounded-full cursor-pointer transition-all ${
                        selectedKeyframeId === keyframe.id
                          ? 'bg-yellow-500 scale-150'
                          : 'bg-yellow-700 hover:bg-yellow-500'
                      }`}
                      style={{
                        left: `${keyframe.frame * pixelsPerFrame - 4}px`,
                      }}
                      title="关键帧"
                    />
                  ))}
                </div>

                {/* 轨道高度调整手柄 */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/50 transition-colors z-30 group"
                  onMouseDown={(e) => handleStartResizeTrack(track.id, e)}
                  title="拖拽调整轨道高度"
                >
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-700 group-hover:bg-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 播放头 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
          style={{ left: `${currentFrame * pixelsPerFrame}px` }}
        >
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-t" />
        </div>

        {/* 吸附引导线 */}
        {snapGuides.map((guide, index) => (
          <div
            key={`snap-guide-${index}`}
            className="absolute top-0 bottom-0 pointer-events-none z-20"
            style={{ left: `${guide.frame * pixelsPerFrame}px` }}
          >
            <div
              className={`w-px h-full ${
                guide.type === 'playhead'
                  ? 'bg-red-400/50'
                  : guide.type === 'keyframe'
                  ? 'bg-yellow-400/50'
                  : 'bg-blue-400/50'
              }`}
            />
            <div
              className={`absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${
                guide.type === 'playhead'
                  ? 'bg-red-500/80 text-white'
                  : guide.type === 'keyframe'
                  ? 'bg-yellow-500/80 text-white'
                  : 'bg-blue-500/80 text-white'
              }`}
            >
              {guide.type === 'playhead' ? '播放头' : guide.type === 'keyframe' ? '关键帧' : '场景边缘'}
            </div>
          </div>
        ))}

        {/* 当前时间指示器 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500/20 pointer-events-none z-10"
          style={{ left: `${currentFrame * pixelsPerFrame}px` }}
        />
      </div>
    </div>
  );
};
