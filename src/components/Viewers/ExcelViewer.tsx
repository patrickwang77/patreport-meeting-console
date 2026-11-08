import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  DollarSign,
  Briefcase,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { ReportItem } from '../../types';
import { parseExcelReport, exportToExcel } from '../../services/excelParser';

interface ExcelViewerProps {
  src: string;
  title: string;
  schema?: string;
  description?: string;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ src, title, schema, description }) => {
  const [data, setData] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default Excel on mount or when src changes
  const loadDefaultExcel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`無法載入 Excel 檔案 (${res.status})`);
      const buffer = await res.arrayBuffer();
      const parsed = await parseExcelReport(buffer);
      setData(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '讀取 Excel 失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultExcel();
  }, [src]);

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleCustomFile(files[0]);
    }
  };

  const handleCustomFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert('請上傳 .xlsx, .xls 或 .csv 格式的 Excel 檔案');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseExcelReport(file);
      setData(parsed);
    } catch (err: any) {
      setError('解析自訂檔案失敗：' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute Metrics
  const totalBudget = data.reduce((acc, cur) => acc + cur.budget, 0);
  const totalSpent = data.reduce((acc, cur) => acc + cur.actualSpent, 0);
  const burnRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const greenCount = data.filter(d => d.status === '正常').length;
  const yellowCount = data.filter(d => d.status === '注意').length;
  const redCount = data.filter(d => d.status === '落後').length;

  const depts = Array.from(new Set(data.map(d => d.dept)));

  // Filtered Items
  const filteredData = data.filter(item => {
    const matchesQuery = item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.remark && item.remark.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || item.dept === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesQuery && matchesDept && matchesStatus;
  });

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-slate-950 p-4 overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel 數據 Schema 剖析
            </span>
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
            {schema && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <CheckCircle className="w-3 h-3" />
                Schema: {schema}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleCustomFile(e.target.files[0])}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium shadow-sm"
            title="拖曳或點選上傳新的 Excel 測試檔案"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>拖入 / 替換 Excel</span>
          </button>
          <button
            onClick={loadDefaultExcel}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="重設為預設月報資料"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => exportToExcel(filteredData, 'filtered_report.xlsx')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="匯出目前篩選結果為 Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">總提報預算</div>
            <div className="text-base font-bold text-white">${totalBudget.toLocaleString()} 萬</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">已執行支出 (執行率)</div>
            <div className="text-base font-bold text-emerald-400">
              ${totalSpent.toLocaleString()} 萬 <span className="text-xs font-normal">({burnRate}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">列管專案總數</div>
            <div className="text-base font-bold text-slate-200">{data.length} 個工作項目</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-around">
          <div className="text-center">
            <div className="text-[10px] text-emerald-400 font-medium">正常</div>
            <div className="text-base font-bold text-emerald-400">{greenCount}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-amber-400 font-medium">注意</div>
            <div className="text-base font-bold text-amber-400">{yellowCount}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-rose-400 font-medium">落後</div>
            <div className="text-base font-bold text-rose-400">{redCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋專案、負責人、備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3 h-3" />
            <span>部門:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">全部部門 ({data.length})</option>
            {depts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">全部狀態</option>
            <option value="正常">正常 (綠燈)</option>
            <option value="注意">注意 (黃燈)</option>
            <option value="落後">落後 (紅燈)</option>
          </select>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative flex flex-col shadow-inner">
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-950/80 border-2 border-dashed border-indigo-400 z-30 flex flex-col items-center justify-center backdrop-blur-sm">
            <UploadCloud className="w-12 h-12 text-indigo-300 animate-bounce mb-2" />
            <h4 className="text-base font-bold text-white">放開滑鼠以立即載入自訂 Excel 檔案</h4>
            <p className="text-xs text-indigo-200 mt-1">系統將自動依照 Schema 剖析並產生動態報表</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            讀取並剖析 Excel 數據中...
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-rose-400 text-xs">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span>{error}</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            查無符合條件的專案資料
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/90 text-slate-300 sticky top-0 z-10 select-none border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">部門</th>
                  <th className="py-2.5 px-3 font-semibold">專案 / 業務名稱</th>
                  <th className="py-2.5 px-3 font-semibold text-right">預算 (萬)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">實支 (萬)</th>
                  <th className="py-2.5 px-3 font-semibold">進度</th>
                  <th className="py-2.5 px-3 font-semibold text-center">狀態</th>
                  <th className="py-2.5 px-3 font-semibold">負責人</th>
                  <th className="py-2.5 px-3 font-semibold">重點備註說明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {row.dept}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{row.projectName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">${row.budget}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-medium">${row.actualSpent}</td>
                    <td className="py-2.5 px-3 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 w-8">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        row.status === '正常'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : row.status === '注意'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{row.owner}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs" title={row.remark}>
                      {row.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
