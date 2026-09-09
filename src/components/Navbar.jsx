import React from 'react';
import { 
  FileDown, 
  Settings, 
  UserCheck, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  Printer,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({
  metadata,
  onOpenProfile,
  onOpenSettings,
  onExportDocx,
  onPrint,
  isExporting,
  hasApiKey,
  activeModel
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
            <GraduationCap className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Field Report AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                IPT Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Technical Report Assistant • Standard Guidelines
            </p>
          </div>
        </div>

        {/* Student Profile Quick View */}
        <div 
          onClick={onOpenProfile}
          className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-800/80"
          title="Click to edit student & company details"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-semibold text-xs border border-blue-500/30">
            {metadata?.studentName ? metadata.studentName.charAt(0) : 'S'}
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200 truncate max-w-[160px]">
              {metadata?.studentName || 'Student Name'}
            </div>
            <div className="text-slate-400 text-[11px] truncate max-w-[160px]">
              {metadata?.companyName || 'Host Company'}
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {metadata?.level === 'degree' ? 'BEng NTA 8' : 'OD NTA 6'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Settings (Gemini API) */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all ${
              hasApiKey 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Configure Gemini API Key & Model"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">
              {hasApiKey ? activeModel || 'Gemini Active' : 'AI Settings'}
            </span>
          </button>

          {/* Student Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-medium flex items-center space-x-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Print / PDF preview */}
          <button
            onClick={onPrint}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 text-xs font-medium flex items-center space-x-1.5 transition-all"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden lg:inline">Print / PDF</span>
          </button>

          {/* Export to Word .docx */}
          <button
            onClick={onExportDocx}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Export Word (.docx)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
