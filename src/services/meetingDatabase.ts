import { MeetingConfig, ActionItem } from '../types';
import defaultMeeting from '../../content/meetings/2026-11-exec.json';

const STORAGE_KEY_MEETINGS = 'patreport_db_meetings';
const STORAGE_KEY_ACTIONS = 'patreport_db_actions';

const initialMeetings: MeetingConfig[] = [
  {
    ...(defaultMeeting as MeetingConfig),
    status: 'active'
  },
  {
    meetingId: '2026-10-exec',
    title: '2026 年 10 月份跨部門管制作業會',
    date: '2026-10-12',
    chairperson: 'Patrick Wang',
    totalBudgetMinutes: 60,
    status: 'archived',
    agendas: [
      {
        id: 'agenda-10-1',
        index: 1,
        title: 'Q3 營運綜效總檢討與各處績效評比',
        department: '營運規劃室',
        presenter: 'Kevin',
        allocatedMinutes: 30,
        contentType: 'html',
        contentSrc: '/custom-dashboards/action-review.html',
        description: '回顧第三季各部門目標達成率'
      },
      {
        id: 'agenda-10-2',
        index: 2,
        title: '資安 MFA 導入期中報告',
        department: '資訊技術部',
        presenter: 'David',
        allocatedMinutes: 30,
        contentType: 'pdf',
        contentSrc: '/uploads/2026-11/it_security.pdf',
        description: 'MFA 導入進度查核'
      }
    ]
  },
  {
    meetingId: '2026-12-strategy',
    title: '2026 年度戰略總結與 2027 預算初審會',
    date: '2026-12-15',
    chairperson: 'Patrick Wang',
    totalBudgetMinutes: 90,
    status: 'draft',
    agendas: [
      {
        id: 'agenda-12-1',
        index: 1,
        title: '2027 年度資本支出 (CAPEX) 初編草案',
        department: '財務處',
        presenter: 'Amy (財務長)',
        allocatedMinutes: 45,
        contentType: 'excel_table',
        contentSrc: '/uploads/2026-11/finance_report.xlsx',
        schema: 'department-report',
        description: '審查各單位提報之年度設備與專案預算'
      },
      {
        id: 'agenda-12-2',
        index: 2,
        title: '2027 組織架構變革宣導',
        department: '人資處',
        presenter: 'Jessica',
        allocatedMinutes: 45,
        contentType: 'html',
        contentSrc: '/custom-dashboards/kpi-overview.html',
        description: '高階主管共識營後續架構宣導'
      }
    ]
  }
];

const initialActions: ActionItem[] = [
  {
    id: 'act-1',
    meetingId: '2026-11-exec',
    dept: '財務部',
    title: '財務處於 11/15 前確認各處 Q4 預算挪移與保留款名冊',
    owner: 'Amy (財務處)',
    dueDate: '11/15',
    status: 'in_progress'
  },
  {
    id: 'act-2',
    meetingId: '2026-11-exec',
    dept: '資訊部',
    title: 'IT 部門完成海外據點 VPN 安全連線設定與白名單稽核',
    owner: 'David (資訊部)',
    dueDate: '11/22',
    status: 'pending'
  },
  {
    id: 'act-3',
    meetingId: '2026-10-exec',
    dept: '資訊部',
    title: '完成全公司各部門多因素驗證 (MFA) 導入',
    owner: 'David (IT)',
    dueDate: '10/28',
    status: 'completed'
  },
  {
    id: 'act-4',
    meetingId: '2026-10-exec',
    dept: '營運部',
    title: '供應鏈廠商 ESG 綠色盤查問卷第一批催收',
    owner: 'Kevin (營運)',
    dueDate: '10/31',
    status: 'completed'
  }
];

export const meetingDatabase = {
  getMeetings(): MeetingConfig[] {
    if (typeof window === 'undefined') return initialMeetings;
    const raw = localStorage.getItem(STORAGE_KEY_MEETINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(initialMeetings));
      return initialMeetings;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialMeetings;
    }
  },

  saveMeeting(meeting: MeetingConfig): void {
    const list = this.getMeetings();
    const index = list.findIndex(m => m.meetingId === meeting.meetingId);
    if (index >= 0) {
      list[index] = meeting;
    } else {
      list.unshift(meeting);
    }
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(list));
  },

  deleteMeeting(id: string): void {
    const list = this.getMeetings().filter(m => m.meetingId !== id);
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(list));
  },

  getActionItems(): ActionItem[] {
    if (typeof window === 'undefined') return initialActions;
    const raw = localStorage.getItem(STORAGE_KEY_ACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(initialActions));
      return initialActions;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialActions;
    }
  },

  saveActionItem(action: ActionItem): void {
    const list = this.getActionItems();
    const index = list.findIndex(a => a.id === action.id);
    if (index >= 0) {
      list[index] = action;
    } else {
      list.unshift(action);
    }
    localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(list));
  },

  deleteActionItem(id: string): void {
    const list = this.getActionItems().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(list));
  },

  exportBackupJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      meetings: this.getMeetings(),
      actionItems: this.getActionItems()
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.meetings)) {
        localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(data.meetings));
      }
      if (Array.isArray(data.actionItems)) {
        localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(data.actionItems));
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};
