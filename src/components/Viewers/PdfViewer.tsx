import React from 'react';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface PdfViewerProps {
  src: string;
  title: string;
  description?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ src, title, description }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium flex items-center gap-1">
              <FileText className="w-3 h-3" />
              PDF 簡報
            </span>
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" />
            <span>企業內部安全隔離檢視</span>
          </div>
          <a
            href={src}
            download
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <Download className="w-3 h-3" />
            <span>下載 PDF</span>
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>新分頁開啟</span>
          </a>
        </div>
      </div>

      {/* PDF View Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-inner">
        <object
          data={`${src}#toolbar=1&navpanes=0`}
          type="application/pdf"
          className="w-full h-full border-0 rounded-2xl"
        >
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-500 mb-3" />
            <h4 className="text-base font-semibold text-slate-200">無法直接嵌入預覽 PDF</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              您的瀏覽器可能不支援內嵌 PDF 檢視器，請點選下方按鈕直接在新分頁開啟或下載。
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              在新分頁打開 PDF 簡報
            </a>
          </div>
        </object>
      </div>
    </div>
  );
};
