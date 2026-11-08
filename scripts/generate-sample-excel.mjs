import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const dir = path.join(process.cwd(), 'public', 'uploads', '2026-11');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Sample department report data matching schema
const data = [
  {
    "部門代碼": "資訊部",
    "專案名稱": "雲端資安稽核與 MFA 防護建置",
    "本期預算(萬)": 280,
    "實際花費(萬)": 245,
    "進度(%)": 92,
    "狀態燈號": "正常",
    "負責人": "David",
    "備註說明": "已完成全員多因素認證，符合 ISO27001 規範"
  },
  {
    "部門代碼": "資訊部",
    "專案名稱": "核心 ERP 系統資料庫升級專案",
    "本期預算(萬)": 450,
    "實際花費(萬)": 390,
    "進度(%)": 85,
    "狀態燈號": "正常",
    "負責人": "Kevin",
    "備註說明": "下週末進行資料庫離線切換作業"
  },
  {
    "部門代碼": "行銷部",
    "專案名稱": "Q4 新產品發布會與數位廣告投放",
    "本期預算(萬)": 320,
    "實際花費(萬)": 290,
    "進度(%)": 95,
    "狀態燈號": "正常",
    "負責人": "Sarah",
    "備註說明": "線上參與突破 5,000 人次，轉換率超標 15%"
  },
  {
    "部門代碼": "業務部",
    "專案名稱": "東南亞海外據點拓銷合作計畫",
    "本期預算(萬)": 500,
    "實際花費(萬)": 310,
    "進度(%)": 60,
    "狀態燈號": "注意",
    "負責人": "Alex",
    "備註說明": "越南當地合作經銷商法務簽約審查延宕 2 週"
  },
  {
    "部門代碼": "營運部",
    "專案名稱": "自動化智慧倉儲物流導入二期",
    "本期預算(萬)": 600,
    "實際花費(萬)": 520,
    "進度(%)": 78,
    "狀態燈號": "正常",
    "負責人": "Mark",
    "備註說明": "第一階段測試完成，揀貨效率提升 35%"
  },
  {
    "部門代碼": "人資部",
    "專案名稱": "2027 組織變革與高階主管領導梯隊培訓",
    "本期預算(萬)": 150,
    "實際花費(萬)": 140,
    "進度(%)": 90,
    "狀態燈號": "正常",
    "負責人": "Jessica",
    "備註說明": "高階主管共識營已圓滿結束，產出戰略藍圖"
  },
  {
    "部門代碼": "財務部",
    "專案名稱": "跨國稅務合規申報與移轉訂價規劃",
    "本期預算(萬)": 180,
    "實際花費(萬)": 110,
    "進度(%)": 55,
    "狀態燈號": "注意",
    "負責人": "Amy",
    "備註說明": "會計師事務所查核意見補充中"
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "ReportData");

// Auto column width
const colWidths = [
  { wch: 12 },
  { wch: 38 },
  { wch: 14 },
  { wch: 14 },
  { wch: 10 },
  { wch: 10 },
  { wch: 12 },
  { wch: 45 }
];
worksheet['!cols'] = colWidths;

const excelPath = path.join(dir, 'finance_report.xlsx');
XLSX.writeFile(workbook, excelPath);
console.log(`Created sample excel at ${excelPath}`);
