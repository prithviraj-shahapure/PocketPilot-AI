import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Pin, 
  Download, 
  Trash2, 
  Search, 
  Zap, 
  HelpCircle,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { copilotEngine, CopilotResponse } from '../../services/copilot/copilotEngine';
import { scenarioEngine } from '../../services/copilot/scenarioEngine';
import { conversationStore, ConversationThread, CopilotMessage } from '../../services/copilot/conversationStore';

export const AICopilotPanel: React.FC = () => {
  const { transactions, budgets, goals, subscriptions, totalBalance, monthlyExpense } = useFinance();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [threads, setThreads] = useState<ConversationThread[]>(() => conversationStore.getThreads());
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-default');
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active thread with user message
    const updatedThreads = threads.map((t) => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          messages: [...t.messages, userMsg],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    conversationStore.saveThreads(updatedThreads);
    setInputText('');
    setIsTyping(true);

    // Evaluate response using copilotEngine or scenarioEngine
    setTimeout(() => {
      let res: CopilotResponse;
      const lower = textToSend.toLowerCase();

      if (lower.includes('iphone') || lower.includes('buy') || lower.includes('macbook')) {
        res = scenarioEngine.simulatePurchase('Apple Device', 80000, totalBalance, monthlyExpense, goals, user.currency);
      } else if (lower.includes('save') && (lower.includes('5000') || lower.includes('more') || lower.includes('extra'))) {
        res = scenarioEngine.simulateExtraSavings(5000, goals, user.currency);
      } else {
        res = copilotEngine.processQuery(textToSend, transactions, budgets, goals, subscriptions, user.currency);
      }

      const copilotMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metricCard: res.metricCard,
        scenarioResult: res.scenarioResult,
        suggestions: res.suggestions,
      };

      const finalThreads = updatedThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            messages: [...t.messages, copilotMsg],
          };
        }
        return t;
      });

      setThreads(finalThreads);
      conversationStore.saveThreads(finalThreads);
      setIsTyping(false);
    }, 600);
  };

  const handleExportText = () => {
    if (!activeThread) return;
    const txt = conversationStore.exportThreadToText(activeThread);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeThread.title.replace(/\s+/g, '_')}_Copilot.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = activeThread?.messages.filter((m) =>
    searchQuery ? m.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  ) || [];

  return (
    <>
      {/* Floating Glassmorphic Orb Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-brand-600/90 text-white shadow-2xl shadow-brand-500/50 hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all border border-brand-400/40 flex items-center justify-center cursor-pointer group"
        title="Open AI Financial Copilot"
      >
        <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          AI Copilot
        </span>
      </button>

      {/* Side Panel Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full shadow-2xl animate-slide-left">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between glass-panel">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">AI Financial Copilot</h3>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-Time Firestore Synced
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={isMuted ? 'Unmute Voice Output' : 'Mute Voice Output'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={handleExportText}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Export Conversation"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Search Bar */}
            <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 relative">
              <Search className="w-3.5 h-3.5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversation thread..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
              />
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none shadow-lg'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Metric Card Callout */}
                    {m.metricCard && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-brand-500/30 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{m.metricCard.label}</span>
                          <strong className="text-sm font-extrabold text-white">{m.metricCard.value}</strong>
                        </div>
                        {m.metricCard.subtext && (
                          <span className="text-[10px] text-brand-400 font-semibold">{m.metricCard.subtext}</span>
                        )}
                      </div>
                    )}

                    {/* Scenario Result Simulation Card */}
                    {m.scenarioResult && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                          Scenario Analysis
                        </span>
                        <h5 className="text-xs font-bold text-white">{m.scenarioResult.title}</h5>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {m.scenarioResult.impacts.map((imp: any, idx: number) => (
                            <div key={idx} className="bg-slate-950 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-400 block">{imp.label}</span>
                              <strong className={imp.color}>{imp.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 px-1">{m.timestamp}</span>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                      {m.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug)}
                          className="px-2.5 py-1 rounded-full bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">Analyzing Firestore financial engine...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Voice Waveform Animation UI (Voice Ready) */}
            {isVoiceActive && (
              <div className="px-4 py-2 bg-brand-950/40 border-t border-brand-500/40 flex items-center justify-between text-xs text-brand-300">
                <span className="font-bold flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-brand-400 animate-pulse" /> Listening for voice command...
                </span>
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1 bg-brand-400 h-2 animate-bounce" />
                  <span className="w-1 bg-brand-400 h-4 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-brand-400 h-3 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 glass-panel">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isVoiceActive ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Toggle Voice Input (Voice Ready)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Ask financial copilot..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
