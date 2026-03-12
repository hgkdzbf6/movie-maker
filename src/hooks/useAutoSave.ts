import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editor';

interface AutoSaveOptions {
  interval?: number; // 自动保存间隔（毫秒），默认 30 秒
  enabled?: boolean; // 是否启用自动保存
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const { interval = 30000, enabled = true } = options;
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<string>('');

  const { exportProjectFile } = useEditorStore();

  useEffect(() => {
    if (!enabled) return;

    const saveProject = async () => {
      try {
        setIsSaving(true);
        const projectData = exportProjectFile();
        const currentState = JSON.stringify(projectData);

        // 只有状态变化时才保存
        if (currentState !== lastStateRef.current) {
          // 保存到 localStorage
          localStorage.setItem('autosave-project', currentState);
          localStorage.setItem('autosave-timestamp', new Date().toISOString());

          lastStateRef.current = currentState;
          setLastSaveTime(new Date());
        }
      } catch (error) {
        console.error('自动保存失败:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // 立即保存一次
    saveProject();

    // 设置定时保存
    saveTimeoutRef.current = setInterval(saveProject, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [enabled, interval, exportProjectFile]);

  // 手动保存
  const manualSave = async () => {
    try {
      setIsSaving(true);
      const projectData = exportProjectFile();
      const currentState = JSON.stringify(projectData);

      localStorage.setItem('autosave-project', currentState);
      localStorage.setItem('autosave-timestamp', new Date().toISOString());

      lastStateRef.current = currentState;
      setLastSaveTime(new Date());

      return true;
    } catch (error) {
      console.error('手动保存失败:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 加载自动保存的项目
  const loadAutoSave = () => {
    try {
      const savedProject = localStorage.getItem('autosave-project');
      const savedTimestamp = localStorage.getItem('autosave-timestamp');

      if (savedProject && savedTimestamp) {
        return {
          project: JSON.parse(savedProject),
          timestamp: new Date(savedTimestamp),
        };
      }
      return null;
    } catch (error) {
      console.error('加载自动保存失败:', error);
      return null;
    }
  };

  // 清除自动保存
  const clearAutoSave = () => {
    localStorage.removeItem('autosave-project');
    localStorage.removeItem('autosave-timestamp');
    setLastSaveTime(null);
  };

  return {
    lastSaveTime,
    isSaving,
    manualSave,
    loadAutoSave,
    clearAutoSave,
  };
};
