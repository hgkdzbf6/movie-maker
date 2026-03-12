'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { Sparkles, X } from 'lucide-react';

interface TransitionItem {
  id: string;
  name: string;
  type: 'fade' | 'crossDissolve' | 'push' | 'zoom' | 'wipe';
  description: string;
  icon: string;
}

const transitions: TransitionItem[] = [
  {
    id: 'fade',
    name: '淡入淡出',
    type: 'fade',
    description: '平滑的淡入淡出效果',
    icon: '🌅',
  },
  {
    id: 'crossDissolve',
    name: '交叉溶解',
    type: 'crossDissolve',
    description: '两个场景之间的交叉淡化',
    icon: '✨',
  },
  {
    id: 'push',
    name: '推入',
    type: 'push',
    description: '新场景推入旧场景',
    icon: '➡️',
  },
  {
    id: 'zoom',
    name: '缩放',
    type: 'zoom',
    description: '从小到大的缩放效果',
    icon: '🔍',
  },
  {
    id: 'wipe',
    name: '擦除',
    type: 'wipe',
    description: '擦除式过渡效果',
    icon: '🧹',
  },
];

export const TransitionPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addTransition, fps } = useEditorStore();

  const handleDragStart = (e: React.DragEvent, transition: TransitionItem) => {
    e.dataTransfer.setData('application/x-movie-maker-transition+json', JSON.stringify({
      type: transition.type,
      name: transition.name,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddTransition = (transition: TransitionItem) => {
    // 默认添加 1 秒的转场
    const durationFrames = fps;

    addTransition({
      name: transition.name,
      type: 'transition',
      startFrame: 0,
      durationFrames,
      transitionType: transition.type,
      transitionDirection: 'right',
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-all z-50"
        title="打开转场库"
      >
        <Sparkles size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-20 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-200">转场库</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 转场列表 */}
      <div className="p-3 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {transitions.map((transition) => (
            <div
              key={transition.id}
              draggable
              onDragStart={(e) => handleDragStart(e, transition)}
              onClick={() => handleAddTransition(transition)}
              className="group relative p-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500 rounded-lg cursor-move transition-all"
              title={`拖拽到时间轴或点击添加\n${transition.description}`}
            >
              {/* 图标 */}
              <div className="flex items-center justify-center h-16 mb-2 text-4xl">
                {transition.icon}
              </div>

              {/* 名称 */}
              <div className="text-center">
                <div className="text-xs font-medium text-gray-200 mb-1">
                  {transition.name}
                </div>
                <div className="text-[10px] text-gray-500 line-clamp-2">
                  {transition.description}
                </div>
              </div>

              {/* Hover 提示 */}
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* 使用提示 */}
        <div className="mt-3 p-2 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-400">
          <p className="mb-1">💡 使用方法：</p>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>拖拽转场到两个场景之间</li>
            <li>点击转场直接添加到时间轴</li>
            <li>调整转场时长（0.5-2秒）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
