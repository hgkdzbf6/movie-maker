# 阶段 1：开始 - 拖拽场景调整位置

**开始时间**: 2026-03-07 13:05

---

## 🎯 目标

实现 Timeline 组件中场景的拖拽功能，允许用户通过拖拽调整场景在时间轴上的位置。

---

## 📝 技术方案

### 1. 场景拖拽状态管理

```typescript
// 在 EditorState 中新增拖拽状态
interface DraggableScene {
  id: string;
  isDragging: boolean;
  dragOffsetX: number;
  originalStartFrame: number;
}

interface EditorState {
  // ... 现有状态
  draggedScene: DraggableScene | null;
  
  // 新增 Actions
  setDraggedScene: (scene: DraggableScene | null) => void;
  updateScenePosition: (sceneId: string, newStartFrame: number) => void;
  endSceneDrag: () => void;
}
```

### 2. Timeline 组件实现

```typescript
// 拖拽处理函数
const handleSceneMouseDown = (sceneId: string, e: React.MouseEvent) => {
  const scene = scenes.find(s => s.id === sceneId);
  if (!scene) return;
  
  const store = useEditorStore.getState();
  store.setDraggedScene({
    id: scene.id,
    isDragging: true,
    dragOffsetX: e.clientX,
    originalStartFrame: scene.startFrame,
  });
};

// 拖拽移动处理
const handleSceneMouseMove = (e: React.MouseEvent) => {
  const { draggedScene, scenes } = useEditorStore.getState();
  if (!draggedScene) return;
  
  const deltaX = e.clientX - draggedScene.dragOffsetX;
  const currentScene = scenes.find(s => s.id === draggedScene.id);
  if (!currentScene) return;
  
  // 计算新的起始帧（考虑边界）
  const minFrame = Math.max(0, 0);
  const maxFrame = totalFrames - draggedScene.durationFrames;
  
  const newStartFrame = Math.max(
    minFrame,
    Math.min(maxFrame, Math.round(deltaX / pixelsPerFrame))
  );
  
  useEditorStore.getState().updateScenePosition(
    draggedScene.id,
    newStartFrame
  );
};

// 鼠标释放处理
const handleSceneMouseUp = () => {
  const { draggedScene, scenes } = useEditorStore.getState();
  if (!draggedScene) return;
  
  // 自动对齐到最近的时间轴刻度
  const scene = scenes.find(s => s.id === draggedScene.id);
  if (scene) {
    const pixelsPerFrame = width / totalFrames;
    const startFrame = scene.startFrame;
    const nearestRuler = Math.round(startFrame / pixelsPerFrame) * pixelsPerFrame;
    
    useEditorStore.getState().updateScenePosition(
      scene.id,
      nearestRuler
    );
  }
  
  useEditorStore.getState().endSceneDrag();
};
```

### 3. Timeline 组件更新

```tsx
// 添加拖拽事件和样式
<div
  key={scene.id}
  className={`absolute top-0 h-16 rounded-lg border-2 cursor-pointer transition-all ${
    isSelected
      ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
  } ${scene.isDragging ? 'opacity-50 cursor-grabbing' : 'opacity-100 cursor-grab'}`}
  style={{
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
  }}
  onMouseDown={(e) => handleSceneMouseDown(scene.id, e)}
  onMouseMove={handleSceneMouseMove}
  onMouseUp={handleSceneMouseUp}
  onDragStart={(e) => handleSceneDragStart(scene.id, e)}
  onDragEnd={(e) => handleSceneDragEnd(scene.id, e)}
  draggable
>
  {/* 场景内容 */}
</div>
```

---

## ⚠️ 注意事项

1. **边界检查**
   - 不允许场景拖拽到负帧位置
   - 确保场景之间有最小间隔

2. **对齐吸附**
   - 拖拽释放时自动对齐到最近的时间轴刻度
   - 可选：按住 Shift 键时禁用吸附

3. **视觉反馈**
   - 拖拽时降低透明度（opacity-50）
   - 拖拽时显示光标为抓取图标（cursor-grabbing）
   - 对齐时显示临时边框

4. **冲突处理**
   - 正在拖拽一个场景时，不允许拖拽另一个场景
   - 拖拽释放时检查时间范围是否有效

---

## 🚀 实现步骤

### 步骤 1: 更新状态管理
1. 在 `src/store/editor.ts` 中添加拖拽相关状态
2. 更新 EditorState 接口
3. 添加拖拽相关的 Actions

### 步骤 2: 更新 Timeline 组件
1. 实现拖拽事件处理函数
2. 添加拖拽样式类
3. 实现场景位置更新逻辑
4. 添加自动对齐功能

### 步骤 3: 测试
1. 启动开发服务器
2. 测试场景拖拽功能
3. 测试边界检查
4. 测试对齐吸附

---

## 📊 完成标准

- [ ] 场景可以拖拽调整位置
- [ ] 拖拽时视觉反馈正确
- [ ] 自动对齐到时间轴刻度
- [ ] 边界检查正常
- [ ] 冲突处理正常
- [ ] 编译通过
- [ ] 测试通过

---

**预计时间**: 30-45 分钟

---

创建时间: 2026-03-07 13:05
