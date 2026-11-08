import React, { useRef, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface HtmlViewerProps {
  src: string;
  title: string;
  description?: string;
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({ src, title, description }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = src + '?t=' + Date.now();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 overflow-hidden">
      {/* Top Bar info */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              HTML 動態戰情室
            </span>
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="重新整理圖表"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="另開新視窗全螢幕"
          >
            <ExternalLink className="w-3 h-3" />
            <span>新分頁開啟</span>
          </a>
        </div>
      </div>

      {/* Sandboxed iframe container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>載入互動戰情室組件中...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 bg-transparent"
        />
      </div>
    </div>
  );
};
