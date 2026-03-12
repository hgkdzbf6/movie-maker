'use client';

import { useShortcuts, ShortcutConfig } from '@/hooks/useShortcuts';
import { useEditorStore } from '@/store/editor';

export const useEditorShortcuts = () => {
  const {
    isPlaying,
    setIsPlaying,
    currentFrame,
    setCurrentFrame,
    fps,
    scenes,
    selectedSceneId,
    deleteScene,
    duplicateScene,
    splitScene,
    setTimelineZoom,
    timelineZoom,
  } = useEditorStore();

  // 计算总帧数
  const totalFrames = Math.max(
    180,
    ...scenes.map((scene) => scene.startFrame + scene.durationFrames)
  );

  // 播放控制快捷键
  const playbackShortcuts: ShortcutConfig[] = [
    {
      key: 'space',
      description: '播放/暂停',
      action: () => {
        setIsPlaying(!isPlaying);
      },
    },
    {
      key: 'home',
      description: '跳到开头',
      action: () => {
        setCurrentFrame(0);
      },
    },
    {
      key: 'end',
      description: '跳到结尾',
      action: () => {
        setCurrentFrame(totalFrames);
      },
    },
    {
      key: 'left',
      description: '后退一帧',
      action: () => {
        setCurrentFrame(Math.max(0, currentFrame - 1));
      },
    },
    {
      key: 'right',
      description: '前进一帧',
      action: () => {
        setCurrentFrame(Math.min(totalFrames, currentFrame + 1));
      },
    },
    {
      key: 'left',
      shift: true,
      description: '后退一秒',
      action: () => {
        setCurrentFrame(Math.max(0, currentFrame - fps));
      },
    },
    {
      key: 'right',
      shift: true,
      description: '前进一秒',
      action: () => {
        setCurrentFrame(Math.min(totalFrames, currentFrame + fps));
      },
    },
  ];

  // 编辑操作快捷键
  const editingShortcuts: ShortcutConfig[] = [
    {
      key: 'delete',
      description: '删除选中场景',
      action: () => {
        if (selectedSceneId) {
          deleteScene(selectedSceneId);
        }
      },
    },
    {
      key: 'backspace',
      description: '删除选中场景',
      action: () => {
        if (selectedSceneId) {
          deleteScene(selectedSceneId);
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: '复制场景',
      action: () => {
        if (selectedSceneId) {
          duplicateScene(selectedSceneId);
        }
      },
    },
    {
      key: 's',
      description: '分割场景',
      action: () => {
        const currentScene = scenes.find(
          (s) => currentFrame >= s.startFrame && currentFrame < s.startFrame + s.durationFrames
        );
        if (currentScene) {
          splitScene(currentScene.id, currentFrame);
        }
      },
    },
  ];

  // 时间轴导航快捷键
  const navigationShortcuts: ShortcutConfig[] = [
    {
      key: '=',
      description: '放大时间轴',
      action: () => {
        setTimelineZoom(Math.min(5, timelineZoom * 1.2));
      },
    },
    {
      key: '+',
      description: '放大时间轴',
      action: () => {
        setTimelineZoom(Math.min(5, timelineZoom * 1.2));
      },
    },
    {
      key: '-',
      description: '缩小时间轴',
      action: () => {
        setTimelineZoom(Math.max(0.1, timelineZoom / 1.2));
      },
    },
  ];

  // 合并所有快捷键
  const allShortcuts = [...playbackShortcuts, ...editingShortcuts, ...navigationShortcuts];

  // 注册快捷键
  useShortcuts(allShortcuts);

  return {
    playbackShortcuts,
    editingShortcuts,
    navigationShortcuts,
    allShortcuts,
  };
};
