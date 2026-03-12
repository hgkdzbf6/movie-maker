'use client';

import { Player, type PlayerRef } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import { useEditorStore } from '@/store/editor';
import { Play, Pause, Download, Settings, Maximize2, Save, Undo, Redo, ChevronRight, Layers, Scissors, Plus, X, Upload, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AssetUploader, AssetFile } from '@/components/AssetUploader';
import { AssetList } from '@/components/AssetList';
import { Timeline } from '@/components/Timeline';
import { InspectorPanel } from '@/components/InspectorPanel';
import { TransitionPanel } from '@/components/TransitionPanel';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { AudioControlPanel } from '@/components/AudioControlPanel';
import { ShortcutHelpPanel } from '@/components/ShortcutHelpPanel';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { validateExport } from '@/lib/export-validator';

export default function EditorPage() {
  const {
    isPlaying,
    scenes,
    selectedSceneId,
    currentFrame,
    fps,
    assets,
    selectedAssetId,
    assetFilter,
    setAssetFilter,
    selectAsset,
    deleteAsset,
    selectScene,
    deleteScene,
    duplicateScene,
    splitScene,
    setIsPlaying,
    setCurrentFrame,
    resetEditor,
    exportProjectFile,
    loadProjectFile,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  // 注册快捷键
  useEditorShortcuts();

  const [activePanel, setActivePanel] = useState<'timeline' | 'assets' | 'inspector'>('timeline');
  const [, setAssetFiles] = useState<AssetFile[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'project' | 'export'>('assets');
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [draggedAsset, setDraggedAsset] = useState<any>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);

  // 导出状态
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [timelineHeight, setTimelineHeight] = useState(160);
  const resizeStateRef = useRef<null | {
    side: 'left' | 'right' | 'timeline';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>(null);

  const playerRef = useRef<PlayerRef>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const totalFrames = Math.max(
    180,
    ...scenes.map((scene) => scene.startFrame + scene.durationFrames)
  );
  const totalSeconds = Math.floor(totalFrames / fps);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (event: { detail: { frame: number } }) => {
      useEditorStore.getState().setCurrentFrame(event.detail.frame);
    };

    const onPlay = () => {
      useEditorStore.getState().setIsPlaying(true);
    };

    const onPause = () => {
      useEditorStore.getState().setIsPlaying(false);
    };

    const onEnded = () => {
      const state = useEditorStore.getState();
      state.setIsPlaying(false);
      const last = Math.max(0, totalFrames - 1);
      state.setCurrentFrame(last);
      player.seekTo(last);
    };

    player.addEventListener('frameupdate', onFrameUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
    };
  }, [totalFrames]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) return;
    playerRef.current.seekTo(currentFrame);
  }, [currentFrame, isPlaying]);

  const handlePlayPause = () => {
    if (!playerRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      // If we are already at the end, restart from beginning.
      if (currentFrame >= totalFrames - 1) {
        setCurrentFrame(0);
        playerRef.current.seekTo(0);
      }
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    try {
      const left = window.localStorage.getItem('editor:leftSidebarWidth');
      const right = window.localStorage.getItem('editor:rightSidebarWidth');
      const timeline = window.localStorage.getItem('editor:timelineHeight');
      if (left) setLeftSidebarWidth(Math.max(220, Math.min(520, parseInt(left, 10) || 280)));
      if (right) setRightSidebarWidth(Math.max(260, Math.min(560, parseInt(right, 10) || 320)));
      if (timeline) setTimelineHeight(Math.max(120, Math.min(420, parseInt(timeline, 10) || 160)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;

      if (state.side === 'timeline') {
        const deltaY = state.startY - event.clientY;
        const next = Math.max(120, Math.min(420, state.startHeight + deltaY));
        setTimelineHeight(next);
        try {
          window.localStorage.setItem('editor:timelineHeight', String(next));
        } catch {
          // ignore
        }
        return;
      }

      const delta = event.clientX - state.startX;
      if (state.side === 'left') {
        const next = Math.max(220, Math.min(520, state.startWidth + delta));
        setLeftSidebarWidth(next);
        try {
          window.localStorage.setItem('editor:leftSidebarWidth', String(next));
        } catch {
          // ignore
        }
      } else {
        const next = Math.max(260, Math.min(560, state.startWidth - delta));
        setRightSidebarWidth(next);
        try {
          window.localStorage.setItem('editor:rightSidebarWidth', String(next));
        } catch {
          // ignore
        }
      }
    };

    const onMouseUp = () => {
      resizeStateRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startResize = (side: 'left' | 'right' | 'timeline', event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    resizeStateRef.current = {
      side,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: side === 'left' ? leftSidebarWidth : rightSidebarWidth,
      startHeight: timelineHeight,
    };

    document.body.style.cursor = side === 'timeline' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleDebugClear = () => {
    if (!confirm('确定要清空当前工程吗？这会删除所有时间轴片段与素材（仅本地状态）。')) return;

    try {
      window.localStorage.removeItem('editor-storage');
      window.localStorage.removeItem('editor:leftSidebarWidth');
      window.localStorage.removeItem('editor:rightSidebarWidth');
      window.localStorage.removeItem('editor:timelineHeight');
    } catch {
      // ignore
    }

    resetEditor();
    setLeftSidebarWidth(280);
    setRightSidebarWidth(320);
    setTimelineHeight(160);
  };

  const handleSaveProjectFile = () => {
    const file = exportProjectFile();
    const json = JSON.stringify(file, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `movie-maker-project-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLoadProjectFileClick = () => {
    projectFileInputRef.current?.click();
  };

  const handleLoadProjectFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || parsed.version !== 1) {
        alert('工程文件格式不正确或版本不支持');
        return;
      }

      loadProjectFile(parsed);
    } catch (error) {
      console.error('Failed to load project file:', error);
      alert('加载工程文件失败，请检查文件内容');
    }
  };

  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleAssetUpload = (files: AssetFile[]) => {
    setAssetFiles(prev => [...prev, ...files]);
    // 转换文件为 Asset 并添加到 store
    files.forEach(file => {
      const asset: any = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type as 'image' | 'video' | 'audio',
        url: file.url,
        duration: file.duration,
        width: file.width,
        height: file.height,
        thumbnail: file.thumbnail,
        createdAt: new Date().toISOString(),
      };
      useEditorStore.getState().addAsset(asset);
    });
  };

  const handleAssetDelete = (id: string) => {
    deleteAsset(id);
  };

  const handleAssetSelect = (asset: any) => {
    selectAsset(asset.id);
  };

  const handleAssetDragStart = (asset: any, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    const payload = JSON.stringify(asset);
    // Prefer a stable MIME-like type; keep legacy keys for compatibility.
    e.dataTransfer.setData('application/x-movie-maker-asset+json', payload);
    e.dataTransfer.setData('asset', payload);
    e.dataTransfer.setData('text/plain', payload);
    setIsDraggingAsset(true);
    setDraggedAsset(asset);
  };

  const handleAssetDragEnd = () => {
    setIsDraggingAsset(false);
    setDraggedAsset(null);
  };

  const handleTimelineDrop = (frame: number, trackType: 'video' | 'audio' | 'text', e: React.DragEvent<HTMLDivElement>) => {
    try {
      const assetData =
        e.dataTransfer.getData('application/x-movie-maker-asset+json') ||
        e.dataTransfer.getData('asset') ||
        e.dataTransfer.getData('text/plain');
      if (!assetData) return;

      const asset = JSON.parse(assetData);
      const sceneType = asset.type === 'audio' ? 'audio' : (asset.type === 'image' ? 'image' : 'video');

      const durationFrames = asset.duration ? Math.round(asset.duration * fps) : 90;
      const baseId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const newScene: any = {
        id: `scene-${baseId}`,
        name: asset.name,
        type: sceneType,
        startFrame: frame,
        durationFrames,
        content: {
          assetId: asset.id,
        },
      };

      useEditorStore.getState().addScene(newScene);

      // If a video is added, also create an audio scene so the video's sound plays.
      if (asset.type === 'video') {
        const audioScene: any = {
          id: `scene-${baseId}-audio`,
          name: `${asset.name} (音频)`,
          type: 'audio',
          startFrame: frame,
          durationFrames,
          content: {
            assetId: asset.id,
          },
        };
        useEditorStore.getState().addScene(audioScene);
      }

      selectScene(newScene.id);
    } catch (error) {
      console.error('Failed to parse asset data:', error);
    } finally {
      setIsDraggingAsset(false);
      setDraggedAsset(null);
    }
  };

  const handleSceneDragStart = (sceneId: string, index: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setIsReordering(true);
    setDraggedSceneIndex(index);
  };

  const handleSceneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSceneDrop = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedSceneIndex === null || draggedSceneIndex === targetIndex) return;

    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    useEditorStore.getState().reorderScenes(fromIndex, targetIndex);

    setIsReordering(false);
    setDraggedSceneIndex(null);
  };

  const handleExport = async () => {
    // 1. 导出前检查
    const validation = validateExport({
      scenes,
      assets,
      fps,
    });

    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      alert(`导出失败:\n\n${errorMessages}`);
      return;
    }

    if (validation.warnings.length > 0) {
      const warningMessages = validation.warnings.map(w => w.message).join('\n');
      const confirmed = confirm(`检测到以下警告:\n\n${warningMessages}\n\n是否继续导出?`);
      if (!confirmed) return;
    }

    // 2. 开始导出
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      const { exportSettings } = useEditorStore.getState();

      // 调用导出 API
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token', // TODO: 使用真实 token
        },
        body: JSON.stringify({
          projectId: 'mock-project-id', // TODO: 使用真实项目 ID
          format: exportSettings.format,
          quality: exportSettings.quality,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导出失败');
      }

      const exportTask = await response.json();
      setExportId(exportTask.id);

      // 3. 轮询导出进度
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/exports/${exportTask.id}`);
          if (!statusResponse.ok) {
            clearInterval(pollInterval);
            throw new Error('获取导出状态失败');
          }

          const status = await statusResponse.json();
          setExportProgress(status.progress || 0);

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsExporting(false);

            // 4. 下载文件
            const downloadUrl = `/api/downloads/${status.filename}`;
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = status.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();

            alert('导出完成！');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsExporting(false);
            setExportError(status.error || '导出失败');
            alert(`导出失败: ${status.error || '未知错误'}`);
          }
        } catch (error: any) {
          clearInterval(pollInterval);
          setIsExporting(false);
          setExportError(error.message);
          console.error('轮询导出状态失败:', error);
        }
      }, 1000);

    } catch (error: any) {
      setIsExporting(false);
      setExportError(error.message);
      alert(`导出失败: ${error.message}`);
      console.error('导出失败:', error);
    }
  };

  const handleCancelExport = async () => {
    if (!exportId) return;

    try {
      await fetch(`/api/exports/${exportId}`, {
        method: 'DELETE',
      });
      setIsExporting(false);
      setExportProgress(0);
      setExportId(null);
    } catch (error) {
      console.error('取消导出失败:', error);
    }
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z: 撤销
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Cmd/Ctrl + Shift + Z: 重做
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
      // Cmd/Ctrl + Y: 重做（Windows 风格）
      else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col bg-gray-950 text-gray-100 overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <input
        ref={projectFileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleLoadProjectFileChange}
      />
      {/* 顶部导航栏 */}
      <header
        className="h-14 flex flex-shrink-0 items-center justify-between px-4 border-b border-gray-800 bg-gray-900 gap-4"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        {/* 左侧：项目名称 + 保存/撤销 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">
                Remotion Editor
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="已自动保存" />
                  <span>未命名项目</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-700" />

          <div className="flex items-center gap-2">
            <button
              className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="保存工程文件"
              onClick={handleSaveProjectFile}
            >
              <Save size={18} />
            </button>
            <button
              className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="加载工程文件"
              onClick={handleLoadProjectFileClick}
            >
              <Upload size={18} />
            </button>
            <button
              className={`p-1.5 bg-transparent border-none rounded cursor-pointer transition ${
                canUndo()
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="撤销 (Ctrl/Cmd+Z)"
              onClick={undo}
              disabled={!canUndo()}
            >
              <Undo size={18} />
            </button>
            <button
              className={`p-1.5 bg-transparent border-none rounded cursor-pointer transition ${
                canRedo()
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="重做 (Ctrl/Cmd+Shift+Z)"
              onClick={redo}
              disabled={!canRedo()}
            >
              <Redo size={18} />
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <button
              className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-red-900/40 hover:text-red-200"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="一键清空(调试)"
              onClick={handleDebugClear}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* 中间：预览分辨率 + 帧率 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
            <span>1920×1080</span>
            <span className="text-gray-600">|</span>
            <span>30fps</span>
          </div>
        </div>

        {/* 右侧：导出 + 设置 + 用户 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <Download size={16} />
            <span>{isExporting ? '导出中...' : '导出'}</span>
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 bg-gray-800 border-none rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700"
            title="全屏模式"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={() => alert('设置功能即将推出')}
            className="p-2.5 bg-gray-800 border-none rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700"
            title="设置"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <Settings size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-400">Z</span>
          </div>
        </div>
      </header>

      {/* 中间主内容区 */}
      <div className="flex-1 flex overflow-hidden flex-row min-h-0">
        {/* 左侧边栏 */}
        <div
          className="flex-shrink-0 border-r border-gray-800 flex flex-col bg-gray-900"
          style={{ width: `${leftSidebarWidth}px` }}
        >
          {/* 面板切换标签 */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-none border-b-2 transition-all duration-200 ${
                activeTab === 'assets'
                  ? 'bg-gray-800 text-blue-500 border-blue-500'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              素材库
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-none border-b-2 transition-all duration-200 ${
                activeTab === 'project'
                  ? 'bg-gray-800 text-blue-500 border-blue-500'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              项目
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-none border-b-2 transition-all duration-200 ${
                activeTab === 'export'
                  ? 'bg-gray-800 text-blue-500 border-blue-500'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              导出
            </button>
          </div>

          {/* 素材库内容 */}
          {activeTab === 'assets' && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* 上传区 */}
              <div className="p-4 border-b border-gray-800">
                <AssetUploader onUpload={handleAssetUpload} />
              </div>

              {/* 分类标签 */}
              <div className="flex gap-1 p-2 border-b border-gray-800 overflow-x-auto">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'video', label: '视频' },
                  { key: 'image', label: '图片' },
                  { key: 'audio', label: '音频' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setAssetFilter(item.key as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border-none whitespace-nowrap cursor-pointer transition ${
                      assetFilter === item.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                    {item.key !== 'all' && (
                      <span className="ml-1.5 text-gray-500">
                        ({assets.filter(a => a.type === item.key).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* 素材列表 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <AssetList
                  assets={assets}
                  filter={assetFilter}
                  onDelete={handleAssetDelete}
                  onSelect={handleAssetSelect}
                  selectedAsset={selectedAsset || null}
                  onDragStart={handleAssetDragStart}
                  onDragEnd={handleAssetDragEnd}
                  isDragging={isDraggingAsset}
                  draggedAsset={draggedAsset}
                />
              </div>
            </div>
          )}

          {/* 项目结构内容 */}
          {activeTab === 'project' && (
            <div className="flex-1 overflow-y-auto">
              {/* 场景列表 */}
              <div className="p-2">
                <div className="text-xs text-gray-500 font-medium mb-2 px-2">
                  {scenes.length} 个场景
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => {
                      const newScene: any = {
                        id: `scene-${Date.now()}`,
                        name: `场景 ${scenes.length + 1}`,
                        type: 'video' as const,
                        startFrame: currentFrame,
                        durationFrames: 90,
                      };
                      useEditorStore.getState().addScene(newScene);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded border-none cursor-pointer hover:bg-blue-700 transition"
                  >
                    <Plus size={14} />
                    <span className="ml-1">添加场景</span>
                  </button>
                  {selectedSceneId && (
                    <button
                      onClick={() => splitScene(selectedSceneId, currentFrame)}
                      disabled={!selectedScene}
                      className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded border-none cursor-pointer hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Scissors size={14} />
                      <span className="ml-1">分割场景</span>
                    </button>
                  )}
                </div>
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={(e) => handleSceneDragStart(scene.id, index, e)}
                    onDragOver={handleSceneDragOver}
                    onDrop={(e) => handleSceneDrop(index, e)}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer mb-1 transition-all select-none ${
                      selectedSceneId === scene.id
                        ? 'bg-blue-900/30 border border-blue-500'
                        : 'bg-transparent hover:bg-gray-800 border border-transparent'
                    } ${isReordering && draggedSceneIndex === index ? 'opacity-50' : ''}`}
                    onClick={() => selectScene(scene.id)}
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                      <Layers size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200 truncate">
                        {scene.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(scene.durationFrames / fps)}s
                      </div>
                    </div>
                    {/* 拖拽指示器 */}
                    {isReordering && draggedSceneIndex === index && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
                {scenes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">暂无场景</p>
                    <p className="text-xs mt-2 text-gray-600">从素材库拖拽素材到时间轴添加场景</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 导出设置内容 */}
          {activeTab === 'export' && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* 格式选择 */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 font-medium mb-2">
                  格式
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'mp4', label: 'MP4' },
                    { key: 'gif', label: 'GIF' },
                    { key: 'webm', label: 'WebM' },
                    { key: 'png', label: 'PNG 序列' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      className="px-3 py-2 text-sm font-medium rounded border-none cursor-pointer transition hover:bg-gray-700"
                      style={{
                        backgroundColor: useEditorStore.getState().exportSettings.format === item.key ? '#2563eb' : '#1f2937',
                        color: useEditorStore.getState().exportSettings.format === item.key ? 'white' : '#9ca3af',
                      }}
                      onClick={() => useEditorStore.getState().setExportSettings({ format: item.key as any })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 质量 */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 font-medium mb-2">
                  质量
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'low', label: '低' },
                    { key: 'medium', label: '中' },
                    { key: 'high', label: '高' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      className="px-3 py-1.5 text-xs font-medium rounded border-none cursor-pointer transition hover:bg-gray-700"
                      style={{
                        backgroundColor: useEditorStore.getState().exportSettings.quality === item.key ? '#2563eb' : '#1f2937',
                        color: useEditorStore.getState().exportSettings.quality === item.key ? 'white' : '#9ca3af',
                      }}
                      onClick={() => useEditorStore.getState().setExportSettings({ quality: item.key as any })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 输出设置 */}
              <div>
                <div className="text-xs text-gray-500 font-medium mb-2">
                  输出
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300">文件名</span>
                    <span className="text-sm text-gray-500">{useEditorStore.getState().exportSettings.filename}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300">位置</span>
                    <span className="text-sm text-gray-500">{useEditorStore.getState().exportSettings.outputPath}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="w-1 flex-shrink-0 bg-gray-900 hover:bg-blue-500/30 cursor-col-resize"
          onMouseDown={(e) => startResize('left', e)}
          title="拖拽调整左侧宽度"
        />

        {/* 中央预览区 */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0 min-h-0">
          {/* 播放控制区 */}
          <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-4">
              {/* 播放/暂停按钮 */}
                <button
                  onClick={handlePlayPause}
                  className="p-2.5 bg-blue-600 text-white border-none rounded-full cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                  title={isPlaying ? '暂停 (Space)' : '播放 (Space)'}
                >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>

              {/* 时间显示 */}
              <div className="flex flex-col">
                <div className="text-lg font-medium text-white leading-tight">
                  {Math.floor(currentFrame / fps)}s
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  / {totalSeconds}s
                </div>
              </div>
            </div>

            {/* 场景切换 */}
            <div className="flex items-center gap-2">
              {selectedScene && (
                <>
                  <button
                    onClick={() => {
                      const currentIndex = scenes.findIndex(s => s.id === selectedSceneId);
                      if (currentIndex > 0) {
                        selectScene(scenes[currentIndex - 1].id);
                      }
                    }}
                    disabled={scenes.findIndex(s => s.id === selectedSceneId) === 0}
                    className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="上一个场景"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <div className="text-sm text-gray-400">
                    场景 {scenes.findIndex(s => s.id === selectedSceneId) + 1} / {scenes.length}
                  </div>
                  <button
                    onClick={() => {
                      const currentIndex = scenes.findIndex(s => s.id === selectedSceneId);
                      if (currentIndex < scenes.length - 1) {
                        selectScene(scenes[currentIndex + 1].id);
                      }
                    }}
                    disabled={scenes.findIndex(s => s.id === selectedSceneId) === scenes.length - 1}
                    className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="下一个场景"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 视频预览区 */}
          <div className="flex-1 flex items-center justify-center bg-black p-6 min-h-0">
            <div className="w-full h-full max-w-[80rem] max-h-[60vh]">
              <Player
                ref={playerRef}
                component={VideoComposition}
                style={{ width: '100%', height: '100%' }}
                compositionWidth={1920}
                compositionHeight={1080}
                durationInFrames={totalFrames || 180}
                fps={fps}
                initialFrame={currentFrame}
                controls={false}
                loop={false}
                autoPlay={false}
                moveToBeginningWhenEnded={false}
                acknowledgeRemotionLicense={true}
              />
            </div>
          </div>

          {/* 当前场景信息 */}
          {selectedScene && (
            <div className="h-10 flex-shrink-0 px-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">当前场景:</span>
                <span className="text-sm font-medium text-gray-200">{selectedScene.name}</span>
                <button
                  onClick={() => duplicateScene(selectedScene.id)}
                  className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800"
                  title="复制场景"
                >
                  <Scissors size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定要删除 "${selectedScene.name}" 吗？`)) {
                      deleteScene(selectedScene.id);
                    }
                  }}
                  className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                  title="删除场景"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">帧范围:</span>
                <span className="text-sm font-mono text-gray-200">
                  {selectedScene.startFrame} - {selectedScene.startFrame + selectedScene.durationFrames}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className="w-1 flex-shrink-0 bg-gray-900 hover:bg-blue-500/30 cursor-col-resize"
          onMouseDown={(e) => startResize('right', e)}
          title="拖拽调整右侧宽度"
        />

        {/* 右侧属性面板 */}
        <div
          className="flex-shrink-0 border-l border-gray-800 flex flex-col bg-gray-900"
          style={{ width: `${rightSidebarWidth}px` }}
        >
          {/* 属性面板标签 */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActivePanel('inspector')}
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-none border-b-2 transition-all duration-200 ${
                activePanel === 'inspector'
                  ? 'text-blue-500 border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              属性
            </button>
          </div>

          {/* 属性面板内容 */}
          <div className="flex-1 overflow-y-auto">
            <InspectorPanel scene={selectedScene || null} />
          </div>
        </div>
      </div>

      {/* 底部时间轴 */}
      <div
        className="relative flex-shrink-0 border-t border-gray-800 bg-gray-900 flex flex-col"
        style={{ height: `${timelineHeight}px` }}
      >
        <div
          className="h-1 w-full flex-shrink-0 bg-gray-900 hover:bg-blue-500/30 cursor-row-resize"
          onMouseDown={(e) => startResize('timeline', e)}
          title="拖拽调整时间轴高度"
        />
        {/* 拖拽指示器 */}
        {isDraggingAsset && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-blue-300 font-medium">
              松开以添加到时间轴
            </span>
          </div>
        )}

        {/* 轨道区 */}
        <div className="flex-1 overflow-hidden">
          <Timeline
            fps={fps}
            isAssetDragging={isDraggingAsset}
            draggedAssetType={draggedAsset?.type ?? null}
            draggedAssetDuration={draggedAsset?.duration}
            onAssetDrop={handleTimelineDrop}
          />
        </div>
      </div>

      {/* 导出进度条 */}
      {isExporting && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">
                  正在导出视频...
                </div>
                <div className="text-sm text-gray-400">
                  {exportProgress}%
                </div>
              </div>
              <button
                onClick={handleCancelExport}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                取消
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            {exportError && (
              <div className="mt-2 text-sm text-red-400">
                {exportError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 全屏退出按钮 */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 px-4 py-2 bg-gray-900 border border-gray-700 text-white z-50 cursor-pointer rounded-xl font-medium hover:bg-gray-800 transition-all"
        >
          退出全屏
        </button>
      )}

      {/* 转场库面板 */}
      <TransitionPanel />

      {/* 文本编辑器面板 */}
      <TextEditorPanel />

      {/* 音频控制面板 */}
      <AudioControlPanel />

      {/* 快捷键帮助面板 */}
      <ShortcutHelpPanel />
    </div>
  );
}
