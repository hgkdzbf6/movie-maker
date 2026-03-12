'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editor';
import { Volume2, X } from 'lucide-react';

const AUDIO_EFFECTS = [
  { value: 'none', label: '无效果' },
  { value: 'noise-reduction', label: '降噪' },
  { value: 'equalizer-bass', label: '均衡器 - 低音' },
  { value: 'equalizer-treble', label: '均衡器 - 高音' },
  { value: 'compressor', label: '压缩器' },
];

export const AudioControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedSceneId,
    scenes,
    updateAudioVolume,
    setAudioFade,
    setAudioEffect,
    fps,
  } = useEditorStore();

  const selectedScene = scenes.find(s => s.id === selectedSceneId && s.type === 'audio');

  const [volume, setVolume] = useState(selectedScene?.volume ?? 1.0);
  const [fadeInDuration, setFadeInDuration] = useState(
    selectedScene?.fadeInDuration ? Math.round((selectedScene.fadeInDuration / fps) * 10) / 10 : 0
  );
  const [fadeOutDuration, setFadeOutDuration] = useState(
    selectedScene?.fadeOutDuration ? Math.round((selectedScene.fadeOutDuration / fps) * 10) / 10 : 0
  );
  const [audioEffect, setAudioEffectState] = useState<typeof selectedScene.audioEffect>(
    selectedScene?.audioEffect || 'none'
  );

  // 当选中的场景改变时，更新状态
  useEffect(() => {
    if (selectedScene) {
      setVolume(selectedScene.volume ?? 1.0);
      setFadeInDuration(
        selectedScene.fadeInDuration ? Math.round((selectedScene.fadeInDuration / fps) * 10) / 10 : 0
      );
      setFadeOutDuration(
        selectedScene.fadeOutDuration ? Math.round((selectedScene.fadeOutDuration / fps) * 10) / 10 : 0
      );
      setAudioEffectState(selectedScene.audioEffect || 'none');
    }
  }, [selectedSceneId, selectedScene, fps]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (selectedSceneId) {
      updateAudioVolume(selectedSceneId, newVolume);
    }
  };

  const handleFadeInChange = (seconds: number) => {
    setFadeInDuration(seconds);
    if (selectedSceneId) {
      const frames = Math.round(seconds * fps);
      setAudioFade(selectedSceneId, frames > 0 ? frames : undefined, selectedScene?.fadeOutDuration);
    }
  };

  const handleFadeOutChange = (seconds: number) => {
    setFadeOutDuration(seconds);
    if (selectedSceneId) {
      const frames = Math.round(seconds * fps);
      setAudioFade(selectedSceneId, selectedScene?.fadeInDuration, frames > 0 ? frames : undefined);
    }
  };

  const handleEffectChange = (effect: typeof audioEffect) => {
    setAudioEffectState(effect);
    if (selectedSceneId) {
      setAudioEffect(selectedSceneId, effect);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-52 p-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-all z-50"
        title="打开音频控制面板"
      >
        <Volume2 size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-52 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-green-400" />
          <h3 className="text-sm font-semibold text-gray-200">音频控制</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 内容 */}
      <div className="p-4 space-y-4">
        {!selectedScene ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            请选择一个音频片段
          </div>
        ) : (
          <>
            {/* 音量控制 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                音量: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 淡入时长 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                淡入时长: {fadeInDuration}s
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={fadeInDuration}
                onChange={(e) => handleFadeInChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0s</span>
                <span>1s</span>
                <span>2s</span>
              </div>
            </div>

            {/* 淡出时长 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                淡出时长: {fadeOutDuration}s
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={fadeOutDuration}
                onChange={(e) => handleFadeOutChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0s</span>
                <span>1s</span>
                <span>2s</span>
              </div>
            </div>

            {/* 音频特效 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">音频特效</label>
              <select
                value={audioEffect}
                onChange={(e) => handleEffectChange(e.target.value as typeof audioEffect)}
                className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm focus:outline-none focus:border-green-500"
              >
                {AUDIO_EFFECTS.map((effect) => (
                  <option key={effect.value} value={effect.value}>
                    {effect.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 音量包络线提示 */}
            <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-400">
              <p className="mb-1">💡 高级功能：</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>音量包络线编辑（开发中）</li>
                <li>实时波形预览</li>
                <li>关键帧动画</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
