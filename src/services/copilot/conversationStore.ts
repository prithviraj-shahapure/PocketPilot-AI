export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  metricCard?: any;
  scenarioResult?: any;
  suggestions?: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  pinned: boolean;
  messages: CopilotMessage[];
  updatedAt: string;
}

const STORAGE_KEY = 'pocketpilot_copilot_threads';

export const conversationStore = {
  getThreads(): ConversationThread[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading copilot threads:', e);
    }
    return [
      {
        id: 'thread-default',
        title: 'Financial Health & Savings Query',
        pinned: true,
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-init',
            sender: 'copilot',
            text: 'Hello! I am your **PocketPilot AI Financial Copilot**.\nHow can I assist your financial journey today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              'How much did I spend this month?',
              'Where can I save money?',
              'What is my Financial Health Score?',
              'Can I afford a MacBook?',
            ],
          },
        ],
      },
    ];
  },

  saveThreads(threads: ConversationThread[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.warn('Failed saving copilot threads:', e);
    }
  },

  togglePin(threadId: string): ConversationThread[] {
    const threads = this.getThreads().map((t) =>
      t.id === threadId ? { ...t, pinned: !t.pinned } : t
    );
    this.saveThreads(threads);
    return threads;
  },

  deleteThread(threadId: string): ConversationThread[] {
    const threads = this.getThreads().filter((t) => t.id !== threadId);
    this.saveThreads(threads);
    return threads;
  },

  exportThreadToText(thread: ConversationThread): string {
    let output = `# ${thread.title} - PocketPilot AI Copilot Export\n\n`;
    thread.messages.forEach((m) => {
      output += `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n\n`;
    });
    return output;
  }
};
