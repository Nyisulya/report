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
  X,
  BookCheck,
  PenTool,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendChatMessageToAI, DEFAULT_MODEL } from '../services/aiEngine.js';
import { autoExtractCoverMetadata } from '../services/reportSynchronizer.js';
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
  onSyncAllLogbooks,
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
  const [logbookMode, setLogbookMode] = useState(() => {
    return localStorage.getItem('dit_logbook_mode') || null;
  });

  const [messages, setMessages] = useState(() => {
    const savedMode = localStorage.getItem('dit_logbook_mode');
    if (!savedMode) return [];

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
    return [];
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

  const handleSelectLogbookMode = async (mode) => {
    setLogbookMode(mode);
    try {
      localStorage.setItem('dit_logbook_mode', mode);
    } catch (e) {}

    if (mode === 'filled') {
      const logbooksCount = reportData?.logbooks?.length || 0;
      if (logbooksCount > 0) {
        if (onSyncAllLogbooks) {
          onSyncAllLogbooks(reportData.logbooks);
        }
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        await handleSend('Nishajaza logbook tayari kwenye mfumo huu. Nisaidie kuhamisha taarifa zote kwenye Ripoti yangu ya chuo.');
      } else {
        await handleSend('Nishajaza logbook tayari, nataka kuweka taarifa zake kwenye ripoti yangu.');
      }
    } else {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      await handleSend('Sijajaza logbook kwenye mfumo huu, nataka tuanze kuandaa ripoti yangu ya chuo kuanzia mwanzo hatua kwa hatua.');
    }
  };

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

    // Immediate smart client-side metadata extraction (ensures zero loss of user-provided details)
    const newlyExtracted = autoExtractCoverMetadata(text, reportData?.metadata || {});
    let currentMetadata = reportData?.metadata || {};
    let hasMetaChanges = false;
    for (const [k, v] of Object.entries(newlyExtracted)) {
      if (v && v !== currentMetadata[k]) {
        currentMetadata = { ...currentMetadata, [k]: v };
        hasMetaChanges = true;
      }
    }
    if (hasMetaChanges) {
      onSaveMetadata(currentMetadata);
    }

    // 2. Call real DeepSeek AI directly
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessageToAI({
        messages: updatedMessages,
        reportData: { ...reportData, metadata: currentMetadata },
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

      // Keep only focused chips returned by AI for that specific question
      let finalChips = Array.isArray(aiResponse.chips) ? aiResponse.chips : [];

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

      {/* Main Content Area: If no mode selected, show clean welcoming explanation card; otherwise show active chat stream */}
      {!logbookMode ? (
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-6 w-full mx-auto flex items-center justify-center max-w-2xl">
          <div className="w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#262626] to-[#1c1c1c] border border-[#3d3d3d] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Icon */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>Field Report AI Assistant</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    IPT Copilot
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mwongozo rasmi wa kuandaa ripoti kamili ya kitaaluma (Chapter 1 hadi 5) ya kukusanya chuoni.
                </p>
              </div>
            </div>

            {/* Maelezo Mazuri (Clear Explanations) */}
            <div className="p-4 rounded-2xl bg-[#141414]/80 border border-[#2e2e2e] text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-200">
                Habari ndugu mwanafunzi! Karibu kwenye mfumo wako wa kuandaa ripoti ya Field.
              </p>
              <p className="text-slate-400">
                Mfumo huu unakuandalia ripoti kamili inayokidhi vigezo vya chuo chako (A4 Document pembeni). Ili tukusaidie kwa usahihi, tafadhali chagua mojawapo ya vitufe viwili hapa chini kuanza:
              </p>
            </div>

            {/* The 2 Core Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Button 1: Nishajaza Logbook */}
              <button
                type="button"
                onClick={() => handleSelectLogbookMode('filled')}
                className="group relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between bg-[#242424] hover:bg-emerald-500/10 border-[#3a3a3a] hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    <BookCheck className="w-5 h-5" />
                  </div>
                  {(reportData?.logbooks?.length || 0) > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      Wiki {reportData.logbooks.length} Zipo
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-medium">
                      Vuna Data
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition flex items-center justify-between">
                    <span>Nishajaza Logbook</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                    Kazi zako zote za wiki zitahamishwa moja kwa moja kuingia kwenye Chapter 2 na Chapter 3 bila kuanza upya.
                  </p>
                </div>
              </button>

              {/* Button 2: Sijajaza Logbook */}
              <button
                type="button"
                onClick={() => handleSelectLogbookMode('not_filled')}
                className="group relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between bg-[#242424] hover:bg-amber-500/10 border-[#3a3a3a] hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    Hatua kwa Hatua
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition flex items-center justify-between">
                    <span>Sijajaza Logbook</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                    AI itakuhoji maswali mafupi ya kirafiki hatua kwa hatua ili kukuandikia ripoti nzima ya chuo kuanzia mwanzo hadi mwisho.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Chagua mojawapo ya vitufe viwili hapo juu ili kufungua sehemu ya kuandika hapa chini.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Main Chat Stream when mode is active */
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 w-full mx-auto space-y-4 max-w-3xl">
          {/* Active Mode Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#262626] border border-[#383838] shadow-sm text-xs">
            <div className="flex items-center space-x-2 truncate">
              {logbookMode === 'filled' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-semibold text-emerald-300 shrink-0">Hali Yako:</span>
                  <span className="text-slate-300 truncate">Nishajaza Logbook (Uvunaji wa Data za Wiki)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="font-semibold text-amber-300 shrink-0">Hali Yako:</span>
                  <span className="text-slate-300 truncate">Sijajaza Logbook (Kuandika Hatua kwa Hatua)</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setLogbookMode(null);
                setMessages([]);
                try {
                  localStorage.removeItem('dit_logbook_mode');
                  localStorage.removeItem('dit_chat_messages_v4');
                } catch (e) {}
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] shrink-0 ml-2 cursor-pointer transition"
              title="Badili jinsi unavyotaka ripoti iandaliwe"
            >
              Badili Njia
            </button>
          </div>

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
                          if (chip.includes('Nishajaza Logbook')) {
                            handleSelectLogbookMode('filled');
                          } else if (chip.includes('Sijajaza Logbook')) {
                            handleSelectLogbookMode('not_filled');
                          } else if (chip.includes('Logbook') && onOpenLogbook) {
                            onOpenLogbook();
                          } else {
                            handleSend(chip);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#1c1c1c] hover:bg-[#282828] border border-[#383838] hover:border-amber-500/50 text-xs text-slate-300 hover:text-amber-300 transition shadow-sm text-left flex items-center space-x-1 cursor-pointer"
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
      )}

      {/* Input Box Bar */}
      <div className="p-3.5 border-t border-[#2e2e2e] bg-[#1a1a1a]/95 backdrop-blur shrink-0">
        <div className={`max-w-3xl mx-auto flex items-end space-x-2 rounded-2xl border p-2 transition-all shadow-xl ${
          !logbookMode
            ? 'bg-[#202020] border-[#303030] opacity-60'
            : 'bg-[#262626] border-[#3a3a3a] focus-within:border-amber-500/80'
        }`}>
          {!logbookMode && (
            <div className="p-2 text-amber-400/80 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
          )}
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={!logbookMode || isLoading}
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
            placeholder={
              !logbookMode
                ? 'Tafadhali chagua mojawapo ya vitufe vilivyo hapo juu ili uanze...'
                : 'Ongea na AI (k.m. Jina langu ni..., tulifanya LAN cabling...)...'
            }
            className={`flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-28 leading-relaxed ${
              !logbookMode ? 'cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!logbookMode || !inputVal.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold transition shrink-0 shadow disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-1.5">
          {!logbookMode ? (
            <span className="text-amber-400/90 font-medium">
              Chagua kitufe kimoja hapo juu ili ufungue sehemu hii ya kuandika.
            </span>
          ) : (
            'Maudhui yote ya kiufundi yanaandikwa moja kwa moja kwenye Document yako hapo kulia.'
          )}
        </p>
      </div>
    </div>
  );
}
