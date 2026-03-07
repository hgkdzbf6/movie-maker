# Remotion 视频编辑器 - 完整任务文档

**项目名称**: Remotion Video Editor (专业版）  
**创建日期**: 2026-03-07  
**最后更新**: 2026-03-07  
**状态**: 进行中

---

## 📋 目录

1. [项目概述](#项目概述)
2. [整体布局结构](#整体布局结构)
3. [各区域详细设计](#各区域详细设计)
4. [交互与状态设计](#交互与状态设计)
5. [任务分解](#任务分解)
6. [优先级安排](#优先级安排)
7. [技术栈](#技术栈)
8. [开发计划](#开发计划)

---

## 项目概述

### 目标

打造一个专业的视频编辑器，基于 Remotion 4.0 + Next.js 14，支持：
- 专业三栏 + 底部时间轴布局
- 素材管理、项目编辑、属性调整
- 实时预览、关键帧编辑
- 导出功能（多种格式）

### 参考

- **Adobe Premiere Pro** - 专业的三栏布局
- **DaVinci Resolve** - 强大的时间轴编辑
- **Final Cut Pro** - 流畅的操作体验

---

## 整体布局结构

### 布局方案

采用经典视频编辑器布局：**三栏 + 底部时间轴**

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部导航栏 (56px)                                 │
├─────────────┬───────────────┬───────────────┬─────────────┤
│             │               │               │             │
│ 左侧边栏     │  中央预览区     │  右侧属性面板   │
│ (280px)    │  (Flex-1, ~60%) │  (320px)       │
│             │               │               │             │
│             │               │               │             │
│             │               │               │             │
├─────────────┴───────────────┴───────────────┴─────────────┤
│  底部时间轴 (160px)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 响应式设计

- **桌面端优先** (最小宽度 1280px)
- **左侧边栏** (固定宽度 280px)
- **右侧面板** (固定宽度 320px)
- **中央预览区** (flex-1，自适应)
- **底部时间轴** (固定高度 160px)

---

## 各区域详细设计

### 1. 顶部导航栏 (全局)

**固定高度**: 56px

#### 左侧：项目信息 + 保存/撤销/重做

```tsx
<div className="flex items-center gap-4">
  {/* Logo */}
  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">R</span>
  </div>
  
  {/* 项目信息 */}
  <div>
    <h1 className="text-lg font-bold text-white">Remotion Editor</h1>
    <div className="flex items-center gap-2 mt-0.5">
      {/* 自动保存状态 */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="已自动保存" />
        <span>未命名项目</span>
      </div>
    </div>
  </div>
</div>
```

#### 中间：预览分辨率 + 帧率显示

```tsx
<div className="flex items-center gap-4">
  {/* 分辨率切换 */}
  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
    <select className="bg-transparent text-gray-300 outline-none">
      <option>1920×1080</option>
      <option>1080×1920</option>
      <option>1280×720</option>
      <option>720×1280</option>
    </select>
    <span className="text-gray-600">|</span>
    <select className="bg-transparent text-gray-300 outline-none">
      <option>30fps</option>
      <option>60fps</option>
      <option>24fps</option>
    </select>
  </div>
</div>
```

#### 右侧：导出按钮 + 设置 + 用户/队列信息

```tsx
<div className="flex items-center gap-2">
  {/* 导出按钮 */}
  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-white font-medium">
    <Download size={16} />
    <span>导出</span>
  </button>
  
  {/* 全屏按钮 */}
  <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all">
    <Maximize2 size={18} />
  </button>
  
  {/* 设置按钮 */}
  <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all">
    <Settings size={18} />
  </button>
  
  {/* 用户头像 */}
  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
    <span className="text-sm font-medium text-gray-400">Z</span>
  </div>
</div>
```

---

### 2. 左侧边栏 (素材与项目)

**固定宽度**: 280px

#### 面板切换标签

```tsx
<div className="flex border-b border-gray-800">
  <button className="flex-1 px-4 py-3 text-sm font-medium">
    素材库
  </button>
  <button className="flex-1 px-4 py-3 text-sm font-medium">
    项目
  </button>
  <button className="flex-1 px-4 py-3 text-sm font-medium">
    导出
  </button>
</div>
```

#### 2.1 素材库

分为三个可折叠面板：

##### 2.1.1 上传区

```tsx
<div className="p-4 border-b border-gray-800">
  {/* 拖拽上传区 */}
  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition">
    <Upload size={32} className="mx-auto mb-4 text-gray-500" />
    <p className="text-sm text-gray-400 mb-2">
      拖拽文件到此处或点击上传
    </p>
    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
      选择文件
    </button>
    <p className="text-xs text-gray-500 mt-2">
      支持视频、图片、音频，最大 100MB
    </p>
  </div>
</div>
```

##### 2.1.2 分类标签

```tsx
<div className="flex gap-1 p-2 border-b border-gray-800 overflow-x-auto">
  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded whitespace-nowrap">
    全部
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 whitespace-nowrap">
    视频
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 whitespace-nowrap">
    图片
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 whitespace-nowrap">
    音频
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 whitespace-nowrap">
    字体
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 whitespace-nowrap">
    自定义组件
  </button>
</div>
```

##### 2.1.3 素材列表

```tsx
<div className="flex-1 overflow-y-auto">
  {assets.map(asset => (
    <div key={asset.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer transition-all mb-1">
      {/* 缩略图 */}
      <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
        {asset.type === 'video' && <Type size={20} className="text-gray-500" />}
        {asset.type === 'image' && <Image size={20} className="text-gray-500" />}
        {asset.type === 'audio' && <Music size={20} className="text-gray-500" />}
        {asset.type === 'text' && <FileText size={20} className="text-gray-500" />}
      </div>
      
      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-200 truncate">
          {asset.name}
        </div>
        <div className="text-xs text-gray-500">
          {asset.duration ? `${asset.duration}s` : ''}
          {asset.width && asset.height && `${asset.width}×${asset.height}`}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <button className="p-1 hover:bg-gray-700 rounded">
        <Plus size={14} className="text-gray-400" />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded">
        <Trash2 size={14} className="text-gray-400" />
      </button>
    </div>
  ))}
</div>
```

#### 2.2 项目结构

##### 2.2.1 场景列表

```tsx
<div className="p-2">
  <div className="text-xs text-gray-500 font-medium mb-2 px-2">
    {scenes.length} 个场景
  </div>
  {scenes.map((scene, index) => (
    <div
      key={scene.id}
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer transition-all mb-1"
    >
      {/* 图标 */}
      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
        <Layers size={14} className="text-gray-400" />
      </div>
      
      {/* 场景信息 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-200 truncate">
          {scene.name}
        </div>
        <div className="text-xs text-gray-500">
          {Math.floor(scene.durationFrames / fps)}s
        </div>
      </div>
      
      {/* 操作按钮 */}
      <button className="p-1 hover:bg-gray-700 rounded">
        <Copy size={14} className="text-gray-400" />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded">
        <Trash2 size={14} className="text-gray-400" />
      </button>
    </div>
  ))}
</div>
```

##### 2.2.2 合成列表

```tsx
<div className="p-2 border-t border-gray-800">
  <div className="text-xs text-gray-500 font-medium mb-2 px-2">
    合成
  </div>
  {compositions.map(comp => (
    <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer transition-all mb-1">
      <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
        <Layout size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-200 truncate">
          {comp.name}
        </div>
        <div className="text-xs text-gray-500">
          {comp.duration}s
        </div>
      </div>
    </div>
  ))}
</div>
```

#### 2.3 导出设置

##### 2.3.1 格式选择

```tsx
<div className="mb-4">
  <div className="text-xs text-gray-500 font-medium mb-2">
    格式
  </div>
  <div className="grid grid-cols-2 gap-2">
    <button className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
      MP4
    </button>
    <button className="px-3 py-2 bg-gray-800 text-gray-400 text-sm font-medium rounded hover:bg-gray-700 transition">
      GIF
    </button>
    <button className="px-3 py-2 bg-gray-800 text-gray-400 text-sm font-medium rounded hover:bg-gray-700 transition">
      WebM
    </button>
    <button className="px-3 py-2 bg-gray-800 text-gray-400 text-sm font-medium rounded hover:bg-gray-700 transition">
      PNG 序列
    </button>
  </div>
</div>
```

##### 2.3.2 质量与码率

```tsx
<div className="mb-4">
  <div className="text-xs text-gray-500 font-medium mb-2">
    质量
  </div>
  <div className="flex gap-2">
    <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
      低
    </button>
    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition">
      中
    </button>
    <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
      高
    </button>
  </div>
</div>
```

##### 2.3.3 输出路径与文件名

```tsx
<div>
  <div className="text-xs text-gray-500 font-medium mb-2">
    导出
  </div>
  <div className="space-y-2">
    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded">
      <span className="text-sm text-gray-300">文件名</span>
      <span className="text-sm text-gray-500">remotion-video.mp4</span>
    </div>
    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded">
      <span className="text-sm text-gray-300">位置</span>
      <span className="text-sm text-gray-500">~/Downloads</span>
    </div>
  </div>
</div>
```

---

### 3. 中央预览区

#### 3.1 预览画布

```tsx
<div className="flex-1 flex items-center justify-center bg-black p-6">
  <div className="w-full h-full max-w-7xl max-h-[60vh]">
    <Player
      component={VideoComposition}
      style={{ width: '100%', height: '100%' }}
      compositionWidth={1920}
      compositionHeight={1080}
      durationInFrames={totalFrames || 180}
      fps={fps}
      inFrame={currentFrame}
      controls={false} // 使用自定义控制
      acknowledgeRemotionLicense={true}
    />
  </div>
</div>
```

##### 3.2 缩放控制

```tsx
<div className="flex items-center gap-2 mb-2">
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
    50%
  </button>
  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition">
    100%
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
    200%
  </button>
</div>
```

##### 3.3 辅助线

```tsx
{/* 安全框 */}
<div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-yellow-500/50 pointer-events-none" />

{/* 网格 */}
<div className="absolute inset-0" style={{
  backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px'
}} />
```

#### 3.4 操作控件

##### 3.4.1 播放控制

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
  <div className="flex items-center gap-4">
    {/* 播放/暂停按钮 */}
    <button
      onClick={togglePlayback}
      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all"
    >
      {isPlaying ? <Pause size={22} /> : <Play size={22} />}
    </button>
    
    {/* 逐帧前进/后退 */}
    <button className="p-2 hover:bg-gray-800 rounded">
      <ChevronRight size={18} />
    </button>
    <button className="p-2 hover:bg-gray-800 rounded">
      <ChevronRight size={18} className="rotate-180" />
    </button>
  </div>

  {/* 时间显示 */}
  <div className="flex items-center gap-4">
    <div className="text-lg font-mono text-white">
      {Math.floor(currentFrame / fps)}s
    </div>
    <div className="text-sm text-gray-400">
      / {Math.floor(totalFrames / fps)}s
    </div>
  </div>

  {/* 分辨率 */}
  <div className="flex items-center gap-2">
    <button className="p-2 hover:bg-gray-800 rounded">
      <Monitor size={18} className="text-gray-400" />
    </button>
  </div>
</div>
```

##### 3.4.2 场景切换按钮

```tsx
<div className="flex items-center gap-2">
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
    上一场景
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition">
    下一场景
  </button>
</div>
```

##### 3.4.3 右键菜单

```tsx
{/* 右键菜单 - 添加元素 */}
<Menu>
  <MenuItem icon={<Type size={14} />}>添加文本</MenuItem>
  <MenuItem icon={<div className="w-4 h-4 bg-gray-600 rounded" />}>添加矩形</MenuItem>
  <MenuItem icon={<div className="w-4 h-4 bg-gray-600 rounded-full" />}>添加圆形</MenuItem>
  <MenuSeparator />
  <MenuItem icon={<Layers size={14} />}>添加图层</MenuItem>
</Menu>

{/* 右键菜单 - 图层操作 */}
<Menu>
  <MenuItem icon={<Lock size={14} />}>锁定</MenuItem>
  <MenuItem icon={<Eye size={14} />}>隐藏</MenuItem>
  <MenuItem icon={<Copy size={14} />}>复制样式</MenuItem>
  <MenuSeparator />
  <MenuItem icon={<Trash2 size={14} />} danger>删除</MenuItem>
</Menu>
```

---

### 4. 右侧属性面板

**固定宽度**: 320px

#### 根据选中对象动态切换内容

##### 4.1 无选中

```tsx
<div className="p-4">
  <h3 className="text-sm font-semibold text-gray-300 mb-4">项目设置</h3>
  
  <div className="space-y-4">
    {/* 背景色 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">背景色</label>
      <input type="color" value="#000000" className="w-full h-8 rounded" />
    </div>
    
    {/* 默认帧率 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">默认帧率</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>24fps</option>
        <option>30fps</option>
        <option>60fps</option>
      </select>
    </div>
    
    {/* 分辨率 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">分辨率</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>1920×1080</option>
        <option>1080×1920</option>
        <option>1280×720</option>
        <option>720×1280</option>
      </select>
    </div>
  </div>
</div>
```

##### 4.2 选中视频/图片

```tsx
<div className="p-4">
  <h3 className="text-sm font-semibold text-gray-300 mb-4">变换</h3>
  
  <div className="space-y-4">
    {/* 位置 */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-500 mb-2">X</label>
        <input type="number" value={scene.x} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-2">Y</label>
        <input type="number" value={scene.y} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
    </div>
    
    {/* 尺寸 */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-500 mb-2">宽度</label>
        <input type="number" value={scene.width} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-2">高度</label>
        <input type="number" value={scene.height} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
    </div>
    
    {/* 旋转 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">旋转</label>
      <input type="range" min={0} max={360} value={scene.rotation} className="w-full" />
    </div>
    
    {/* 缩放 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">缩放</label>
      <input type="number" value={scene.scale} step={0.1} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
  </div>

  <h3 className="text-sm font-semibold text-gray-300 mb-4 mt-6">样式</h3>
  
  <div className="space-y-4">
    {/* 不透明度 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">不透明度</label>
      <input type="range" min={0} max={1} step={0.01} value={scene.opacity} className="w-full" />
    </div>
    
    {/* 混合模式 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">混合模式</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>正常</option>
        <option>正片叠底</option>
        <option>滤色</option>
        <option>变暗</option>
        <option>变亮</option>
      </select>
    </div>
    
    {/* 边框 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">边框</label>
      <input type="number" value={scene.borderWidth} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
    
    {/* 阴影 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">阴影</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>无</option>
        <option>小</option>
        <option>中</option>
        <option>大</option>
      </select>
    </div>
  </div>
</div>
```

##### 4.3 选中文本

```tsx
<div className="p-4">
  <h3 className="text-sm font-semibold text-gray-300 mb-4">文本</h3>
  
  <div className="space-y-4">
    {/* 字体 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">字体</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>Inter</option>
        <option>Roboto</option>
        <option>Helvetica</option>
        <option>Arial</option>
      </select>
    </div>
    
    {/* 字号 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">字号</label>
      <input type="number" value={text.fontSize} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
    
    {/* 字重 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">字重</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>细体</option>
        <option>常规</option>
        <option>粗体</option>
      </select>
    </div>
    
    {/* 颜色 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">颜色</label>
      <input type="color" value={text.color} className="w-full h-8 rounded" />
    </div>
    
    {/* 行高 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">行高</label>
      <input type="number" value={text.lineHeight} step={0.1} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
    
    {/* 字间距 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">字间距</label>
      <input type="number" value={text.letterSpacing} step={0.1} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
    
    {/* 对齐方式 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">对齐</label>
      <div className="flex gap-2">
        <button className="p-2 bg-gray-800 rounded"><Type.AlignLeft size={14} /></button>
        <button className="p-2 bg-gray-800 rounded"><Type.AlignCenter size={14} /></button>
        <button className="p-2 bg-gray-800 rounded"><Type.AlignRight size={14} /></button>
      </div>
    </div>
  </div>

  <h3 className="text-sm font-semibold text-gray-300 mb-4 mt-6">描边</h3>
  
  <div className="space-y-4">
    {/* 阴影 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">阴影</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>无</option>
        <option>小</option>
        <option>中</option>
        <option>大</option>
      </select>
    </div>
    
    {/* 背景色 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">背景色</label>
      <input type="color" value={text.backgroundColor} className="w-full h-8 rounded" />
    </div>
  </div>
</div>
```

##### 4.4 选中音频

```tsx
<div className="p-4">
  <h3 className="text-sm font-semibold text-gray-300 mb-4">音频</h3>
  
  <div className="space-y-4">
    {/* 音量 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">音量</label>
      <input type="range" min={0} max={1} step={0.01} value={audio.volume} className="w-full" />
    </div>
    
    {/* 淡入淡出 */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-500 mb-2">淡入 (s)</label>
        <input type="number" value={audio.fadeIn} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-2">淡出 (s)</label>
        <input type="number" value={audio.fadeOut} className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300" />
      </div>
    </div>
    
    {/* 播放速率 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">播放速率</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>0.5x</option>
        <option>1.0x</option>
        <option>1.5x</option>
        <option>2.0x</option>
      </select>
    </div>
    
    {/* 循环 */}
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={audio.loop} />
      <label className="text-sm text-gray-300">循环</label>
    </div>
  </div>
</div>
```

##### 4.5 选中动画/关键帧

```tsx
<div className="p-4">
  <h3 className="text-sm font-semibold text-gray-300 mb-4">动画</h3>
  
  <div className="space-y-4">
    {/* 缓动函数 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">缓动函数</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>无</option>
        <option>linear</option>
        <option>ease-in</option>
        <option>ease-out</option>
        <option>ease-in-out</option>
        <option>cubic-bezier</option>
        <option>spring</option>
      </select>
    </div>
    
    {/* 关键帧 */}
    <div>
      <div className="text-xs text-gray-500 font-medium mb-2">关键帧</div>
      <KeyframesTimeline />
    </div>
    
    {/* 插值方式 */}
    <div>
      <label className="block text-xs text-gray-500 mb-2">插值方式</label>
      <select className="w-full px-3 py-2 bg-gray-800 rounded text-sm text-gray-300">
        <option>线性</option>
        <option>贝塞尔</option>
        <option>步进</option>
      </select>
    </div>
  </div>
</div>
```

---

### 5. 底部时间轴

**固定高度**: 160px

#### 5.1 轨道区

##### 5.1.1 视频轨道

```tsx
<div className="flex-1 overflow-y-auto">
  {videoTracks.map((track, index) => (
    <div key={track.id} className="mb-2">
      {/* 轨道头 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800">
        <Layers size={14} className="text-gray-400" />
        <span className="text-xs text-gray-300">{track.name}</span>
        <div className="flex-1" />
        <button className="p-1 hover:bg-gray-700 rounded">
          <Eye size={14} className="text-gray-400" />
        </button>
        <button className="p-1 hover:bg-gray-700 rounded">
          <Volume2 size={14} className="text-gray-400" />
        </button>
      </div>
      
      {/* 轨道内容 */}
      <div className="h-12 relative bg-gray-900 flex items-center">
        {track.clips.map(clip => (
          <div
            key={clip.id}
            className="absolute h-10 bg-blue-900/30 border border-blue-500 rounded"
            style={{
              left: `${(clip.startFrame / totalFrames) * 100}%`,
              width: `${(clip.durationFrames / totalFrames) * 100}%`,
            }}
          >
            {/* 缩略图 */}
            <img src={clip.thumbnail} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

##### 5.1.2 音频轨道

```tsx
<div className="mb-2">
  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800">
    <Music size={14} className="text-gray-400" />
    <span className="text-xs text-gray-300">Audio Track</span>
    <div className="flex-1" />
    <button className="p-1 hover:bg-gray-700 rounded">
      <Eye size={14} className="text-gray-400" />
    </button>
    <button className="p-1 hover:bg-gray-700 rounded">
      <Volume2 size={14} className="text-gray-400" />
    </button>
  </div>
  
  <div className="h-12 relative bg-gray-900 flex items-center">
    {/* 波形预览 */}
    <div className="w-full h-full flex items-center">
      {audio.waveform.map((value, index) => (
        <div
          key={index}
          className="flex-1 bg-green-500/20"
          style={{ height: `${Math.abs(value) * 100}%` }}
        />
      ))}
    </div>
  </div>
</div>
```

##### 5.1.3 文本/形状轨道

```tsx
<div className="mb-2">
  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800">
    <Type size={14} className="text-gray-400" />
    <span className="text-xs text-gray-300">Text Layer</span>
    <div className="flex-1" />
    <button className="p-1 hover:bg-gray-700 rounded">
      <Eye size={14} className="text-gray-400" />
    </button>
  </div>
  
  <div className="h-12 relative bg-gray-900 flex items-center">
    {textLayer.clips.map(clip => (
      <div
        key={clip.id}
        className="absolute h-10 bg-purple-900/30 border border-purple-500 rounded"
        style={{
          left: `${(clip.startFrame / totalFrames) * 100}%`,
          width: `${(clip.durationFrames / totalFrames) * 100}%`,
        }}
      >
        <span className="text-xs text-gray-300 px-2">{clip.text}</span>
      </div>
    ))}
  </div>
</div>
```

#### 5.2 时间标尺

```tsx
<div className="h-6 bg-gray-800 relative">
  {/* 刻度 */}
  {Array.from({ length: 10 }).map((_, i) => {
    const frame = Math.round((totalFrames / 10) * i);
    return (
      <div key={i} className="absolute text-xs text-gray-500 font-mono" style={{ left: `${(i / 10) * 100}%` }}>
        {frameToTime(frame)}
      </div>
    );
  })}
  
  {/* 播放头 */}
  <div
    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
    style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
  >
    <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-t" />
  </div>
</div>
```

#### 5.3 控制区

##### 5.3.1 播放模式

```tsx
<div className="flex items-center gap-4">
  <button className={`px-3 py-1.5 text-xs font-medium rounded ${playbackMode === 'loop' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
    循环
  </button>
  <button className={`px-3 py-1.5 text-xs font-medium rounded ${playbackMode === 'once' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
    单次
  </button>
</div>
```

##### 5.3.2 标记点

```tsx
<div className="flex items-center gap-2">
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700">
    + 章节
  </button>
  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700">
    导出范围
  </button>
</div>
```

##### 5.3.3 吸附开关

```tsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    <input type="checkbox" checked={snapEnabled} />
    <label className="text-sm text-gray-300">吸附</label>
  </div>
  <select className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded">
    <option>无</option>
    <option>关键帧</option>
    <option>轨道边界</option>
    <option>帧</option>
    <option>秒</option>
  </select>
</div>
```

---

## 交互与状态设计

### 1. 拖拽流

#### 1.1 素材库 → 时间轴

```tsx
<AssetItem
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('asset', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  }}
/>

<TimelineTrack onDrop={(e) => {
  const asset = JSON.parse(e.dataTransfer.getData('asset'));
  handleAddAssetToTimeline(asset);
}} />
```

#### 1.2 素材库 → 预览区

```tsx
<AssetItem
  onDoubleClick={() => {
    handleAddToCurrentScene(asset);
  }}
/>
```

#### 1.3 时间轴内片段拖拽

```tsx
<SceneClip
  draggable
  onDragStart={(e) => {
    setDraggingScene(clip.id);
    setDragStartFrame(clip.startFrame);
    e.dataTransfer.setData('clip', clip.id);
  }}
  onDrag={(e) => {
    if (draggingScene) {
      const deltaX = e.clientX - dragStartX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);
      const newStartFrame = clip.startFrame + deltaFrames;
      updateScenePosition(clip.id, newStartFrame);
    }
  }}
  onDragEnd={() => {
    // 自动对齐到最近的刻度
    snapScene(clip.id);
    setDraggingScene(null);
  }}
/>
```

### 2. 快捷键

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'k':
          e.preventDefault();
          handleSplitClip();
          break;
      }
    } else {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipFrame(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipFrame(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          previousScene();
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextScene();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelected();
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleSave, handleUndo, handleRedo, togglePlayback, ...]);
```

### 3. 状态反馈

#### 3.1 加载中

```tsx
{isLoading && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-gray-600 rounded-full animate-spin" />
      <span className="text-gray-300">加载中...</span>
    </div>
  </div>
)}
```

#### 3.2 导出中

```tsx
{isExporting && (
  <>
    <div className="h-2 bg-blue-600 transition-all" style={{ width: `${exportProgress}%` }} />
    <div className="px-4 py-2 bg-gray-900 text-xs text-gray-400">
      导出中... 剩余时间: {remainingTime}
    </div>
  </>
)}
```

#### 3.3 错误提示

```tsx
{error && (
  <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
    <div className="flex items-center gap-2">
      <AlertCircle size={16} />
      <span>{error.message}</span>
    </div>
    <div className="flex items-center gap-2 mt-2">
      <button onClick={handleRetry} className="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium">
        重试
      </button>
      <button onClick={handleDismiss} className="px-3 py-1.5 bg-transparent border border-white text-white rounded text-sm">
        关闭
      </button>
    </div>
  </div>
)}
```

---

## 任务分解

### Phase 1: 基础布局 (当前完成)

#### ✅ 1.1 顶部导航栏
- [x] Logo 和项目信息
- [x] 保存/撤销/重做按钮
- [x] 分辨率和帧率显示
- [x] 导出和设置按钮
- [x] 用户头像

#### ✅ 1.2 中央预览区
- [x] 视频预览播放器
- [x] 播放控制（播放/暂停、逐帧）
- [x] 时间显示
- [x] 场景切换按钮
- [x] 当前场景信息显示

#### ✅ 1.3 右侧属性面板
- [x] 属性面板标签
- [x] 基础属性编辑

#### ✅ 1.4 底部时间轴
- [x] 时间轴轨道
- [x] 时间刻度显示
- [x] 播放头
- [x] 播放控制按钮

**状态**: ✅ 已完成

---

### Phase 2: 左侧边栏功能

#### 2.1 素材库
- [ ] 素材上传组件
- [ ] 素材分类功能
- [ ] 素材列表显示
- [ ] 素材缩略图生成
- [ ] 素材时长检测
- [ ] 素材预览
- [ ] 素材删除
- [ ] 素材重命名
- [ ] 素材右键菜单

#### 2.2 项目结构
- [ ] 场景列表显示
- [ ] 场景拖拽排序
- [ ] 场景复制/删除
- [ ] 合成列表
- [ ] 合成创建/删除

#### 2.3 导出设置
- [ ] 格式选择（MP4/GIF/WebM）
- [ ] 质量预设
- [ ] 自定义码率
- [ ] 输出路径选择
- [ ] 文件名编辑

**状态**: 🚧 进行中

---

### Phase 3: 属性面板功能

#### 3.1 动态属性切换
- [ ] 无选中：项目设置
- [ ] 选中视频/图片：变换、样式
- [ ] 选中文本：字体、颜色、对齐
- [ ] 选中音频：音量、淡入淡出
- [ ] 选中动画：关键帧编辑

#### 3.2 属性编辑器
- [ ] 数字输入框（位置、尺寸、旋转）
- [ ] 滑块（缩放、不透明度）
- [ ] 颜色选择器
- [ ] 字体选择器
- [ ] 缓动函数选择器

**状态**: ⏳ 待开始

---

### Phase 4: 高级时间轴功能

#### 4.1 多轨道支持
- [ ] 轨道显示/隐藏
- [ ] 轨道锁定/静音
- [ ] 轨道顺序调整
- [ ] 视频轨道（多层叠加）
- [ ] 音频轨道（波形预览）
- [ ] 文本/形状轨道（顶层）

#### 4.2 关键帧编辑
- [ ] 关键帧时间轴显示
- [ ] 关键帧添加/删除
- [ ] 关键帧值编辑
- [ ] 插值方式选择
- [ ] 关键帧贝塞尔曲线

#### 4.3 时间轴缩放
- [ ] 时间轴缩放（滚轮）
- [ ] 时间粒度切换（帧/秒）
- [ ] 缩放比例显示
- [ ] 缩放重置

#### 4.4 吸附功能
- [ ] 吸附开关
- [ ] 吸附类型（关键帧、轨道边界、帧、秒）
- [ ] 吸附灵敏度设置
- [ ] 视觉吸附指示

**状态**: ⏳ 待开始

---

### Phase 5: 拖拽功能

#### 5.1 素材拖放到时间轴
- [ ] 素材可拖拽
- [ ] 拖放到时间轴时创建新场景
- [ ] 自动检测素材类型
- [ ] 自动计算场景时长
- [ ] 拖拽预览（显示在播放头位置）

#### 5.2 场景拖拽调整位置
- [x] 场景拖拽实现
- [x] 边界检查
- [x] 自动对齐到刻度
- [ ] 拖拽视觉反馈
- [ ] 多选场景拖拽（可选）

#### 5.3 场景延伸手柄
- [ ] 左侧手柄（调整起始帧）
- [ ] 右侧手柄（调整结束帧）
- [ ] 边界检查
- [ ] 吸附到关键帧
- [ ] 视觉手柄样式

**状态**: ✅ 场景拖拽已完成，延伸手柄待实现

---

### Phase 6: 视频导出

#### 6.1 导出功能
- [ ] MP4 导出（H.264 编码）
- [ ] GIF 导出（高帧率）
- [ ] WebM 导出（VP8 编码）
- [ ] PNG 序列导出

#### 6.2 导出设置
- [ ] 分辨率选择
- [ ] 帧率选择
- [ ] 码率设置
- [ ] 质量预设
- [ ] 导出进度显示

#### 6.3 导出管理
- [ ] 导出历史
- [ ] 批量导出
- [ ] 导出模板保存
- [ ] 云存储上传（可选）

**状态**: ⏳ 待开始

---

### Phase 7: 键盘快捷键

#### 7.1 基础快捷键
- [ ] Space: 播放/暂停
- [ ] Ctrl+S: 保存
- [ ] Ctrl+Z: 撤销
- [ ] Ctrl+Shift+Z: 重做
- [ ] Delete: 删除选中

#### 7.2 导航快捷键
- [ ] ←/→: 前进/后退一帧
- [ ] ↑/↓: 上一个/下一个场景
- [ ] Home: 跳转到开头
- [ ] End: 跳转到结尾

#### 7.3 编辑快捷键
- [ ] Ctrl+C: 复制
- [ ] Ctrl+V: 粘贴
- [ ] Ctrl+X: 剪切
- [ ] S: 分割当前片段

**状态**: ⏳ 待开始

---

### Phase 8: 高级功能

#### 8.1 转场效果
- [ ] 转场库（淡入淡出、溶解、滑动、缩放）
- [ ] 转场拖放到时间轴
- [ ] 转场时长调整
- [ ] 转场预览

#### 8.2 音频处理
- [ ] 音频波形显示
- [ ] 音量包络线
- [ ] 音频淡入淡出
- [ ] 多音轨混合

#### 8.3 字幕生成
- [ ] 字幕编辑器
- [ ] 字幕预览
- [ ] 字幕样式（字体、颜色、位置）
- [ ] 字幕导出（SRT、VTT）

**状态**: ⏳ 待开始

---

## 优先级安排

### 🔴 高优先级（本周完成）

1. **左侧边栏功能** (Phase 2)
   - 素材库完整功能
   - 项目结构管理
   - 导出设置

2. **属性面板功能** (Phase 3)
   - 动态属性切换
   - 属性编辑器

3. **场景延伸手柄** (Phase 5.3)
   - 左右拖拽手柄
   - 边界检查
   - 吸附功能

### 🟡 中优先级（本月完成）

4. **多轨道支持** (Phase 4.1)
   - 轨道显示/隐藏
   - 轨道锁定/静音

5. **关键帧编辑** (Phase 4.2)
   - 关键帧时间轴
   - 关键帧添加/删除
   - 插值方式

6. **时间轴缩放** (Phase 4.3)
   - 滚轮缩放
   - 时间粒度切换

7. **素材拖放** (Phase 5.1)
   - 素材拖放到时间轴
   - 自动检测素材类型

### 🟢 低优先级（下月完成）

8. **转场效果** (Phase 8.1)
9. **音频处理** (Phase 8.2)
10. **字幕生成** (Phase 8.3)
11. **视频导出** (Phase 6)
12. **键盘快捷键** (Phase 7)

---

## 技术栈

### 前端

- **框架**: Next.js 14.2.18
- **UI 库**: React 18.3.1
- **样式**: Tailwind CSS 3.4.17
- **图标**: Lucide React 0.468.0
- **视频**: Remotion 4.0.434
- **状态**: Zustand 5.0.2

### 开发工具

- **TypeScript**: 5.7.3
- **PostCSS**: 8.4.49
- **ESLint**: Next.js 内置

---

## 开发计划

### 第一周 (2026-03-07 ~ 2026-03-14)

**目标**: 完成 Phase 2 和 Phase 3

- [ ] 素材库功能完善
- [ ] 项目结构管理
- [ ] 导出设置
- [ ] 动态属性面板
- [ ] 属性编辑器

### 第二周 (2026-03-15 ~ 2026-03-22)

**目标**: 完成 Phase 4.1, 4.2, 4.3

- [ ] 多轨道支持
- [ ] 关键帧编辑
- [ ] 时间轴缩放
- [ ] 吸附功能

### 第三周 (2026-03-23 ~ 2026-03-30)

**目标**: 完成 Phase 5.1, 5.3

- [ ] 素材拖放到时间轴
- [ ] 场景延伸手柄
- [ ] 高级拖拽功能

### 第四周 (2026-03-31 ~ 2026-04-07)

**目标**: 完成 Phase 6, 7

- [ ] 视频导出功能
- [ ] 键盘快捷键
- [ ] 性能优化

---

## 附录

### A. 文件结构

```
remotion-video-editor/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx          # 首页
│   │   └── editor/
│   │       └── page.tsx      # 编辑器主页面
│   ├── components/
│   │   ├── Timeline.tsx          # 时间轴
│   │   ├── TimelineHeader.tsx   # 时间轴头部
│   │   ├── TimelineTrack.tsx     # 轨道
│   │   ├── TimelineRuler.tsx     # 时间标尺
│   │   ├── TimelineControls.tsx  # 时间轴控制
│   │   ├── InspectorPanel.tsx   # 属性面板
│   │   ├── LeftSidebar.tsx      # 左侧边栏
│   │   ├── AssetUploader.tsx     # 素材上传器
│   │   ├── AssetList.tsx        # 素材列表
│   │   ├── AssetItem.tsx        # 素材卡片
│   │   ├── AssetFilters.tsx      # 素材过滤器
│   │   ├── ProjectPanel.tsx      # 项目面板
│   │   ├── SceneList.tsx        # 场景列表
│   │   ├── ExportPanel.tsx      # 导出面板
│   │   ├── Header.tsx          # 顶部导航栏
│   │   ├── PlaybackControls.tsx # 播放控制
│   │   └── PreviewArea.tsx     # 预览区
│   ├── remotion/
│   │   └── VideoComposition.tsx # Remotion 组件
│   ├── store/
│   │   └── editor.ts            # Zustand 状态管理
│   └── styles/
│       └── globals.css          # 全局样式
├── docs/
│   ├── TASKS.md                 # 任务文档（当前文件）
│   ├── LAYOUT-REDESIGN.md       # 布局设计文档
│   ├── API.md                  # API 文档（待创建）
│   └── CONTRIBUTING.md         # 贡献指南（待创建）
└── package.json
```

### B. 参考资源

- [Remotion 官方文档](https://www.remotion.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)

---

## 更新日志

### 2026-03-07 15:40
- ✅ 创建完整任务文档
- ✅ 分解为 8 个阶段
- ✅ 定义优先级安排
- ✅ 制定 4 周开发计划

### 2026-03-07 15:50
- ✅ 添加详细设计规范
- ✅ 添加交互与状态设计
- ✅ 添加技术栈说明
- ✅ 添加文件结构说明

---

**创建日期**: 2026-03-07 15:40
**最后更新**: 2026-03-07 15:50
