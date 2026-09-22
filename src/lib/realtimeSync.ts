// Gutierrez Transportes - Realtime Event Bus for Cross-Tab and In-App Synchronization

export type RealtimeEventType = 
  | 'NEW_SALE'
  | 'DRIVER_ACCEPTED'
  | 'TRIP_ASSIGNED'
  | 'WAKE_UP_ALARM'
  | 'ALARM_ACKNOWLEDGED'
  | 'SEATS_UPDATED'
  | 'ROUTE_STOPS_UPDATED';

export interface RealtimeMessage<T = any> {
  id: string;
  type: RealtimeEventType;
  payload: T;
  timestamp: number;
}

type RealtimeListener = (message: RealtimeMessage) => void;

const CHANNEL_NAME = 'gutierrez_transportes_realtime_channel_v3';
const STORAGE_KEY = 'gutierrez_realtime_broadcast_v3';

class RealtimeSyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<RealtimeListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent) => {
            if (event.data && event.data.type) {
              this.notifyListeners(event.data);
            }
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported, using storage fallback', e);
      }

      // Storage event fallback for cross-tab communication
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data && data.type) {
              this.notifyListeners(data);
            }
          } catch (err) {}
        }
      });
    }
  }

  public publish<T = any>(type: RealtimeEventType, payload: T) {
    const message: RealtimeMessage<T> = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: Date.now()
    };

    // 1. Notify local in-memory listeners
    this.notifyListeners(message);

    // 2. Broadcast via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.warn('Error posting to BroadcastChannel', e);
      }
    }

    // 3. Trigger localStorage for other tabs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    } catch (e) {}
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(message: RealtimeMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }
}

export const realtimeBus = new RealtimeSyncBus();
