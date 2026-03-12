'use client';

import { useEditorStore } from '@/store/editor';
import { Sparkles, X } from 'lucide-react';

const EFFECT_PRESETS = [
  { type: 'brightness' as const, label: '亮度', icon: '☀️', defaultIntensity: 50 },
  { type: 'contrast' as const, label: '对比度', icon: '◐', defaultIntensity: 50 },
  { type: 'saturation' as const, label: '饱和度', icon: '🎨', defaultIntensity: 50 },
  { type: 'hue' as const, label: '色调', icon: '🌈', defaultIntensity: 0 },
  { type: 'blur' as const, label: '模糊', icon: '💫', defaultIntensity: 0 },
  { type: 'sharpen' as const, label: '锐化', icon: '✨', defaultIntensity: 0 },
  { type: 'grayscale' as const, label: '黑白', icon: '⚫', defaultIntensity: 0 },
  { type: 'sepia' as const, label: '复古', icon: '📷', defaultIntensity: 0 },
];

export const VideoEffectPanel: React.FC = () => {
  const { selectedSceneId, scenes, addVideoEffect, removeVideoEffect, updateVideoEffect, clearVideoEffects } = useEditorStore();

  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const isVideoScene = selectedScene && (selectedScene.type === 'video' || selectedScene.type === 'image');

  if (!selectedSceneId || !isVideoScene) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">选择视频或图片场景以添加特效</p>
      </div>
    );
  }

  const activeEffects = selectedScene.videoEffects || [];

  const handleAddEffect = (type: typeof EFFECT_PRESETS[number]['type'], defaultIntensity: number) => {
    if (activeEffects.some(e => e.type === type)) return;
    addVideoEffect(selectedSceneId, { type, intensity: defaultIntensity });
  };

  const handleRemoveEffect = (type: typeof EFFECT_PRESETS[number]['type']) => {
    removeVideoEffect(selectedSceneId, type);
  };

  const handleUpdateEffect = (type: typeof EFFECT_PRESETS[number]['type'], intensity: number) => {
    updateVideoEffect(selectedSceneId, type, intensity);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="font-semibold text-gray-200">视频特效</h3>
        </div>
        {activeEffects.length > 0 && (
          <button
            onClick={() => clearVideoEffects(selectedSceneId)}
            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition"
          >
            清除全部
          </button>
        )}
      </div>

      {/* 特效列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 已应用的特效 */}
        {activeEffects.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">已应用特效</h4>
            {activeEffects.map((effect) => {
              const preset = EFFECT_PRESETS.find(p => p.type === effect.type);
              if (!preset) return null;

              return (
                <div key={effect.type} className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-sm font-medium text-gray-200">{preset.label}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEffect(effect.type)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                      title="移除特效"
                    >
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>强度</span>
                      <span className="font-mono">{effect.intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effect.intensity}
                      onChange={(e) => handleUpdateEffect(effect.type, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 可用特效 */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">可用特效</h4>
          <div className="grid grid-cols-2 gap-2">
            {EFFECT_PRESETS.map((preset) => {
              const isActive = activeEffects.some(e => e.type === preset.type);
              return (
                <button
                  key={preset.type}
                  onClick={() => !isActive && handleAddEffect(preset.type, preset.defaultIntensity)}
                  disabled={isActive}
                  className={`p-3 rounded-lg border-2 transition ${
                    isActive
                      ? 'border-purple-500 bg-purple-500/10 cursor-not-allowed opacity-50'
                      : 'border-gray-700 bg-gray-800 hover:border-purple-500 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="text-2xl mb-1">{preset.icon}</div>
                  <div className="text-xs font-medium text-gray-300">{preset.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 提示：可以同时应用多个特效，它们会按顺序叠加。调整滑块可以控制特效强度。
          </p>
        </div>
      </div>
    </div>
  );
};
