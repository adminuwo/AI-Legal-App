import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowLeft, Send, Mic, RefreshCcw, History, ChevronRight, 
  AlertTriangle, BookOpen, Check, Compass, HelpCircle, X, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GuideService, APP_CONTEXTS, QUICK_ACTIONS } from '../../services/guideService';

export default function ProductGuideWorkspace() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentContext, setCurrentContext] = useState('General');
  const [isThinking, setIsThinking] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Scroll Tracking
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Initialize Welcome Message
  useEffect(() => {
    const initialWelcome = {
      id: 'welcome',
      sender: 'guide',
      text: `👋 Welcome to AI LEGAL™ Guide!

I am your interactive AI coach for learning every feature of AI LEGAL™.

I can explain any screen, tool, workflow, or legal module step by step.

Choose a Quick Action below or type/ask any question!`,
      timestamp: new Date(),
      suggestions: [
        'How do I create a case in My Matters?',
        'Where is Draft Maker?',
        'How do I upload evidence?'
      ]
    };
    setMessages([initialWelcome]);
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        toast.error("Voice input error. Please try typing.");
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Listening... Speak your question.");
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  // Scroll Helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottomBtn(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 120) {
      setShowScrollBottomBtn(true);
    } else {
      setShowScrollBottomBtn(false);
    }
  };

  // Handle Send Message
  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    setTimeout(scrollToBottom, 50);

    try {
      const guideRes = await GuideService.getResponse(query, currentContext, messages);

      const guideMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'guide',
        text: guideRes.reply,
        navRoute: guideRes.navRoute,
        navLabel: guideRes.navLabel,
        suggestions: guideRes.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, guideMsg]);

      // Save to local storage history
      const savedHistory = JSON.parse(localStorage.getItem('ai_legal_guide_sessions') || '[]');
      savedHistory.unshift({
        id: Date.now().toString(),
        query,
        reply: guideRes.reply,
        context: currentContext,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('ai_legal_guide_sessions', JSON.stringify(savedHistory.slice(0, 30)));

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'guide',
          text: "Sorry, I had trouble generating instructions. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Reset Guide Session
  const handleResetSession = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'guide',
        text: `👋 New Guide Session Started! Ask any question about using AI LEGAL™.`,
        timestamp: new Date(),
        suggestions: [
          'How do I create a case in My Matters?',
          'Where is Draft Maker?',
          'How do I upload evidence?'
        ]
      }
    ]);
    toast.success("Guide session reset!");
  };

  // Render Parsed Message Content (Step Cards, Warning Cards, Direct Navigation)
  const renderMessageContent = (msg) => {
    if (msg.sender === 'user') {
      return (
        <div className="bg-[#C8A34D]/10 dark:bg-[#C8A34D]/20 border border-[#C8A34D]/30 text-slate-900 dark:text-zinc-100 px-4 py-3 rounded-2xl max-w-xl font-medium text-sm shadow-2xs">
          {msg.text}
        </div>
      );
    }

    // Intercepted Guide Limitation Card
    const isLimitation = msg.text.includes('[GUIDE_LIMITATION]');
    if (isLimitation) {
      const cleanText = msg.text.replace('[GUIDE_LIMITATION]', '').trim();
      return (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-2 max-w-2xl border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Guide Limitation</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
            {cleanText}
          </p>
        </div>
      );
    }

    // Step-by-Step Divider Parsing (↓)
    const isStepFlow = msg.text.includes('↓');
    if (isStepFlow) {
      const parts = msg.text.split(/↓\n|↓/);
      return (
        <div className="space-y-3 max-w-2xl">
          {/* Header Line */}
          {parts[0] && (
            <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 leading-relaxed">
              {parts[0].trim()}
            </p>
          )}

          {/* Render Step Cards */}
          <div className="space-y-2.5 pl-1">
            {parts.slice(1).map((stepText, idx) => {
              const trimmed = stepText.trim();
              if (!trimmed) return null;

              const isTip = trimmed.toLowerCase().startsWith('tip') || trimmed.startsWith('•');
              if (isTip) {
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#C8A34D]/10 dark:bg-[#C8A34D]/15 border border-[#C8A34D]/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#C8A34D] uppercase tracking-wider">
                      <Sparkles size={13} />
                      <span>Pro Tip</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {trimmed.replace(/^tip:?\s*/i, '').replace(/^•\s*/, '')}
                    </p>
                  </div>
                );
              }

              const lines = trimmed.split('\n');
              const stepTitle = lines[0];
              const stepBody = lines.slice(1).join('\n');

              return (
                <div key={idx} className="flex gap-3 items-start bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-xl shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#C8A34D] text-[#111111] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">{stepTitle}</h4>
                    {stepBody && (
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-normal leading-relaxed">
                        {stepBody}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Navigation Button */}
          {msg.navRoute && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(msg.navRoute)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>{msg.navLabel || 'Open Feature →'}</span>
                <ExternalLink size={13} />
              </button>
            </div>
          )}
        </div>
      );
    }

    // Standard Text Reply
    return (
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl max-w-2xl space-y-3">
        <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
          {msg.text}
        </p>

        {msg.navRoute && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => navigate(msg.navRoute)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>{msg.navLabel || 'Open Feature →'}</span>
              <ExternalLink size={13} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER */}
      <header className="w-full bg-white dark:bg-[#0d0e16] border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C8A34D]/15 border border-[#C8A34D]/30 flex items-center justify-center text-[#C8A34D]">
              <Sparkles size={17} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <span>AI LEGAL™ Product Guide</span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                Your interactive AI coach for learning every feature of AI LEGAL™.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CONTROLS: History */}
        <div className="flex items-center gap-2.5">
          {/* History Toggle */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#C8A34D] hover:bg-[#C8A34D]/10 rounded-xl transition-colors border border-[#C8A34D]/30 cursor-pointer"
          >
            <History size={13} />
            <span className="hidden sm:inline">Guide History</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER (CHAT AREA + SIDE HISTORY DRAWER) */}
      <div className="flex-1 flex w-full overflow-hidden relative">

        {/* CHAT MESSAGES AREA */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* SCROLLABLE MESSAGES LIST */}
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'guide' && (
                  <div className="w-8 h-8 rounded-xl bg-[#C8A34D] text-[#111111] flex items-center justify-center font-black shrink-0 shadow-xs">
                    <Sparkles size={16} />
                  </div>
                )}

                <div className="space-y-2.5">
                  {renderMessageContent(msg)}

                  {/* Interactive Suggestion Chips */}
                  {msg.sender === 'guide' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-800/90 hover:bg-[#C8A34D]/15 border border-[#C8A34D]/40 hover:border-[#C8A34D] text-[#C8A34D] dark:text-[#E2C275] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 text-left"
                        >
                          💡 {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-[#C8A34D] text-[#111111] flex items-center justify-center font-black shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C8A34D] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#C8A34D] animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-[#C8A34D] animate-bounce [animation-delay:0.3s]" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 ml-1">
                    AI LEGAL™ Guide is formulating instructions...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* FLOATING SCROLL BOTTOM BUTTON */}
          {showScrollBottomBtn && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 px-3.5 py-1.5 bg-[#C8A34D] text-[#111111] font-black rounded-full text-xs shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer z-20"
            >
              <span>↓ New Instructions</span>
            </button>
          )}

          {/* 2. QUICK ACTIONS BAR (PERSISTENT AT BOTTOM ABOVE COMPOSER) */}
          <div className="w-full bg-white/90 dark:bg-[#0d0e16]/90 backdrop-blur-md border-t border-slate-200/60 dark:border-zinc-800/60 px-4 sm:px-6 py-2.5 shrink-0">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-1">Quick Actions:</span>
              {QUICK_ACTIONS.map((qa, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qa.query)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800/80 hover:bg-[#C8A34D]/15 border border-slate-200 dark:border-zinc-700/60 hover:border-[#C8A34D]/50 text-slate-800 dark:text-zinc-200 hover:text-[#C8A34D] rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0"
                >
                  <span>{qa.icon}</span>
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. INPUT COMPOSER */}
          <div className="w-full bg-white dark:bg-[#0d0e16] border-t border-slate-200/80 dark:border-zinc-800/80 p-4 shrink-0 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              
              {/* Voice Recording Waveform / Status */}
              {isRecording && (
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Listening... Speak your question about AI LEGAL™
                  </span>
                </div>
              )}

              {!isRecording && (
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask how to use AI LEGAL™ (e.g., How do I create a case?)..."
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-[#C8A34D] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              )}

              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isRecording 
                    ? 'bg-rose-500 text-white border-rose-600 animate-bounce' 
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-[#C8A34D] border-slate-200 dark:border-zinc-700/60'
                }`}
                title={isRecording ? "Stop Listening" : "Voice Input (Hindi/English/Hinglish)"}
              >
                <Mic size={18} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="p-3 bg-[#C8A34D] hover:bg-[#b08d3b] disabled:opacity-40 text-[#111111] font-black rounded-2xl transition-all shadow-sm cursor-pointer shrink-0 disabled:cursor-not-allowed"
                title="Send Question"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </main>

        {/* 4. HISTORY SIDE DRAWER */}
        {isHistoryOpen && (
          <aside className="w-80 bg-white dark:bg-[#0d0e16] border-l border-slate-200/80 dark:border-zinc-800/80 h-full p-4 flex flex-col shrink-0 z-30 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#C8A34D]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Product Guide History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-2">
              {(() => {
                const sessions = JSON.parse(localStorage.getItem('ai_legal_guide_sessions') || '[]');
                if (sessions.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                      No guide history logged yet.
                    </div>
                  );
                }
                return sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      handleSend(s.query);
                      setIsHistoryOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-left hover:border-[#C8A34D]/50 transition-all cursor-pointer group space-y-1"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#C8A34D] line-clamp-2">
                      {s.query}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{s.context}</span>
                      <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                ));
              })()}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}
