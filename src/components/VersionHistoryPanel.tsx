'use client';

import { useState } from 'react';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { History, RotateCcw, Trash2, X } from 'lucide-react';

export const VersionHistoryPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getVersionHistory, restoreVersion, deleteVersion, clearVersionHistory, saveVersion } = useVersionHistory();
  const [versions, setVersions] = useState(getVersionHistory());

  const refreshVersions = () => {
    setVersions(getVersionHistory());
  };

  const handleRestore = (versionId: string) => {
    if (confirm('确定要恢复到此版本吗？当前状态将被保存为新版本。')) {
      const success = restoreVersion(versionId);
      if (success) {
        alert('版本恢复成功！');
        refreshVersions();
        setIsOpen(false);
      } else {
        alert('版本恢复失败！');
      }
    }
  };

  const handleDelete = (versionId: string) => {
    if (confirm('确定要删除此版本吗？')) {
      const success = deleteVersion(versionId);
      if (success) {
        refreshVersions();
      } else {
        alert('删除失败！');
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清除所有版本历史吗？此操作不可恢复。')) {
      const success = clearVersionHistory();
      if (success) {
        refreshVersions();
      } else {
        alert('清除失败！');
      }
    }
  };

  const handleSaveManual = () => {
    const description = prompt('请输入版本描述（可选）：');
    saveVersion(description || undefined);
    refreshVersions();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          refreshVersions();
          setIsOpen(true);
        }}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition z-50"
        title="版本历史"
      >
        <History size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <History size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-200">版本历史</h2>
            <span className="text-sm text-gray-500">({versions.length}/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveManual}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              保存当前版本
            </button>
            {versions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition"
              >
                清除全部
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-800 rounded transition"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 版本列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <History size={48} className="mb-4 opacity-50" />
              <p className="text-sm">暂无版本历史</p>
              <p className="text-xs mt-2 text-gray-600">系统会每 5 分钟自动保存版本</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-200">
                          {version.description}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 rounded">
                            最新
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {version.timestamp.toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {version.projectData.tracks.reduce((sum, track) => sum + track.scenes.length, 0)} 个场景 · {' '}
                        {version.projectData.assets.length} 个素材
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="p-2 hover:bg-blue-900/30 hover:text-blue-400 rounded transition"
                        title="恢复到此版本"
                      >
                        <RotateCcw size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(version.id)}
                        className="p-2 hover:bg-red-900/30 hover:text-red-400 rounded transition"
                        title="删除此版本"
                      >
                        <Trash2 size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示 */}
        <div className="px-6 py-3 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-gray-500">
            💡 提示：系统会自动保存最近 10 个版本，每 5 分钟保存一次。恢复版本前会自动保存当前状态。
          </p>
        </div>
      </div>
    </div>
  );
};
