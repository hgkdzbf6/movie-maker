/**
 * 快捷键管理系统
 * 提供快捷键注册、事件监听、冲突检测、上下文感知等功能
 */

import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutConfig[];
}

// 检查是否在输入元素中
const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.getAttribute('contenteditable') === 'true'
  );
};

// 检查快捷键是否匹配
const matchesShortcut = (event: KeyboardEvent, config: ShortcutConfig): boolean => {
  const key = event.key.toLowerCase();
  const configKey = config.key.toLowerCase();

  // 特殊键映射
  const keyMap: Record<string, string> = {
    ' ': 'space',
    'arrowleft': 'left',
    'arrowright': 'right',
    'arrowup': 'up',
    'arrowdown': 'down',
  };

  const normalizedKey = keyMap[key] || key;
  const normalizedConfigKey = keyMap[configKey] || configKey;

  if (normalizedKey !== normalizedConfigKey) return false;

  // 检查修饰键
  const ctrlMatch = config.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
  const shiftMatch = config.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = config.alt ? event.altKey : !event.altKey;

  return ctrlMatch && shiftMatch && altMatch;
};

// 格式化快捷键显示
export const formatShortcut = (config: ShortcutConfig): string => {
  const parts: string[] = [];

  // 检测操作系统
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (config.ctrl || config.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (config.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (config.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // 格式化按键名称
  const keyName = config.key.charAt(0).toUpperCase() + config.key.slice(1);
  const keyMap: Record<string, string> = {
    'Space': '␣',
    'Left': '←',
    'Right': '→',
    'Up': '↑',
    'Down': '↓',
    'Home': 'Home',
    'End': 'End',
    'Delete': 'Del',
  };

  parts.push(keyMap[keyName] || keyName);

  return parts.join(isMac ? '' : '+');
};

// 快捷键 Hook
export const useShortcuts = (shortcuts: ShortcutConfig[], enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // 如果在输入元素中，不触发快捷键
      if (isInputElement(event.target as Element)) {
        return;
      }

      // 查找匹配的快捷键
      for (const config of shortcuts) {
        if (matchesShortcut(event, config)) {
          if (config.preventDefault !== false) {
            event.preventDefault();
          }
          config.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

// 预定义的快捷键类别
export const SHORTCUT_CATEGORIES = {
  PLAYBACK: 'playback',
  EDITING: 'editing',
  NAVIGATION: 'navigation',
  VIEW: 'view',
} as const;
