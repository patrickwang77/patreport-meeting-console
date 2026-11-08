export type ContentType = 'html' | 'pdf' | 'excel_table' | 'media';

export interface AgendaItem {
  id: string;
  index: number;
  title: string;
  department: string;
  presenter: string;
  allocatedMinutes: number;
  contentType: ContentType;
  contentSrc: string;
  schema?: string;
  description?: string;
}

export interface MeetingConfig {
  meetingId: string;
  title: string;
  date: string;
  chairperson: string;
  totalBudgetMinutes: number;
  agendas: AgendaItem[];
  status?: 'draft' | 'active' | 'archived';
}

export interface ReportItem {
  dept: string;
  projectName: string;
  budget: number;
  actualSpent: number;
  progress: number;
  status: '正常' | '注意' | '落後';
  owner: string;
  remark?: string;
}

export interface ActionItem {
  id: string;
  meetingId?: string;
  title: string;
  owner: string;
  dept?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface PollState {
  id: string;
  question: string;
  options: PollOption[];
  isOpen: boolean;
  totalVotes: number;
}

export interface DanmakuItem {
  id: string;
  text: string;
  color?: string;
  top: number;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  width: number;
}

export interface SyncMessage {
  type: 
    | 'AGENDA_CHANGE' 
    | 'TIMER_TICK' 
    | 'SYNC_REQUEST' 
    | 'SYNC_RESPONSE' 
    | 'ACTION_UPDATE'
    | 'POINTER_MOVE'
    | 'DRAW_STROKE'
    | 'DRAW_CLEAR'
    | 'POLL_UPDATE'
    | 'POLL_VOTE'
    | 'DANMAKU_SEND'
    | 'GIFT_SEND'
    | 'INTERACTIVE_TOGGLE';
  currentIndex?: number;
  timerSeconds?: number;
  isLocked?: boolean;
  actionItems?: ActionItem[];
  pointer?: { x: number; y: number; active: boolean; tool: 'laser' | 'spotlight' | 'pen' | 'none' };
  stroke?: DrawingStroke;
  poll?: PollState | null;
  danmaku?: DanmakuItem;
  gift?: { emoji: string; label: string; sender: string };
  interactiveEnabled?: boolean;
  timestamp: number;
}
