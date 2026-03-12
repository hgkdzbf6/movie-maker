'use client';

import { AbsoluteFill, Audio, Img, Sequence, Video } from 'remotion';
import { useEditorStore } from '@/store/editor';
import { Transition } from './Transition';
import { TextScene } from './TextScene';

export const VideoComposition: React.FC = () => {
  const { tracks, assets } = useEditorStore();

  const videoTrack = tracks.find((track) => track.type === 'video');
  const audioTrack = tracks.find((track) => track.type === 'audio');

  const visualScenes = (videoTrack?.scenes ?? [])
    .filter((scene) => scene.type === 'image' || scene.type === 'video' || scene.type === 'transition' || scene.type === 'text')
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);

  const audioScenes = (audioTrack?.scenes ?? [])
    .filter((scene) => scene.type === 'audio')
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {visualScenes.map((scene) => {
        // 处理转场
        if (scene.type === 'transition') {
          return (
            <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
              <Transition
                type={scene.transitionType || 'fade'}
                direction={scene.transitionDirection}
                durationInFrames={scene.durationFrames}
              >
                <AbsoluteFill style={{ backgroundColor: '#000' }} />
              </Transition>
            </Sequence>
          );
        }

        // 处理文本场景
        if (scene.type === 'text') {
          return (
            <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
              <TextScene
                text={scene.content?.text || ''}
                fontFamily={scene.content?.fontFamily}
                fontSize={scene.content?.fontSize}
                fontWeight={scene.content?.fontWeight}
                color={scene.content?.color}
                textAlign={scene.content?.textAlign}
                lineHeight={scene.content?.lineHeight}
                letterSpacing={scene.content?.letterSpacing}
                strokeWidth={scene.content?.strokeWidth}
                strokeColor={scene.content?.strokeColor}
                backgroundColor={scene.content?.backgroundColor}
                backgroundOpacity={scene.content?.backgroundOpacity}
                shadowColor={scene.content?.shadowColor}
                shadowBlur={scene.content?.shadowBlur}
                shadowOffsetX={scene.content?.shadowOffsetX}
                shadowOffsetY={scene.content?.shadowOffsetY}
                animation={scene.content?.animation}
                durationInFrames={scene.durationFrames}
              />
            </Sequence>
          );
        }

        // 处理普通场景
        const asset = assets.find((item) => item.id === scene.content?.assetId);
        if (!asset) return null;

        const trimStartFrames = scene.trimStart || 0;

        // 构建 CSS 滤镜字符串
        const buildFilterStyle = () => {
          if (!scene.videoEffects || scene.videoEffects.length === 0) return {};

          const filters: string[] = [];

          scene.videoEffects.forEach(effect => {
            const intensity = effect.intensity;

            switch (effect.type) {
              case 'brightness':
                // 0-100 映射到 0-2 (50 = 1 = 正常)
                filters.push(`brightness(${intensity / 50})`);
                break;
              case 'contrast':
                // 0-100 映射到 0-2 (50 = 1 = 正常)
                filters.push(`contrast(${intensity / 50})`);
                break;
              case 'saturation':
                // 0-100 映射到 0-2 (50 = 1 = 正常)
                filters.push(`saturate(${intensity / 50})`);
                break;
              case 'hue':
                // 0-100 映射到 0-360 度
                filters.push(`hue-rotate(${(intensity / 100) * 360}deg)`);
                break;
              case 'blur':
                // 0-100 映射到 0-20px
                filters.push(`blur(${(intensity / 100) * 20}px)`);
                break;
              case 'grayscale':
                // 0-100 映射到 0-1
                filters.push(`grayscale(${intensity / 100})`);
                break;
              case 'sepia':
                // 0-100 映射到 0-1
                filters.push(`sepia(${intensity / 100})`);
                break;
              case 'sharpen':
                // 锐化通过对比度和亮度微调实现
                if (intensity > 0) {
                  const sharpenAmount = 1 + (intensity / 100) * 0.5;
                  filters.push(`contrast(${sharpenAmount})`);
                }
                break;
            }
          });

          return filters.length > 0 ? { filter: filters.join(' ') } : {};
        };

        const filterStyle = buildFilterStyle();

        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              {scene.type === 'image' ? (
                <Img
                  src={asset.url}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', ...filterStyle }}
                />
              ) : (
                <Video
                  src={asset.url}
                  startFrom={trimStartFrames}
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'contain', ...filterStyle }}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {audioScenes.map((scene) => {
        const asset = assets.find((item) => item.id === scene.content?.assetId);
        if (!asset) return null;

        const trimStartFrames = scene.trimStart || 0;

        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
            <Audio src={asset.url} startFrom={trimStartFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
