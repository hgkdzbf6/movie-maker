# Remotion 视频编辑器 - 专业界面重设计

**日期**: 2026-03-07  
**版本**: v2.0 - 专业版

---

## 🎨 设计原则

### 参考软件
- **DaVinci Resolve** - 专业调色，深色主题
- **Adobe Premiere Pro** - 清晰层次，工具栏优化
- **Final Cut Pro** - 极简设计，高效操作

### 核心目标
1. **专业性** - 符合专业视频编辑器的视觉规范
2. **可用性** - 清晰的视觉层次，快速操作
3. **美观性** - 统一的设计语言，精致的细节
4. **高效性** - 合理的布局，最小化操作步骤

---

## 🎨 配色方案

### 主题色
```css
/* 主色调 */
--bg-primary: #1a1a2a;       /* 深灰黑色背景 */
--bg-secondary: #252525;     /* 次级背景 */
--bg-tertiary: #1e1e2e;     /* 卡片背景 */
--bg-hover: #3d3d3d;         /* 悬停背景 */
--bg-active: #2d2d2d;          /* 激活状态 */

/* 强调色 */
--accent-primary: #e11d48;      /* 主强调色（红色，类似 DaVinci） */
--accent-secondary: #3b82f6;   /* 次强调色（蓝色） */
--accent-success: #10b981;      /* 成功色（绿色） */
--accent-warning: #f59e0b;      /* 警告色（橙色） */
--accent-error: #ef4444;        /* 错误色（红色） */

/* 文本色 */
--text-primary: #ffffff;         /* 主文本色 */
--text-secondary: #a0a0a0;     /* 次级文本 */
--text-muted: #6b7280;          /* 弱化文本 */
--text-disabled: #404040;       /* 禁用文本 */

/* 边框色 */
--border-subtle: #333333;       /* 细边框 */
--border-medium: #444444;       /* 中等边框 */
--border-strong: #555555;       /* 强边框 */

/* 分隔线 */
--divider-light: #2d2d2d;
--divider-medium: #3d3d3d;
```

### 字体系统
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
font-size: 13px;
font-weight: 400;
line-height: 1.5;
```

### 阴影系统
```css
/* 细腻阴影 */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 4px 28px rgba(0, 0, 0, 0.25);

/* 内阴影 */
--shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.1);
```

### 圆角系统
```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
```

---

## 📐 布局结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header Bar (标题栏 + 工具栏)                       │
├───────────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│ │             │ │             │ │              │ │
│ │   Timeline  │ │  Inspector  │ │   Preview    │ │
│ │   (Left)   │ │   (Right)   │ │   (Center)   │ │
│ │             │ │             │ │              │ │
│ │             │ │             │ │              │ │
│ │             │ │             │ │              │ │
│ └─────────────┘ └─────────────┘ └──────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────────┤
│  Status Bar (状态栏)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 布局详情

#### 1. Header Bar (标题栏 - 56px)
- 左侧：项目名称 + 面包屑导航
- 中间：工作区切换（编辑/预览）
- 右侧：用户信息 + 设置按钮

#### 2. Main Area (工作区)
- **左侧面板** (280px 固定宽度)
  - 工具箱（Timeline Tools）
  - 时间轴（Timeline Track）
  
- **中间预览区** (flex-1)
  - Remotion Player
  - 视频预览
  
- **右侧面板** (300px 固定宽度)
  - 属性面板（Inspector）
  - 素材库（Assets）

#### 3. Status Bar (状态栏 - 32px)
- 播放控制
- 时间显示
- 缩放控制
- 导出按钮

---

## 🧩 组件设计

### 1. Header Bar 组件

```tsx
<Header className="h-14 bg-primary border-b border-subtle">
  {/* Logo 和项目名称 */}
  <div className="flex items-center gap-3">
    <LogoIcon className="w-6 h-6" />
    <h1 className="text-base font-semibold text-primary">My Project</h1>
    <Badge>3 Scenes</Badge>
  </div>
  
  {/* 工具栏 */}
  <div className="flex items-center gap-1">
    <ToolbarButton icon={<SaveIcon />} label="保存" />
    <ToolbarButton icon={<UndoIcon />} label="撤销" />
    <ToolbarButton icon={<RedoIcon />} label="重做" />
    <Separator />
    <ToolbarButton icon={<ExportIcon />} label="导出" primary />
  </div>
  
  {/* 工作区切换 */}
  <div className="flex items-center bg-secondary">
    <Tab active label="编辑" />
    <Tab label="预览" />
  </div>
  
  {/* 右侧按钮 */}
  <div className="flex items-center gap-2">
    <UserAvatar />
    <IconButton icon={<SettingsIcon />} />
  </div>
