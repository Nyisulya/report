import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Calendar, 
  Wrench, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Clock, 
  Loader2,
  Table as TableIcon,
  FileSignature,
  Eye,
  Check,
  ListFilter,
  Lightbulb,
  PenTool,
  Image as ImageIcon,
  AlertCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { generateWeeklyLogbookEntry } from '../services/aiEngine';
import { getDepartmentsForUniversity } from '../data/ditDepartments';

export default function WeeklyLogbookModal({
  isOpen,
  onClose,
  metadata = {},
  logbooks = [],
  onSaveLogbook,
  onSyncToReport,
  apiKey,
  activeModel
}) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [inputMode, setInputMode] = useState('daily'); // 'daily' or 'general'
  const [briefInput, setBriefInput] = useState('');
  const [dailyInputs, setDailyInputs] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: ''
  });
  const [activePageTab, setActivePageTab] = useState('all'); // 'page1', 'page2', 'page3', 'page4', 'all'
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'page1', 'page2', 'page3', 'page4', 'all', 'ascii'
  const [synced, setSynced] = useState(false);

  if (!isOpen) return null;

  const currentLogbook = logbooks.find(l => l.weekNumber === selectedWeek);

  // Department specific quick chips
  const depts = getDepartmentsForUniversity('dit');
  const currentDept = depts.find(d => d.name === metadata.department) || depts[0];
  const quickSuggestions = currentDept?.sampleActivities || [
    'System Configuration and Testing',
    'Preventive Equipment Maintenance and Diagnostics',
    'Hardware Troubleshooting and System Configuration',
    'Safety Induction, PPE Inspection, and Tool Calibration'
  ];

  const handleDailyChange = (day, value) => {
    setDailyInputs(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateWeeklyLogbookEntry({
        apiKey,
        modelName: activeModel,
        weekNumber: selectedWeek,
        briefInput: briefInput.trim(),
        dailyInputs: inputMode === 'daily' ? dailyInputs : null,
        department: currentDept,
        level: metadata.ntaLevel?.includes('8') ? 'degree' : 'diploma',
        companyName: metadata.firm || metadata.companyName || 'Host Firm'
      });

      onSaveLogbook(generated);
      setBriefInput('');
    } catch (err) {
      console.error('Failed to generate logbook:', err);
      alert(`Imeshindwa kutengeneza logbook: ${err.message || 'Tafadhali kagua intaneti au API key yako na ujaribu tena.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get Page 1 rows (5 rows: Monday to Friday)
  const getPage1Rows = () => {
    if (currentLogbook?.page1_dailySummary && currentLogbook.page1_dailySummary.length > 0) {
      return currentLogbook.page1_dailySummary;
    }
    if (currentLogbook?.days && currentLogbook.days.length > 0) {
      return currentLogbook.days.map(d => ({
        day: d.day,
        heading: d.task.split(':')[0] || d.day,
        inShort: d.task.includes(':') ? d.task.split(':').slice(1).join(':').trim() : d.task,
        tools: d.tools || []
      }));
    }
    return [];
  };

  // Helper to get Page 2 report (Part 1: Intro, Objectives, Methodology)
  const getPage2Report = () => {
    if (currentLogbook?.page2_detailedReport?.sections && currentLogbook.page2_detailedReport.sections.length > 0) {
      // If older logbook with 6+ sections, take first 3 for page 2
      const sections = currentLogbook.page2_detailedReport.sections.length > 3 && !currentLogbook?.page3_detailedReport
        ? currentLogbook.page2_detailedReport.sections.slice(0, 3)
        : currentLogbook.page2_detailedReport.sections;

      return {
        topic: currentLogbook.page2_detailedReport.topic || currentLogbook?.title || `Technical Focus for Week ${selectedWeek}`,
        sections,
        detailedDescription: currentLogbook.page2_detailedReport.detailedDescription || '',
        toolsAndEquipment: currentLogbook.page2_detailedReport.toolsAndEquipment || Array.from(new Set((currentLogbook?.days || []).flatMap(d => d.tools || [])))
      };
    }
    return {
      topic: currentLogbook?.title || `Technical Work Done in Week ${selectedWeek}`,
      sections: [
        {
          heading: '1.0 Introduction & System Context',
          content: currentLogbook?.weeklySummary ? currentLogbook.weeklySummary.split('\n\n')[0] : `During Week ${selectedWeek} of the Industrial Practical Training (IPT), technical tasks were performed at ${metadata.firm || 'the host firm'} under engineering supervision.`
        },
        {
          heading: '2.0 Technical Objectives & Work Scope',
          content: 'The core technical objectives for the week included inspecting operational setups, staging calibrated tools, and executing practical system configurations.'
        },
        {
          heading: '3.0 Procedural Methodology & Practical Execution',
          content: 'Execution commenced with pre-operational inspection and PPE compliance verification, followed by methodical hardware alignments and live functional testing.'
        }
      ],
      detailedDescription: currentLogbook?.weeklySummary || '',
      toolsAndEquipment: Array.from(new Set((currentLogbook?.days || []).flatMap(d => d.tools || [])))
    };
  };

  // Helper to get Page 3 report (Part 2: Working Principles, Troubleshooting, Safety, Competencies)
  const getPage3Report = () => {
    if (currentLogbook?.page3_detailedReport?.sections && currentLogbook.page3_detailedReport.sections.length > 0) {
      return currentLogbook.page3_detailedReport;
    }
    // Check if older logbook had sections 4, 5, 6 in page 2
    const p2Sections = currentLogbook?.page2_detailedReport?.sections || [];
    if (p2Sections.length > 3) {
      return {
        sections: p2Sections.slice(3),
        detailedDescription: p2Sections.slice(3).map(s => `${s.heading}\n${s.content}`).join('\n\n'),
        safetyPrecautions: currentLogbook?.page2_detailedReport?.safetyPrecautions || 'Strict compliance with OSHA safety protocols.',
        challengesAndSolutions: currentLogbook?.page2_detailedReport?.challengesAndSolutions || 'Isolated and rectified minor diagnostic impedance.',
        skillsLearnt: currentLogbook?.skillsGained || ''
      };
    }
    return {
      sections: [
        {
          heading: '4.0 Working Principles & Technical Advantages',
          content: 'Adopting standard engineering practices minimizes downtime, provides energy and operational efficiency, and ensures compliance with Tanzanian national industrial regulations.'
        },
        {
          heading: '5.0 Diagnostic Findings & Troubleshooting Solutions',
          content: 'During verification routines, diagnostic readings revealed minor contact friction which was promptly isolated through systematic continuity checks and terminal re-torquing.'
        },
        {
          heading: '6.0 Occupational Safety, Health (OSHA) & Standards',
          content: 'Full OSHA compliance was maintained. Safety boots, protective gloves, and eye protection were used throughout. Equipment was safely isolated and tagged prior to work.'
        },
        {
          heading: '7.0 Practical Skills & Competencies Gained',
          content: currentLogbook?.skillsGained || 'Acquired proficiency in practical tool manipulation, schematic tracing, diagnostic fault identification, and standard engineering documentation.'
        }
      ],
      detailedDescription: '',
      safetyPrecautions: 'Strict compliance with OSHA protocols was maintained.',
      challengesAndSolutions: 'Isolated and rectified routine diagnostic deviations.',
      skillsLearnt: currentLogbook?.skillsGained || ''
    };
  };

  // Helper to get Page 4 Diagram (Technical Sketch or No-Diagram advice)
  const getPage4Diagram = () => {
    if (currentLogbook?.page4_technicalDiagram) {
      return currentLogbook.page4_technicalDiagram;
    }
    const topic = currentLogbook?.title || `Technical Work Done in Week ${selectedWeek}`;
    const cleanTopic = topic.replace(/^Week \d+:\s*/, '');
    const isOrientation = selectedWeek === 1 && !currentLogbook?.briefInput && !(currentLogbook?.days || []).some(d => d.task && !d.task.includes('Safety') && !d.task.includes('Orientation'));

    if (isOrientation) {
      return {
        hasDiagram: false,
        diagramTitle: `No Technical Diagram Required (Week ${selectedWeek})`,
        diagramType: 'None Required',
        recommendationAdvice: `The technical tasks executed this week involve non-schematic operations such as workplace safety induction, site orientation, or administrative auditing. In the official physical logbook booklet, Page 4 may be left blank or used to affix an authentic worksite photograph or supervisory stamp.`,
        stepByStepDrawingInstructions: [],
        keyLabelsToInclude: [],
        asciiPreview: '',
        alternativeAction: 'Page 4 may be left blank or used to attach an operational worksite photograph (photo attachment).'
      };
    }

    return {
      hasDiagram: true,
      diagramTitle: `Figure W${selectedWeek}.1: Technical Layout & Connection Schematic for ${cleanTopic}`,
      diagramType: 'Schematic / Topology Layout',
      recommendationAdvice: `The technical scope executed in Week ${selectedWeek} involving "${cleanTopic}" warrants a formal engineering diagram on Page 4 of the logbook booklet. Constructing this diagram demonstrates technical comprehension of the system architecture and satisfies practical assessment requirements.`,
      stepByStepDrawingInstructions: [
        '1. Use a clean ruler and technical pencil to construct an outer border frame in the center of the booklet grid page.',
        '2. Top-Left / Ingress: Sketch the primary energy source, incoming feed, or host controller symbol.',
        '3. Interconnections: Draw transmission, signal, or connection flow lines directed toward intermediate protection and control units.',
        '4. Output / Egress: Illustrate terminal load points, end-user drops, or distribution interfaces on the right perimeter.',
        '5. Annotate all component ratings, terminal identifiers, and technical labels in clear uppercase lettering, with the figure caption below.'
      ],
      keyLabelsToInclude: [
        'Main Input Feed / Supply Line',
        'Protective Circuit Breaker / Isolator',
        'Distribution Controller / Patch Panel',
        'Equipment Grounding (Earthing Terminal PE)',
        'Output Terminal Load / Workstation Drops'
      ],
      asciiPreview: `+-------------------------------------------------------------+
|        TECHNICAL CONNECTION & SCHEMATIC LAYOUT              |
+-------------------------------------------------------------+
 [ Main Feed / Supply ] ---> [ Isolator / MCB ] ---> [ Controller ]
                                   |                       |
                                   v                       v
                             [ Ground (PE) ]         [ Output Load ]
+-------------------------------------------------------------+
|  Figure W${selectedWeek}.1: Operational Setup Layout Schematic        |
+-------------------------------------------------------------+`,
      alternativeAction: 'If drafting instruments are unavailable, attach an authentic worksite photograph or present the booklet for supervisory verification.'
    };
  };

  // Copy Page 1 only (Daily Table)
  const handleCopyPage1 = () => {
    const rows = getPage1Rows();
    if (rows.length === 0) return;

    let text = `=======================================================\n`;
    text += `INDUSTRIAL PRACTICAL TRAINING (IPT) LOGBOOK\n`;
    text += `PAGE 1: DAILY SUMMARY TABLE\n`;
    text += `WEEK ${selectedWeek} (MONDAY TO FRIDAY)\n`;
    text += `Student: ${metadata.studentName || 'Student'} | Host Firm: ${metadata.firm || 'Host Firm'}\n`;
    text += `=======================================================\n\n`;

    rows.forEach((r) => {
      text += `[${r.day.toUpperCase()}]\n`;
      text += `Task: ${r.heading}\n`;
      if (r.tools && r.tools.length > 0) {
        text += `Tools: ${r.tools.join(', ')}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedType('page1');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy Page 2 only (Detailed Explanation Pt 1)
  const handleCopyPage2 = () => {
    const p2 = getPage2Report();
    let text = `=======================================================\n`;
    text += `INDUSTRIAL PRACTICAL TRAINING (IPT) LOGBOOK\n`;
    text += `PAGE 2: DETAILED TECHNICAL REPORT (PART 1)\n`;
    text += `WEEK ${selectedWeek} TECHNICAL FOCUS: ${p2.topic}\n`;
    text += `=======================================================\n\n`;

    (p2.sections || []).forEach(s => {
      text += `${s.heading}:\n${s.content}\n\n`;
    });

    if (p2.toolsAndEquipment && p2.toolsAndEquipment.length > 0) {
      text += `TOOLS & EQUIPMENT USED: ${p2.toolsAndEquipment.join(', ')}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedType('page2');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy Page 3 only (Detailed Explanation Pt 2)
  const handleCopyPage3 = () => {
    const p3 = getPage3Report();
    let text = `=======================================================\n`;
    text += `INDUSTRIAL PRACTICAL TRAINING (IPT) LOGBOOK\n`;
    text += `PAGE 3: DETAILED TECHNICAL REPORT (PART 2)\n`;
    text += `WEEK ${selectedWeek} PRINCIPLES, TROUBLESHOOTING & STANDARDS\n`;
    text += `=======================================================\n\n`;

    (p3.sections || []).forEach(s => {
      text += `${s.heading}:\n${s.content}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedType('page3');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy Page 4 only (Diagram & Sketch Guidance)
  const handleCopyPage4 = () => {
    const p4 = getPage4Diagram();
    let text = `=======================================================\n`;
    text += `INDUSTRIAL PRACTICAL TRAINING (IPT) LOGBOOK\n`;
    text += `PAGE 4: TECHNICAL DIAGRAM & SKETCH GUIDANCE\n`;
    text += `WEEK ${selectedWeek}\n`;
    text += `=======================================================\n\n`;

    if (p4.hasDiagram) {
      text += `FIGURE TITLE: ${p4.diagramTitle}\n`;
      text += `DIAGRAM TYPE: ${p4.diagramType}\n\n`;
      text += `DRAWING INSTRUCTIONS FOR BOOKLET:\n`;
      (p4.stepByStepDrawingInstructions || []).forEach(step => {
        text += `• ${step}\n`;
      });
      text += `\nKEY LABELS TO ANNOTATE: ${(p4.keyLabelsToInclude || []).join(', ')}\n\n`;
      if (p4.asciiPreview) {
        text += `VISUAL SKETCH LAYOUT (ASCII PREVIEW):\n${p4.asciiPreview}\n`;
      }
    } else {
      text += `STATUS: NO TECHNICAL DIAGRAM REQUIRED THIS WEEK\n\n`;
      text += `ASSESSMENT ADVICE:\n${p4.recommendationAdvice}\n\n`;
      if (p4.alternativeAction) {
        text += `ALTERNATIVE GUIDANCE: ${p4.alternativeAction}\n`;
      }
    }

    navigator.clipboard.writeText(text);
    setCopiedType('page4');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy All 4 Pages
  const handleCopyAll = () => {
    const rows = getPage1Rows();
    const p2 = getPage2Report();
    const p3 = getPage3Report();
    const p4 = getPage4Diagram();

    let text = `=======================================================\n`;
    text += `INDUSTRIAL PRACTICAL TRAINING (IPT) LOGBOOK - WEEK ${selectedWeek}\n`;
    text += `Student: ${metadata.studentName || 'Student'} (${metadata.admissionNo || ''})\n`;
    text += `Host Firm: ${metadata.firm || 'Host Firm'} | Department: ${currentDept?.name || 'Engineering'}\n`;
    text += `=======================================================\n\n`;

    text += `>>> PAGE 1: DAILY SUMMARY TABLE (MONDAY TO FRIDAY) <<<\n\n`;
    rows.forEach((r) => {
      text += `[${r.day.toUpperCase()}]\n`;
      text += `Task: ${r.heading}\n`;
      if (r.tools && r.tools.length > 0) text += `Tools: ${r.tools.join(', ')}\n`;
      text += `\n`;
    });

    text += `>>> PAGE 2: DETAILED TECHNICAL REPORT (PART 1) <<<\n`;
    text += `Topic: ${p2.topic}\n\n`;
    (p2.sections || []).forEach(s => {
      text += `${s.heading}:\n${s.content}\n\n`;
    });

    text += `>>> PAGE 3: DETAILED TECHNICAL REPORT (PART 2) <<<\n\n`;
    (p3.sections || []).forEach(s => {
      text += `${s.heading}:\n${s.content}\n\n`;
    });

    text += `>>> PAGE 4: TECHNICAL DIAGRAM & SKETCH GUIDANCE <<<\n`;
    if (p4.hasDiagram) {
      text += `Figure Title: ${p4.diagramTitle}\n`;
      text += `Diagram Type: ${p4.diagramType}\n\n`;
      text += `Drawing Instructions for Booklet:\n`;
      (p4.stepByStepDrawingInstructions || []).forEach(step => {
        text += `• ${step}\n`;
      });
      text += `\nKey Labels to Annotate: ${(p4.keyLabelsToInclude || []).join(', ')}\n\n`;
      if (p4.asciiPreview) {
        text += `Visual Layout / ASCII Sketch:\n${p4.asciiPreview}\n\n`;
      }
    } else {
      text += `Status: No Technical Diagram Required This Week\n`;
      text += `Assessment Advice: ${p4.recommendationAdvice}\n`;
      if (p4.alternativeAction) {
        text += `Alternative Guidance: ${p4.alternativeAction}\n`;
      }
    }

    navigator.clipboard.writeText(text);
    setCopiedType('all');
    setTimeout(() => setCopiedType(null), 2000);
  };


  const handleCopyAscii = (ascii) => {
    navigator.clipboard.writeText(ascii);
    setCopiedType('ascii');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSyncToFinalReport = () => {
    if (!currentLogbook) return;
    onSyncToReport(currentLogbook);
    setSynced(true);
    setTimeout(() => setSynced(false), 2500);
  };

  const page1Rows = getPage1Rows();
  const page2Report = getPage2Report();
  const page3Report = getPage3Report();
  const page4Diagram = getPage4Diagram();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2e2e] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-100 text-base">
                  Logbook ya IPT (Muundo Rasmi wa Kurasa 4 za Kijitabu)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
                  Kurasa 4 kwa Wiki
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Page 1:</strong> Jedwali (Row 5) • <strong>Page 2 & 3:</strong> Maelezo ya Kina yenye Headings za Kiufundi • <strong>Page 4:</strong> Mchoro wa Kiufundi (Sketch)
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

        {/* Week Selector Tabs */}
        <div className="px-6 py-2.5 bg-[#111111] border-b border-[#262626] overflow-x-auto flex items-center space-x-2 shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Wiki:
          </span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(week => {
            const isFilled = logbooks.some(l => l.weekNumber === week);
            const isCurrent = selectedWeek === week;

            return (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shrink-0 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : isFilled
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-[#1e1e1e] hover:bg-[#282828] border border-[#303030] text-slate-400'
                }`}
              >
                <span>Wiki {week}</span>
                {isFilled && (
                  <CheckCircle2 className={`w-3 h-3 ${isCurrent ? 'text-slate-950' : 'text-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#161616]">
          {/* Flexible Input Card (Daily or General) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b1b] border border-[#2d2d2d] space-y-4 shadow-md">
            {/* Input Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#282828] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kazi ya Wiki ya {selectedWeek}: Jaza ulichofanya</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Idara: <strong className="text-amber-400">{currentDept.name}</strong>
                </span>
              </div>

              {/* Input Mode Switcher */}
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#121212] border border-[#2a2a2a] w-fit">
                <button
                  type="button"
                  onClick={() => setInputMode('daily')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    inputMode === 'daily'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📅 Jaza kwa Siku (J3 - Ijumaa)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('general')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    inputMode === 'general'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ Maelezo ya Jumla
                </button>
              </div>
            </div>

            {/* Daily Inputs Mode (Monday to Friday) */}
            {inputMode === 'daily' ? (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kidokezo:</strong> Jaza ulichofanya kwa siku unazozikumbuka. <em>Ukiacha wazi siku kadhaa, haina shida!</em> AI itapanga mtiririko wa siku zote 5 (Row 5) na kutathmini kama unahitaji mchoro ukurasa wa 4.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Monday */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Jumatatu (Monday):</span>
                    </label>
                    <input
                      type="text"
                      value={dailyInputs.monday}
                      onChange={e => handleDailyChange('monday', e.target.value)}
                      placeholder="k.m. Kazi au shughuli uliyofanya (au acha wazi)"
                      className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Tuesday */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Jumanne (Tuesday):</span>
                    </label>
                    <input
                      type="text"
                      value={dailyInputs.tuesday}
                      onChange={e => handleDailyChange('tuesday', e.target.value)}
                      placeholder="k.m. Kazi au shughuli uliyofanya (au acha wazi)"
                      className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Wednesday */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Jumatano (Wednesday):</span>
                    </label>
                    <input
                      type="text"
                      value={dailyInputs.wednesday}
                      onChange={e => handleDailyChange('wednesday', e.target.value)}
                      placeholder="k.m. Kazi au shughuli uliyofanya (au acha wazi)"
                      className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Thursday */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Alhamisi (Thursday):</span>
                    </label>
                    <input
                      type="text"
                      value={dailyInputs.thursday}
                      onChange={e => handleDailyChange('thursday', e.target.value)}
                      placeholder="k.m. Kazi au shughuli uliyofanya (au acha wazi)"
                      className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Friday */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Ijumaa (Friday):</span>
                    </label>
                    <input
                      type="text"
                      value={dailyInputs.friday}
                      onChange={e => handleDailyChange('friday', e.target.value)}
                      placeholder="k.m. Kazi au shughuli uliyofanya (au acha wazi)"
                      className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#333333] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* General Input Mode */
              <div className="space-y-2">
                <textarea
                  value={briefInput}
                  onChange={e => setBriefInput(e.target.value)}
                  rows={2}
                  placeholder="k.m. Eleza kwa ufupi kazi au mifumo mliyofanya/kushughulikia wiki hii..."
                  className="w-full p-3 rounded-xl bg-[#111111] border border-[#383838] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-slate-500 transition"
                />

                {/* Quick Suggestions Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Mifano ya shughuli za kawaida za kiufundi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBriefInput(sug)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-amber-500/20 hover:border-amber-500/40 border border-[#333333] text-slate-300 hover:text-amber-300 transition text-left"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AI Inatathmini & Kuandaa Kurasa Zote 4 za Kijitabu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{currentLogbook ? `Boresha Kurasa 4 za Wiki ${selectedWeek}` : `Tengeneza Kurasa 4 za Wiki ${selectedWeek}`}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Logbook Result Showcase */}
          {currentLogbook ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Page View Switcher & Action Toolbar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#202020] to-[#181818] border border-[#2e2e2e] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                {/* 4-Page Tabs Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-[#2c2c2c]">
                  <button
                    onClick={() => setActivePageTab('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      activePageTab === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>All 4 Pages</span>
                  </button>

                  <button
                    onClick={() => setActivePageTab('page1')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      activePageTab === 'page1'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Page 1: Daily Table</span>
                  </button>

                  <button
                    onClick={() => setActivePageTab('page2')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      activePageTab === 'page2'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Page 2: Report Pt 1</span>
                  </button>

                  <button
                    onClick={() => setActivePageTab('page3')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      activePageTab === 'page3'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Page 3: Report Pt 2</span>
                  </button>

                  <button
                    onClick={() => setActivePageTab('page4')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      activePageTab === 'page4'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Page 4: Diagram / Sketch</span>
                    {page4Diagram.hasDiagram ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    )}
                  </button>
                </div>

                {/* Quick Copy & Sync Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3.5 py-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] border border-[#3e3e3e] text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                    title="Copy all 4 pages of the booklet"
                  >
                    {copiedType === 'all' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied All 4 Pages!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy All 4 Pages</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSyncToFinalReport}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition"
                    title="Sync this weekly work into Chapter 2 and 3 of the Final Report"
                  >
                    {synced ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Synced to Final Report!</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sync to Final Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ================= PAGE 1: DAILY SUMMARY TABLE ================= */}
              {(activePageTab === 'page1' || activePageTab === 'all') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#191919] border border-[#2e2e2e] space-y-3.5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#282828]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        PAGE 1: DAILY TABLE
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Daily Technical Work Entries (Monday to Friday)
                      </h5>
                    </div>
                    <button
                      onClick={handleCopyPage1}
                      className="px-3 py-1 rounded-lg bg-[#252525] hover:bg-[#303030] text-slate-300 hover:text-amber-300 border border-[#383838] text-[11px] font-semibold flex items-center space-x-1 w-fit transition"
                    >
                      {copiedType === 'page1' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied Page 1!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Copy Page 1 (Daily Table)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 5-Row Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#2d2d2d]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#121212] border-b border-[#2d2d2d] text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <th className="p-3 w-28 sm:w-32 border-r border-[#2d2d2d]">Day</th>
                          <th className="p-3 border-r border-[#2d2d2d]">Daily Task Heading</th>
                          <th className="p-3 w-48 sm:w-56">Tools & PPE Used</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626]">
                        {page1Rows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-[#1f1f1f] transition">
                            <td className="p-3.5 align-middle font-bold text-amber-400 border-r border-[#262626] whitespace-nowrap">
                              <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span>{r.day.toUpperCase()}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-normal block pl-3.5">
                                Row {idx + 1}
                              </span>
                            </td>
                            <td className="p-3.5 align-middle text-slate-100 font-semibold text-xs border-r border-[#262626] leading-relaxed">
                              {r.heading}
                            </td>
                            <td className="p-3 align-top text-slate-300">
                              <div className="flex flex-wrap gap-1">
                                {(r.tools || []).map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#252525] border border-[#383838] text-slate-300 font-mono"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= PAGE 2: DETAILED TECHNICAL REPORT (PART 1) ================= */}
              {(activePageTab === 'page2' || activePageTab === 'all') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#191919] border border-[#2e2e2e] space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#282828]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        PAGE 2: REPORT PT 1
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Technical Report - Part 1 (Objectives & Execution)
                      </h5>
                    </div>
                    <button
                      onClick={handleCopyPage2}
                      className="px-3 py-1 rounded-lg bg-[#252525] hover:bg-[#303030] text-slate-300 hover:text-blue-300 border border-[#383838] text-[11px] font-semibold flex items-center space-x-1 w-fit transition"
                    >
                      {copiedType === 'page2' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied Page 2!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-blue-400" />
                          <span>Copy Page 2 Only</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Topic */}
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2a2a2a]">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-0.5 font-mono">
                      Weekly Technical Focus Area:
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      {page2Report.topic}
                    </h4>
                  </div>

                  {/* Dynamic Academic Sections */}
                  <div className="space-y-3">
                    {page2Report.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-xl bg-[#141414] border border-[#272727] hover:border-[#383838] transition space-y-1.5 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                          <h6 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                            {sec.heading}
                          </h6>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pl-3.5">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tools List */}
                  {page2Report.toolsAndEquipment && page2Report.toolsAndEquipment.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tools & Equipment Used This Week:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {page2Report.toolsAndEquipment.map((tool, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#202020] border border-[#333] text-slate-200 font-mono"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= PAGE 3: DETAILED TECHNICAL REPORT (PART 2) ================= */}
              {(activePageTab === 'page3' || activePageTab === 'all') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#191919] border border-[#2e2e2e] space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#282828]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        PAGE 3: REPORT PT 2
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Technical Report - Part 2 (Principles, Troubleshooting & Safety)
                      </h5>
                    </div>
                    <button
                      onClick={handleCopyPage3}
                      className="px-3 py-1 rounded-lg bg-[#252525] hover:bg-[#303030] text-slate-300 hover:text-emerald-300 border border-[#383838] text-[11px] font-semibold flex items-center space-x-1 w-fit transition"
                    >
                      {copiedType === 'page3' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied Page 3!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-emerald-400" />
                          <span>Copy Page 3 Only</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Academic Sections for Page 3 */}
                  <div className="space-y-3">
                    {page3Report.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-xl bg-[#141414] border border-[#272727] hover:border-[#383838] transition space-y-1.5 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                          <h6 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                            {sec.heading}
                          </h6>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pl-3.5">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Extra OSHA & Standards Badge */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3 text-xs text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block text-emerald-200 uppercase tracking-wider text-[11px]">
                        OSHA & Engineering Standards Compliance:
                      </span>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">
                        Page 3 technical reporting adheres to OSHA workplace safety guidelines and IEEE / TBS engineering standards.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PAGE 4: TECHNICAL DIAGRAM & SKETCH ================= */}
              {(activePageTab === 'page4' || activePageTab === 'all') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#191919] border border-[#2e2e2e] space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#282828]">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                        page4Diagram.hasDiagram ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700/30 text-slate-300'
                      }`}>
                        PAGE 4: DIAGRAM & SKETCH
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Technical Diagram, Sketch & Drawing Guidance
                      </h5>
                    </div>
                    <button
                      onClick={handleCopyPage4}
                      className="px-3 py-1 rounded-lg bg-[#252525] hover:bg-[#303030] text-slate-300 hover:text-purple-300 border border-[#383838] text-[11px] font-semibold flex items-center space-x-1 w-fit transition"
                    >
                      {copiedType === 'page4' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied Page 4!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-purple-400" />
                          <span>Copy Page 4 Guidance</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Intelligent Evaluation Outcome */}
                  {page4Diagram.hasDiagram ? (
                    <div className="space-y-4">
                      {/* Diagram Status & Title Banner */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-[#1c1424] border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Technical Diagram Recommended</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold font-mono">
                              {page4Diagram.diagramType || 'Technical Schematic'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                            Figure Title:
                          </span>
                          <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                            {page4Diagram.diagramTitle}
                          </h4>
                        </div>
                      </div>

                      {/* AI Recommendation Advice */}
                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#272727] space-y-1">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>AI Assessment Advice:</span>
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed pl-5">
                          {page4Diagram.recommendationAdvice}
                        </p>
                      </div>

                      {/* Step-by-Step Drawing Instructions */}
                      {page4Diagram.stepByStepDrawingInstructions && page4Diagram.stepByStepDrawingInstructions.length > 0 && (
                        <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] space-y-2.5">
                          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                            <PenTool className="w-3.5 h-3.5 text-purple-400" />
                            <span>Step-by-Step Drawing Instructions for Physical Booklet:</span>
                          </span>
                          <div className="space-y-1.5 pl-2">
                            {page4Diagram.stepByStepDrawingInstructions.map((step, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                                <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Labels to Annotate */}
                      {page4Diagram.keyLabelsToInclude && page4Diagram.keyLabelsToInclude.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                            <Hash className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Key Technical Labels to Annotate on Sketch:</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {page4Diagram.keyLabelsToInclude.map((label, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1e1e1e] border border-purple-500/30 text-purple-300 font-mono"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ASCII / Visual Guide Preview */}
                      {page4Diagram.asciiPreview && (
                        <div className="p-4 rounded-xl bg-[#111111] border border-[#2a2a2a] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>Visual Sketch Layout Preview (ASCII Guide):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyAscii(page4Diagram.asciiPreview)}
                              className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2b2b2b] text-[10px] font-mono text-slate-300 hover:text-white border border-[#333] flex items-center space-x-1 transition"
                            >
                              {copiedType === 'ascii' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copy ASCII</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#222] text-amber-300/90 font-mono text-[11px] leading-relaxed overflow-x-auto select-all">
                            {page4Diagram.asciiPreview}
                          </pre>
                        </div>
                      )}

                      {/* Alternative guidance note */}
                      {page4Diagram.alternativeAction && (
                        <p className="text-[11px] text-slate-500 italic pl-1">
                          💡 {page4Diagram.alternativeAction}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* NO DIAGRAM REQUIRED CASE */
                    <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-700/40 space-y-3 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto sm:mx-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 justify-center sm:justify-start">
                            <h4 className="text-sm font-bold text-slate-200">
                              No Technical Diagram Required This Week
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                              Optional / Blank Page
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            The technical tasks for this week do not mandate a technical schematic.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#252525] space-y-1">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                          AI Advice for Physical Booklet:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {page4Diagram.recommendationAdvice}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-xs text-slate-400">
                        📌 <strong>Student Options:</strong> {page4Diagram.alternativeAction || 'Page 4 may be left blank or used to affix an operational worksite photograph or supervisory stamp.'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 rounded-2xl bg-[#1a1a1a] border border-dashed border-[#333333] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">
                  Logbook for Week {selectedWeek} Not Generated Yet
                </h4>
                <p className="text-xs text-slate-400">
                  Fill in your daily tasks above (even a few days) and click <strong>"Tengeneza Kurasa 4 za Wiki {selectedWeek}"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2e2e2e] bg-[#141414] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Kumbukumbu: <strong>{logbooks.length} kati ya wiki 10</strong> zimerekodiwa
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#242424] hover:bg-[#2f2f2f] text-slate-200 font-semibold text-xs transition"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
}
