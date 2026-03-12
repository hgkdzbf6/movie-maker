'use client';

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import React from 'react';

export type TextAnimation = 'fadeIn' | 'flyIn' | 'typewriter' | 'none';

interface TextSceneProps {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  animation?: TextAnimation;
  durationInFrames: number;
}

export const TextScene: React.FC<TextSceneProps> = ({
  text,
  fontFamily = 'Arial, sans-serif',
  fontSize = 48,
  fontWeight = 'bold',
  color = '#ffffff',
  textAlign = 'center',
  lineHeight = 1.2,
  letterSpacing = 0,
  strokeWidth = 0,
  strokeColor = '#000000',
  backgroundColor,
  backgroundOpacity = 0.8,
  shadowColor,
  shadowBlur = 0,
  shadowOffsetX = 0,
  shadowOffsetY = 0,
  animation = 'none',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // 文本样式
  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight === 'normal' ? 400 : fontWeight === 'medium' ? 500 : fontWeight === 'bold' ? 700 : 900,
    color,
    textAlign,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    margin: 0,
    padding: backgroundColor ? '20px 40px' : 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  // 描边效果
  if (strokeWidth > 0) {
    textStyle.WebkitTextStroke = `${strokeWidth}px ${strokeColor}`;
    textStyle.paintOrder = 'stroke fill';
  }

  // 阴影效果
  if (shadowColor && shadowBlur > 0) {
    textStyle.textShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`;
  }

  // 背景色
  if (backgroundColor) {
    textStyle.backgroundColor = backgroundColor;
    textStyle.opacity = backgroundOpacity;
    textStyle.borderRadius = '8px';
  }

  // 应用动画
  let animatedStyle: React.CSSProperties = {};

  switch (animation) {
    case 'fadeIn':
      animatedStyle = getFadeInStyle(frame, durationInFrames);
      break;
    case 'flyIn':
      animatedStyle = getFlyInStyle(frame, durationInFrames);
      break;
    case 'typewriter':
      // 打字机效果通过截取文本实现
      break;
    default:
      break;
  }

  // 打字机效果：逐字显示
  let displayText = text;
  if (animation === 'typewriter') {
    const animationDuration = Math.min(durationInFrames, 60); // 最多 2 秒动画
    const progress = Math.min(1, frame / animationDuration);
    const charCount = Math.floor(text.length * progress);
    displayText = text.substring(0, charCount);
  }

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        padding: '40px',
        ...animatedStyle,
      }}
    >
      <div style={textStyle}>
        {displayText}
      </div>
    </AbsoluteFill>
  );
};

// 淡入动画
function getFadeInStyle(frame: number, durationInFrames: number): React.CSSProperties {
  const animationDuration = Math.min(durationInFrames, 30); // 最多 1 秒动画
  const opacity = interpolate(frame, [0, animationDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return { opacity };
}

// 飞入动画
function getFlyInStyle(frame: number, durationInFrames: number): React.CSSProperties {
  const animationDuration = Math.min(durationInFrames, 30); // 最多 1 秒动画

  const translateY = interpolate(frame, [0, animationDuration], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(frame, [0, animationDuration * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return {
    transform: `translateY(${translateY}px)`,
    opacity,
  };
}
