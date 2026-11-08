import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

interface AttendeeCheerBarProps {
  onSendDanmaku: (text: string) => void;
  onSendGift: (emoji: string, label: string) => void;
  enabled: boolean;
  deptName?: string;
}

export const AttendeeCheerBar: React.FC<AttendeeCheerBarProps> = ({
  onSendDanmaku,
  onSendGift,
  enabled,
  deptName: _deptName = '與會成員'
}) => {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!enabled) {
    return (
      <div className="absolute bottom-3 right-4 z-30 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-[11px] text-slate-500 select-none">
        主持人已關閉現場彈幕與互動
      </div>
    );
  }

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendDanmaku(text.trim());
    setText('');
  };

  const gifts = [
    { emoji: '👏', label: '熱烈鼓掌' },
    { emoji: '👍', label: '全力支持' },
    { emoji: '☕', label: '送上咖啡' },
    { emoji: '🎉', label: '慶祝達標' },
    { emoji: '🚀', label: '專案起飛' }
  ];

  return (
    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
      {/* Quick Reaction Pills */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-xl flex items-center gap-1 backdrop-blur-md">
        {gifts.map((g) => (
          <button
            key={g.emoji}
            onClick={() => onSendGift(g.emoji, g.label)}
            className="hover:scale-125 active:scale-95 p-1.5 rounded-xl hover:bg-slate-800 transition duration-150 text-lg"
            title={`送出 ${g.label}`}
          >
            {g.emoji}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Danmaku Input Toggle / Form */}
        {isExpanded ? (
          <form onSubmit={handleSendText} className="flex items-center gap-1.5 pr-1">
            <input
              type="text"
              placeholder="發送現場彈幕..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-400 w-44"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition"
              title="發送"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-400 hover:text-white px-1.5"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>發彈幕</span>
          </button>
        )}
      </div>
    </div>
  );
};
