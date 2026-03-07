'use client';

import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import '@/styles/globals.css';

export default function PreviewPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">
          🎬 Remotion 视频编辑器
        </h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition">
            新建项目
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
            导入
          </button>
        </div>
      </header>

      {/* Player */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
        <Player
          component={VideoComposition}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '1920px',
            maxHeight: '1080px',
          }}
          compositionWidth={1920}
          compositionHeight={1080}
          durationInFrames={180}
          fps={30}
          loop
          controls
          showVolumeControls
          inputProps={{ frame: 0 }}
          acknowledgeRemotionLicense={true}
        />
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-800 bg-gray-900 text-gray-400 text-center">
        <p>
          基于 Remotion 4.0 + Next.js 14 构建 | 
          <a href="https://www.remotion.dev" className="text-primary-400 hover:underline">
            Remotion 文档
          </a>
        </p>
      </footer>
    </div>
  );
}
