# Patreport Console - 定期會議控場與議程導航平台

專為跨部門定期月報、決策會議、專案管制作業設計的全端互動戰情平台。

## 特色功能

1. **三合一多格式內容導航**：
   - **HTML 互動戰情室**：將原本繁雜的 PPT 轉為高穿透性、可切換維度的圖表（整合 Tailwind CSS 與 Chart.js）。
   - **Excel Schema 自動剖析**：各部門繳交的標準 Excel，免手動整理，拖入即時生成 KPI 指標、執行率計算、警示燈號與可篩選表格。
   - **PDF 簡報安全內嵌**：其他部門交付之 PDF 簡報可直接在平台內瀏覽與全螢幕導航。
2. **雙角色即時控場同步 (Presenter & Attendee)**：
   - **主持人模式**：配備議題切換、議程倒數計時器、全員畫面強制鎖定跟隨、會議決議 (Action Items) 隨選速記。
   - **與會者模式**：預設跟隨主持人視角切換議題，或切換為自由查閱模式。
   - 本地測試使用 `BroadcastChannel` 即時跨視窗同步，上線後可無縫對接 Firebase Firestore。

## 目錄結構說明

```text
├── content/
│   ├── meetings/                # 會議劇本配置（設定議程順序、時間、展示內容）
│   │   └── 2026-11-exec.json
│   └── templates/               # 給各部門填報的標準空白 Excel 範本
│       └── monthly_report_template.xlsx
│
├── schemas/                     # 資料欄位定義規範 (JSON Schema)
│   └── department-report.schema.json
│
├── public/                      # 靜態資源與外部檔案
│   ├── custom-dashboards/       # 自製動態 HTML 頁面 (免開 PPT)
│   │   ├── action-review.html   # 上月決議管制作業追蹤
│   │   └── kpi-overview.html    # 年度重點戰略專案戰情室 (含動態圖表)
│   └── uploads/2026-11/         # 各部門繳交的簡報與試算表
│       ├── finance_report.xlsx  # 財務處提供的測試 Excel
│       └── it_security.pdf      # 資訊部提供的測試 PDF
│
├── src/                         # 平台核心應用原始碼 (React + TypeScript + Tailwind)
│   ├── components/              # 控場列、側邊議程樹、三種檔案檢視器、行動決議彈窗
│   └── services/                # Excel 剖析器、即時同步 Channel
│
├── firebase.json                # Firebase Hosting 部署設定檔
└── .firebaserc                  # 綁定 Firebase 專案代碼 (patreport)
```

## 本機快速啟動 (Local PoC)

```bash
npm run dev
```

* 本機網址：`http://localhost:5173/`
* **雙視窗同步測試**：打開兩個瀏覽器視窗，一個切換為「主持人」，另一個切換為「與會者」。主持人切換下一議題或新增會議決議時，與會者視窗將即時毫秒同步！

## 替換自訂資料方式

1. **更換議程與時間**：修改 `content/meetings/2026-11-exec.json`。
2. **替換 Excel 資料**：
   * 方式 A（動態即時測試）：在畫面第二個議題「Excel 數據」，直接把你的 `.xlsx` 檔案拖入瀏覽器中，即可即時剖析！
   * 方式 B（固定靜態檔案）：將新檔案命名為 `finance_report.xlsx` 放進 `public/uploads/2026-11/`。
3. **更換 HTML 簡報**：直接修改或在 `public/custom-dashboards/` 新增 HTML 檔案，並在議程 JSON 中指向它。

## 正式部署至 Firebase (`patreport`)

當本地測試滿意後，在終端機執行：

```bash
npm run build
firebase deploy --only hosting
```
即會自動將編譯後的 `dist/` 上傳發布至你的 `https://patreport.web.app`！
