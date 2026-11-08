import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  UserCheck, 
  Users, 
  CheckSquare,
  Settings,
  Crosshair,
  Sun,
  PenTool,
  Eraser,
  Vote,
  MessageSquareOff,
  MessageSquare
} from 'lucide-react';
import { AgendaItem } from '../types';

interface PresenterBarProps {
  role: 'presenter' | 'attendee';
  setRole: (role: 'presenter' | 'attendee') => void;
  currentAgenda: AgendaItem;
  currentIndex: number;
  totalAgendas: number;
  onNavigate: (index: number) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  onOpenActions: () => void;
  actionItemCount: number;
  onOpenAdmin?: () => void;
  // New Interactive Props
  activeTool: 'laser' | 'spotlight' | 'pen' | 'none';
  setActiveTool: (tool: 'laser' | 'spotlight' | 'pen' | 'none') => void;
  onClearDrawing: () => void;
  hasDrawings: boolean;
  onOpenPoll: () => void;
  isPollOpen: boolean;
  interactiveEnabled: boolean;
  setInteractiveEnabled: (enabled: boolean) => void;
}

export const PresenterBar: React.FC<PresenterBarProps> = ({
  role,
  setRole,
  currentAgenda,
  currentIndex,
  totalAgendas,
  onNavigate,
  isLocked,
  setIsLocked,
  onOpenActions,
  actionItemCount,
  onOpenAdmin,
  activeTool,
  setActiveTool,
  onClearDrawing,
  hasDrawings,
  onOpenPoll,
  isPollOpen,
  interactiveEnabled,
  setInteractiveEnabled
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Reset timer on agenda change
  useEffect(() => {
    setSeconds(0);
    setIsRunning(true);
  }, [currentIndex]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOverTime = seconds > (currentAgenda.allocatedMinutes * 60);

  const toggleTool = (tool: 'laser' | 'spotlight' | 'pen') => {
    setActiveTool(activeTool === tool ? 'none' : tool);
  };

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between select-none z-30 backdrop-blur-md gap-2">
      {/* Left: Branding & Role Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            P
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-white tracking-wide">Patreport Console</h1>
            <p className="text-[10px] text-slate-400">定期會議控場與議程導航平台</p>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/60 flex items-center text-xs">
          <button
            onClick={() => setRole('presenter')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition font-medium ${
              role === 'presenter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>主持人</span>
          </button>
          <button
            onClick={() => setRole('attendee')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition font-medium ${
              role === 'attendee'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>與會者</span>
          </button>
        </div>
      </div>

      {/* Center: Current Agenda & Navigation */}
      <div className="flex items-center gap-2">
        {role === 'presenter' && (
          <button
            onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="上一議題 (鍵盤 ←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="text-center px-1 max-w-[180px] sm:max-w-xs md:max-w-md truncate">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              議程 {currentIndex + 1} / {totalAgendas}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate">{currentAgenda.department}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
            {currentAgenda.title}
          </div>
        </div>

        {role === 'presenter' && (
          <button
            onClick={() => onNavigate(Math.min(totalAgendas - 1, currentIndex + 1))}
            disabled={currentIndex === totalAgendas - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="下一議題 (鍵盤 →)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right: Tools, Timer, Controls */}
      <div className="flex items-center gap-2">
        {/* Presenter Interactive Tools Group */}
        {role === 'presenter' && (
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {/* Laser Pointer */}
            <button
              onClick={() => toggleTool('laser')}
              className={`p-1.5 rounded-lg transition ${
                activeTool === 'laser'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
              title="雷射筆 (紅點跟隨游標)"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            {/* Spotlight */}
            <button
              onClick={() => toggleTool('spotlight')}
              className={`p-1.5 rounded-lg transition ${
                activeTool === 'spotlight'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
              title="聚光燈 (反暗全螢幕，強調焦點)"
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Pen Drawing */}
            <button
              onClick={() => toggleTool('pen')}
              className={`p-1.5 rounded-lg transition ${
                activeTool === 'pen'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
              title="螢光筆 (在畫面上塗鴉標註)"
            >
              <PenTool className="w-4 h-4" />
            </button>

            {/* Clear Drawings */}
            {hasDrawings && (
              <button
                onClick={onClearDrawing}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="清除畫筆痕跡"
              >
                <Eraser className="w-4 h-4" />
              </button>
            )}

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            {/* Live Poll trigger */}
            <button
              onClick={onOpenPoll}
              className={`p-1.5 rounded-lg transition relative ${
                isPollOpen
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-indigo-400'
              }`}
              title="現場投票 / 表決"
            >
              <Vote className="w-4 h-4" />
              {isPollOpen && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Danmaku Master Switch */}
            <button
              onClick={() => setInteractiveEnabled(!interactiveEnabled)}
              className={`p-1.5 rounded-lg transition ${
                interactiveEnabled
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              title={interactiveEnabled ? "點擊關閉與會者彈幕與送禮" : "點擊開啟與會者彈幕與送禮"}
            >
              {interactiveEnabled ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Agenda Timer */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/60">
          <span className={`text-xs font-mono font-bold ${isOverTime ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {formatTime(seconds)} / {currentAgenda.allocatedMinutes}:00
          </span>
          {role === 'presenter' && (
            <div className="flex items-center gap-0.5 text-slate-400">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="hover:text-white transition p-0.5"
                title={isRunning ? "暫停計時" : "繼續計時"}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setSeconds(0)}
                className="hover:text-white transition p-0.5"
                title="重新計時"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Lock Sync Button (Presenter only) */}
        {role === 'presenter' ? (
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
              isLocked
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="開啟時，全體與會者螢幕強制跟隨主持人切換"
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? "全員鎖定" : "自由翻閱"}</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>跟隨視角</span>
          </div>
        )}

        {/* Action Items Trigger */}
        <button
          onClick={onOpenActions}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">決議</span>
          {actionItemCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-200 text-[10px] font-bold">
              {actionItemCount}
            </span>
          )}
        </button>

        {/* Admin Console Trigger */}
        {role === 'presenter' && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
            title="開啟會議排程與資料庫管理控制台"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">後台管理</span>
          </button>
        )}
      </div>
    </header>
  );
};
