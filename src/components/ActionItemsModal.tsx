import React, { useState } from 'react';
import { X, Plus, CheckCircle2, Circle, Clock, User, Trash2 } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ActionItem[];
  onAddAction: (item: Omit<ActionItem, 'id'>) => void;
  onToggleAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  role: 'presenter' | 'attendee';
}

export const ActionItemsModal: React.FC<ActionItemsModalProps> = ({
  isOpen,
  onClose,
  actionItems,
  onAddAction,
  onToggleAction,
  onDeleteAction,
  role
}) => {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddAction({
      title: title.trim(),
      owner: owner.trim() || '未指定',
      dueDate: dueDate || '下週會議前',
      status: 'pending'
    });
    setTitle('');
    setOwner('');
    setDueDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>會議決議與行動列管事項 (Action Items)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                {actionItems.length} 項
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">即時紀錄各議題討論決議，全員即時同步查閱。</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Form (Presenter only or enabled) */}
        {role === 'presenter' && (
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950/60 border-b border-slate-800">
            <div className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide">
              ＋ 新增本場決議事項
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="決議內容或交辦工作..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:col-span-3 bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="主辦單位 / 負責人"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="預定完成期限 (如 11/20)"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>加入決議</span>
              </button>
            </div>
          </form>
        )}

        {/* Action Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {actionItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              目前尚無新增的列管事項
            </div>
          ) : (
            actionItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                  item.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => onToggleAction(item.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-400 transition"
                  title="切換完成狀態"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <h4 className={`text-xs sm:text-sm font-semibold ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {item.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      負責: {item.owner}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      期限: {item.dueDate}
                    </span>
                  </div>
                </div>

                {role === 'presenter' && (
                  <button
                    onClick={() => onDeleteAction(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
