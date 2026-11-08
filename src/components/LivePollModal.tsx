import React, { useState } from 'react';
import { Vote, X, Check, BarChart2, Plus, Trash2 } from 'lucide-react';
import { PollState } from '../types';

interface LivePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: PollState | null;
  onStartPoll: (question: string, options: string[]) => void;
  onVote: (optionId: string) => void;
  onClosePoll: () => void;
  role: 'presenter' | 'attendee';
}

export const LivePollModal: React.FC<LivePollModalProps> = ({
  isOpen,
  onClose,
  poll,
  onStartPoll,
  onVote,
  onClosePoll,
  role
}) => {
  const [question, setQuestion] = useState('是否同意第 2 議題所提之 Q4 預算追加調整案？');
  const [options, setOptions] = useState(['同意 (贊成)', '不同意 (反對)', '修正後再行審議']);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onStartPoll(question.trim(), options.filter(o => o.trim().length > 0));
    setHasVoted(false);
    setVotedOptionId(null);
  };

  const handleCastVote = (optId: string) => {
    if (hasVoted) return;
    onVote(optId);
    setHasVoted(true);
    setVotedOptionId(optId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">現場表決與即時投票 (Live Poll)</h3>
              <p className="text-[11px] text-slate-400">全員即時連線投票，結果毫秒計算公開。</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {poll && poll.isOpen ? (
            /* Active Poll View */
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                  進行中表決
                </span>
                <h4 className="text-base font-bold text-white mt-2">{poll.question}</h4>
                <div className="text-xs text-slate-400 mt-1">總投票數: {poll.totalVotes} 票</div>
              </div>

              {/* Options & Results */}
              <div className="space-y-2.5">
                {poll.options.map((opt) => {
                  const percent = poll.totalVotes > 0 
                    ? Math.round((opt.votes / poll.totalVotes) * 100) 
                    : 0;
                  const isSelected = votedOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !hasVoted && handleCastVote(opt.id)}
                      className={`relative overflow-hidden p-3.5 rounded-xl border transition select-none ${
                        hasVoted
                          ? 'border-slate-700 bg-slate-800/40 cursor-default'
                          : 'border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/20 cursor-pointer active:scale-[0.99]'
                      } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-950/40' : ''}`}
                    >
                      {/* Vote Progress Bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-600/25 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />

                      <div className="relative flex items-center justify-between text-xs sm:text-sm z-10">
                        <span className="font-semibold text-slate-100 flex items-center gap-2">
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                          {opt.label}
                        </span>
                        <span className="font-mono text-xs text-slate-300 font-bold">
                          {opt.votes} 票 ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasVoted && (
                <div className="text-center text-xs text-emerald-400 font-medium">
                  ✓ 您的選票已送出，感謝參與表決！
                </div>
              )}

              {role === 'presenter' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onClosePoll}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold transition"
                  >
                    結束本場表決
                  </button>
                </div>
              )}
            </div>
          ) : role === 'presenter' ? (
            /* Presenter Create Poll Form */
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">表決議題名稱</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">表決選項</label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className="flex-1 bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOptions([...options, `選項 ${options.length + 1}`])}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 增加選項
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                立即發起現場表決
              </button>
            </form>
          ) : (
            /* Attendee Waiting */
            <div className="text-center py-8 text-slate-400 text-xs">
              <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              目前主持人尚未開啟任何投票議題
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
