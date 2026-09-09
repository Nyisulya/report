import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { UNIVERSITY_STRUCTURES } from '../data/universityStructures';

export default function StructureModal({
  isOpen,
  onClose,
  currentUniversityId = 'dit',
  onSelectUniversity
}) {
  const [selectedUniId, setSelectedUniId] = useState(currentUniversityId);

  if (!isOpen) return null;

  const currentStructure = UNIVERSITY_STRUCTURES.find(u => u.id === selectedUniId) || UNIVERSITY_STRUCTURES[0];

  const handleApply = () => {
    onSelectUniversity(selectedUniId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2e2e] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <span>Mwongozo Rasmi wa Ripoti ya IPT (Toleo la 2026)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Toleo Rasmi 2026
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Mwongozo rasmi na viwango vya kitaaluma vya ripoti ya mafunzo kwa vitendo (IPT).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Left University Selector, Right Structure Outline */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* University Cards Column */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#2e2e2e] p-4 space-y-2.5 overflow-y-auto bg-[#121212]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Chuo Kikuu / Taasisi
            </span>
            {UNIVERSITY_STRUCTURES.map(uni => {
              const isSelected = uni.id === selectedUniId;
              const isDIT = uni.id === 'dit';
              const isActive = uni.id === currentUniversityId;

              return (
                <button
                  key={uni.id}
                  onClick={() => setSelectedUniId(uni.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-[#252525] border-amber-500/60 shadow-lg'
                      : 'bg-[#181818] border-[#2a2a2a] hover:bg-[#202020] text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: uni.crestColor }}
                      />
                      <span className="font-bold text-xs text-slate-100">
                        {uni.shortName}
                      </span>
                      {isDIT ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                          Toleo Rasmi 2026
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#222222] text-slate-400 font-medium border border-[#333]">
                          Inakuja 2027
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {uni.name}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      📍 {uni.location}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Structure Inspector Column */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#161616] space-y-5">
            {selectedUniId !== 'dit' && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-semibold mb-0.5">
                    Muundo wa Upanuzi (Inakuja Mwakani 2027)
                  </strong>
                  <span>
                    Muundo huu wa <strong>{currentStructure.name}</strong> umekamilika kiufundi na utafunguliwa rasmi toleo lijalo. Kwa sasa mfumo unatumia muundo rasmi wa kitaifa wa ripoti ya mafunzo kwa vitendo (IPT).
                  </span>
                </div>
              </div>
            )}

            {/* University Hero Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#202020] to-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {currentStructure.badge}
                </span>
                <h4 className="text-base font-bold text-slate-100 mt-0.5">
                  {currentStructure.name}
                </h4>
                <p className="text-xs text-slate-400 italic">
                  "{currentStructure.motto}"
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                style={{ backgroundColor: currentStructure.crestColor }}
              >
                {currentStructure.shortName.split(' ')[0]}
              </div>
            </div>

            {/* Formatting Guidelines */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Kanuni za Uandishi (Official Formatting Rules)</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <FormatBadge label="Font Style" value={currentStructure.formatting.font} />
                <FormatBadge label="Font Size" value={currentStructure.formatting.fontSize} />
                <FormatBadge label="Line Spacing" value={currentStructure.formatting.lineSpacing} />
                <FormatBadge label="Left Margin (Binding)" value={currentStructure.formatting.leftMargin} />
              </div>
            </div>

            {/* Preliminary Pages */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Kurasa za Mwanzo (Preliminaries)</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStructure.preliminaries.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2c2c2c] flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded bg-[#2a2a2a] text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {p.roman}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{p.title}</div>
                      <div className="text-[10px] text-slate-400">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters Breakdown */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mpangilio wa Sura (Chapters 1 to 5)</span>
              </h5>
              <div className="space-y-2">
                {currentStructure.chapters.map(chap => (
                  <div key={chap.number} className="p-3 rounded-lg bg-[#1e1e1e] border border-[#2c2c2c] space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        CHAPTER {chap.number}:
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {chap.title}
                      </span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {chap.sections.map(sec => (
                        <div key={sec.code} className="text-[11px] text-slate-300 flex items-center space-x-2">
                          <span className="font-mono text-slate-400 font-semibold">{sec.code}</span>
                          <span>{sec.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#2e2e2e] bg-[#141414] flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            Chuo kilichochaguliwa: <strong className="text-slate-200">{currentStructure.name}</strong>
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition"
            >
              Funga
            </button>
            {selectedUniId === 'dit' ? (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Tumia Muundo Rasmi wa IPT</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedUniId('dit');
                  onSelectUniversity('dit');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] border border-[#444] text-slate-300 hover:text-white font-medium text-xs flex items-center space-x-1.5 transition"
              >
                <span>Rudi Kwenye Muundo Rasmi wa IPT (2026)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormatBadge({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-[#1e1e1e] border border-[#2c2c2c]">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">{value}</div>
    </div>
  );
}
