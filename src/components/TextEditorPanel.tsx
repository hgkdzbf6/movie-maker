'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editor';
import { Type, X, Plus } from 'lucide-react';

const FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: '"Georgia", serif', label: 'Georgia' },
  { value: '"Verdana", sans-serif', label: 'Verdana' },
];

const ANIMATIONS = [
  { value: 'none', label: '无动画' },
  { value: 'fadeIn', label: '淡入' },
  { value: 'flyIn', label: '飞入' },
  { value: 'typewriter', label: '打字机' },
];

export const TextEditorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedSceneId, scenes, updateTextContent, addTextScene, fps } = useEditorStore();

  const selectedScene = scenes.find(s => s.id === selectedSceneId && s.type === 'text');

  const [textContent, setTextContent] = useState(selectedScene?.content?.text || '输入文本内容');
  const [fontFamily, setFontFamily] = useState(selectedScene?.content?.fontFamily || FONTS[0].value);
  const [fontSize, setFontSize] = useState(selectedScene?.content?.fontSize || 48);
  const [fontWeight, setFontWeight] = useState<'normal' | 'medium' | 'bold' | 'black'>(
    selectedScene?.content?.fontWeight || 'bold'
  );
  const [color, setColor] = useState(selectedScene?.content?.color || '#ffffff');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(
    selectedScene?.content?.textAlign || 'center'
  );
  const [strokeWidth, setStrokeWidth] = useState(selectedScene?.content?.strokeWidth || 0);
  const [strokeColor, setStrokeColor] = useState(selectedScene?.content?.strokeColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(selectedScene?.content?.backgroundColor || '');
  const [backgroundOpacity, setBackgroundOpacity] = useState(selectedScene?.content?.backgroundOpacity || 0.8);
  const [shadowBlur, setShadowBlur] = useState(selectedScene?.content?.shadowBlur || 0);
  const [shadowColor, setShadowColor] = useState(selectedScene?.content?.shadowColor || '#000000');
  const [animation, setAnimation] = useState<'fadeIn' | 'flyIn' | 'typewriter' | 'none'>(
    selectedScene?.content?.animation || 'none'
  );

  const handleAddText = () => {
    addTextScene({
      name: '文本',
      type: 'text',
      startFrame: 0,
      durationFrames: fps * 5, // 默认 5 秒
      content: {
        text: textContent,
        fontFamily,
        fontSize,
        fontWeight,
        color,
        textAlign,
        strokeWidth,
        strokeColor,
        backgroundColor: backgroundColor || undefined,
        backgroundOpacity,
        shadowBlur,
        shadowColor: shadowBlur > 0 ? shadowColor : undefined,
        animation,
        x: 50,
        y: 50,
      },
    });
  };

  const handleUpdateText = () => {
    if (!selectedSceneId) return;

    updateTextContent(selectedSceneId, {
      text: textContent,
      fontFamily,
      fontSize,
      fontWeight,
      color,
      textAlign,
      strokeWidth,
      strokeColor,
      backgroundColor: backgroundColor || undefined,
      backgroundOpacity,
      shadowBlur,
      shadowColor: shadowBlur > 0 ? shadowColor : undefined,
      animation,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-36 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-all z-50"
        title="打开文本编辑器"
      >
        <Type size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-36 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[600px] overflow-y-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center gap-2">
          <Type size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-200">文本编辑器</h3>
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
        {/* 文本输入 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">文本内容</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm focus:outline-none focus:border-indigo-500 resize-none"
            rows={3}
            placeholder="输入文本内容"
          />
        </div>

        {/* 字体选择 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">字体</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm focus:outline-none focus:border-indigo-500"
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* 字号和粗细 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              字号: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">粗细</label>
            <select
              value={fontWeight}
              onChange={(e) => setFontWeight(e.target.value as 'normal' | 'medium' | 'bold' | 'black')}
              className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="normal">正常</option>
              <option value="medium">中等</option>
              <option value="bold">粗体</option>
              <option value="black">特粗</option>
            </select>
          </div>
        </div>

        {/* 颜色和对齐 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">颜色</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">对齐</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align)}
                  className={`flex-1 px-2 py-2 text-xs rounded transition ${
                    textAlign === align
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 描边 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            描边宽度: {strokeWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full mb-2"
          />
          {strokeWidth > 0 && (
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
            />
          )}
        </div>

        {/* 背景色 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">背景色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor || '#000000'}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
            />
            <button
              onClick={() => setBackgroundColor('')}
              className="px-3 py-2 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 transition"
            >
              清除
            </button>
          </div>
          {backgroundColor && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                不透明度: {Math.round(backgroundOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* 阴影 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            阴影模糊: {shadowBlur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={shadowBlur}
            onChange={(e) => setShadowBlur(Number(e.target.value))}
            className="w-full mb-2"
          />
          {shadowBlur > 0 && (
            <input
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
            />
          )}
        </div>

        {/* 动画 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">动画效果</label>
          <select
            value={animation}
            onChange={(e) => setAnimation(e.target.value as 'fadeIn' | 'flyIn' | 'typewriter' | 'none')}
            className="w-full px-3 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded text-sm focus:outline-none focus:border-indigo-500"
          >
            {ANIMATIONS.map((anim) => (
              <option key={anim.value} value={anim.value}>
                {anim.label}
              </option>
            ))}
          </select>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          {selectedScene ? (
            <button
              onClick={handleUpdateText}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition"
            >
              更新文本
            </button>
          ) : (
            <button
              onClick={handleAddText}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              添加文本
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
