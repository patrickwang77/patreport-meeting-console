import React from 'react';
import { Download, ExternalLink, PlayCircle } from 'lucide-react';

interface MediaViewerProps {
  src: string;
  title: string;
  description?: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ src, title, description }) => {
  const isAudio = src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.m4a');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" />
              {isAudio ? '音訊錄音' : '高畫質影片'}
            </span>
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={src}
            download
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <Download className="w-3 h-3" />
            <span>下載影音檔</span>
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>新分頁播放</span>
          </a>
        </div>
      </div>

      {/* Media Player Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center p-6 shadow-inner relative">
        {isAudio ? (
          <div className="w-full max-w-lg bg-slate-800/80 p-8 rounded-2xl border border-slate-700 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
              <PlayCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">{title}</h4>
            <audio controls className="w-full mt-4" src={src}>
              您的瀏覽器不支援 HTML5 音訊播放。
            </audio>
          </div>
        ) : (
          <video
            controls
            playsInline
            className="max-h-full max-w-full rounded-xl shadow-2xl object-contain bg-black"
            src={src}
          >
            您的瀏覽器不支援 HTML5 視訊播放。
          </video>
        )}
      </div>
    </div>
  );
};
