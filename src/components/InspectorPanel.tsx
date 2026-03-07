'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditorStore, Scene } from '@/store/editor';
import { Trash2, Copy, Settings, Lock, Unlock, Type, Move, Maximize2, RotateCw, Droplets, Palette, Hash } from 'lucide-react';

interface InspectorPanelProps {
  scene: Scene | null;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ scene }) => {
  const { updateScene, deleteScene } = useEditorStore();
  const [localScene, setLocalScene] = useState<Scene | null>(null);

  // 当选中的场景改变时，更新本地状态
  useEffect(() => {
    if (scene) {
      setLocalScene(scene);
    }
  }, [scene]);

  // 保存修改
  const handleSave = useCallback(() => {
    if (localScene) {
      updateScene(localScene.id, {
        name: localScene.name,
        type: localScene.type,
        startFrame: localScene.startFrame,
        durationFrames: localScene.durationFrames,
        content: localScene.content,
      });
    }
  }, [localScene, updateScene]);

  // 删除场景
  const handleDelete = useCallback(() => {
    if (scene && confirm('确定要删除这个场景吗？')) {
      deleteScene(scene.id);
      setLocalScene(null);
    }
  }, [scene, deleteScene]);

  // 复制场景
  const handleDuplicate = useCallback(() => {
    if (!scene) return;

    const newScene: Scene = {
      ...scene,
      id: `scene-${Date.now()}`,
      name: `${scene.name} (副本)`,
      startFrame: scene.startFrame + scene.durationFrames,
    };

    useEditorStore.getState().addScene(newScene);
  }, [scene]);

  if (!scene) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <Settings size={48} />
        <p className="mt-4 text-sm">选择一个场景来编辑</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-800">
        <h2 className="text-lg font-semibold text-white">属性面板</h2>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">基本信息</h3>

          {/* 场景名称 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              场景名称
            </label>
            <input
              type="text"
              value={localScene?.name || ''}
              onChange={(e) => setLocalScene(prev => prev ? { ...prev, name: e.target.value } : null)}
              onBlur={handleSave}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              placeholder="输入场景名称"
            />
          </div>

          {/* 场景类型 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              场景类型
            </label>
            <select
              value={localScene?.type || 'video'}
              onChange={(e) => setLocalScene(prev => prev ? { ...prev, type: e.target.value as Scene['type'] } : null)}
              onBlur={handleSave}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
            >
              <option value="video">视频</option>
              <option value="image">图片</option>
              <option value="text">文本</option>
              <option value="transition">转场</option>
            </select>
          </div>

          {/* 时长 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                开始帧
              </label>
              <input
                type="number"
                value={localScene?.startFrame || 0}
                onChange={(e) => setLocalScene(prev => prev ? { ...prev, startFrame: parseInt(e.target.value) || 0 } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                持续帧数
              </label>
              <input
                type="number"
                value={localScene?.durationFrames || 90}
                onChange={(e) => setLocalScene(prev => prev ? { ...prev, durationFrames: parseInt(e.target.value) || 90 } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 变换属性 */}
        {(localScene?.type === 'video' || localScene?.type === 'image') && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Move size={14} />
              变换
            </h3>

            {/* 位置 */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">位置</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X</label>
                  <input
                    type="number"
                    value={localScene.content?.x || 0}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, x: parseInt(e.target.value) || 0 }
                    } : null)}
                    onBlur={handleSave}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y</label>
                  <input
                    type="number"
                    value={localScene.content?.y || 0}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, y: parseInt(e.target.value) || 0 }
                    } : null)}
                    onBlur={handleSave}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 尺寸 */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">尺寸</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">宽度</label>
                  <input
                    type="number"
                    value={localScene.content?.width || 1920}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, width: parseInt(e.target.value) || 1920 }
                    } : null)}
                    onBlur={handleSave}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">高度</label>
                  <input
                    type="number"
                    value={localScene.content?.height || 1080}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, height: parseInt(e.target.value) || 1080 }
                    } : null)}
                    onBlur={handleSave}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 旋转 */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">旋转</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={localScene.content?.rotation || 0}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, rotation: parseInt(e.target.value) }
                  } : null)}
                  onBlur={handleSave}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={localScene.content?.rotation || 0}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, rotation: parseInt(e.target.value) || 0 }
                  } : null)}
                  onBlur={handleSave}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition text-center"
                />
                <span className="text-xs text-gray-500">°</span>
              </div>
            </div>

            {/* 缩放 */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">缩放</label>
              <div className="flex items-center gap-3">
                <Maximize2 size={14} className="text-gray-400" />
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={localScene.content?.scale || 1}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, scale: parseFloat(e.target.value) }
                  } : null)}
                  onBlur={handleSave}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={localScene.content?.scale || 1}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, scale: parseFloat(e.target.value) || 1 }
                  } : null)}
                  onBlur={handleSave}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition text-center"
                />
                <span className="text-xs text-gray-500">x</span>
              </div>
            </div>

            {/* 不透明度 */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">不透明度</label>
              <div className="flex items-center gap-3">
                <Droplets size={14} className="text-gray-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={localScene.content?.opacity !== undefined ? localScene.content.opacity : 1}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, opacity: parseFloat(e.target.value) }
                  } : null)}
                  onBlur={handleSave}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={localScene.content?.opacity !== undefined ? localScene.content.opacity : 1}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, opacity: parseFloat(e.target.value) }
                  } : null)}
                  onBlur={handleSave}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition text-center"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>

            {/* 混合模式 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                混合模式
              </label>
              <select
                value={localScene.content?.blendMode || 'normal'}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, blendMode: e.target.value }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              >
                <option value="normal">正常</option>
                <option value="multiply">正片叠底</option>
                <option value="screen">滤色</option>
                <option value="overlay">叠加</option>
                <option value="darken">变暗</option>
                <option value="lighten">变亮</option>
              </select>
            </div>
          </div>
        )}

        {/* 文本属性 */}
        {localScene?.type === 'text' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Type size={14} />
              文本
            </h3>

            {/* 文本内容 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                文本内容
              </label>
              <textarea
                value={localScene.content?.text || ''}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, text: e.target.value }
                } : null)}
                onBlur={handleSave}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition resize-none"
                placeholder="输入文本内容"
              />
            </div>

            {/* 字体 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                字体
              </label>
              <select
                value={localScene.content?.fontFamily || 'Inter'}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, fontFamily: e.target.value }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>

            {/* 字号 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                字号
              </label>
              <input
                type="number"
                min={12}
                max={200}
                value={localScene.content?.fontSize || 48}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, fontSize: parseInt(e.target.value) || 48 }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* 字重 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                字重
              </label>
              <select
                value={localScene.content?.fontWeight || 'normal'}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, fontWeight: e.target.value }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              >
                <option value="normal">常规</option>
                <option value="medium">中等</option>
                <option value="bold">粗体</option>
                <option value="black">黑体</option>
              </select>
            </div>

            {/* 文本颜色 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                文本颜色
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localScene.content?.color || '#ffffff'}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, color: e.target.value }
                  } : null)}
                  onBlur={handleSave}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-gray-700"
                />
                <Palette size={14} className="text-gray-400" />
                <input
                  type="text"
                  value={localScene.content?.color || '#ffffff'}
                  onChange={(e) => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, color: e.target.value }
                  } : null)}
                  onBlur={handleSave}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* 对齐方式 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                对齐方式
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, textAlign: 'left' }
                  } : null)}
                  onBlur={handleSave}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                    localScene.content?.textAlign === 'left'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  title="左对齐"
                >
                  L
                </button>
                <button
                  onClick={() => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, textAlign: 'center' }
                  } : null)}
                  onBlur={handleSave}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                    localScene.content?.textAlign === 'center'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  title="居中对齐"
                >
                  C
                </button>
                <button
                  onClick={() => setLocalScene(prev => prev ? {
                    ...prev,
                    content: { ...prev.content, textAlign: 'right' }
                  } : null)}
                  onBlur={handleSave}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                    localScene.content?.textAlign === 'right'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  title="右对齐"
                >
                  R
                </button>
              </div>
            </div>

            {/* 行高 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                行高
              </label>
              <input
                type="number"
                min={1}
                max={3}
                step={0.1}
                value={localScene.content?.lineHeight || 1.5}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, lineHeight: parseFloat(e.target.value) || 1.5 }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* 字间距 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                字间距
              </label>
              <input
                type="number"
                min={-10}
                max={20}
                step={0.5}
                value={localScene.content?.letterSpacing || 0}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, letterSpacing: parseFloat(e.target.value) || 0 }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        )}

        {/* 样式设置 */}
        {(localScene?.type === 'video' || localScene?.type === 'image') && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">样式</h3>

            {/* 边框 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                边框
              </label>
              <input
                type="number"
                min={0}
                value={localScene.content?.borderWidth || 0}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, borderWidth: parseInt(e.target.value) || 0 }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                placeholder="边框宽度"
              />
            </div>

            {/* 边框颜色 */}
            {localScene.content?.borderWidth && localScene.content.borderWidth > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  边框颜色
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localScene.content?.borderColor || '#ffffff'}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, borderColor: e.target.value }
                    } : null)}
                    onBlur={handleSave}
                    className="w-12 h-10 rounded cursor-pointer border-2 border-gray-700"
                  />
                  <Palette size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={localScene.content?.borderColor || '#ffffff'}
                    onChange={(e) => setLocalScene(prev => prev ? {
                      ...prev,
                      content: { ...prev.content, borderColor: e.target.value }
                    } : null)}
                    onBlur={handleSave}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            )}

            {/* 阴影 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                阴影
              </label>
              <select
                value={localScene.content?.shadow || 'none'}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, shadow: e.target.value }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
              >
                <option value="none">无</option>
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>
          </div>
        )}

        {/* 内容设置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">内容</h3>

          {/* 文本内容 */}
          {localScene?.type === 'text' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                文本内容
              </label>
              <textarea
                value={localScene.content?.text || ''}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, text: e.target.value }
                } : null)}
                onBlur={handleSave}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition resize-none"
                placeholder="输入文本内容"
              />
            </div>
          )}

          {/* 素材 ID */}
          {(localScene?.type === 'video' || localScene?.type === 'image') && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                素材 ID
              </label>
              <input
                type="text"
                value={localScene.content?.assetId || ''}
                onChange={(e) => setLocalScene(prev => prev ? {
                  ...prev,
                  content: { ...prev.content, assetId: e.target.value }
                } : null)}
                onBlur={handleSave}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                placeholder="输入素材 ID"
              />
            </div>
          )}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="p-4 border-t border-gray-800 bg-gray-800 space-y-2">
        <button
          onClick={handleDuplicate}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition"
        >
          <Copy size={16} />
          <span>复制场景</span>
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition"
        >
          <Trash2 size={16} />
          <span>删除场景</span>
        </button>
      </div>
    </div>
  );
};
