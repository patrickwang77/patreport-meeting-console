import React from 'react';
import { 
  FileCode2, 
  FileText, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar,
  Layers,
  PlayCircle
} from 'lucide-react';
import { AgendaItem, ContentType } from '../types';

interface AgendaSidebarProps {
  agendas: AgendaItem[];
  currentIndex: number;
  onSelectAgenda: (index: number) => void;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  meetingTitle: string;
  meetingDate: string;
  chairperson: string;
}

const getContentTypeBadge = (type: ContentType) => {
  switch (type) {
    case 'html':
      return {
        icon: <FileCode2 className="w-3.5 h-3.5" />,
        label: 'HTML 戰情室',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      };
    case 'pdf':
      return {
        icon: <FileText className="w-3.5 h-3.5" />,
        label: 'PDF 簡報',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      };
    case 'excel_table':
      return {
        icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
        label: 'Excel 數據',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      };
    case 'media':
      return {
        icon: <PlayCircle className="w-3.5 h-3.5" />,
        label: '多媒體影音',
        bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
      };
  }
};

export const AgendaSidebar: React.FC<AgendaSidebarProps> = ({
  agendas,
  currentIndex,
  onSelectAgenda,
  disabled = false,
  isOpen,
  onToggle,
  meetingTitle,
  meetingDate,
  chairperson
}) => {
  return (
    <aside
      className={`h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-16'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {isOpen ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>會議議程導航</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1 line-clamp-1">{meetingTitle}</h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {meetingDate}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> 主席: {chairperson}</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-xs"
          title={isOpen ? "收合側邊欄" : "展開側邊欄"}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Agenda Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {agendas.map((item, idx) => {
          const isActive = idx === currentIndex;
          const isPassed = idx < currentIndex;
          const badge = getContentTypeBadge(item.contentType);

          if (!isOpen) {
            return (
              <button
                key={item.id}
                onClick={() => !disabled && onSelectAgenda(idx)}
                disabled={disabled}
                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : isPassed
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-700'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
                title={`議程 ${idx + 1}: ${item.title}`}
              >
                {isActive ? idx + 1 : isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
              </button>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => !disabled && onSelectAgenda(idx)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition relative group ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  #{item.index} {item.department}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>

              <h4 className={`text-sm font-semibold line-clamp-2 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                {item.title}
              </h4>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.presenter}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.allocatedMinutes} 分鐘
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {isOpen && (
        <div className="p-3 border-t border-slate-800 text-center text-xs text-slate-500">
          總議程時間: {agendas.reduce((acc, a) => acc + a.allocatedMinutes, 0)} 分鐘
        </div>
      )}
    </aside>
  );
};
