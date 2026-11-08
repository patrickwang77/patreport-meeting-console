import { SyncMessage } from '../types';

class MeetingSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('patreport_meeting_sync');
      this.channel.onmessage = (event) => {
        this.notify(event.data);
      };
    }

    // Fallback: localStorage storage events for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'patreport_sync_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notify(data);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public send(msg: SyncMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('patreport_sync_event', JSON.stringify(msg));
    }
  }

  public subscribe(cb: (msg: SyncMessage) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(msg: SyncMessage) {
    this.listeners.forEach(cb => cb(msg));
  }
}

export const syncService = new MeetingSyncChannel();
