'use client';

import { AbsoluteFill, Audio, Img, Sequence, Video } from 'remotion';
import { useEditorStore } from '@/store/editor';

export const VideoComposition: React.FC = () => {
  const { tracks, assets } = useEditorStore();

  const videoTrack = tracks.find((track) => track.type === 'video');
  const audioTrack = tracks.find((track) => track.type === 'audio');

  const visualScenes = (videoTrack?.scenes ?? [])
    .filter((scene) => scene.type === 'image' || scene.type === 'video')
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);

  const audioScenes = (audioTrack?.scenes ?? [])
    .filter((scene) => scene.type === 'audio')
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {visualScenes.map((scene) => {
        const asset = assets.find((item) => item.id === scene.content?.assetId);
        if (!asset) return null;

        const trimStartFrames = scene.trimStart || 0;

        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationFrames}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              {scene.type === 'image' ? (
                <Img
                  src={asset.url}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Video
                  src={asset.url}
                  startFrom={trimStartFrames}
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
