import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  Wrench, 
  AlertOctagon, 
  Layers, 
  Zap, 
  FileText,
  RotateCcw,
  Check,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WRITING_PERSONAS, DIT_DEPARTMENTS } from '../data/ditDepartments';
import { generateHumanizedActivityParagraph } from '../services/aiEngine';

export default function ChatAssistant({
  metadata,
  apiKey,
  activeModel,
  onAddSectionToChapter2
}) {
  // 1-by-1 Step State: 1 = Activity, 2 = Tools, 3 = Specific Device, 4 = Challenge
  const [currentStep, setCurrentStep] = useState(1);
  
  // Student Answers
  const [activityName, setActivityName] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [specificDevice, setSpecificDevice] = useState('');
  const [challengeEncountered, setChallengeEncountered] = useState('');

  // Selected persona
  const [selectedPersona, setSelectedPersona] = useState('methodological');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');

  const currentDeptObj = DIT_DEPARTMENTS.find(d => d.name === metadata.department) || DIT_DEPARTMENTS[0];

  // Micro-interview questions
  const QUESTIONS = [
    {
      step: 1,
      title: 'Kazi Kuu Uliyofanya (Main Technical Activity)',
      prompt: `Habari ${metadata.studentName?.split(' ')[0] || 'Mwanafunzi'}! Tueleze kwa kifupi kazi au wiki gani unataka tuandike? (k.m. Uliweka LAN, ulijenga foundation, ulipima transformer, au ulifanya maintenance?)`,
      placeholder: 'k.m. Tulikuwa tunafanya structured LAN cabling na termination kwenye ofisi ya accounts...',
      value: activityName,
      setValue: setActivityName,
      chips: currentDeptObj.sampleActivities
    },
    {
      step: 2,
      title: 'Vifaa & Tools Zilizotumika (Tools & Instruments)',
      prompt: 'Safi sana. Vifaa, nyaya, au tools gani zilitumika kwenye kazi hii?',
      placeholder: 'k.m. Cat6 UTP cables, RJ45 connectors, crimping tool, na digital cable tester...',
      value: toolsUsed,
      setValue: setToolsUsed,
      chips: currentDeptObj.typicalTools
    },
    {
      step: 3,
      title: 'Kifaa / Mashine Maalum Iliyotumika (Specific Device/System)',
      prompt: 'Je, mliunganisha, mlipima, au ku-configure kifaa gani maalum (k.m. Model ya switch, server, injini, au kifaa cha upimaji)?',
      placeholder: 'k.m. Cisco Catalyst 2960 24-port switch na patch panel...',
      value: specificDevice,
      setValue: setSpecificDevice,
      chips: ['Cisco Catalyst 2960', 'MikroTik Router hEX', 'Total Station Leica', 'Transformer 33kV', 'Lathe Machine', 'Centrifugal Pump']
    },
    {
      step: 4,
      title: 'Hitilafu au Changamoto Iliyotokea (Troubleshooting & Friction)',
      prompt: 'Mwisho kabisa: Hitilafu au changamoto gani ndogo ilijitokeza wakati wa kazi hiyo na mliitatua vipi?',
      placeholder: 'k.m. Nyaya 2 zilipishana rangi kwenye T568B, tukazikata tukarudia crimping ikasoma vizuri...',
      value: challengeEncountered,
      setValue: setChallengeEncountered,
      chips: [
        'Tester ilionyesha crossed wire pairs kwenye drops mbili',
        'Subnet mask ilikuwa hailingani na default gateway',
        'Concrete slump ilikuwa na maji mengi tukarekebisha mix ratio',
        'Loose connection kwenye terminal ya motor ilisababisha tripping'
      ]
    }
  ];

  const activeQ = QUESTIONS[currentStep - 1];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async (overridePersona) => {
    const personaToUse = overridePersona || selectedPersona;
    setIsGenerating(true);

    try {
      const res = await generateHumanizedActivityParagraph({
        apiKey,
        modelName: activeModel,
        department: currentDeptObj,
        level: metadata.level,
        companyName: metadata.companyName,
        persona: personaToUse,
        activityName: activityName || 'Structured Network Deployment',
        toolsUsed: toolsUsed || 'Hand tools and test equipment',
        specificDevice: specificDevice || 'Terminal access hardware',
        challengeEncountered: challengeEncountered || 'Connection alignment discrepancies'
      });

      setGeneratedResult(res);
      if (!sectionTitle) {
        setSectionTitle(activityName ? activityName.slice(0, 45) : 'Technical Activity Execution');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSection = () => {
    if (!generatedResult) return;

    onAddSectionToChapter2({
      title: sectionTitle || 'Technical Task',
      content: generatedResult.paragraph,
      persona: selectedPersona,
      tools: toolsUsed.split(',').map(s => s.trim()).filter(Boolean),
      vivaTip: generatedResult.vivaTip
    });

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    // Reset wizard
    setGeneratedResult(null);
    setCurrentStep(1);
    setActivityName('');
    setToolsUsed('');
    setSpecificDevice('');
    setChallengeEncountered('');
    setSectionTitle('');
  };

  const handleReset = () => {
    setCurrentStep(1);
    setGeneratedResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 glass-panel overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>1-by-1 Field Logbook Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Anti-AI Shield Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Swali moja moja • {currentDeptObj.name} ({metadata.level === 'degree' ? 'Degree' : 'Diploma'})
            </p>
          </div>
        </div>

        {/* Reset button */}
        {(currentStep > 1 || generatedResult) && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anza Upya</span>
          </button>
        )}
      </div>

      {/* Progress Bar (Steps 1 to 4) */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-amber-400">
            {generatedResult ? '🚀 Aya Iko Tayari!' : `Hatua ya ${currentStep} kati ya 4`}
          </span>
          <span className="text-slate-400 text-[11px]">
            {activeQ?.title}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: generatedResult ? '100%' : `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {!generatedResult ? (
          /* ================= STEP-BY-STEP QUESTION VIEW ================= */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* AI Prompt Bubble */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
                  AI
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {activeQ.prompt}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Unaweza kuandika kwa Kiswahili au Kiingereza cha kawaida.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Answer Chips */}
            {activeQ.chips && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mifano ya haraka ya kubonyeza:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeQ.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (activeQ.value) {
                          activeQ.setValue(activeQ.value + ', ' + chip);
                        } else {
                          activeQ.setValue(chip);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 border border-slate-700 text-slate-300 text-xs transition"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-2">
              <textarea
                rows={3}
                value={activeQ.value}
                onChange={(e) => activeQ.setValue(e.target.value)}
                placeholder={activeQ.placeholder}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (activeQ.value.trim().length > 0) {
                      handleNextStep();
                    }
                  }
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  ← Rudi Nyuma
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isGenerating || activeQ.value.trim().length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inatengeneza Aya ya Ripoti...</span>
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tengeneza Aya Sasa 🚀</span>
                  </>
                ) : (
                  <>
                    <span>Swali Linalofuata</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= GENERATED RESULT VIEW ================= */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Writing Angle / Persona Switcher */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Mtazamo wa Uandishi (Anti-Plagiarism Persona):</span>
                <span className="text-amber-400 text-[10px]">Bonyeza kubadili mtindo papo hapo</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {WRITING_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPersona(p.id);
                      handleGenerate(p.id);
                    }}
                    className={`p-2 rounded-lg text-left text-xs transition border ${
                      selectedPersona === p.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">{p.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Paragraph Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Aya Iliyotengenezwa (Academic Format)</span>
                  </span>
                </div>
                {/* AI Score Badge */}
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-semibold flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>{generatedResult.aiScore?.score || 100}% Humanized</span>
                </span>
              </div>

              {/* Title input */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Kichwa cha Sehemu (Section Heading):
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Structured Local Area Network Deployment"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Editable paragraph */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Maelezo (Unaweza ku-edit maneno moja kwa moja hapa):
                </label>
                <textarea
                  rows={6}
                  value={generatedResult.paragraph}
                  onChange={(e) => setGeneratedResult({ ...generatedResult, paragraph: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 font-academic resize-none"
                />
              </div>
            </div>

            {/* Viva Defense Coach Card */}
            {generatedResult.vivaTip && (
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                <div className="flex items-center space-x-2 text-blue-300 font-semibold text-xs">
                  <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>💡 Tip ya Presentation/Viva (Swali la Wasimamizi/Assessor):</span>
                </div>
                <p className="text-xs text-blue-200/90 italic pl-6">
                  "{generatedResult.vivaTip.question}"
                </p>
                <p className="text-[11px] text-slate-400 pl-6">
                  <strong>Jinsi ya kujibu:</strong> {generatedResult.vivaTip.expectedAnswer}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:text-amber-400 hover:bg-slate-700 flex items-center space-x-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Andika Upya (Regenerate)</span>
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Weka Kwenye Chapter 2 📄</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
