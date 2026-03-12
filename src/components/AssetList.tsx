'use client';

import { Asset } from '@/store/editor';
import { Type, Image as ImageIcon, Music, FileText, Trash2, MoreHorizontal, GripVertical, Tag, Palette, X } from 'lucide-react';
import { useState } from 'react';

interface AssetListProps {
  assets: Asset[];
  filter?: 'all' | 'image' | 'video' | 'audio';
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  onDelete?: (id: string) => void;
  onSelect?: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  onDragStart?: (asset: Asset, e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  draggedAsset?: Asset | null;
  onUpdateTags?: (assetId: string, tags: string[]) => void;
  onUpdateColor?: (assetId: string, color: string | undefined) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  filter = 'all',
  searchQuery = '',
  onDelete,
  onSelect,
  selectedAsset,
  onDragStart,
  onDragEnd,
  isDragging = false,
  draggedAsset = null,
  onUpdateTags,
  onUpdateColor,
}) => {
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [editingTagsAssetId, setEditingTagsAssetId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const PRESET_COLORS = [
    '#ef4444', // red
    '#f59e0b', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  // 根据过滤器和搜索查询筛选素材
  const filteredAssets = assets.filter(asset => {
    // 类型过滤
    if (filter !== 'all' && asset.type !== filter) return false;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = asset.name.toLowerCase().includes(query);
      const tagsMatch = asset.tags?.some(tag => tag.toLowerCase().includes(query));
      return nameMatch || tagsMatch;
    }

    return true;
  });

  // 获取素材图标
  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'video':
        return <Type size={20} className="text-gray-500" />;
      case 'image':
        return <ImageIcon size={20} className="text-gray-500" />;
      case 'audio':
        return <Music size={20} className="text-gray-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  // 获取素材时长
  const getDuration = (asset: Asset) => {
    if (asset.duration) {
      const minutes = Math.floor(asset.duration / 60);
      const seconds = Math.floor(asset.duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return null;
  };

  // 获取素材尺寸
  const getDimensions = (asset: Asset) => {
    if (asset.width && asset.height) {
      return `${asset.width}×${asset.height}`;
    }
    return null;
  };

  // 处理素材拖拽开始
  const handleDragStart = (asset: Asset, e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(asset, e);
    }
  };

  // 处理素材拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  // 处理素材点击
  const handleAssetClick = (asset: Asset) => {
    if (onSelect) {
      onSelect(asset);
    }
    setExpandedAsset(expandedAsset === asset.id ? null : asset.id);
  };

  // 处理添加标签
  const handleAddTag = (assetId: string) => {
    if (!newTag.trim() || !onUpdateTags) return;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    const tags = asset.tags || [];
    if (!tags.includes(newTag.trim())) {
      onUpdateTags(assetId, [...tags, newTag.trim()]);
    }
    setNewTag('');
  };

  // 处理删除标签
  const handleRemoveTag = (assetId: string, tag: string) => {
    if (!onUpdateTags) return;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    const tags = asset.tags || [];
    onUpdateTags(assetId, tags.filter(t => t !== tag));
  };

  // 处理颜色选择
  const handleColorSelect = (assetId: string, color: string | undefined) => {
    if (!onUpdateColor) return;
    onUpdateColor(assetId, color);
  };

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
          <FileText size={32} className="text-gray-600" />
        </div>
        <p className="text-sm">{searchQuery ? '未找到匹配的素材' : `暂无${filter !== 'all' ? '此类' : ''}素材`}</p>
        <p className="text-xs mt-2 text-gray-600">拖拽文件到此处上传</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAssets.map((asset) => (
        <div
          key={asset.id}
          draggable={true}
          onDragStart={(e) => handleDragStart(asset, e)}
          onDragEnd={handleDragEnd}
          className={`group relative overflow-hidden rounded-lg transition-all ${
            selectedAsset?.id === asset.id
              ? 'bg-gray-700 border-2 border-blue-500'
              : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
          } ${isDragging && draggedAsset?.id === asset.id ? 'opacity-50' : ''}`}
          style={{ cursor: 'grab' }}
        >
          {/* 主内容 - 可点击 */}
          <div
            className={`flex items-center gap-3 p-3 cursor-pointer ${
              selectedAsset?.id === asset.id ? '' : 'hover:bg-gray-700/50'
            }`}
            onClick={() => handleAssetClick(asset)}
          >
            {/* 颜色标记 */}
            {asset.color && (
              <div
                className="w-1 h-16 rounded-full flex-shrink-0"
                style={{ backgroundColor: asset.color }}
              />
            )}

            {/* 拖拽手柄 */}
            <div className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-400">
              <GripVertical size={14} />
            </div>

            {/* 缩略图 */}
            <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
              {asset.thumbnail ? (
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                getAssetIcon(asset.type)
              )}
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-200 truncate font-medium">
                {asset.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getDuration(asset) && (
                  <span className="mr-2">
                    {getDuration(asset)}
                  </span>
                )}
                {getDimensions(asset) && (
                  <span className="mr-2">
                    {getDimensions(asset)}
                  </span>
                )}
                {asset.createdAt && (
                  <span className="text-xs text-gray-600">
                    {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
              {/* 类型标签 */}
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  asset.type === 'video'
                    ? 'bg-blue-900/30 text-blue-400'
                    : asset.type === 'image'
                    ? 'bg-purple-900/30 text-purple-400'
                    : asset.type === 'audio'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {asset.type === 'video' && '视频'}
                  {asset.type === 'image' && '图片'}
                  {asset.type === 'audio' && '音频'}
                </span>
                {/* 显示标签 */}
                {asset.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                    {tag}
                  </span>
                ))}
                {asset.tags && asset.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{asset.tags.length - 2}</span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className={`flex items-center gap-1 transition-opacity ${
              selectedAsset?.id === asset.id || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedAsset(expandedAsset === asset.id ? null : asset.id);
                }}
                className="p-1.5 hover:bg-gray-600 rounded transition"
                title="更多选项"
              >
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除 "${asset.name}" 吗？`)) {
                      onDelete(asset.id);
                    }
                  }}
                  className="p-1.5 hover:bg-red-900/50 hover:text-red-400 rounded transition"
                  title="删除"
                >
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* 展开的详细信息 */}
          {expandedAsset === asset.id && (
            <div className="px-3 pb-3 border-t border-gray-700 bg-gray-900/50">
              <div className="pt-3 space-y-2">
                {/* 文件名 */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">文件名</div>
                  <div className="text-sm text-gray-300 font-mono break-all">
                    {asset.name}
                  </div>
                </div>

                {/* URL */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">URL</div>
                  <div className="text-xs text-gray-400 font-mono break-all truncate">
                    {asset.url}
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800 rounded p-2">
                    <div className="text-gray-500 mb-1">类型</div>
                    <div className="text-gray-300 capitalize">{asset.type}</div>
                  </div>
                  <div className="bg-gray-800 rounded p-2">
                    <div className="text-gray-500 mb-1">大小</div>
                    <div className="text-gray-300">
                      {asset.duration ? `${asset.duration.toFixed(1)}s` : '-'}
                    </div>
                  </div>
                  {asset.width && asset.height && (
                    <>
                      <div className="bg-gray-800 rounded p-2">
                        <div className="text-gray-500 mb-1">宽度</div>
                        <div className="text-gray-300">{asset.width}px</div>
                      </div>
                      <div className="bg-gray-800 rounded p-2">
                        <div className="text-gray-500 mb-1">高度</div>
                        <div className="text-gray-300">{asset.height}px</div>
                      </div>
                    </>
                  )}
                </div>

                {/* 标签管理 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <Tag size={12} />
                    <span>标签</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {tag}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(asset.id, tag);
                          }}
                          className="hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {editingTagsAssetId === asset.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag(asset.id);
                          } else if (e.key === 'Escape') {
                            setEditingTagsAssetId(null);
                            setNewTag('');
                          }
                        }}
                        placeholder="输入标签..."
                        className="flex-1 px-2 py-1 text-xs bg-gray-800 text-gray-300 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddTag(asset.id)}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        添加
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTagsAssetId(asset.id);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + 添加标签
                    </button>
                  )}
                </div>

                {/* 颜色标记 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <Palette size={12} />
                    <span>颜色标记</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorSelect(asset.id, asset.color === color ? undefined : color);
                        }}
                        className={`w-6 h-6 rounded border-2 transition ${
                          asset.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {asset.color && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorSelect(asset.id, undefined);
                        }}
                        className="text-xs text-gray-400 hover:text-gray-300"
                      >
                        清除
                      </button>
                    )}
                  </div>
                </div>

                {/* 拖拽提示 */}
                <div className="text-xs text-gray-500 text-center py-2 bg-gray-800/50 rounded">
                  💡 拖拽到时间轴以添加场景
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