</Header>
```

### 2. Toolbar Button 组件

```tsx
<ToolbarButton 
  icon={<SaveIcon />}
  label="保存"
  onClick={handleSave}
  variant="default"  // default | primary | danger
  disabled={false}
  tooltip="快捷键: Ctrl+S"
  size="md"        // sm | md | lg
/>
```

### 3. Timeline 组件（专业版）

```tsx
<Timeline className="flex flex-col bg-tertiary">
  {/* 工具栏 */}
  <TimelineToolbar>
    <ToolButton icon={<SelectIcon />} active={tool === 'select'} />
    <ToolButton icon={<CutIcon />} active={tool === 'cut'} />
    <ToolButton icon={<SplitIcon />} active={tool === 'split'} />
    <ToolButton icon={<TrashIcon />} active={tool === 'delete'} />
    <TimelineSettings />
  </TimelineToolbar>
  
  {/* 时间刻度 */}
  <TimelineRuler>
    {rulers.map(ruler => (
      <RulerMarker position={ruler.position} label={ruler.label} />
    ))}
  </TimelineRuler>
  
  {/* 轨道 */}
  <Tracks>
    {scenes.map(scene => (
      <Track
        key={scene.id}
        scene={scene}
        selected={scene.id === selectedSceneId}
        onClick={handleSceneSelect}
        onDragStart={handleSceneDrag}
        onDragEnd={handleSceneDragEnd}
        onResizeStart={handleSceneResize}
        onResizeEnd={handleSceneResizeEnd}
      />
    ))}
  </Tracks>
  
  {/* 播放头 */}
  <Playhead position={playheadPosition} />
</Timeline>
```

### 4. Track Component

```tsx
<Track 
  scene={scene}
  selected={selected}
  onDragStart={handleDrag}
>
  {/* 左侧手柄 - 调整时长 */}
  <ResizeHandle 
    side="left"
    onDrag={handleResize}
  />
  
  {/* 主体 */}
  <TrackContent>
    <Thumbnail src={scene.thumbnail} />
    <SceneLabel>{scene.name}</SceneLabel>
    <Duration>{formatDuration(scene.duration)}</Duration>
  </TrackContent>
  
  {/* 右侧手柄 - 调整时长 */}
  <ResizeHandle 
    side="right"
    onDrag={handleResize}
  />
  
  {/* 选中边框 */}
  {selected && <SelectionBorder />}
</Track>
```

### 5. Inspector Panel 组件（专业版）

```tsx
<InspectorPanel className="flex flex-col bg-secondary border-l border-subtle">
  {/* 场景缩略图 */}
  <SceneThumbnail>
    <img src={scene.thumbnail} alt={scene.name} />
    <SceneTitle>{scene.name}</SceneTitle>
  </SceneThumbnail>
  
  {/* 分组面板 */}
  <AccordionGroup>
    <AccordionSection title="变换">
      <PropertyRow label="位置">
        <NumberInput value={scene.x} onChange={handleXChange} />
        <NumberInput value={scene.y} onChange={handleYChange} />
      </PropertyRow>
      <PropertyRow label="尺寸">
        <NumberInput value={scene.width} onChange={handleWidthChange} />
        <NumberInput value={scene.height} onChange={handleHeightChange} />
      </PropertyRow>
      <PropertyRow label="旋转">
        <Slider value={scene.rotation} onChange={handleRotationChange} />
      </PropertyRow>
      <PropertyRow label="透明度">
        <Slider value={scene.opacity} onChange={handleOpacityChange} />
      </PropertyRow>
    </AccordionSection>
    
    <AccordionSection title="外观">
      <PropertyRow label="背景色">
        <ColorPicker value={scene.backgroundColor} onChange={handleBgColorChange} />
      </PropertyRow>
      <PropertyRow label="边框颜色">
        <ColorPicker value={scene.borderColor} onChange={handleBorderColorChange} />
      </PropertyRow>
      <PropertyRow label="边框圆角">
        <Slider value={scene.borderRadius} onChange={handleBorderRadiusChange} />
      </PropertyRow>
      <PropertyRow label="阴影">
        <Select value={scene.shadow} onChange={handleShadowChange} />
      </PropertyRow>
    </AccordionSection>
    
    <AccordionSection title="动画">
      <PropertyRow label="缓动">
        <Select value={scene.easing} onChange={handleEasingChange}>
          <option value="none">无</option>
          <option value="linear">线性</option>
          <option value="ease-in">缓入</option>
          <option value="ease-out">缓出</option>
          <option value="ease-in-out">缓入缓出</option>
        </Select>
      </PropertyRow>
      <PropertyRow label="持续时间">
        <NumberInput value={scene.duration} onChange={handleDurationChange} />
      </PropertyRow>
    </AccordionSection>
  </AccordionGroup>
