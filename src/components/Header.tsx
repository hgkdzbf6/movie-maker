'use client';

import { Save, Download, Settings, User, Undo, Redo } from 'lucide-react';

interface HeaderProps {
  projectName?: string;
  sceneCount?: number;
  assetCount?: number;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName = '未命名项目',
  sceneCount = 0,
  assetCount = 0,
  onSave,
  onUndo,
  onRedo,
  onExport,
}) => {
  return (
    <header className="h-header-height bg-primary border-b border-subtle flex items-center justify-between px-6">
      {/* 左侧：Logo 和项目信息 */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">
              {projectName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge label={`${sceneCount} 场景`} variant="primary" />
              <Badge label={`${assetCount} 素材`} variant="secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* 中间：工具栏 */}
      <div className="flex items-center gap-1">
        <Tooltip content="保存 (Ctrl+S)">
          <button
            onClick={onSave}
            className="btn btn-secondary"
          >
            <Save size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="撤销 (Ctrl+Z)">
          <button
            onClick={onUndo}
            className="btn btn-secondary"
          >
            <Undo size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="重做 (Ctrl+Shift+Z)">
          <button
            onClick={onRedo}
            className="btn btn-secondary"
          >
            <Redo size={16} />
          </button>
        </Tooltip>

        <div className="w-px h-6 border-l border-subtle" />

        <Tooltip content="导出项目">
          <button
            onClick={onExport}
            className="btn btn-primary"
          >
            <Download size={16} />
            <span className="ml-2">导出</span>
          </button>
        </Tooltip>

        <div className="w-px h-6 border-l border-subtle" />
      </div>

      {/* 右侧：用户信息和设置 */}
      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        <div className="w-8 h-8 rounded-full bg-secondary border border-subtle flex items-center justify-center">
          <User size={18} className="text-muted" />
        </div>

        {/* 设置按钮 */}
        <Tooltip content="设置">
          <button className="btn btn-ghost btn-icon-only">
            <Settings size={18} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

// Badge 组件
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary' }) => {
  const variantStyles = {
    primary: 'bg-accent-primary text-white',
    secondary: 'bg-secondary text-secondary',
    success: 'bg-accent-success text-white',
    warning: 'bg-accent-warning text-white',
    error: 'bg-accent-error text-white',
  };

  return (
    <span className={`badge ${variantStyles[variant]}`}>
      {label}
    </span>
  );
};

// Tooltip 组件（简化版）
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top' }) => {
  return (
    <div className="tooltip-trigger relative inline-flex">
      {children}
      <div className="tooltip" style={{ [side]: '4px' } as React.CSSProperties}>
        {content}
      </div>
    </div>
  );
};
