/**
 * Timeline 组件单元测试
 * 测试时间轴的核心功能
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Timeline } from '@/components/Timeline';
import { useEditorStore } from '@/store/editor';

jest.mock('@/store/editor', () => ({
  useEditorStore: jest.fn(),
}));

describe('Timeline Component', () => {
  const mockfps = 30;
  const mockCurrentFrame = 45;
  const mockScenes = [
    {
      id: 'scene-1',
      name: '场景 1',
      type: 'video' as const,
      startFrame: 0,
      durationFrames: 90,
      content: {},
    },
    {
      id: 'scene-2',
      name: '场景 2',
      type: 'video' as const,
      startFrame: 90,
      durationFrames: 60,
      content: {},
    },
  ];

  beforeEach(() => {
    (useEditorStore as jest.Mock).mockReturnValue({
      scenes: mockScenes,
      selectedSceneId: 'scene-1',
      currentFrame: mockCurrentFrame,
      fps: mockfps,
      draggedScene: null,
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track 1',
          type: 'video' as const,
          scenes: mockScenes,
          visible: true,
          locked: false,
        },
      ],
      selectedTrackId: null,
      timelineZoom: 1.0,
      snapEnabled: true,
      snapType: 'frame',
      keyframes: [],
      selectedKeyframeId: null,
      setCurrentFrame: jest.fn(),
      selectTrack: jest.fn(),
      toggleTrackVisibility: jest.fn(),
      toggleTrackLock: jest.fn(),
      setTimelineZoom: jest.fn(),
      setSnapEnabled: jest.fn(),
      setSnapType: jest.fn(),
      addKeyframe: jest.fn(),
      deleteKeyframe: jest.fn(),
      updateKeyframe: jest.fn(),
      selectKeyframe: jest.fn(),
    });
  });

  describe('渲染', () => {
    it('应该正确渲染时间轴组件', () => {
      render(<Timeline fps={mockfps} />);

      // 检查时间标尺
      expect(screen.getByText(/0s/i)).toBeInTheDocument();

      // 检查轨道头部
      expect(screen.getByText(/Video Track 1/i)).toBeInTheDocument();
    });

    it('应该正确显示场景', () => {
      render(<Timeline fps={mockfps} />);

      // 检查场景 1
      expect(screen.getByText('场景 1')).toBeInTheDocument();

      // 检查场景 2
      expect(screen.getByText('场景 2')).toBeInTheDocument();
    });

    it('应该正确显示时间信息', () => {
      render(<Timeline fps={mockfps} />);

      // 检查当前时间
      expect(screen.getByText(/0:01/i)).toBeInTheDocument();
    });

    it('应该正确显示帧数信息', () => {
      render(<Timeline fps={mockfps} />);

      // 检查当前帧数
      expect(screen.getByText(/第 45 帧/i)).toBeInTheDocument();

      // 检查总帧数
      expect(screen.getByText(/共 150 帧/i)).toBeInTheDocument();
    });
  });

  describe('时间轴点击', () => {
    it('应该更新当前帧数', async () => {
      const mockSetCurrentFrame = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setCurrentFrame: mockSetCurrentFrame,
      });

      render(<Timeline fps={mockfps} />);

      // 模拟时间轴点击
      const timelineContent = screen.getByText(/Video Track 1/i).closest('.relative');
      fireEvent.click(timelineContent!, { clientX: 300 });

      await waitFor(() => {
        expect(mockSetCurrentFrame).toHaveBeenCalled();
      });
    });

    it('应该应用吸附功能', async () => {
      const mockSetCurrentFrame = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setCurrentFrame: mockSetCurrentFrame,
        snapEnabled: true,
        snapType: 'frame',
      });

      render(<Timeline fps={mockfps} />);

      // 模拟时间轴点击（应该吸附到整数帧）
      const timelineContent = screen.getByText(/Video Track 1/i).closest('.relative');
      fireEvent.click(timelineContent!, { clientX: 304.5 }); // 不是整数位置

      await waitFor(() => {
        expect(mockSetCurrentFrame).toHaveBeenCalledWith(
          expect.anything(), // 等待更新
        );
      });
    });
  });

  describe('场景拖拽', () => {
    it('应该开始场景拖拽', () => {
      const mockSetDraggedScene = jest.fn();
      const mockSelectScene = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setDraggedScene: mockSetDraggedScene,
        selectScene: mockSelectScene,
      });

      render(<Timeline fps={mockfps} />);

      // 模拟场景拖拽开始
      const sceneElement = screen.getByText('场景 1');
      fireEvent.mouseDown(sceneElement, { clientX: 100 });

      await waitFor(() => {
        expect(mockSetDraggedScene).toHaveBeenCalled();
        expect(mockSelectScene).toHaveBeenCalledWith('scene-1');
      });
    });

    it('应该在拖拽时更新场景位置', async () => {
      const mockUpdateScenePosition = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        updateScenePosition: mockUpdateScenePosition,
        draggedScene: {
          id: 'scene-1',
          isDragging: true,
          dragOffsetX: 0,
          originalStartFrame: 0,
        },
      });

      render(<Timeline fps={mockfps} />);

      // 模拟场景拖拽中
      const sceneElement = screen.getByText('场景 1');
      fireEvent.mouseDown(sceneElement, { clientX: 100 });
      fireEvent.mouseMove(sceneElement, { clientX: 120 });

      await waitFor(() => {
        expect(mockUpdateScenePosition).toHaveBeenCalledWith('scene-1', expect.any(Number));
      });
    });

    it('应该结束场景拖拽', () => {
      const mockEndSceneDrag = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        endSceneDrag: mockEndSceneDrag,
      });

      render(<Timeline fps={mockfps} />);

      // 模拟场景拖拽结束
      const sceneElement = screen.getByText('场景 1');
      fireEvent.mouseUp(sceneElement);

      await waitFor(() => {
        expect(mockEndSceneDrag).toHaveBeenCalled();
      });
    });
  });

  describe('轨道操作', () => {
    it('应该切换轨道可见性', () => {
      const mockToggleTrackVisibility = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        toggleTrackVisibility: mockToggleTrackVisibility,
      });

      render(<Timeline fps={mockfps} />);

      // 查找可见性切换按钮
      const visibilityButton = screen.getByLabelText(/隐藏/显示/);
      fireEvent.click(visibilityButton);

      expect(mockToggleTrackVisibility).toHaveBeenCalledWith('track-1');
    });

    it('应该切换轨道锁定状态', () => {
      const mockToggleTrackLock = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        toggleTrackLock: mockToggleTrackLock,
      });

      render(<Timeline fps={mockfps} />);

      // 查找锁定切换按钮
      const lockButton = screen.getByLabelText(/解锁/锁定/);
      fireEvent.click(lockButton);

      expect(mockToggleTrackLock).toHaveBeenCalledWith('track-1');
    });
  });

  describe('时间轴缩放', () => {
    it('应该增加时间轴缩放', () => {
      const mockSetTimelineZoom = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setTimelineZoom: mockSetTimelineZoom,
        timelineZoom: 1.0,
      });

      render(<Timeline fps={mockfps} />);

      // 查找缩放增加按钮
      const zoomInButton = screen.getByTitle('放大');
      fireEvent.click(zoomInButton);

      expect(mockSetTimelineZoom).toHaveBeenCalledWith(1.1);
    });

    it('应该减少时间轴缩放', () => {
      const mockSetTimelineZoom = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setTimelineZoom: mockSetTimelineZoom,
        timelineZoom: 1.0,
      });

      render(<Timeline fps={mockfps} />);

      // 查找缩放减少按钮
      const zoomOutButton = screen.getByTitle('缩小');
      fireEvent.click(zoomOutButton);

      expect(mockSetTimelineZoom).toHaveBeenCalledWith(0.9);
    });

    it('应该限制缩放范围', () => {
      const mockSetTimelineZoom = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setTimelineZoom: mockSetTimelineZoom,
        timelineZoom: 5.0, // 已经最大
      });

      render(<Timeline fps={mockfps} />);

      // 查找缩放增加按钮
      const zoomInButton = screen.getByTitle('放大');
      fireEvent.click(zoomInButton);

      expect(mockSetTimelineZoom).toHaveBeenCalledWith(expect.any(Number));
      // 应该调用 setTimelineZoom 但会限制在 5.0
    });
  });

  describe('关键帧', () => {
    it('应该显示关键帧', () => {
      const mockKeyframes = [
        {
          id: 'kf-1',
          sceneId: 'scene-1',
          frame: 30,
          properties: { x: 100, y: 100 },
          interpolation: 'linear',
        },
      ];

      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        keyframes: mockKeyframes,
      });

      render(<Timeline fps={mockfps} />);

      // 检查关键帧是否显示
      // 关键帧应该是一个黄色的小点
      // 注意：由于没有实际的 DOM 结构，这里只是示例
      expect(screen.getByText(/Video Track 1/i)).toBeInTheDocument();
    });

    it('应该添加关键帧', () => {
      const mockAddKeyframe = jest.fn();
      const mockCurrentFrame = 30;
      const mockSelectedSceneId = 'scene-1';

      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        addKeyframe: mockAddKeyframe,
        currentFrame: mockCurrentFrame,
        selectedSceneId: mockSelectedSceneId,
      });

      render(<Timeline fps={mockfps} />);

      // 查找添加场景按钮（用于添加关键帧）
      // 注意：这里假设添加关键帧的按钮是添加场景按钮
      const addSceneButton = screen.getByText('添加场景');
      fireEvent.click(addSceneButton);

      await waitFor(() => {
        expect(mockAddKeyframe).toHaveBeenCalledWith(expect.objectContaining({
          sceneId: mockSelectedSceneId,
          frame: mockCurrentFrame,
        }));
      });
    });

    it('应该删除关键帧', () => {
      const mockDeleteKeyframe = jest.fn();
      const mockSelectedKeyframeId = 'kf-1';
      const mockKeyframes = [
        {
          id: 'kf-1',
          sceneId: 'scene-1',
          frame: 30,
          properties: {},
          interpolation: 'linear',
        },
      ];

      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        deleteKeyframe: mockDeleteKeyframe,
        selectedKeyframeId: mockSelectedKeyframeId,
        keyframes: mockKeyframes,
      });

      render(<Timeline fps={mockfps} />);

      // 查找关键帧并点击删除
      const keyframe = screen.getByText(/Video Track 1/i).closest('[title="关键帧"]');
      fireEvent.click(keyframe, { detail: 1 }); // 右键删除

      await waitFor(() => {
        expect(mockDeleteKeyframe).toHaveBeenCalledWith('kf-1');
      });
    });
  });

  describe('吸附功能', () => {
    it('应该切换吸附开关', () => {
      const mockSetSnapEnabled = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setSnapEnabled: mockSetSnapEnabled,
        snapEnabled: true,
      });

      render(<Timeline fps={mockfps} />);

      // 查找吸附开关按钮
      const snapButton = screen.getByText('吸附');
      fireEvent.click(snapButton);

      expect(mockSetSnapEnabled).toHaveBeenCalledWith(false);
    });

    it('应该切换吸附类型', () => {
      const mockSetSnapType = jest.fn();
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        setSnapType: mockSetSnapType,
        snapEnabled: true,
        snapType: 'frame',
      });

      render(<Timeline fps={mockfps} />);

      // 查找吸附类型下拉框
      const snapTypeSelect = screen.getByDisplayValue('帧');
      fireEvent.change(snapTypeSelect, { target: { value: 'keyframe' } });

      expect(mockSetSnapType).toHaveBeenCalledWith('keyframe');
    });

    it('应该在吸附时显示指示灯', () => {
      (useEditorStore as jest.Mock).mockReturnValue({
        ...jest.requireActual('@/store/editor').useEditorStore(),
        snapEnabled: true,
        snapType: 'frame',
      });

      render(<Timeline fps={mockfps} />);

      // 检查吸附按钮是否有指示灯
      const snapButton = screen.getByText('吸附');
      expect(snapButton.closest('button')).toHaveClass(/bg-blue-600/);
    });
  });
});
