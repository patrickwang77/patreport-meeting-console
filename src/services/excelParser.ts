import * as XLSX from 'xlsx';
import { ReportItem } from '../types';

export async function parseExcelReport(fileOrBuffer: File | ArrayBuffer): Promise<ReportItem[]> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames.includes('ReportData') 
    ? 'ReportData' 
    : workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

  // Normalize column names
  return rawRows.map((row) => {
    const dept = row['部門代碼'] || row['部門'] || row['dept'] || '未指定部門';
    const projectName = row['專案名稱'] || row['projectName'] || '未命名專案';
    const budget = Number(row['本期預算(萬)'] || row['預算'] || row['budget'] || 0);
    const actualSpent = Number(row['實際花費(萬)'] || row['花費'] || row['actualSpent'] || 0);
    const progress = Number(row['進度(%)'] || row['進度'] || row['progress'] || 0);
    
    let status: '正常' | '注意' | '落後' = '正常';
    const rawStatus = String(row['狀態燈號'] || row['狀態'] || row['status'] || '');
    if (rawStatus.includes('紅') || rawStatus.includes('落後') || rawStatus.toLowerCase().includes('red')) {
      status = '落後';
    } else if (rawStatus.includes('黃') || rawStatus.includes('注意') || rawStatus.toLowerCase().includes('yellow')) {
      status = '注意';
    }

    const owner = row['負責人'] || row['owner'] || '未指定';
    const remark = row['備註說明'] || row['備註'] || row['remark'] || '';

    return {
      dept,
      projectName,
      budget,
      actualSpent,
      progress,
      status,
      owner,
      remark
    };
  });
}

export function exportToExcel(items: ReportItem[], filename: string = 'monthly_report.xlsx') {
  const data = items.map(item => ({
    '部門代碼': item.dept,
    '專案名稱': item.projectName,
    '本期預算(萬)': item.budget,
    '實際花費(萬)': item.actualSpent,
    '進度(%)': item.progress,
    '狀態燈號': item.status,
    '負責人': item.owner,
    '備註說明': item.remark || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ReportData');
  XLSX.writeFile(wb, filename);
}
