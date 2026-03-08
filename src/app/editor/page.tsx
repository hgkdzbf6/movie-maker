'use client';

import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import { useEditorStore } from '@/store/editor';
import { Play, Pause, Download, Settings, Maximize2, Save, Undo, Redo, ChevronRight, Layers, Scissors, Plus, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { AssetUploader, AssetFile } from '@/components/AssetUploader';
import { AssetList } from '@/components/AssetList';
import { Timeline } from '@/components/Timeline';
import { InspectorPanel } from '@/components/InspectorPanel';

export default function EditorPage() {
  const {
    isPlaying,
    togglePlayback,
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
  } = useEditorStore();

  const [activePanel, setActivePanel] = useState<'timeline' | 'assets' | 'inspector'>('timeline');
  const [assetFiles, setAssetFiles] = useState<AssetFile[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'project' | 'export'>('assets');
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [draggedAsset, setDraggedAsset] = useState<any>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);

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
    e.dataTransfer.setData('asset', JSON.stringify(asset));
    setIsDraggingAsset(true);
    setDraggedAsset(asset);
  };

  const handleAssetDragEnd = () => {
    setIsDraggingAsset(false);
    setDraggedAsset(null);
  };

  const handleTimelineDrop = (frame: number, trackType: 'video' | 'audio' | 'text', e: React.DragEvent<HTMLDivElement>) => {
    const assetData = e.dataTransfer.getData('asset');
    if (!assetData || !draggedAsset) return;

    try {
      const asset = JSON.parse(assetData);
      const sceneType = asset.type === 'audio' ? 'audio' : (asset.type === 'image' ? 'image' : 'video');
      const isInvalidTrack = (sceneType === 'audio' && trackType !== 'audio') || (sceneType !== 'audio' && trackType === 'audio');

      if (isInvalidTrack) {
        return;
      }

      const newScene: any = {
        id: `scene-${Date.now()}`,
        name: asset.name,
        type: sceneType,
        startFrame: frame,
        durationFrames: asset.duration ? Math.round(asset.duration * fps) : 90,
        content: {
          assetId: asset.id,
        },
      };

      useEditorStore.getState().addScene(newScene);
      selectScene(newScene.id);
    } catch (error) {
      console.error('Failed to parse asset data:', error);
    }

    setIsDraggingAsset(false);
    setDraggedAsset(null);
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

  const totalFrames = scenes.reduce((sum, s) => sum + s.durationFrames, 0);
  const totalSeconds = Math.floor(totalFrames / fps);
  const currentSeconds = Math.floor(currentFrame / fps);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="h-14 flex flex-shrink-0 items-center justify-between px-4 border-b border-gray-800 bg-gray-900 gap-4">
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
            <button className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800">
              <Save size={18} />
            </button>
            <button className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800">
              <Undo size={18} />
            </button>
            <button className="p-1.5 bg-transparent border-none rounded cursor-pointer text-gray-400 hover:bg-gray-800">
              <Redo size={18} />
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
            onClick={() => alert('导出功能即将推出')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer font-medium text-sm hover:bg-blue-700"
          >
            <Download size={16} />
            <span>导出</span>
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 bg-gray-800 border-none rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700"
            title="全屏模式"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={() => alert('设置功能即将推出')}
            className="p-2.5 bg-gray-800 border-none rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700"
            title="设置"
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
        <div className="w-[280px] flex-shrink-0 border-r border-gray-800 flex flex-col bg-gray-900">
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

        {/* 中央预览区 */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0 min-h-0">
          {/* 播放控制区 */}
          <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-4">
              {/* 播放/暂停按钮 */}
              <button
                onClick={togglePlayback}
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
                component={VideoComposition}
                style={{ width: '100%', height: '100%' }}
                compositionWidth={1920}
                compositionHeight={1080}
                durationInFrames={totalFrames || 180}
                fps={fps}
                inFrame={currentFrame}
                controls={false}
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

        {/* 右侧属性面板 */}
        <div className="w-[320px] flex-shrink-0 border-l border-gray-800 flex flex-col bg-gray-900">
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
        className="relative h-40 flex-shrink-0 border-t border-gray-800 bg-gray-900 flex flex-col"
      >
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

      {/* 全屏退出按钮 */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 px-4 py-2 bg-gray-900 border border-gray-700 text-white z-50 cursor-pointer rounded-xl font-medium hover:bg-gray-800 transition-all"
        >
          退出全屏
        </button>
      )}
    </div>
  );
}
