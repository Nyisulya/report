import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Menu, 
  FileText, 
  Check, 
  Copy, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  Zap,
  Building2,
  Wrench,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  Eye,
  Columns,
  Maximize2,
  FileDown,
  Plus,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendChatMessageToAI, DEFAULT_MODEL } from '../services/aiEngine.js';
import GoogleAuthButton from './GoogleAuthButton.jsx';
import { analyticsService } from '../services/analyticsService.js';

export default function ChatView({
  metadata,
  onSaveMetadata,
  reportData,
  apiKey,
  activeModel = DEFAULT_MODEL,
  onOpenSidebar,
  onNewChat,
  onOpenDocumentPreview,
  onAddSectionToChapter2,
  onUpdateChapterSections,
  onUpdatePreliminaries,
  onOpenProfile,
  onOpenStructures,
  onOpenLogbook,
  onOpenAdmin,
  onSelectChapter,
  isSplitView,
  onToggleSplitView,
  onExportDocx,
  isExporting,
  googleUser,
  onGoogleLogin,
  onGoogleLogout,
  onSyncGoogleProfile
}) {
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('dit_chat_messages_v4') || localStorage.getItem('dit_chat_messages_v3');
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(msg => ({
            ...msg,
            text: typeof msg.text === 'string'
              ? msg.text
                  .replace(/\s*\((?:DeepSeek|deepseek)[^)]*\)/gi, '')
                  .replace(/DeepSeek\s*(?:v4(?:\.1)?\s*Flash|v4|chat|reasoner)?/gi, 'AI Engine')
              : msg.text
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved chat:', e);
      }
    }

    const uniName = reportData?.metadata?.universityName || 'DIT';
    const hasStudentName = !!reportData?.metadata?.studentName;

    if (hasStudentName) {
      return [
        {
          id: 'welcome_back',
          sender: 'ai',
          text: `Karibu tena ${reportData.metadata.studentName}! Ripoti yako ya Field (IPT) inaendelea kuandaliwa na kusawazishwa moja kwa moja kwenye karatasi ya A4 hapo pembeni. 📄\n\nTuanze kuandaa au kuboresha Sura ipi sasa?`,
          chips: [
            '📖 Logbook ya Wiki',
            'Chapter 1: Company Overview',
            'Chapter 2: Technical Duties Undertaken',
            'Chapter 3: Skills & Methodology',
            'Chapter 4: Gaps in Skills & Tech',
            'Chapter 5: Conclusions & Recommendations'
          ]
        }
      ];
    }

    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: `Habari ndugu mwanafunzi! Karibu sana kwenye **Field Report AI Assistant**. 🎓\n\nNipo hapa kukuandikia ripoti yako rasmi ya **Industrial Practical Training (IPT)** kuanzia mwanzo hadi mwisho kulingana na viwango rasmi vya kitaaluma. Kila kitu kinachoandikwa kinaingia moja kwa moja kwenye **A4 Document hapo pembeni**.\n\nTuanze kwa kukamilisha **Cover Page** yako: **Jina lako kamili la mwanafunzi unaitwa nani?**`,
        chips: ['FELICIAN JOHN MUSSA', 'CHILLU JOHN MWITA', 'JUMA ALLY SELEMANI', 'NEEMA A. MWAKYUSA']
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Persist chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dit_chat_messages_v4', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat messages:', e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle user sending a message
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    setInputVal('');
    setErrorMsg(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 1. Append user message to thread
    const userMsg = { id: `user_${Date.now()}`, sender: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // 2. Call real DeepSeek AI directly
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessageToAI({
        messages: updatedMessages,
        reportData,
        apiKey: apiKey || '',
        modelName: activeModel || DEFAULT_MODEL
      });

      // Process dynamic actions returned by DeepSeek
      if (aiResponse.actionData) {
        const ad = aiResponse.actionData;

        if (ad.metadata || (ad.action === 'update_metadata' && ad.data)) {
          const metaObj = ad.metadata || ad.data;
          onSaveMetadata(metaObj);
        }

        if (ad.preliminaries && onUpdatePreliminaries) {
          Object.entries(ad.preliminaries).forEach(([field, val]) => {
            if (val) onUpdatePreliminaries(field, val);
          });
        }

        if ((ad.chapterId && ad.sections) || (ad.action === 'update_chapter' && ad.data?.chapterId)) {
          const chapId = ad.chapterId || ad.data?.chapterId;
          const secs = ad.sections || ad.data?.sections;
          if (chapId && secs) {
            onUpdateChapterSections(chapId, secs);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            onSelectChapter(chapId);
          }
        }

        if (ad.task || (ad.action === 'add_task' && ad.data)) {
          const taskObj = ad.task || ad.data;
          onAddSectionToChapter2(taskObj);
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          onSelectChapter('chap2');
        }
      }

      // Generate contextual chips if AI did not provide any
      let finalChips = aiResponse.chips || [];
      if (finalChips.length === 0) {
        const lowerReply = aiResponse.text.toLowerCase();
        if (lowerReply.includes('chapter') || lowerReply.includes('sura')) {
          finalChips = [
            'Chapter 1: Company Overview',
            'Chapter 2: Technical Duties',
            'Chapter 3: Skills & Methodology',
            'Chapter 4: Gaps in Skills & Tech',
            'Chapter 5: Recommendations'
          ];
        } else {
          finalChips = ['Ongeza Kazi Nyingine', 'Tazama Document (A4)', 'Nenda Chapter Inayofuata'];
        }
      }

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponse.text,
        chips: finalChips,
        actionData: aiResponse.actionData
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('DeepSeek generation error:', err);
      setErrorMsg(err.message || 'Hitilafu ya mtandao katika kuwasiliana na mfumo wa AI.');

      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `Samahani, kuna hitilafu ya mtandao (${err.message || 'Network Error'}). Tafadhali jaribu tena.`,
          chips: ['Jaribu Tena', 'Chapter 1: Overview', 'Chapter 2: Technical Tasks']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const [activeAnnouncement, setActiveAnnouncement] = useState(() => analyticsService.getAnnouncement());

  // Periodically refresh announcement banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncement(analyticsService.getAnnouncement());
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Global subtle shortcut for Admin: Ctrl + Shift + A or Alt + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        if (onOpenAdmin) onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] text-slate-100 overflow-hidden relative">
      {/* Global System Announcement Banner (If active) */}
      {activeAnnouncement?.active && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between z-20 border-b shadow-sm ${
          activeAnnouncement.type === 'warning'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
            : activeAnnouncement.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            : 'bg-blue-500/15 border-blue-500/30 text-blue-200'
        }`}>
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-semibold shrink-0">Tangazo la Mfumo:</span>
            <span className="truncate">{activeAnnouncement.message}</span>
          </div>
          <button
            onClick={() => setActiveAnnouncement(prev => ({ ...prev, active: false }))}
            className="p-1 text-slate-400 hover:text-white rounded ml-2 shrink-0"
            title="Funga Tangazo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header - Clean & Minimal */}
      <header className="h-12 px-3 pt-2 flex items-center justify-between shrink-0 z-10 bg-transparent">
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-[#282828]/60 transition"
            title="Fungua / Funga Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Document Preview Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={onOpenDocumentPreview}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-[#282828]/60 transition"
            title="Tazama A4 Document"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 w-full mx-auto space-y-5 max-w-3xl">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-inner">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-xl space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-[#2a2a2a] text-slate-100 border border-[#383838] rounded-tl-none shadow-lg'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Quick Document Status Banner */}
                {msg.actionData && (
                  <div className="mt-2.5 pt-2 border-t border-[#383838] flex items-center justify-between">
                    <span className="text-[11px] text-amber-300 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {msg.actionData.metadata || msg.actionData.action === 'update_metadata'
                          ? 'Imejazwa kwenye Cover Page'
                          : msg.actionData.task || msg.actionData.action === 'add_task'
                          ? 'Imeandikwa kwenye Chapter 2 (Tasks)'
                          : 'Imeandikwa kwenye Document'}
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        const tab = (msg.actionData.metadata || msg.actionData.action === 'update_metadata')
                          ? 'cover'
                          : (msg.actionData.task || msg.actionData.action === 'add_task')
                          ? 'chap2'
                          : msg.actionData.chapterId || 'cover';
                        onSelectChapter(tab);
                      }}
                      className="px-2.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[11px] flex items-center space-x-1 transition"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>Kagua Kwenye Docs 📄</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Quick Action Chips */}
              {msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {msg.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (chip.includes('Logbook') && onOpenLogbook) {
                          onOpenLogbook();
                        } else {
                          handleSend(chip);
                        }
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#1c1c1c] hover:bg-[#282828] border border-[#383838] hover:border-amber-500/50 text-xs text-slate-300 hover:text-amber-300 transition shadow-sm text-left flex items-center space-x-1"
                    >
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse bg-[#1a1a1a] p-3 rounded-xl border border-[#2e2e2e] w-fit">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>AI inaandika moja kwa moja kwenye Document yako...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="p-3.5 border-t border-[#2e2e2e] bg-[#1a1a1a]/95 backdrop-blur shrink-0">
        <div className="max-w-3xl mx-auto flex items-end space-x-2 bg-[#262626] rounded-2xl border border-[#3a3a3a] p-2 focus-within:border-amber-500/80 transition-all shadow-xl">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ongea na AI (k.m. Jina langu ni..., tulifanya LAN cabling...)..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-28 leading-relaxed"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold transition shrink-0 shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-1.5">
          Maudhui yote ya kiufundi yanaandikwa moja kwa moja kwenye Document yako hapo kulia.
        </p>
      </div>
    </div>
  );
}