</InspectorPanel>
```

### 6. Preview Area 组件

```tsx
<PreviewArea className="flex-1 flex flex-col bg-primary">
  {/* 顶部控制栏 */}
  <PreviewControls>
    <PlaybackButton icon={<PlayIcon />} onClick={handlePlay} />
    <PlaybackButton icon={<PauseIcon />} onClick={handlePause} />
    <TimeDisplay>{formatTime(currentFrame)}</TimeDisplay>
    <ZoomControls>
      <ZoomButton icon={<ZoomInIcon />} onClick={handleZoomIn} />
      <ZoomLevel>{zoomLevel}x</ZoomLevel>
      <ZoomButton icon={<ZoomOutIcon />} onClick={handleZoomOut} />
    </ZoomControls>
    <FullscreenButton icon={<FullscreenIcon />} onClick={handleFullscreen} />
  </PreviewControls>
  
  {/* 视频预览 */}
  <div className="flex-1 flex items-center justify-center bg-black relative">
    <Player
      component={VideoComposition}
      compositionWidth={1920}
      compositionHeight={1080}
      frame={currentFrame}
      fps={30}
      controls={false}  // 禁用默认控制
    />
    
    {/* 安全区域 */}
    <SafeArea>
      <SafeAreaGuide />
    </SafeArea>
  </div>
</PreviewArea>
```

---

## 🎯 实现优先级

### Phase 1: 基础样式（当前）
1. ✅ 配色方案定义
2. ✅ 布局结构设计
3. ✅ 组件接口定义
4. ✅ 工具栏组件样式

### Phase 2: 核心组件重构
**优先级**: 🔴 高
1. Header Bar 重构
   - 新增 Logo 和面包屑
   - 工具按钮重设计
   - 工作区切换标签

**预计时间**: 2-3 小时

### Phase 3: Timeline 组件升级
**优先级**: 🔴 高
1. 时间轴刻度优化
2. 拖拽手柄优化
3. 场景卡片美化
4. 播放头重设计

**预计时间**: 3-4 小时

### Phase 4: Inspector 组件升级
**优先级**: 🟡 中
1. 手风琴面板实现
2. 属性输入组件统一
3. 颜色选择器集成
4. 场景缩略图显示

**预计时间**: 2-3 小时

### Phase 5: Preview Area 优化
**优先级**: 🟡 中
1. 播放控制条优化
2. 安全区域指示器
3. 缩放控制实现
4. 全屏模式优化

**预计时间**: 2-3 小时

### Phase 6: 高级功能
**优先级**: 🟢 低
1. 多选实现
2. 时间轴吸附
3. 关键帧系统
4. 转场效果库

**预计时间**: 4-6 小时

---

## 📝 实现细节

### 阴影效果
```css
.component-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.component-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-medium);
}
```

### 按钮样式
```css
.button-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-primary:hover {
  background: #f43f5e;  /* 更亮的红色 */
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
}
```

### 输入框样式
```css
.input-field {
  background: var(--bg-primary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1);
}
```

### 时间轴样式
```css
.timeline-track {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  margin: 4px 0;
  padding: 8px;
  height: 80px;
}

.timeline-track:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.scene-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 8px;
  min-height: 64px;
}

.scene-card.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 8px rgba(225, 29, 72, 0.15);
}
```

---

## 🚀 开发计划

### 今天（2026-03-07）
- [x] Phase 1: 基础样式
  - [ ] 创建 CSS 变量文件
  - [ ] 更新 Tailwind 配置
  - [ ] 重构 Header 组件

### 本周
- [ ] Phase 2: 核心组件重构
  - [ ] Header Bar 实现
  - [ ] Timeline 升级
  - [ ] Inspector 升级
  - [ ] Preview Area 优化

### 下周
- [ ] Phase 3: 高级功能
- [ ] 多选功能
- [ ] 时间轴吸附
- [ ] 键盘快捷键

---

## 📚 参考资料

- [DaVinci Resolve UI Guide](https://www.blackmagicdesign.com/products/davinciresolve/)
- [Adobe Premiere Pro UI Patterns](https://helpx.adobe.com/premiere-pro/using/workspaces-and-panels)
- [Final Cut Pro Interface](https://support.apple.com/guide/final-cut-pro/)
- [Figma Video Editor UI Kit](https://www.figma.com/community/file/106253416852776765)
- [Remotion Player Props](https://www.remotion.dev/docs/player/player)

---

**创建时间**: 2026-03-07 09:20
**预计完成**: 2026-03-10
