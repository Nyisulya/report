import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Trash2, 
  Plus, 
  BookOpen, 
  Layers, 
  Edit3, 
  HelpCircle,
  Eye,
  Award,
  Sparkles,
  List,
  Image as ImageIcon,
  Printer,
  Upload,
  X,
  FileDown
} from 'lucide-react';
import { buildDynamicTableOfContents, buildDynamicTableOfFigures } from '../services/reportSynchronizer.js';

export default function DocumentPreview({
  reportData,
  activeTab: controlledActiveTab,
  onTabChange,
  onUpdatePreliminaries,
  onUpdateSection,
  onDeleteSection,
  onAddCustomSection,
  onExportDocx,
  isExporting
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('cover');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  const { metadata, preliminaries, chapters } = reportData;
  const totalWords = calculateTotalWords(reportData);
  const dynamicTOC = buildDynamicTableOfContents(reportData);
  const dynamicFigures = buildDynamicTableOfFigures(reportData);
  const uniName = metadata.universityName || 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)';
  const uniAcronym = metadata.universityId ? metadata.universityId.toUpperCase() : 'DIT';

  // Handle local image file upload for a section
  const handleImageUpload = (chapterId, sectionId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdateSection(chapterId, sectionId, {
        image: e.target.result,
        imageCaption: `Setup and execution of ${file.name.replace(/\.[^/.]+$/, "")}`
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] rounded-2xl border border-[#2e2e2e] overflow-hidden shadow-2xl">
      {/* Header & Tabs */}
      <div className="px-4 py-2.5 border-b border-[#2e2e2e] bg-[#141414] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100">
            Live Document (A4)
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {totalWords} Maneno
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] border border-[#383838] text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Chapisha au Hifadhi kama PDF"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Download Word DOCX Button */}
          <button
            onClick={onExportDocx}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/25 transition disabled:opacity-50"
            title="Pakua ripoti kamili ya Word (.docx)"
          >
            <FileDown className="w-4 h-4 text-slate-950" />
            <span>{isExporting ? 'Inatengeneza...' : 'Pakua Word (.docx)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 py-2 border-b border-[#2e2e2e] bg-[#121212] flex items-center space-x-1 overflow-x-auto text-xs font-medium shrink-0">
        <TabButton id="cover" label="Cover Page" active={activeTab === 'cover'} onClick={() => setActiveTab('cover')} />
        <TabButton id="prelim" label="Preliminaries (i-vi)" active={activeTab === 'prelim'} onClick={() => setActiveTab('prelim')} />
        <TabButton id="chap1" label="Chapter 1 (Org)" active={activeTab === 'chap1'} onClick={() => setActiveTab('chap1')} badge={chapters.find(c => c.id === 'chap1')?.sections?.length || 0} />
        <TabButton id="chap2" label="Chapter 2 (Tasks)" active={activeTab === 'chap2'} onClick={() => setActiveTab('chap2')} badge={chapters.find(c => c.id === 'chap2')?.sections?.length || 0} />
        <TabButton id="chap3" label="Chapter 3 (Skills)" active={activeTab === 'chap3'} onClick={() => setActiveTab('chap3')} badge={chapters.find(c => c.id === 'chap3')?.sections?.length || 0} />
        <TabButton id="chap4" label="Chapter 4 (Gaps)" active={activeTab === 'chap4'} onClick={() => setActiveTab('chap4')} badge={chapters.find(c => c.id === 'chap4')?.sections?.length || 0} />
        <TabButton id="chap5" label="Chapter 5 (Recs)" active={activeTab === 'chap5'} onClick={() => setActiveTab('chap5')} badge={chapters.find(c => c.id === 'chap5')?.sections?.length || 0} />
        <TabButton id="ref" label="References" active={activeTab === 'ref'} onClick={() => setActiveTab('ref')} />
      </div>

      {/* A4 Paper Document Viewer */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-auto bg-[#0a0a0a] flex justify-center">
        <div className="a4-page text-slate-900 select-text transition-all font-academic w-full max-w-[210mm]">
          {/* ================= COVER PAGE ================= */}
          {activeTab === 'cover' && (
            <div className="space-y-6 pt-4 text-slate-950">
              <div className="text-center space-y-4">
                <h1 className="text-base font-bold uppercase tracking-wide">
                  {uniName}
                </h1>

                {/* Crest Box */}
                <div className="py-2 flex justify-center">
                  <div className="w-28 h-28 border-2 border-amber-600 rounded-2xl p-2 bg-gradient-to-b from-sky-50 to-amber-50 flex flex-col items-center justify-between shadow-md">
                    <div className="text-[9px] font-bold uppercase text-amber-800 bg-amber-200 px-2 rounded-full">
                      {uniAcronym} CREST
                    </div>
                    <div className="flex items-center space-x-1.5 my-1">
                      <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center font-bold text-[8px] text-slate-900 shadow">
                        ⚙️
                      </div>
                      <div className="w-7 h-6 rounded bg-sky-600 flex items-center justify-center text-white text-[9px] font-bold shadow">
                        📖
                      </div>
                    </div>
                    <div className="text-[8px] font-extrabold uppercase tracking-tight text-slate-900 border-t border-amber-400 pt-0.5">
                      OFFICIAL EMBLEM
                    </div>
                  </div>
                </div>

                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 mt-3">
                  {metadata.module ? `${metadata.module} TECHNICAL REPORT` : 'INDUSTRIAL PRACTICAL TRAINING (IPT) TECHNICAL REPORT'}
                </h2>
              </div>

              {/* Exact Metadata List */}
              <div className="pt-6 max-w-lg mx-auto space-y-2 text-xs font-academic font-bold">
                <CoverField label="STUDENT NAME" value={metadata.studentName} />
                <CoverField label="DEPARTMENT" value={metadata.department?.toUpperCase()} />
                <CoverField label="ADMISSION NUMBER" value={metadata.admissionNo || metadata.regNumber} />
                <CoverField label="PROGRAM" value={metadata.program || metadata.courseName?.toUpperCase()} />
                <CoverField label="NTA LEVEL" value={metadata.ntaLevel} />
                <CoverField label="CLASS" value={metadata.classCode} />
                <CoverField label="MODULE" value={metadata.module || 'INDUSTRIAL PRACTICAL TRAINING (IPT)'} />
                <CoverField label="FIRM" value={metadata.firm || metadata.companyName?.toUpperCase()} />
                <CoverField label="FIRM'S SUPERVISOR" value={metadata.firmSupervisor || metadata.industrialSupervisor} />
                <CoverField label="INSTITUTE SUPERVISOR" value={metadata.instituteSupervisor || metadata.academicSupervisor} />
                <CoverField label="ACADEMIC YEAR" value={metadata.academicYear} />
                <CoverField label="FIELD SPAN" value={metadata.fieldSpan} />
              </div>
            </div>
          )}

          {/* ================= PRELIMINARY PAGES (i to vi) ================= */}
          {activeTab === 'prelim' && (
            <div className="space-y-8 text-xs leading-relaxed text-slate-900">
              {/* i. Abstract */}
              <div>
                <h2 className="text-sm font-bold text-center uppercase mb-3 underline">
                  i. ABSTRACT
                </h2>
                <textarea
                  rows={4}
                  placeholder="Sehemu ya Abstract itaandikwa na AI pindi sura zako za ripoti zitakapokamilika..."
                  value={preliminaries.abstract || preliminaries.executiveSummary || ''}
                  onChange={(e) => onUpdatePreliminaries('abstract', e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-xs font-academic bg-transparent focus:ring-1 focus:ring-amber-500 focus:bg-white resize-none"
                />
              </div>

              <hr className="border-slate-300" />

              {/* ii. Acknowledgement */}
              <div>
                <h2 className="text-sm font-bold text-center uppercase mb-2 underline">
                  ii. ACKNOWLEDGEMENT
                </h2>
                <textarea
                  rows={3}
                  placeholder="Shukrani zitaandikwa hapa kiotomatiki..."
                  value={preliminaries.acknowledgement || ''}
                  onChange={(e) => onUpdatePreliminaries('acknowledgement', e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-xs font-academic bg-transparent focus:ring-1 focus:ring-amber-500 focus:bg-white resize-none"
                />
              </div>

              <hr className="border-slate-300" />

              {/* iii. Declaration */}
              <div>
                <h2 className="text-sm font-bold text-center uppercase mb-3 underline">
                  iii. DECLARATION
                </h2>
                <textarea
                  rows={3}
                  placeholder="Tamko rasmi la uhalisi wa kazi..."
                  value={preliminaries.declaration || ''}
                  onChange={(e) => onUpdatePreliminaries('declaration', e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-xs font-academic bg-transparent focus:ring-1 focus:ring-amber-500 focus:bg-white resize-none"
                />
                <div className="mt-4 flex justify-between text-xs font-semibold">
                  <span>Signature: ______________________</span>
                  <span>Date: ______________________</span>
                </div>
              </div>

              <hr className="border-slate-300" />

              {/* iv. List of Abbreviations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold uppercase underline">
                    iv. LIST OF ABBREVIATIONS
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                    {preliminaries.abbreviations?.length || 0} Vifupisho Vilivyotumika
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Array.isArray(preliminaries.abbreviations) && preliminaries.abbreviations.length > 0 ? (
                    preliminaries.abbreviations.map((item, idx) => (
                      <div key={idx} className="flex space-x-2 p-1 rounded bg-slate-50 border border-slate-200">
                        <strong className="w-16 shrink-0 font-mono text-amber-900">{item.term}</strong>
                        <span className="text-slate-700">{item.definition}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-slate-500 italic py-2">
                      Vifupisho vitatambuliwa kiotomatiki kutokana na maneno utakayoandika kwenye sura 1 hadi 5...
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-slate-300" />

              {/* v. Table of Figures */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold uppercase underline">
                    v. TABLE OF FIGURES
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-mono">
                    {dynamicFigures.length} Michoro / Picha
                  </span>
                </div>
                {dynamicFigures.length > 0 ? (
                  <div className="space-y-1.5 font-mono text-xs">
                    {dynamicFigures.map((fig, idx) => (
                      <div key={idx} className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          {fig.figureNo}: {fig.title} {fig.hasImage ? '📷' : ''}
                        </span>
                        <span className="border-b border-dotted border-slate-400 flex-1 mx-2"></span>
                        <span className="font-bold">{fig.page}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs">
                    Picha na michoro ya kazi za Chapter 2 itaorodheshwa hapa kiotomatiki.
                  </p>
                )}
              </div>

              <hr className="border-slate-300" />

              {/* vi. Dynamic Table of Contents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold uppercase underline">
                    vi. TABLE OF CONTENTS
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                    Dynamic Auto-Sync
                  </span>
                </div>

                {dynamicTOC.length > 0 ? (
                  <div className="space-y-1 font-mono text-[11px]">
                    {dynamicTOC.map((entry, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-baseline ${
                          entry.level === 1 ? 'font-bold text-slate-950 pt-2' : 'pl-4 text-slate-700 font-normal'
                        }`}
                      >
                        <span className="truncate max-w-md">
                          {entry.code}  {entry.title}
                        </span>
                        <span className="border-b border-dotted border-slate-400 flex-1 mx-2"></span>
                        <span>{entry.page}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs">
                    Yaliyomo (TOC) yatajipanga kiotomatiki kadiri unavyoandika kila sura.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= CHAPTERS 1 to 5 ================= */}
          {['chap1', 'chap2', 'chap3', 'chap4', 'chap5'].includes(activeTab) && (
            <div className="text-xs leading-relaxed text-slate-900 space-y-6">
              {(() => {
                const currentChap = chapters.find(c => c.id === activeTab);
                if (!currentChap) return null;

                const hasSections = currentChap.sections && currentChap.sections.length > 0;

                return (
                  <div>
                    {/* Chapter Header */}
                    <div className="text-center pb-4 border-b border-slate-300 mb-6">
                      <h2 className="text-sm font-bold uppercase text-slate-700">
                        CHAPTER {currentChap.number === 1 ? 'ONE' : currentChap.number === 2 ? 'TWO' : currentChap.number === 3 ? 'THREE' : currentChap.number === 4 ? 'FOUR' : 'FIVE'}
                      </h2>
                      <h3 className="text-base font-bold uppercase tracking-tight text-slate-950">
                        {currentChap.title}
                      </h3>
                      {hasSections && (
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          {(() => {
                            const chapWords = (currentChap.sections || []).reduce((acc, s) => acc + (s.content || '').split(/\s+/).filter(Boolean).length, 0);
                            const estPages = Math.max(1, Math.ceil(chapWords / 300));
                            return (
                              <>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-semibold border border-amber-200">
                                  {chapWords} Maneno
                                </span>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-semibold border border-slate-200">
                                  ~{estPages} {estPages === 1 ? 'Ukurasa' : 'Kurasa'} za A4
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {!hasSections ? (
                      <div className="text-center py-14 px-4 space-y-3 bg-amber-50/40 rounded-xl border border-dashed border-amber-300/80">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-lg">
                          ✍️
                        </div>
                        <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          Sura Hii Bado Haijatengenezwa
                        </div>
                        <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                          Andika ujumbe kwenye Chat na AI ili ikuulize maswali na kukuandikia maudhui halisi ya sura hii.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentChap.sections.map((sec, secIdx) => (
                          <div key={sec.id} className="group relative p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="font-bold text-xs text-slate-950">
                                {sec.code}  {sec.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {currentChap.id === 'chap2' && (
                                  <label className="cursor-pointer opacity-80 hover:opacity-100 px-2 py-0.5 rounded bg-slate-200 hover:bg-amber-100 text-[10px] font-semibold text-slate-700 hover:text-amber-900 flex items-center space-x-1 transition">
                                    <ImageIcon className="w-3 h-3 text-amber-600" />
                                    <span>{sec.image ? 'Badili Picha' : '+ Weka Picha/Diagram'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleImageUpload(currentChap.id, sec.id, e.target.files[0])}
                                    />
                                  </label>
                                )}

                                {currentChap.id === 'chap2' && sec.code.startsWith('2.2') && (
                                  <button
                                    onClick={() => onDeleteSection(currentChap.id, sec.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition"
                                    title="Futa kazi hii"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <textarea
                              rows={Math.max(3, Math.ceil((sec.content || '').length / 85))}
                              value={sec.content}
                              onChange={(e) => onUpdateSection(currentChap.id, sec.id, e.target.value)}
                              className="w-full p-2 rounded border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-xs font-academic leading-relaxed bg-transparent resize-none transition"
                            />

                            {/* Attached Image / Technical Diagram Preview */}
                            {sec.image && (
                              <div className="my-3 p-2 rounded-lg bg-slate-100 border border-slate-300 text-center relative group/img">
                                <img
                                  src={sec.image}
                                  alt={sec.imageCaption || sec.title}
                                  className="max-h-60 mx-auto rounded object-contain shadow-sm"
                                />
                                <div className="mt-1.5 flex items-center justify-center space-x-2 text-[11px] font-bold text-slate-800">
                                  <span>Figure 2.{secIdx + 1}:</span>
                                  <input
                                    type="text"
                                    value={sec.imageCaption || `${sec.title} Execution and Testing Setup`}
                                    onChange={(e) => onUpdateSection(currentChap.id, sec.id, { imageCaption: e.target.value })}
                                    className="bg-transparent border-b border-dashed border-slate-400 px-1 py-0.5 text-[11px] text-center focus:outline-none focus:border-amber-500 max-w-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => onUpdateSection(currentChap.id, sec.id, { image: null, imageCaption: null })}
                                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover/img:opacity-100 transition shadow"
                                  title="Ondoa picha"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {sec.vivaTip && (
                              <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">Swali la Presentation:</span> {sec.vivaTip.question}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= REFERENCES ================= */}
          {activeTab === 'ref' && (
            <div className="text-xs leading-relaxed text-slate-900 space-y-4">
              <div className="text-center pb-3 border-b border-slate-300 mb-4">
                <h2 className="text-sm font-bold uppercase">
                  REFERENCES
                </h2>
              </div>
              <p>[1] {uniName}, "Industrial Practical Training (IPT) Guidelines for Engineering & Technology Programs", Academic Press.</p>
              <p>[2] IEEE Standards Association, "IEEE Standards on Information Technology and Telecommunications Systems".</p>
              <p>[3] Occupational Safety and Health Authority (OSHA) Tanzania, "General Guidelines on Safety in Engineering Workplaces".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CoverField({ label, value }) {
  return (
    <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[165px_1fr] gap-2 items-baseline text-slate-900 border-b border-slate-100/90 py-1 text-xs">
      <span className="font-bold uppercase text-[11px] sm:text-xs text-slate-800 tracking-tight">{label}:</span>
      <span className={`font-bold break-words text-[11px] sm:text-xs leading-snug ${value ? 'text-slate-950' : 'text-slate-400 font-normal italic'}`}>
        {value || '________________________'}
      </span>
    </div>
  );
}

function TabButton({ id, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center space-x-1.5 transition ${
        active
          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-[#202020]'
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
          active ? 'bg-slate-950 text-amber-300' : 'bg-[#282828] text-amber-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function calculateTotalWords(data) {
  let count = 0;
  if (data.preliminaries) {
    Object.values(data.preliminaries).forEach(val => {
      if (typeof val === 'string') {
        count += val.split(/\s+/).filter(Boolean).length;
      }
    });
  }
  if (data.chapters) {
    data.chapters.forEach(chap => {
      if (chap.sections) {
        chap.sections.forEach(sec => {
          count += (sec.content || '').split(/\s+/).filter(Boolean).length;
        });
      }
    });
  }
  return count;
}
