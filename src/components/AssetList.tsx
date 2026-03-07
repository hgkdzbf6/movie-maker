'use client';

import { Asset } from '@/store/editor';
import { Type, Image as ImageIcon, Music, FileText, Trash2, MoreHorizontal, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface AssetListProps {
  assets: Asset[];
  filter?: 'all' | 'image' | 'video' | 'audio';
  onDelete?: (id: string) => void;
  onSelect?: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  onDragStart?: (asset: Asset, e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  draggedAsset?: Asset | null;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  filter = 'all',
  onDelete,
  onSelect,
  selectedAsset,
  onDragStart,
  onDragEnd,
  isDragging = false,
  draggedAsset = null,
}) => {
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  // 根据过滤器筛选素材
  const filteredAssets = filter === 'all'
    ? assets
    : assets.filter(asset => asset.type === filter);

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
    e.preventDefault();
    if (onDragStart) {
      onDragStart(asset, e);
    }
  };

  // 处理素材拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
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

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
          <FileText size={32} className="text-gray-600" />
        </div>
        <p className="text-sm">暂无{filter !== 'all' ? '此类' : ''}素材</p>
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
              <div className="mt-1.5">
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
