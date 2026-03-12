'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { formatShortcut } from '@/hooks/useShortcuts';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';

export const ShortcutHelpPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { playbackShortcuts, editingShortcuts, navigationShortcuts } = useEditorShortcuts();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg transition-all z-50"
        title="快捷键帮助 (?)"
      >
        <Keyboard size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <Keyboard size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-200">快捷键帮助</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 播放控制 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded"></span>
              播放控制
            </h3>
            <div className="space-y-2">
              {playbackShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded hover:bg-gray-800 transition"
                >
                  <span className="text-sm text-gray-300">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-gray-700 text-gray-200 text-xs font-mono rounded border border-gray-600">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* 编辑操作 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-green-500 rounded"></span>
              编辑操作
            </h3>
            <div className="space-y-2">
              {editingShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded hover:bg-gray-800 transition"
                >
                  <span className="text-sm text-gray-300">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-gray-700 text-gray-200 text-xs font-mono rounded border border-gray-600">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* 时间轴导航 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded"></span>
              时间轴导航
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded hover:bg-gray-800 transition"
                >
                  <span className="text-sm text-gray-300">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-gray-700 text-gray-200 text-xs font-mono rounded border border-gray-600">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 提示：快捷键在输入框中不会触发，确保编辑体验流畅。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
