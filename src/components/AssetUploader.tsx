'use client';

import { useState, useRef } from 'react';
import { Upload, FileVideo, FileImage, Music } from 'lucide-react';

export interface AssetFile {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
}

interface AssetUploaderProps {
  onUpload: (files: AssetFile[]) => void;
  accept?: string;
  maxSize?: number;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  onUpload,
  accept = 'video/*,image/*,audio/*',
  maxSize = 100 * 1024 * 1024 // 100MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const uploadedFiles: AssetFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 太大（最大 ${maxSize / 1024 / 1024}MB）`);
        continue;
      }

      // Create object URL
      const url = URL.createObjectURL(file);
      
      // Determine file type
      let type: 'video' | 'image' | 'audio' = 'image';
      if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      }

      uploadedFiles.push({
        id: Date.now().toString() + i,
        name: file.name,
        type,
        url,
        size: file.size
      });
    }

    if (uploadedFiles.length > 0) {
      onUpload(uploadedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
        isDragging
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-gray-700 hover:border-primary-500 hover:border-solid'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${
          isDragging ? 'bg-primary-500' : 'bg-gray-700'
        }`}>
          <Upload size={32} className="text-white" />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">
            {isDragging ? '释放文件以上传' : '拖拽文件到此处'}
          </p>
          <p className="text-sm text-gray-400">
            或者点击选择文件
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileVideo size={16} />
          <FileImage size={16} />
          <Music size={16} />
          <span>支持视频、图片、音频</span>
        </div>
        
        <p className="text-xs text-gray-600">
          最大文件大小：{maxSize / 1024 / 1024}MB
        </p>
      </div>
    </div>
  );
};
