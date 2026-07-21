export interface QueuedOfflineAction {
  id: string;
  type: 'addTransaction' | 'addGoal' | 'addBudget' | 'addSubscription' | 'markBillPaid';
  payload: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'pocketpilot_offline_queue';

export const offlineSyncEngine = {
  getQueue(): QueuedOfflineAction[] {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading offline queue:', e);
    }
    return [];
  },

  enqueue(type: QueuedOfflineAction['type'], payload: any): void {
    const queue = this.getQueue();
    queue.push({
      id: `off-${Date.now()}`,
      type,
      payload,
      timestamp: Date.now(),
    });
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed saving offline queue:', e);
    }
  },

  clearQueue(): void {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (e) {
      console.warn('Failed clearing offline queue:', e);
    }
  },

  async replayQueue(uid: string, handlers: Record<string, Function>): Promise<number> {
    const queue = this.getQueue();
    if (queue.length === 0 || !uid) return 0;

    let replayedCount = 0;
    for (const item of queue) {
      try {
        const handler = handlers[item.type];
        if (handler) {
          await handler(uid, item.payload);
          replayedCount++;
        }
      } catch (err) {
        console.warn(`Failed replaying offline item ${item.id}:`, err);
      }
    }

    this.clearQueue();
    return replayedCount;
  }
};
