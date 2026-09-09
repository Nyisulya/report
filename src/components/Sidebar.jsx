import React from 'react';
import { 
  FileText,
  PenSquare, 
  BookOpen, 
  Trash2, 
  PanelLeftClose
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleAuthButton';

export default function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onOpenProfile,
  onOpenLogbook,
  metadata,
  googleUser,
  onGoogleLogin
}) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        ${isOpen ? 'w-64 sm:w-68 translate-x-0' : '-translate-x-full md:w-0 md:translate-x-0 overflow-hidden'}
        bg-[#1e1f20] border-r border-[#282a2c]
        flex flex-col justify-between select-none
        transition-all duration-300 ease-in-out shrink-0
      `}>
        {/* Top Header & Actions */}
        <div className="p-3.5 pb-2 shrink-0">
          {/* Brand Header: Field Report */}
          <div className="flex items-center justify-between px-1 mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-[15px] text-slate-100 tracking-tight">
                Field Report
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#282a2c] text-slate-400 hover:text-slate-200 transition"
              title="Funga Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Pill Button */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-full bg-[#282a2c] hover:bg-[#333537] text-slate-200 text-xs font-medium transition shadow-sm border border-[#37393b]/40 group"
            title="Anza chat mpya"
          >
            <PenSquare className="w-4 h-4 text-slate-300 group-hover:scale-105 transition-transform" />
            <span className="text-slate-200 text-xs font-medium">New chat</span>
          </button>

          {/* Weekly Logbook Pill Button */}
          {onOpenLogbook && (
            <button
              onClick={() => {
                onOpenLogbook();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full mt-2 flex items-center justify-between px-4 py-2.5 rounded-full bg-[#282a2c] hover:bg-[#333537] text-slate-200 text-xs font-medium transition shadow-sm border border-[#37393b]/40 group"
              title="Fungua Logbook ya Kila Wiki"
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4 text-slate-300 group-hover:scale-105 transition-transform" />
                <span className="text-slate-200 text-xs font-medium">Logbook</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Wiki 1-10</span>
            </button>
          )}
        </div>

        {/* Recents Section Header */}
        <div className="px-4.5 pt-2 pb-1 shrink-0">
          <span className="text-[11px] font-medium text-slate-400 select-none">
            Recents
          </span>
        </div>

        {/* History List (Minimalist, Single-Line, Compact) */}
        <div className="flex-1 px-2.5 overflow-y-auto space-y-0.5 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500">
              <p className="text-xs">Hakuna chats za hivi karibuni</p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const displayTitle = s.title || (s.studentName ? `${s.studentName} - ${s.firm || 'Field'}` : 'Ripoti ya Field (IPT)');

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative w-full flex items-center justify-between px-3.5 py-2 rounded-full text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#282a2c] text-white font-medium'
                      : 'text-slate-300 hover:bg-[#282a2c]/60 hover:text-white'
                  }`}
                  title={displayTitle}
                >
                  <span className="text-[13px] truncate flex-1 pr-1 font-normal select-none">
                    {displayTitle}
                  </span>

                  {/* Subtle Delete Action on Hover */}
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Je, unataka kufuta "${displayTitle}"?`)) {
                          onDeleteSession(s.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0 ml-1"
                      title="Futa chat hii"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom User Profile Section: Dynamic based on actual Login State */}
        <div className="p-3 border-t border-[#282a2c] bg-[#1e1f20] shrink-0">
          {googleUser ? (
            <button
              onClick={() => {
                onOpenProfile();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center space-x-2.5 p-1 -ml-1 rounded-full hover:bg-[#282a2c] text-left transition group"
              title="Fungua Profaili ya Mtumiaji"
            >
              {googleUser.picture ? (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-blue-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.name || 'G')}`;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#4285f4] text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm">
                  {(googleUser.name || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                  {googleUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {googleUser.email}
                </div>
              </div>
            </button>
          ) : (
            <div className="w-full">
              <GoogleSignInButton 
                onLoginSuccess={onGoogleLogin} 
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs shadow-sm transition active:scale-98"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
