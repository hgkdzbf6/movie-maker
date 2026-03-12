import { useEffect, useRef } from 'react';
import { useEditorStore, EditorProjectFile } from '@/store/editor';

interface VersionHistoryEntry {
  id: string;
  timestamp: Date;
  projectData: EditorProjectFile;
  description: string;
}

const MAX_VERSIONS = 10;
const VERSION_STORAGE_KEY = 'project-version-history';

export const useVersionHistory = () => {
  const lastStateRef = useRef<string>('');
  const { exportProjectFile } = useEditorStore();

  // 获取版本历史
  const getVersionHistory = (): VersionHistoryEntry[] => {
    try {
      const stored = localStorage.getItem(VERSION_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((entry: { id: string; timestamp: string; projectData: EditorProjectFile; description: string }) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load version history:', error);
      return [];
    }
  };

  // 保存版本
  const saveVersion = (description?: string) => {
    try {
      const projectData = exportProjectFile();
      const currentState = JSON.stringify(projectData);

      // 如果状态没有变化，不保存
      if (currentState === lastStateRef.current) {
        return null;
      }

      lastStateRef.current = currentState;

      const versions = getVersionHistory();
      const newVersion: VersionHistoryEntry = {
        id: `version-${Date.now()}`,
        timestamp: new Date(),
        projectData,
        description: description || `自动保存 - ${new Date().toLocaleString('zh-CN')}`,
      };

      // 添加新版本到开头
      versions.unshift(newVersion);

      // 保持最多 MAX_VERSIONS 个版本
      const trimmedVersions = versions.slice(0, MAX_VERSIONS);

      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(trimmedVersions));

      return newVersion;
    } catch (error) {
      console.error('Failed to save version:', error);
      return null;
    }
  };

  // 恢复到指定版本
  const restoreVersion = (versionId: string) => {
    try {
      const versions = getVersionHistory();
      const version = versions.find(v => v.id === versionId);

      if (!version) {
        throw new Error('Version not found');
      }

      // 在恢复前保存当前状态
      saveVersion('恢复前的状态');

      // 恢复版本
      useEditorStore.getState().loadProjectFile(version.projectData);

      return true;
    } catch (error) {
      console.error('Failed to restore version:', error);
      return false;
    }
  };

  // 删除指定版本
  const deleteVersion = (versionId: string) => {
    try {
      const versions = getVersionHistory();
      const filtered = versions.filter(v => v.id !== versionId);
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete version:', error);
      return false;
    }
  };

  // 清除所有版本历史
  const clearVersionHistory = () => {
    try {
      localStorage.removeItem(VERSION_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear version history:', error);
      return false;
    }
  };

  // 自动保存版本（每 5 分钟）
  useEffect(() => {
    const autoSave = () => {
      saveVersion();
    };

    const interval = setInterval(autoSave, 5 * 60 * 1000); // 5 分钟

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    getVersionHistory,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearVersionHistory,
  };
};
