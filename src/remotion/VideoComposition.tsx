import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)',
        color: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', opacity }}>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>Remotion Editor</div>
        <div style={{ fontSize: 24, color: '#93c5fd' }}>Preview Composition</div>
      </div>
    </AbsoluteFill>
  );
};
