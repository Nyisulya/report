import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import DocumentPreview from './components/DocumentPreview';
import DocumentDrawer from './components/DocumentDrawer';
import ProfileSetupModal from './components/ProfileSetupModal';
import StructureModal from './components/StructureModal';
import WeeklyLogbookModal from './components/WeeklyLogbookModal';
import { INITIAL_REPORT_STATE } from './data/ditTemplates';
import { UNIVERSITY_STRUCTURES, getUniversityStructure } from './data/universityStructures';
import { exportDITReportToDocx } from './services/docxExporter';
import { synchronizeReport } from './services/reportSynchronizer';
import { getStoredGoogleUser, saveGoogleUser, removeGoogleUser } from './services/googleAuth';

export default function App() {
  // Google Authentication State
  const [googleUser, setGoogleUser] = useState(() => getStoredGoogleUser());

  const handleGoogleLogin = (userData) => {
    setGoogleUser(userData);
    saveGoogleUser(userData);
    setReportData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        studentName: prev.metadata?.studentName || userData.name,
        email: userData.email || prev.metadata?.email,
        avatar: userData.picture || prev.metadata?.avatar
      }
    }));
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    removeGoogleUser();
  };

  // Listen for Google OAuth redirect callback (when full browser tab redirects back)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      if (token) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(profile => {
            const userData = {
              name: profile.name || 'Google User',
              email: profile.email || '',
              picture: profile.picture || '',
              sub: profile.sub || '',
              verified: true,
              loginMethod: 'google_redirect'
            };
            handleGoogleLogin(userData);
            window.history.replaceState(null, '', window.location.pathname);
          })
          .catch(err => console.error('OAuth redirect processing error:', err));
      }
    }
  }, []);

  const handleSyncGoogleProfile = (userData) => {
    if (!userData) return;
    setReportData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        studentName: userData.name,
        email: userData.email,
        avatar: userData.picture
      }
    }));
    alert(`Jina "${userData.name}" na barua pepe vimewekwa kwenye jalada la ripoti!`);
  };

  // Session tracking
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return localStorage.getItem('dit_active_session_id') || 'session_default';
  });

  // Multi-session history list
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('dit_report_sessions_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse sessions:', e);
      }
    }
    return [
      {
        id: 'session_default',
        title: 'Ripoti ya IPT',
        studentName: '',
        firm: '',
        universityName: 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)',
        updatedAt: Date.now(),
        reportData: INITIAL_REPORT_STATE
      }
    ];
  });

  // Load initial report state from LocalStorage or active session
  const [reportData, setReportData] = useState(() => {
    const saved = localStorage.getItem('dit_report_clean_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved report data:', e);
      }
    }
    return INITIAL_REPORT_STATE;
  });

  // Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem('deepseek_model') || 'deepseek-v4-flash');

  // UI Drawer & Modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeChapterTab, setActiveChapterTab] = useState('cover');
  const [isSplitView, setIsSplitView] = useState(true);

  // Auto-save active report data and update sessions history
  useEffect(() => {
    localStorage.setItem('dit_report_clean_v3', JSON.stringify(reportData));
    localStorage.setItem('dit_active_session_id', currentSessionId);

    // Update active session in history list
    setSessions(prevSessions => {
      const student = reportData.metadata?.studentName || '';
      const firm = reportData.metadata?.firm || reportData.metadata?.companyName || '';
      const uni = reportData.metadata?.universityName || 'DIT';
      
      let title = 'Ripoti ya Field';
      if (student && firm) {
        title = `${student} - ${firm}`;
      } else if (student) {
        title = `${student} - Ripoti`;
      } else if (firm) {
        title = `Ripoti ya ${firm}`;
      }

      const existingIndex = prevSessions.findIndex(s => s.id === currentSessionId);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prevSessions];
        updated[existingIndex] = {
          ...updated[existingIndex],
          title,
          studentName: student,
          firm,
          universityName: uni,
          updatedAt: Date.now(),
          reportData
        };
      } else {
        updated = [
          {
            id: currentSessionId,
            title,
            studentName: student,
            firm,
            universityName: uni,
            updatedAt: Date.now(),
            reportData
          },
          ...prevSessions
        ];
      }

      localStorage.setItem('dit_report_sessions_v1', JSON.stringify(updated));
      return updated;
    });
  }, [reportData, currentSessionId]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('deepseek_api_key', key);
  };

  const handleSelectModel = (model) => {
    setActiveModel(model);
    localStorage.setItem('deepseek_model', model);
  };

  const handleSaveMetadata = (newMetadata) => {
    setReportData(prev => synchronizeReport({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...newMetadata
      }
    }));
  };

  const handleSelectUniversity = (uniId) => {
    const uni = getUniversityStructure(uniId);
    setReportData(prev => {
      const updatedChapters = (uni.chapters || []).map((uniChap, idx) => {
        const prevChap = prev.chapters?.[idx];
        return {
          id: `chap${uniChap.number}`,
          number: uniChap.number,
          title: uniChap.title,
          sections: prevChap ? prevChap.sections : []
        };
      });

      return synchronizeReport({
        ...prev,
        metadata: {
          ...prev.metadata,
          universityId: uni.id,
          universityName: uni.name,
          module: uni.moduleTitle || (uni.id === 'ifm' ? 'FIELD AND PROJECT WORK PRACTICE' : 'INDUSTRIAL PRACTICAL TRAINING (IPT)')
        },
        chapters: updatedChapters
      });
    });
  };

  const handleUpdatePreliminaries = (field, value) => {
    setReportData(prev => synchronizeReport({
      ...prev,
      preliminaries: {
        ...prev.preliminaries,
        [field]: value
      }
    }));
  };

  const handleUpdateSection = (chapterId, sectionId, newContentOrUpdates) => {
    setReportData(prev => synchronizeReport({
      ...prev,
      chapters: prev.chapters.map(chap => {
        if (chap.id !== chapterId) return chap;
        return {
          ...chap,
          sections: chap.sections.map(sec => {
            if (sec.id !== sectionId) return sec;
            if (typeof newContentOrUpdates === 'string') {
              return { ...sec, content: newContentOrUpdates };
            }
            return { ...sec, ...newContentOrUpdates };
          })
        };
      })
    }));
  };

  const handleUpdateChapterSections = (chapterId, newSections) => {
    setReportData(prev => synchronizeReport({
      ...prev,
      chapters: prev.chapters.map(chap => {
        if (chap.id !== chapterId) return chap;
        return {
          ...chap,
          sections: newSections
        };
      })
    }));
  };

  const handleDeleteSection = (chapterId, sectionId) => {
    setReportData(prev => synchronizeReport({
      ...prev,
      chapters: prev.chapters.map(chap => {
        if (chap.id !== chapterId) return chap;
        return {
          ...chap,
          sections: chap.sections.filter(sec => sec.id !== sectionId)
        };
      })
    }));
  };

  const handleAddSectionToChapter2 = ({ title, content, persona, tools, vivaTip, image, imageCaption }) => {
    setReportData(prev => {
      const chap2 = prev.chapters.find(c => c.id === 'chap2');
      const nextIndex = (chap2?.sections.filter(s => s.code.startsWith('2.2') || s.code.startsWith('2.')).length || 0) + 1;
      const newSection = {
        id: `s2_2_${Date.now()}`,
        code: `2.2.${nextIndex}`,
        title: title || `Practical Task ${nextIndex}`,
        content,
        persona,
        tools,
        vivaTip,
        image: image || null,
        imageCaption: imageCaption || null
      };

      return synchronizeReport({
        ...prev,
        chapters: prev.chapters.map(chap => {
          if (chap.id !== 'chap2') return chap;
          return {
            ...chap,
            sections: [...chap.sections, newSection]
          };
        })
      });
    });
  };

  const handleSaveLogbook = (newLogbook) => {
    setReportData(prev => {
      const existing = prev.logbooks || [];
      const updatedLogbooks = [
        ...existing.filter(l => l.weekNumber !== newLogbook.weekNumber),
        newLogbook
      ].sort((a, b) => a.weekNumber - b.weekNumber);

      return synchronizeReport({
        ...prev,
        logbooks: updatedLogbooks
      });
    });
  };

  const handleSyncLogbookToReport = (logbook) => {
    if (!logbook) return;
    setReportData(prev => {
      const chap2 = prev.chapters.find(c => c.id === 'chap2');
      const nextIndex = (chap2?.sections.filter(s => s.code.startsWith('2.2') || s.code.startsWith('2.')).length || 0) + 1;

      const combinedContent = `${logbook.weeklySummary || ''}\n\nKey Daily Technical Milestones Executed:\n` +
        (logbook.days || []).map(d => `• ${d.day}: ${d.task}`).join('\n\n');

      const allTools = Array.from(new Set((logbook.days || []).flatMap(d => d.tools || [])));

      const newSection = {
        id: `s2_2_logbook_w${logbook.weekNumber}_${Date.now()}`,
        code: `2.2.${nextIndex}`,
        title: `${logbook.title || `Technical Work Done in Week ${logbook.weekNumber}`}`,
        content: combinedContent,
        persona: 'methodological',
        tools: allTools,
        vivaTip: {
          question: `What primary technical tasks and safety precautions were applied during ${logbook.title}?`,
          expectedAnswer: logbook.skillsGained || 'Executed structured technical duties in alignment with engineering safety standards.'
        }
      };

      let updatedChap3Sections = prev.chapters.find(c => c.id === 'chap3')?.sections || [];
      if (logbook.skillsGained) {
        const existing32 = updatedChap3Sections.find(s => s.code === '3.2');
        if (existing32) {
          updatedChap3Sections = updatedChap3Sections.map(s => 
            s.code === '3.2' 
              ? { ...s, content: `${s.content}\n\nWeek ${logbook.weekNumber} Competencies:\n${logbook.skillsGained}` } 
              : s
          );
        } else {
          updatedChap3Sections = [
            ...updatedChap3Sections,
            {
              id: `s3_2_w${logbook.weekNumber}`,
              code: `3.2.${logbook.weekNumber}`,
              title: `Competencies Mastered in Week ${logbook.weekNumber}`,
              content: logbook.skillsGained
            }
          ];
        }
      }

      return synchronizeReport({
        ...prev,
        chapters: prev.chapters.map(chap => {
          if (chap.id === 'chap2') {
            return {
              ...chap,
              sections: [...chap.sections, newSection]
            };
          }
          if (chap.id === 'chap3') {
            return {
              ...chap,
              sections: updatedChap3Sections
            };
          }
          return chap;
        })
      });
    });
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      await exportDITReportToDocx(reportData);
    } catch (err) {
      console.error('Export error:', err);
      alert('Imeshindwa kutengeneza Word document. Tafadhali jaribu tena.');
    } finally {
      setIsExporting(false);
    }
  };

  // Switch to an existing history session
  const handleSelectSession = (sessionId) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    if (targetSession && targetSession.reportData) {
      setCurrentSessionId(sessionId);
      setReportData(targetSession.reportData);
      setIsSidebarOpen(false);
    }
  };

  // Delete a session from history
  const handleDeleteSession = (sessionId) => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    localStorage.setItem('dit_report_sessions_v1', JSON.stringify(remaining));

    if (sessionId === currentSessionId) {
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
        setReportData(remaining[0].reportData || INITIAL_REPORT_STATE);
      } else {
        handleNewChat();
      }
    }
  };

  // Start a new report session
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'Ripoti Mpya ya IPT',
      studentName: '',
      firm: '',
      universityName: 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)',
      updatedAt: Date.now(),
      reportData: INITIAL_REPORT_STATE
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('dit_report_sessions_v1', JSON.stringify(updated));
    setCurrentSessionId(newId);
    setReportData(INITIAL_REPORT_STATE);
    localStorage.removeItem('dit_chat_messages_v3');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121] text-slate-100 font-sans">
      {/* Left Sidebar (Specialized strictly for History) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onOpenProfile={() => {
          setIsSidebarOpen(false);
          setIsProfileOpen(true);
        }}
        onOpenLogbook={() => {
          setIsSidebarOpen(false);
          setIsLogbookModalOpen(true);
        }}
        metadata={reportData.metadata}
        googleUser={googleUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main Workspace: Side-by-Side Split View on Desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: DeepSeek Conversational AI View */}
        <div className={`flex flex-col h-full transition-all duration-300 ${
          isSplitView ? 'w-full lg:w-[48%] border-r border-[#2e2e2e]' : 'w-full'
        }`}>
          <ChatView
            key={currentSessionId}
            metadata={reportData.metadata}
            onSaveMetadata={handleSaveMetadata}
            reportData={reportData}
            apiKey={apiKey}
            activeModel={activeModel}
            onOpenSidebar={() => setIsSidebarOpen(prev => !prev)}
            onNewChat={handleNewChat}
            onOpenDocumentPreview={() => setIsDocDrawerOpen(true)}
            onAddSectionToChapter2={handleAddSectionToChapter2}
            onUpdateChapterSections={handleUpdateChapterSections}
            onUpdatePreliminaries={handleUpdatePreliminaries}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenStructures={() => setIsStructureModalOpen(true)}
            onOpenLogbook={() => setIsLogbookModalOpen(true)}
            onSelectChapter={(tab) => setActiveChapterTab(tab)}
            isSplitView={isSplitView}
            onToggleSplitView={() => setIsSplitView(!isSplitView)}
            onExportDocx={handleExportDocx}
            isExporting={isExporting}
            googleUser={googleUser}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onSyncGoogleProfile={handleSyncGoogleProfile}
          />
        </div>

        {/* Right Side: Live A4 Document Viewer */}
        {isSplitView && (
          <div className="hidden lg:flex flex-1 flex-col h-full bg-[#121212] p-3 overflow-hidden">
            <DocumentPreview
              reportData={reportData}
              activeTab={activeChapterTab}
              onTabChange={setActiveChapterTab}
              onUpdatePreliminaries={handleUpdatePreliminaries}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onExportDocx={handleExportDocx}
              isExporting={isExporting}
            />
          </div>
        )}
      </div>

      {/* Slide-over Full Document Drawer for Mobile/Tablet */}
      <DocumentDrawer
        isOpen={isDocDrawerOpen}
        onClose={() => setIsDocDrawerOpen(false)}
        reportData={reportData}
        onUpdatePreliminaries={handleUpdatePreliminaries}
        onUpdateSection={handleUpdateSection}
        onDeleteSection={handleDeleteSection}
        onExportDocx={handleExportDocx}
        isExporting={isExporting}
        activeChapterTab={activeChapterTab}
      />

      {/* Modals */}
      <StructureModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        currentUniversityId={reportData.metadata.universityId || 'dit'}
        onSelectUniversity={handleSelectUniversity}
      />

      <ProfileSetupModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        metadata={reportData.metadata}
        onSaveMetadata={handleSaveMetadata}
        googleUser={googleUser}
        onSyncGoogleProfile={handleSyncGoogleProfile}
        onLogout={handleGoogleLogout}
        onLogin={handleGoogleLogin}
      />

      <WeeklyLogbookModal
        isOpen={isLogbookModalOpen}
        onClose={() => setIsLogbookModalOpen(false)}
        metadata={reportData.metadata}
        logbooks={reportData.logbooks || []}
        onSaveLogbook={handleSaveLogbook}
        onSyncToReport={handleSyncLogbookToReport}
        apiKey={apiKey}
        activeModel={activeModel}
      />
    </div>
  );
}
