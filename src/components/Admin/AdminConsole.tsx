import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Circle, 
  Database, 
  Download, 
  Upload, 
  ArrowLeft,
  Filter,
  Search,
  Layers,
  Save,
  X
} from 'lucide-react';
import { MeetingConfig, AgendaItem, ActionItem, ContentType } from '../../types';
import { meetingDatabase } from '../../services/meetingDatabase';

interface AdminConsoleProps {
  onBackToLive: () => void;
  onSelectMeetingForLive: (meeting: MeetingConfig) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onBackToLive,
  onSelectMeetingForLive
}) => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'actions' | 'database'>('meetings');
  const [meetings, setMeetings] = useState<MeetingConfig[]>(meetingDatabase.getMeetings());
  const [actionItems, setActionItems] = useState<ActionItem[]>(meetingDatabase.getActionItems());

  // Meeting Editor Modal State
  const [editingMeeting, setEditingMeeting] = useState<MeetingConfig | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Action Items Filter State
  const [actionSearch, setActionSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Reload data
  const refreshData = () => {
    setMeetings(meetingDatabase.getMeetings());
    setActionItems(meetingDatabase.getActionItems());
  };

  // --- Meeting Actions ---
  const handleOpenCreateMeeting = () => {
    const newMeeting: MeetingConfig = {
      meetingId: 'meeting-' + Date.now(),
      title: '新建立定期月報會議',
      date: new Date().toISOString().split('T')[0],
      chairperson: 'Patrick Wang',
      totalBudgetMinutes: 60,
      status: 'draft',
      agendas: [
        {
          id: 'agenda-1',
          index: 1,
          title: '開會致詞與議程確認',
          department: '執行長室',
          presenter: 'Patrick Wang',
          allocatedMinutes: 10,
          contentType: 'html',
          contentSrc: '/custom-dashboards/action-review.html',
          description: '開場與決議追蹤'
        }
      ]
    };
    setEditingMeeting(newMeeting);
    setIsEditorOpen(true);
  };

  const handleEditMeeting = (m: MeetingConfig) => {
    setEditingMeeting(JSON.parse(JSON.stringify(m)));
    setIsEditorOpen(true);
  };

  const handleDeleteMeeting = (id: string) => {
    if (confirm('確定要刪除這場會議嗎？')) {
      meetingDatabase.deleteMeeting(id);
      refreshData();
    }
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    meetingDatabase.saveMeeting(editingMeeting);
    setIsEditorOpen(false);
    setEditingMeeting(null);
    refreshData();
  };

  // Agenda list operations inside editor
  const handleAddAgendaToMeeting = () => {
    if (!editingMeeting) return;
    const newIndex = editingMeeting.agendas.length + 1;
    const newAgenda: AgendaItem = {
      id: 'agenda-' + Date.now(),
      index: newIndex,
      title: `新增議題 ${newIndex}`,
      department: '財務部',
      presenter: '報告代表',
      allocatedMinutes: 15,
      contentType: 'excel_table',
      contentSrc: '/uploads/2026-11/finance_report.xlsx',
      description: '議題重點說明'
    };
    setEditingMeeting({
      ...editingMeeting,
      agendas: [...editingMeeting.agendas, newAgenda],
      totalBudgetMinutes: editingMeeting.totalBudgetMinutes + 15
    });
  };

  const handleRemoveAgenda = (idx: number) => {
    if (!editingMeeting) return;
    const updated = editingMeeting.agendas.filter((_, i) => i !== idx).map((a, i) => ({ ...a, index: i + 1 }));
    setEditingMeeting({ ...editingMeeting, agendas: updated });
  };

  // --- Action Item Actions ---
  const handleToggleActionStatus = (id: string) => {
    const item = actionItems.find(a => a.id === id);
    if (!item) return;
    const updatedStatus: 'completed' | 'in_progress' = item.status === 'completed' ? 'in_progress' : 'completed';
    const updatedItem = { ...item, status: updatedStatus };
    meetingDatabase.saveActionItem(updatedItem);
    refreshData();
  };

  const handleDeleteAction = (id: string) => {
    meetingDatabase.deleteActionItem(id);
    refreshData();
  };

  // Backup Export
  const handleDownloadBackup = () => {
    const jsonStr = meetingDatabase.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patreport_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (meetingDatabase.importBackupJson(content)) {
        alert('備份資料還原成功！');
        refreshData();
      } else {
        alert('匯入格式不符合，請確認是否為本系統導出之 JSON 備份檔。');
      }
    };
    reader.readAsText(file);
  };

  // Filter actions
  const filteredActions = actionItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(actionSearch.toLowerCase()) ||
                          item.owner.toLowerCase().includes(actionSearch.toLowerCase()) ||
                          (item.dept && item.dept.toLowerCase().includes(actionSearch.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || item.dept === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const completedCount = actionItems.filter(a => a.status === 'completed').length;
  const inProgressCount = actionItems.filter(a => a.status !== 'completed').length;
  const completionRate = actionItems.length > 0 ? Math.round((completedCount / actionItems.length) * 100) : 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回會議演播室</span>
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>會議管理控制台 (Admin Console)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                DB 規格化管理
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">跨會議排程規劃、議程檔案關聯與決議管制資料庫</p>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'meetings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>會議場次排程 ({meetings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'actions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全公司決議管制庫 ({actionItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>資料庫與備份</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* TAB 1: MEETINGS MANAGEMENT */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h2 className="text-lg font-bold text-white">定期會議場次管理庫</h2>
                  <p className="text-xs text-slate-400">維護歷次月報、規劃下月議程、上傳各部門檔案</p>
                </div>
                <button
                  onClick={handleOpenCreateMeeting}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>建立新會議場次</span>
                </button>
              </div>

              {/* Meeting Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((m) => {
                  const statusBadge = 
                    m.status === 'active'
                      ? { label: '演播進行中', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
                      : m.status === 'draft'
                      ? { label: '籌備草稿', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
                      : { label: '歷史歸檔', bg: 'bg-slate-800 text-slate-400 border-slate-700' };

                  return (
                    <div
                      key={m.meetingId}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-sm relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{m.meetingId}</span>
                        </div>

                        <h3 className="text-base font-bold text-white line-clamp-1">{m.title}</h3>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>日期：{m.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>主席：{m.chairperson}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>總時長：{m.totalBudgetMinutes} 分鐘 ({m.agendas.length} 個議題)</span>
                          </div>
                        </div>

                        {/* Agenda mini tags */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
                          {m.agendas.map((a, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              #{a.index} {a.department}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectMeetingForLive(m)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>進入演播</span>
                        </button>
                        <button
                          onClick={() => handleEditMeeting(m)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="編輯會議與議題"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(m.meetingId)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL ACTION ITEMS DATABASE */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h2 className="text-lg font-bold text-white">跨部門會議決議與管制追蹤資料庫</h2>
                  <p className="text-xs text-slate-400">彙整各場會議交辦事項，追蹤跨部門結案率</p>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">列管總項目</div>
                  <div className="text-2xl font-bold text-white mt-1">{actionItems.length} 案</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">推動進行中</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount} 案</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">已落實結案</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{completedCount} 案</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">整體結案率</div>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">{completionRate}%</div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="搜尋決議事項、主辦人、部門..."
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-white pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-lg border border-slate-700"
                  >
                    <option value="ALL">全部部門</option>
                    <option value="資訊部">資訊部</option>
                    <option value="財務部">財務部</option>
                    <option value="營運部">營運部</option>
                    <option value="人資部">人資部</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-lg border border-slate-700"
                  >
                    <option value="ALL">全部狀態</option>
                    <option value="in_progress">推動進行中</option>
                    <option value="completed">已結案</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-12 text-center">狀態</th>
                      <th className="py-3 px-4 font-semibold">主辦部門</th>
                      <th className="py-3 px-4 font-semibold">決議列管事項</th>
                      <th className="py-3 px-4 font-semibold">負責人</th>
                      <th className="py-3 px-4 font-semibold">預定完成日</th>
                      <th className="py-3 px-4 font-semibold">所屬會議</th>
                      <th className="py-3 px-4 font-semibold text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredActions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActionStatus(item.id)}
                            className="hover:scale-110 transition"
                            title="點擊切換結案狀態"
                          >
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-amber-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {item.dept || '跨單位'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-semibold ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{item.owner}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{item.dueDate}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{item.meetingId || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAction(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE & BACKUP */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">資料庫連線與備份管理</h2>
                <p className="text-xs text-slate-400">目前本地 PoC 數據存放於瀏覽器 Storage，上線後對接 Firebase Firestore。</p>
              </div>

              {/* Status Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">資料庫運行狀態：正常 (本地持久化模式)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    目標 Firebase 專案代碼：<code className="text-indigo-400 font-mono">patreport</code> (已配置於 .firebaserc)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">已儲存會議場次</div>
                  <div className="text-xl font-bold text-white">{meetings.length} 場</div>
                </div>
              </div>

              {/* Backup / Export Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">一鍵導出全庫 JSON 備份檔</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    包含所有會議議程、時間、報告人、附件關聯路徑以及全體列管 Action Items。可在不同設備間遷移或存檔備份。
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載完整備份檔 (.json)</span>
                  </button>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">還原 / 匯入 JSON 備份檔</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    選取先前導出之 JSON 檔案，系統將自動比對並覆蓋當前資料庫。
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>選取 JSON 檔案還原</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Meeting Editor Modal */}
      {isEditorOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">編輯會議與議程排程</h3>
                <p className="text-xs text-slate-400 mt-0.5">自訂會議名稱、主席、各部門議題與展示內容載體</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveMeeting} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">會議主題名稱</label>
                  <input
                    type="text"
                    value={editingMeeting.title}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">會議日期</label>
                  <input
                    type="date"
                    value={editingMeeting.date}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, date: e.target.value })}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">會議主席</label>
                  <input
                    type="text"
                    value={editingMeeting.chairperson}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, chairperson: e.target.value })}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">會議狀態</label>
                  <select
                    value={editingMeeting.status || 'draft'}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, status: e.target.value as any })}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
                  >
                    <option value="active">演播進行中 (Active)</option>
                    <option value="draft">籌備草稿 (Draft)</option>
                    <option value="archived">歷史歸檔 (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Agenda Items Section */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      議題列表清單 ({editingMeeting.agendas.length} 個議題)
                    </h4>
                    <p className="text-[11px] text-slate-400">各議題可指定為自訂 HTML、Excel 數據表、PDF 簡報或影音檔</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAgendaToMeeting}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> 增加議題
                  </button>
                </div>

                <div className="space-y-3">
                  {editingMeeting.agendas.map((agenda, idx) => (
                    <div key={agenda.id} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          #{idx + 1} 議題配置
                        </span>
                        {editingMeeting.agendas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAgenda(idx)}
                            className="text-slate-500 hover:text-rose-400 text-xs p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="議題標題"
                          value={agenda.title}
                          onChange={(e) => {
                            const updated = [...editingMeeting.agendas];
                            updated[idx].title = e.target.value;
                            setEditingMeeting({ ...editingMeeting, agendas: updated });
                          }}
                          className="sm:col-span-2 bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                          required
                        />
                        <input
                          type="text"
                          placeholder="報告單位"
                          value={agenda.department}
                          onChange={(e) => {
                            const updated = [...editingMeeting.agendas];
                            updated[idx].department = e.target.value;
                            setEditingMeeting({ ...editingMeeting, agendas: updated });
                          }}
                          className="bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                          required
                        />
                        <input
                          type="text"
                          placeholder="報告人"
                          value={agenda.presenter}
                          onChange={(e) => {
                            const updated = [...editingMeeting.agendas];
                            updated[idx].presenter = e.target.value;
                            setEditingMeeting({ ...editingMeeting, agendas: updated });
                          }}
                          className="bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">內容類型</label>
                          <select
                            value={agenda.contentType}
                            onChange={(e) => {
                              const updated = [...editingMeeting.agendas];
                              updated[idx].contentType = e.target.value as ContentType;
                              setEditingMeeting({ ...editingMeeting, agendas: updated });
                            }}
                            className="w-full bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                          >
                            <option value="html">HTML 動態戰情室</option>
                            <option value="excel_table">Excel 數據自動剖析</option>
                            <option value="pdf">PDF 簡報內嵌</option>
                            <option value="media">多媒體影音</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">附件路徑 / URL</label>
                          <input
                            type="text"
                            value={agenda.contentSrc}
                            onChange={(e) => {
                              const updated = [...editingMeeting.agendas];
                              updated[idx].contentSrc = e.target.value;
                              setEditingMeeting({ ...editingMeeting, agendas: updated });
                            }}
                            className="w-full bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">預算時間 (分鐘)</label>
                          <input
                            type="number"
                            min="1"
                            value={agenda.allocatedMinutes}
                            onChange={(e) => {
                              const updated = [...editingMeeting.agendas];
                              updated[idx].allocatedMinutes = Number(e.target.value) || 5;
                              setEditingMeeting({ ...editingMeeting, agendas: updated });
                            }}
                            className="w-full bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>儲存會議變更</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
