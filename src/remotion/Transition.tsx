'use client';

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import React from 'react';

export type TransitionType = 'fade' | 'crossDissolve' | 'push' | 'zoom' | 'wipe';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

interface TransitionProps {
  type: TransitionType;
  direction?: TransitionDirection;
  durationInFrames: number;
  children: React.ReactNode;
}

export const Transition: React.FC<TransitionProps> = ({
  type,
  direction = 'right',
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / durationInFrames);

  switch (type) {
    case 'fade':
      return <FadeTransition progress={progress}>{children}</FadeTransition>;

    case 'crossDissolve':
      return <CrossDissolveTransition progress={progress}>{children}</CrossDissolveTransition>;

    case 'push':
      return <PushTransition progress={progress} direction={direction}>{children}</PushTransition>;

    case 'zoom':
      return <ZoomTransition progress={progress}>{children}</ZoomTransition>;

    case 'wipe':
      return <WipeTransition progress={progress} direction={direction}>{children}</WipeTransition>;

    default:
      return <>{children}</>;
  }
};

// 淡入淡出转场
const FadeTransition: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => {
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// 交叉溶解转场（两个场景之间的淡入淡出）
const CrossDissolveTransition: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => {
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// 推入转场
const PushTransition: React.FC<{
  progress: number;
  direction: TransitionDirection;
  children: React.ReactNode;
}> = ({ progress, direction, children }) => {
  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case 'left':
      translateX = interpolate(progress, [0, 1], [100, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      break;
    case 'right':
      translateX = interpolate(progress, [0, 1], [-100, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      break;
    case 'up':
      translateY = interpolate(progress, [0, 1], [100, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      break;
    case 'down':
      translateY = interpolate(progress, [0, 1], [-100, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      break;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}%, ${translateY}%)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 缩放转场
const ZoomTransition: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => {
  const scale = interpolate(progress, [0, 1], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 擦除转场
const WipeTransition: React.FC<{
  progress: number;
  direction: TransitionDirection;
  children: React.ReactNode;
}> = ({ progress, direction, children }) => {
  let clipPath = '';

  switch (direction) {
    case 'left':
      const leftPercent = interpolate(progress, [0, 1], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      clipPath = `inset(0 ${100 - leftPercent}% 0 0)`;
      break;
    case 'right':
      const rightPercent = interpolate(progress, [0, 1], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      clipPath = `inset(0 0 0 ${100 - rightPercent}%)`;
      break;
    case 'up':
      const upPercent = interpolate(progress, [0, 1], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      clipPath = `inset(${100 - upPercent}% 0 0 0)`;
      break;
    case 'down':
      const downPercent = interpolate(progress, [0, 1], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      clipPath = `inset(0 0 ${100 - downPercent}% 0)`;
      break;
  }

  return (
    <AbsoluteFill style={{ clipPath }}>
      {children}
    </AbsoluteFill>
  );
};
