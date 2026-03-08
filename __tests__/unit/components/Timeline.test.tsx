/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import { Timeline } from '@/components/Timeline';
import { useEditorStore } from '@/store/editor';

jest.mock('@/store/editor', () => ({
  useEditorStore: jest.fn(),
}));

describe('Timeline', () => {
  const mockSetCurrentFrame = jest.fn();
  const mockToggleTrackVisibility = jest.fn();
  const mockToggleTrackLock = jest.fn();
  const mockSelectTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useEditorStore as unknown as jest.Mock).mockReturnValue({
      scenes: [
        { id: 'scene-1', name: '场景 1', type: 'video', startFrame: 0, durationFrames: 90, content: {} },
        { id: 'scene-2', name: '场景 2', type: 'video', startFrame: 90, durationFrames: 60, content: {} },
      ],
      selectedSceneId: 'scene-1',
      currentFrame: 45,
      setCurrentFrame: mockSetCurrentFrame,
      updateScene: jest.fn(),
      selectScene: jest.fn(),
      draggedScene: null,
      setDraggedScene: jest.fn(),
      updateScenePosition: jest.fn(),
      endSceneDrag: jest.fn(),
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track 1',
          type: 'video',
          scenes: [
            { id: 'scene-1', name: '场景 1', type: 'video', startFrame: 0, durationFrames: 90, content: {} },
            { id: 'scene-2', name: '场景 2', type: 'video', startFrame: 90, durationFrames: 60, content: {} },
          ],
          visible: true,
          locked: false,
        },
      ],
      selectedTrackId: null,
      selectTrack: mockSelectTrack,
      toggleTrackVisibility: mockToggleTrackVisibility,
      toggleTrackLock: mockToggleTrackLock,
      timelineZoom: 1,
      setTimelineZoom: jest.fn(),
      snapEnabled: true,
      setSnapEnabled: jest.fn(),
      snapType: 'frame',
      setSnapType: jest.fn(),
      keyframes: [],
      selectedKeyframeId: null,
      selectKeyframe: jest.fn(),
      addKeyframe: jest.fn(),
      deleteKeyframe: jest.fn(),
    });
  });

  it('renders timeline tracks and scenes', () => {
    render(<Timeline fps={30} />);

    expect(screen.getByText('Video Track 1')).toBeInTheDocument();
    expect(screen.getByText('场景 1')).toBeInTheDocument();
    expect(screen.getByText('场景 2')).toBeInTheDocument();
  });

  it('toggles track visibility', () => {
    render(<Timeline fps={30} />);

    fireEvent.click(screen.getByTitle('隐藏'));
    expect(mockToggleTrackVisibility).toHaveBeenCalledWith('track-1');
  });

  it('toggles track lock', () => {
    render(<Timeline fps={30} />);

    fireEvent.click(screen.getByTitle('锁定'));
    expect(mockToggleTrackLock).toHaveBeenCalledWith('track-1');
  });
});
