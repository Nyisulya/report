import { getVivaTipForActivity } from '../data/vivaQuestions.js';
import { getUniversityStructure } from '../data/universityStructures.js';
import { analyticsService } from './analyticsService.js';
import { jsonrepair } from 'jsonrepair';

export const DEFAULT_HIVE_KEY = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_HIVE_API_KEY || import.meta.env?.VITE_DEEPSEEK_API_KEY)) || '';
export const DEFAULT_HIVE_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HIVE_BASE_URL) || '/api/hive';
export const DEFAULT_MODEL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HIVE_MODEL) || 'deepseek-ai/deepseek-v4.1-flash';

// Backwards compatibility alias
export const DEFAULT_DEEPSEEK_KEY = DEFAULT_HIVE_KEY;

/**
 * Sanitizes and resolves credentials, auto-migrating any old cached keys/models
 */
export function resolveActiveCredentials({ apiKey, modelName, baseUrl } = {}) {
  let activeKey = (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 5) ? apiKey.trim() : DEFAULT_HIVE_KEY;
  // If user has old sk- key from previous DeepSeek provider, fallback to environment Hive key
  if (activeKey.startsWith('sk-') && DEFAULT_HIVE_KEY) {
    activeKey = DEFAULT_HIVE_KEY;
  }

  let activeModel = modelName || DEFAULT_MODEL;
  if (!activeModel || activeModel === 'deepseek-flash' || activeModel === 'deepseek-chat' || activeModel === 'deepseek-reasoner' || !activeModel.includes('/')) {
    activeModel = DEFAULT_MODEL;
  }

  // In browser environments, ALWAYS use the reverse proxy '/api/hive' to eliminate CORS preflight blocks
  let activeBaseUrl = '/api/hive';
  if (typeof window === 'undefined') {
    activeBaseUrl = (baseUrl || DEFAULT_HIVE_BASE_URL || 'https://api-cdn.thehive.ai/api/v3').replace(/\/+$/, '');
  } else if (baseUrl && !baseUrl.includes('api-cdn.thehive.ai')) {
    activeBaseUrl = baseUrl.replace(/\/+$/, '');
  }

  return { activeKey, activeModel, activeBaseUrl };
}

/**
 * Ultra-resilient JSON parser:
 * 1. Extracts JSON from markdown fences or bare objects
 * 2. Uses jsonrepair to fix unescaped double quotes, missing commas, truncated strings
 * 3. Cleans control characters
 * 4. Normalizes malformed structures
 */
export function safeParseJSON(input) {
  if (!input) return null;
  let text = typeof input === 'string' ? input.trim() : String(input);

  // 1. Try extracting inside markdown ```json ... ``` or ```json_action ... ```
  const codeMatch = text.match(/```(?:json_action|json)?\s*([\s\S]*?)\s*```/i);
  if (codeMatch) {
    text = codeMatch[1].trim();
  } else {
    // If opening backticks exist without closing backticks (truncated response)
    const openMatch = text.match(/```(?:json_action|json)?\s*([\s\S]*)$/i);
    if (openMatch) {
      text = openMatch[1].trim();
    }
  }

  // 2. Isolate outermost JSON object or array starting at first { or [
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx !== -1) {
    text = text.substring(startIdx);
  }

  // 3. Direct JSON.parse
  try {
    return JSON.parse(text);
  } catch (e1) {
    // Continue
  }

  // 4. jsonrepair directly on full text (handles truncated strings, unclosed brackets, missing braces)
  try {
    const repaired = jsonrepair(text);
    return JSON.parse(repaired);
  } catch (e2) {
    // Continue
  }

  // 5. If text had trailing unclosed characters, try trimming back to last closing quote/brace and repairing
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);
  if (endIdx > 0) {
    try {
      const sliced = text.substring(0, endIdx + 1);
      const repaired = jsonrepair(sliced);
      return JSON.parse(repaired);
    } catch (e2b) {
      // Continue
    }
  }

  // 6. Clean control characters and try jsonrepair
  try {
    const sanitized = sanitizeRawJSON(text);
    const repaired = jsonrepair(sanitized);
    return JSON.parse(repaired);
  } catch (e3) {
    // Continue
  }

  // 7. Fix internal unescaped double quotes e.g. "key": "Value "quoted" inside"
  try {
    const cleanedQuotes = text.replace(/([a-zA-Z0-9_\s])"([a-zA-Z0-9_\s]+)"([a-zA-Z0-9_\s])/g, "$1'$2'$3");
    const repaired = jsonrepair(cleanedQuotes);
    return JSON.parse(repaired);
  } catch (e4) {
    // Continue
  }

  return null;
}

export function sanitizeRawJSON(str) {
  if (!str) return '{}';
  let insideString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !escaped) {
      insideString = !insideString;
      result += char;
    } else if (insideString) {
      if (char === '\n') result += '\\n';
      else if (char === '\r') result += '\\r';
      else if (char === '\t') result += '\\t';
      else if (char.charCodeAt(0) < 32) {
        // drop control char
      } else {
        result += char;
      }
    } else {
      result += char;
    }
    escaped = (char === '\\' && !escaped);
  }
  return result;
}

export function buildEmergencyFallbackLogbook({ weekNumber = 1, briefInput = '', dailyInputs = null, deptName = 'Engineering', firm = 'Host Firm' } = {}) {
  const mainTopic = (briefInput && briefInput.trim()) || (dailyInputs && dailyInputs.monday && dailyInputs.monday.trim()) || 'Practical Engineering Systems and Maintenance Operations';
  return {
    weekNumber,
    title: `Week ${weekNumber}: Practical Engineering & Technical Operations`,
    briefInput: briefInput || '',
    page1_dailySummary: [
      {
        day: 'Monday',
        heading: dailyInputs?.monday?.trim() || `Technical Briefing & Theoretical Orientation on ${mainTopic}`,
        inShort: `Studied standard operational frameworks, equipment specifications, and safety guidelines for ${mainTopic}.`,
        tools: ['Engineering Manuals', 'Workstation', 'Safety PPE']
      },
      {
        day: 'Tuesday',
        heading: dailyInputs?.tuesday?.trim() || `Workspace Setup & Preliminary Testing`,
        inShort: `Configured parameters, checked hardware/software prerequisites, and conducted baseline tests.`,
        tools: ['Diagnostic Tools', 'Testing Equipment', 'Workstation']
      },
      {
        day: 'Wednesday',
        heading: dailyInputs?.wednesday?.trim() || `Core Implementation & Module Integration`,
        inShort: `Executed hands-on operations, connected necessary components, and verified technical connectivity.`,
        tools: ['Core System Tools', 'Multimeter / IDE', 'Interface Cables']
      },
      {
        day: 'Thursday',
        heading: dailyInputs?.thursday?.trim() || `System Diagnostics & Error Troubleshooting`,
        inShort: `Investigated operational discrepancies, resolved configuration conflicts, and ensured stability.`,
        tools: ['Debug Consoles', 'Measurement Gauges', 'Troubleshooting Checklist']
      },
      {
        day: 'Friday',
        heading: dailyInputs?.friday?.trim() || `Weekly Performance Review & Site Maintenance`,
        inShort: `Carried out preventive routine maintenance, documented activity logs, and submitted status report.`,
        tools: ['Maintenance Kit', 'Logbook Documentation', 'Review Templates']
      }
    ],
    page2_detailedReport: {
      topic: `${mainTopic} Execution and Implementation`,
      sections: [
        {
          heading: `1.0 Technical Background & Operational Scope`,
          content: `Practical assignments focused on the systematic implementation of ${mainTopic} under industrial supervision. Necessary engineering precautions and standard operational protocols were maintained throughout.`
        },
        {
          heading: `2.0 Practical Execution & Workflow Procedure`,
          content: `All prerequisite configurations and functional modules were prepared sequentially. Testing benches and operational equipment were deployed to monitor parameter conformity and performance standards.`
        },
        {
          heading: `3.0 Quality Assurance & Verification Testing`,
          content: `The executed setup underwent functional checks and validation. Test cycles verified full stability and alignment with technical guidelines established by the department.`
        }
      ],
      toolsAndEquipment: ['Technical Workstation', 'Testing Instruments', 'Standard PPE Kit']
    },
    page3_detailedReport: {
      sections: [
        {
          heading: `4.0 Diagnostic Challenges & Remedial Actions`,
          content: `Encountered unexpected operational variances during execution. Systematic diagnostic troubleshooting was carried out to pinpoint the anomaly and implement a permanent engineering resolution.`
        },
        {
          heading: `5.0 Health, Safety & Environmental (HSE) Compliance`,
          content: `Followed all mandatory workshop safety precautions, proper equipment grounding, and clean workstation hygiene to prevent accidents and equipment damage.`
        },
        {
          heading: `6.0 Technical Competencies & Engineering Skills Gained`,
          content: `Acquired comprehensive hands-on proficiency in practical fault isolation, tool handling, and system calibration applicable to field engineering environments.`
        }
      ],
      safetyPrecautions: 'Observed strict PPE standards, proper tool handling, and regular inspection of workspace safety barriers.',
      challengesAndSolutions: 'Isolated operational errors through methodical testing and resolved calibration discrepancies effectively.',
      skillsLearnt: 'Gained practical dexterity in technical maintenance, troubleshooting procedures, and operational documentation.'
    },
    page4_technicalDiagram: {
      hasDiagram: true,
      diagramTitle: `Figure W${weekNumber}.1: System Flowchart & Operational Architecture`,
      diagramType: 'Architecture Flowchart',
      recommendationAdvice: 'Illustrates the sequential stages of the technical workflow undertaken during the training week.',
      stepByStepDrawingInstructions: [
        '1. Use a pencil and ruler to draw input and processing blocks representing the workflow.',
        '2. Connect the operational stages with directional arrows indicating signal or task flow.',
        '3. Add a decision diamond for diagnostic verification and error handling.',
        '4. Clearly label all endpoints, modules, and testing checkpoints.'
      ],
      keyLabelsToInclude: ['Input Stage', 'Processing Unit', 'Verification Test', 'Output / Resolution'],
      asciiPreview: '+-------------+    +----------------+    +----------------+\n| Input Stage | -> | Processing Unit| -> | Output / Result|\n+-------------+    +----------------+    +----------------+',
      alternativeAction: 'Attach a worksite photograph or operational schematic.'
    }
  };
}

// Anti-AI cliché filtering
export const BANNED_AI_WORDS = [
  'delve', 'delved', 'delving',
  'pivotal', 'pivotal role',
  'tapestry', 'rich tapestry',
  'testament', 'testament to',
  'seamless', 'seamlessly',
  'foster', 'fostered', 'fostering',
  'beacon', 'beacon of',
  'paramount', 'of paramount importance',
  'realm', 'in the realm of',
  'furthermore', 'moreover',
  'in conclusion, it is worth noting',
  'synergy', 'synergistic',
  'transformative journey',
  'cutting-edge prowess'
];

export function checkAIClichés(text) {
  if (!text) return { score: 100, detectedWords: [], isSafe: true };
  const lower = text.toLowerCase();
  const detected = [];
  for (const word of BANNED_AI_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      detected.push(word);
    }
  }
  const score = Math.max(0, 100 - detected.length * 18);
  return {
    score,
    detectedWords: detected,
    isSafe: detected.length === 0,
    status: detected.length === 0 ? 'Authentic Humanized' : 'AI Clichés Detected'
  };
}

/**
 * Builds the Master System Prompt tailored dynamically to the selected university
 */
function buildMasterSystemPrompt(reportData) {
  const uniId = reportData?.metadata?.universityId || 'dit';
  const uni = getUniversityStructure(uniId);
  const uniName = reportData?.metadata?.universityName || uni.name;
  const uniShort = uni.shortName || 'DIT';
  const moduleName = reportData?.metadata?.module || 'INDUSTRIAL PRACTICAL TRAINING (IPT)';

  // Format chapters outline for prompt
  const chaptersOutline = (uni.chapters || []).map(chap => {
    const secLines = (chap.sections || []).map(sec => {
      let line = `     • ${sec.code} ${sec.title}`;
      if (sec.subSections) {
        sec.subSections.forEach(sub => {
          line += ` (${sub.code} ${sub.title})`;
        });
      }
      return line;
    }).join('\n');
    return `   - Chapter ${chap.number}: ${chap.title}\n${secLines}`;
  }).join('\n\n');

  const isIFM = uniId === 'ifm';
  const roleTitle = isIFM
    ? `Official Field Practical Training Assessor and Academic Copilot for The Institute of Finance Management (IFM)`
    : `Official Technical Report AI Assessor and Senior Engineering Copilot for ${uniName} (${uniShort})`;

  const interviewProtocol = `
   • STRICT LAW 1: ONLY ONE QUESTION AT A TIME (KANUNI YA SWALI MOJA TU):
     - ⚠️ STRICT PROHIBITION: NEVER ask two, three, or multiple questions in one message!
     - ⚠️ NEVER bundle questions together (e.g. NEVER ask "Namba ya usajili, Program na Department ni ipi?" in one message)!
     - ALWAYS ask EXACTLY ONE question, very short, punchy, and simple (swali moja tu tena fupi kabisa) in friendly Swahili.
     - Wait for the student to reply before asking the next single question.
     - Always provide clickable chips that are direct, relevant answers to THAT SINGLE QUESTION only.

   • STRICT LAW 2: STRICT SEQUENTIAL PROGRESSION (KATAZO LA KURUKA SURA):
     - ⚠️ STRICT PROHIBITION: DO NOT LET THE STUDENT SKIP CHAPTERS OR PICK WHAT TO DO FREELY!
     - The report MUST follow a strict, mandatory one-way pipeline:
       [1. COVER PAGE] ➔ [2. CHAPTER 1] ➔ [3. CHAPTER 2] ➔ [4. CHAPTER 3] ➔ [5. CHAPTER 4] ➔ [6. CHAPTER 5] ➔ [7. SMART COMPILE].
     - NEVER provide chips like "Chapter 2", "Chapter 3", or "Nenda Chapter Inayofuata" when the current chapter is still incomplete!
     - You must complete Chapter 1 100% before moving to Chapter 2.
     - You must complete Chapter 2 before moving to Chapter 3.
     - Exception: ONLY if the entire report is 100% finished and the student explicitly asks to edit an earlier chapter.

   • STEP 1: OFFICIAL COVER PAGE INTERVIEW (12 MANDATORY DIT FIELDS):
     Official Cover Page for ${uniShort} requires EXACTLY these 12 fields:
       1. studentName: Full student name (e.g. FELICIAN JOHN MUSSA)
       2. department: Academic Department (e.g. COMPUTER STUDIES, ELECTRICAL ENGINEERING, CIVIL ENGINEERING, MECHANICAL ENGINEERING)
       3. admissionNo: Registration / Admission number (e.g. 21023022415)
       4. program: Degree / Diploma Program (e.g. BACHELOR OF ENGINEERING IN COMPUTER ENGINEERING)
       5. ntaLevel: NTA Level (e.g. NTA LEVEL 7 for Degree, NTA LEVEL 6 for Diploma)
       6. classCode: Class code (e.g. BENG23COE, OD22COE, BENG23EE)
       7. module: Module title (Default: INDUSTRIAL PRACTICAL TRAINING (IPT))
       8. firm: Host Company / Organization (e.g. TANESCO, TTCL, VODACOM TANZANIA, CRDB BANK)
       9. firmSupervisor: Host Company Supervisor name & title (e.g. Eng. Godfrey Mwakyoma)
       10. instituteSupervisor: University Academic Supervisor from ${uniShort} (e.g. Dr. J. M. Mtebe)
       11. academicYear: Academic Year (e.g. 2024/2025)
       12. fieldSpan: Training duration span (e.g. FROM 5 AUGUST 2024 TO 5 OCTOBER 2024)

     • SMART MULTI-FIELD EXTRACTION LAW:
       - Whenever the student mentions multiple details at once (e.g., student name, reg number, department, class code, host company, supervisors, or dates), you MUST extract and update ALL of them immediately into \`json_action.metadata\`!
       - ⚠️ NEVER ask for any detail that the student has ALREADY stated or that is already in CURRENT LIVE DOCUMENT STATE!

     • SEQUENTIAL GAPS INTERVIEW (Ask ONLY for what is still missing among the 6 key clusters):
       - If studentName is missing: Ask ONLY: "Jina lako kamili la mwanafunzi unaitwa nani?"
       - Else if admissionNo is missing: In json_action update studentName. In chat, ask ONLY: "Namba yako ya usajili (Admission / Registration Number) ni ipi?"
       - Else if department, classCode, or program is missing: In json_action update admissionNo. In chat, ask ONLY: "Uko Idara gani na Program/Class Code yako ni ipi? (k.m. Computer Studies, BENG23COE)" with chips: ["Computer Studies | BENG23COE | NTA 7", "Electrical Engineering | BENG23EE | NTA 7", "Civil Engineering | BENG23CE | NTA 7", "Mechanical Engineering | BENG23ME | NTA 7", "Computer Studies | OD22COE | NTA 6"].
       - Else if firm is missing: In chat, ask ONLY: "Ulifanya mafunzo ya vitendo (Field / IPT) katika Shirika au Kampuni gani?" with chips: ["TTCL Kurasini", "TANESCO Ubungo", "Vodacom Tanzania", "CRDB Bank", "TRA Samora"].
       - Else if firmSupervisor or instituteSupervisor is missing: In chat, ask ONLY: "Taja majina ya wasimamizi wako (Supervisor wa Kazini na Supervisor wa Chuoni ${uniShort}):" with chips: ["Kazini: Eng. John | Chuoni: Dr. Mtebe", "Kazini: Dr. Tesha | Chuoni: Prof. Mohamed", "Kazini: Eng. Frank Temba | Chuoni: Eng. M. Nassoro"].
       - Else if fieldSpan or academicYear is missing: In chat, ask ONLY: "Muda wa field ulikuwa lini hadi lini, na mwaka gani wa masomo?" with chips: ["FROM 5 AUGUST 2024 TO 5 OCTOBER 2024 | 2024/2025", "FROM 15 JULY 2024 TO 15 SEPTEMBER 2024 | 2024/2025"].
       - Once all 12 fields are accounted for: In json_action, output the complete \`metadata\` object. In chat, enthusiastically announce: "Hongera sana! Jalada (Cover Page) lako la ${uniShort} lenye taarifa zote 12 rasmi sasa limekamilika 100%! Sasa tunaanza rasmi Sura ya Kwanza (Chapter 1: Company Profile)." And immediately ask the first question for Chapter 1!

   • STEP 2: CHAPTER 1 INTERVIEW (COMPANY OVERVIEW):
     - Ask ONLY: "Ulikuwa kwenye kitengo au idara gani hapo kampuni/kazini?"
     - Once answered: Generate ALL sections of Chapter 1 in json_action (action: "update_chapter", chapterId: "chap1").
     - In chat:
       • IF logbooks exist in reportData.logbooks (logbooksCount > 0):
         Output action: "update_chapter", chapterId: "chap2" immediately with all duties from logbook, and announce: "Chapter 1 imekamilika! Na kwa kuwa ulishajaza Logbook yako, nimevuta kazi zako zote za vitendo na kuziandika moja kwa moja kwenye Chapter 2 kwenye A4! Sasa tunaweza kuendelea na Chapter 3 au Chapter 4."
       • IF NO logbook exists (logbooksCount === 0):
         Say: "Chapter 1 imekamilika kikamilifu na kujazwa kwenye A4! Sasa tunaingia Chapter 2 (Kazi za Vitendo / Technical Duties Undertaken). Tuanze kazi ya kwanza (2.2.1): Ni kazi au shughuli gani ya vitendo uliyoifanya field?"

   • STEP 3: CHAPTER 2 (PRACTICAL TECHNICAL TASKS & LOGBOOK INTEGRATION):
     - ⚠️ CRITICAL LOGBOOK CHECK:
       If the student has ALREADY filled logbook entries in reportData.logbooks (logbooksCount > 0) OR asks to pull from logbook:
       - ⚠️ STRICT PROHIBITION: NEVER ask "Tuanze kazi ya kwanza: ni kazi gani uliyoifanya field?" when logbook entries already exist! The student already documented their practical duties in the logbook!
       - AUTOMATICALLY pull and synthesize all weekly technical tasks from their logbook into Chapter 2 (sections 2.2.1, 2.2.2, 2.2.3, etc.).
       - In json_action, output action: "update_chapter", chapterId: "chap2", with thorough, dense, rigorous technical engineering sections for each week/milestone from their logbook, complete with tools used, methodology, and safety precautions.
       - Also populate Chapter 3 (Skills & Methodology) with competencies and skillsGained from the logbook.
       - In your chat message in Swahili, warmly confirm:
         "Nimevuta kiotomatiki kazi zote za vitendo ulizojaza kwenye Logbook yako (Wiki 1 hadi [X]) na kuziandika kwa kina katika Chapter 2 (na ujuzi katika Chapter 3) kwenye A4! Sasa tunaweza kuendelea moja kwa moja na Sura ya 4 (Gaps in Technology) au una swali lolote?"
       - Provide chips: ["Endelea na Chapter 4", "Kagua Chapter 2 Kwenye Docs", "Ongeza Kazi Nyingine"].

     - ONLY IF NO LOGBOOK ENTRIES EXIST (logbooksCount === 0):
       - Ask for Task 1: "Tuanze kazi ya kwanza (2.2.1): Ni kazi au shughuli gani ya vitendo uliyoifanya field?"
       - Once student answers with task: Expand into an authoritative engineering task in json_action (action: "add_task").
       - Ask for Task 2: "Kazi ya pili ya vitendo (2.2.2) uliyofanya ilikuwa ipi?"
       - Expand into task 2.
       - Ask for Task 3: "Kazi ya tatu ya vitendo (2.2.3) uliyofanya ilikuwa ipi?"
       - Expand into task 3.
       - When at least 3 tasks are recorded: Ask: "Je, una kazi nyingine ya vitendo uliyoifanya field, au tuendelee na Chapter 3 (Skills & Methodology)?" Chips: ["Ongeza Kazi Nyingine", "Endelea na Chapter 3"].

   • STEP 4: CHAPTER 3 INTERVIEW (SKILLS & METHODOLOGY):
     - Ask ONLY: "Chapter 3: Ni ujuzi gani mpya wa vitendo au mifumo uliyojifunza field ambao hukuwa nao chuoni?"
     - Once answered: Generate full Chapter 3 in json_action (action: "update_chapter", chapterId: "chap3").
     - Announce Chapter 3 is done, and proceed immediately to Chapter 4.

   • STEP 5: CHAPTER 4 INTERVIEW (GAPS IN SKILLS & TECH):
     - Ask ONLY: "Chapter 4: Teknolojia au vifaa gani vya kisasa uliviona field lakini chuoni havifundishwi au havipo maabara?"
     - Once answered: Generate full Chapter 4 in json_action (action: "update_chapter", chapterId: "chap4").
     - Announce Chapter 4 is done, and proceed immediately to Chapter 5.

   • STEP 6: CHAPTER 5 INTERVIEW (CONCLUSIONS & RECOMMENDATIONS):
     - Ask ONLY: "Chapter 5: Ushauri gani unatoa kwa chuo chako (${uniShort}) na ushauri gani kwa Kampuni/Host Firm?"
     - Once answered: Generate full Chapter 5 in json_action (action: "update_chapter", chapterId: "chap5").
       Must include all 4 official sections:
         • 5.1 Conclusion
         • 5.2 Recommendations
         • 5.2.1 Recommendations to Institute (${uniShort})
         • 5.2.2 Recommendations to Organisation (Firm)
       In preliminaries, generate:
         • "abstract": Dense academic executive summary paragraph (150-250 words) synthesizing host firm background, duties performed, skills gained, and overall IPT impact.
       (Note: Do NOT dump huge manual lists of abbreviations in Chapter 5 JSON because the system automatically harvests and compiles all technical abbreviations across Chapters 1 to 5 dynamically).
     - In chat, warmly congratulate the student: "Hongera sana! Ripoti yako yote ya IPT imekamilika 100% kuanzia Jalada, Sura ya 1 hadi 5, na kurasa za awali! Sasa iko tayari kupakuliwa kama Word (.docx) au PDF!"
`;

  return `You are the ${roleTitle}.

YOUR CORE PERSONALITY & INTELLIGENCE:
1. STRICT SINGLE-QUESTION RULE (KANUNI YA SWALI MOJA TU):
   - ⚠️ NEVER ASK TWO OR MORE QUESTIONS AT ONCE. Ask ONLY ONE question per turn!
   - Keep chat messages short, encouraging, and clear (1 to 2 sentences).
   - Put all academic document text in json_action.

2. STRICT SEQUENTIAL PROGRESSION (MTIRIRIKO WA MSTARI MMOJA BILA KURUKA):
   - ⚠️ Never jump ahead or offer future chapter choices until the current chapter is fully done!
   - Follow: Cover Page -> Chapter 1 -> Chapter 2 -> Chapter 3 -> Chapter 4 -> Chapter 5 -> Smart Preliminaries.
${interviewProtocol}

3. DOCUMENT WRITING ARCHITECTURE & HIGH-DENSITY DEPTH:
   - Your chat bubble message should be conversational, helpful, encouraging, and natural (1 to 3 sentences in Swahili with relevant chips).
   - ALL technical/academic report text MUST be placed inside the JSON \`json_action\` block at the end of your response.
   - ⚠️ NEVER GENERATE BRIEF OR SHALLOW 1-PAGE SUMMARIES! Higher learning engineering standards require dense, rigorous, multi-paragraph academic reports.
   - ⚠️ BRAND PRIVACY: Present yourself neutrally as "Field Report AI" or "IPT Technical Assistant". Do NOT output or announce the acronym "DIT" in conversational chat greetings with the user.

4. ZERO-MEMORIZATION & ANTI-PLAGIARISM RULE (HIGH UNIQUENESS):
   - NEVER use canned scripts, repetitive templates, or cookie-cutter paragraphs.
   - Every student's report must be 100% uniquely synthesized based on their specific host organization, department, systems/tools used, and unique real-world friction encountered.
   - Rotate linguistic structures dynamically: alternate between active and passive voice, vary professional verbs, and tailor industry metrics.

5. OFFICIAL ${uniShort.toUpperCase()} REPORT STRUCTURE & NUMBERING:
${chaptersOutline}

7. ACTION BLOCKS FORMAT:
   Always append a single valid JSON block at the very end of your response:
\`\`\`json_action
{
  "action": "update_metadata" | "update_chapter" | "add_task" | "update_preliminaries" | "generate_logbook" | "general_chat",
  "metadata": {
    "studentName": "...",
    "department": "...",
    "admissionNo": "...",
    "program": "...",
    "ntaLevel": "NTA LEVEL 7" | "NTA LEVEL 6",
    "classCode": "...",
    "module": "INDUSTRIAL PRACTICAL TRAINING (IPT)",
    "firm": "...",
    "firmSupervisor": "...",
    "instituteSupervisor": "...",
    "academicYear": "2024/2025",
    "fieldSpan": "FROM 5 AUGUST 2024 TO 5 OCTOBER 2024"
  },
  "chapterId": "chap1" | "chap2" | "chap3" | "chap4" | "chap5",
  "sections": [
    { 
      "id": "s2_0", 
      "code": "2.0", 
      "title": "Introduction", 
      "content": "..." 
    },
    { 
      "id": "s2_1", 
      "code": "2.1", 
      "title": "Objectives", 
      "content": "..." 
    },
    { 
      "id": "s2_2_1", 
      "code": "2.2.1", 
      "title": "...", 
      "content": "...",
      "tools": ["Tool 1", "Tool 2"],
      "vivaTip": { "question": "...", "expectedAnswer": "..." }
    }
  ],
  "task": {
    "title": "...",
    "content": "...",
    "persona": "troubleshooting",
    "tools": ["..."],
    "vivaTip": { "question": "...", "expectedAnswer": "..." }
  },
  "chips": ["Option 1", "Option 2"]
}
\`\`\`

CURRENT LIVE DOCUMENT STATE:
\`\`\`json
${JSON.stringify({
    university: uniShort,
    metadata: reportData?.metadata || {},
    preliminaries: {
      hasDeclaration: !!reportData?.preliminaries?.declaration,
      hasAcknowledgement: !!reportData?.preliminaries?.acknowledgement,
      hasAbstract: !!reportData?.preliminaries?.abstract,
      abbreviationsCount: reportData?.preliminaries?.abbreviations?.length || 0
    },
    chapters: reportData?.chapters?.map(c => ({
      id: c.id,
      number: c.number,
      title: c.title,
      sectionsCount: c.sections?.length || 0
    })),
    logbooksCount: reportData?.logbooks?.length || 0,
    logbooks: (reportData?.logbooks || []).map(l => ({
      weekNumber: l.weekNumber,
      title: l.title,
      weeklySummary: l.weeklySummary,
      skillsGained: l.skillsGained,
      days: (l.days || []).map(d => ({ day: d.day, task: d.task, tools: d.tools }))
    }))
  }, null, 2)}
\`\`\`

REMEMBER: Avoid AI clichés (delve, pivotal, tapestry, realm, seamless, testament). Write in formal academic engineering English inside \`json_action\`, while keeping your chat bubble friendly and conversational in Swahili!`;
}

/**
 * Calls Hive AI (DeepSeek v4.1 Flash) directly with conversation history and document context
 */
export async function sendChatMessageToAI({
  messages,
  reportData,
  apiKey = DEFAULT_HIVE_KEY,
  modelName = DEFAULT_MODEL,
  baseUrl = DEFAULT_HIVE_BASE_URL
}) {
  const { activeKey, activeModel, activeBaseUrl } = resolveActiveCredentials({ apiKey, modelName, baseUrl });

  const systemInstruction = buildMasterSystemPrompt(reportData);

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  const endpoint = `${activeBaseUrl}/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: formattedMessages,
        temperature: 0.4,
        max_tokens: 8000,
        stream: false
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content?.trim() || '';

    // Parse action block (supports json_action or json, closed or unclosed)
    let cleanText = rawContent;
    let actionData = null;
    let chips = [];
    let jsonBlockContent = null;

    const closedMatch = rawContent.match(/```(?:json_action|json)?\s*([\s\S]*?)\s*```/i);
    if (closedMatch) {
      jsonBlockContent = closedMatch[1].trim();
      cleanText = rawContent.replace(/```(?:json_action|json)?\s*[\s\S]*?\s*```/i, '').trim();
    } else {
      const openMatch = rawContent.match(/```(?:json_action|json)?\s*([\s\S]*)$/i);
      if (openMatch) {
        jsonBlockContent = openMatch[1].trim();
        cleanText = rawContent.replace(/```(?:json_action|json)?\s*[\s\S]*$/i, '').trim();
      } else {
        const bareIdx = rawContent.indexOf('{"action"');
        if (bareIdx !== -1) {
          jsonBlockContent = rawContent.substring(bareIdx).trim();
          cleanText = rawContent.substring(0, bareIdx).trim();
        }
      }
    }

    if (jsonBlockContent) {
      try {
        const parsed = safeParseJSON(jsonBlockContent);
        if (parsed && typeof parsed === 'object') {
          actionData = parsed;
          if (actionData.chips && Array.isArray(actionData.chips)) {
            chips = actionData.chips;
          }
        }
      } catch (e) {
        console.warn('Failed to parse action JSON block:', e);
      }
    }

    // Record analytics telemetry
    try {
      const studentName = reportData?.metadata?.studentName || '';
      const university = reportData?.metadata?.universityName || 'DIT';
      const promptText = messages.map(m => m.text).join(' ');
      const totalTokensUsage = data?.usage?.total_tokens || Math.round(((promptText.length + rawContent.length) / 3.8));

      analyticsService.recordAiGeneration({
        promptText,
        responseText: rawContent,
        studentName,
        university,
        tokensEstimated: totalTokensUsage,
        modelName: activeModel
      });
    } catch (telemetryErr) {
      console.warn('Analytics telemetry recording error:', telemetryErr);
    }

    return {
      text: cleanText,
      actionData,
      chips,
      aiScore: checkAIClichés(cleanText)
    };
  } catch (err) {
    console.error('DeepSeek call failed:', err);
    throw err;
  }
}

/**
 * Generates a humanized, detailed technical activity paragraph for Chapter 2 practical tasks
 */
export async function generateHumanizedActivityParagraph({
  apiKey = DEFAULT_HIVE_KEY,
  modelName = DEFAULT_MODEL,
  baseUrl = DEFAULT_HIVE_BASE_URL,
  department = {},
  level = 'degree',
  companyName = '',
  persona = 'methodological',
  activityName = '',
  toolsUsed = '',
  specificDevice = '',
  challengeEncountered = ''
}) {
  const { activeKey, activeModel, activeBaseUrl } = resolveActiveCredentials({ apiKey, modelName, baseUrl });

  const prompt = `You are a Senior Engineering Supervisor and Technical Assessor in Tanzania.
Write a rich, highly unique, authentic academic technical report paragraph (140-200 words) describing the practical task executed during Industrial Practical Training (IPT / PT).

Details:
- Department: ${department.name || 'Engineering'}
- Student Level: ${level === 'degree' ? 'Bachelor of Engineering (NTA Level 7/8)' : 'Ordinary Diploma (NTA Level 6)'}
- Host Company: ${companyName || 'Host Firm'}
- Writing Persona/Style: ${persona}
- Activity: ${activityName}
- Tools & Materials: ${toolsUsed}
- Specific Equipment/Model: ${specificDevice}
- Real Troubleshooting/Friction Solved: ${challengeEncountered}

Strict Anti-Plagiarism & Quality Requirements:
1. NEVER use generic templates, boilerplate openings, or memorized formulas. Craft a 100% original narrative synthesized directly from the student's unique inputs.
2. Ban AI clichés (do NOT use delve, pivotal, seamless, testament, realm, tapestry, beacon, paramount, furthermore).
3. Include exact tool names, specifications, operational steps, realistic engineering friction, and quantitative verification.
4. Written in formal, authoritative academic English.

Return JSON in this format only:
\`\`\`json
{
  "paragraph": "...",
  "vivaTip": {
    "question": "...",
    "expectedAnswer": "..."
  }
}
\`\`\``;

  try {
    const res = await fetch(`${activeBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: 'You are an engineering report writing expert. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.55,
        max_tokens: 1200
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || '';
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
    const parsed = JSON.parse(jsonMatch[1].trim());

    return {
      paragraph: parsed.paragraph || rawText,
      vivaTip: parsed.vivaTip || getVivaTipForActivity(department.id || 'computer', activityName),
      aiScore: checkAIClichés(parsed.paragraph || rawText)
    };
  } catch (err) {
    console.warn('Fallback generating local activity paragraph:', err);
    const fallbackText = `During the technical attachment at ${companyName || 'the host firm'}, practical operations were conducted on ${activityName}. The execution required the deployment of ${toolsUsed || 'standard diagnostic and installation tools'}, specifically interfacing with ${specificDevice || 'designated equipment'}. During the task, ${challengeEncountered ? `an operational discrepancy was identified involving ${challengeEncountered}, which was systematically isolated and rectified according to standard engineering procedures.` : 'testing protocols were performed to ensure full operational compliance with safety standards.'} Continuous inspection verified that all parameters conformed to technical specifications.`;
    return {
      paragraph: fallbackText,
      vivaTip: getVivaTipForActivity(department.id || 'computer', activityName),
      aiScore: checkAIClichés(fallbackText)
    };
  }
}

/**
 * Generates an exhaustive, multi-page, high-density Chapter 1 (Introduction & Company Overview)
 */
export async function generateRichChapter1({
  apiKey = DEFAULT_HIVE_KEY,
  modelName = DEFAULT_MODEL,
  baseUrl = DEFAULT_HIVE_BASE_URL,
  universityId = 'dit',
  universityName = 'Dar es Salaam Institute of Technology (DIT)',
  companyName = '',
  location = 'Dar es Salaam, Tanzania',
  department = 'Computer Studies',
  industry = 'Engineering and Technology Operations'
}) {
  const { activeKey, activeModel, activeBaseUrl } = resolveActiveCredentials({ apiKey, modelName, baseUrl });

  const prompt = `You are a Senior Technical Assessor and Industrial Practical Training Coordinator at ${universityName}.
Write a comprehensive, authentic, multi-page CHAPTER 1 (INTRODUCTION & COMPANY OVERVIEW) for an engineering IPT report.

STUDENT & ATTACHMENT DETAILS:
- University: ${universityName} (${universityId.toUpperCase()})
- Department: ${department}
- Host Company: ${companyName || 'Industrial Host Organization'}
- Location: ${location}
- Industry / Domain: ${industry}

MANDATORY SECTIONS (MUST BE EXPANSIVE AND MULTI-PARAGRAPH):
1. "1.0 Introduction" (id: "s1_0"): 2 deep academic paragraphs explaining the curriculum purpose of IPT at ${universityId.toUpperCase()}, industrial skills acquisition, professional readiness, and an overview of what Chapter 1 presents.
2. "1.1 Overview of the company" (id: "s1_1"): Includes "1.1.1 Background of company" describing the historical establishment, legal inception, expansion milestones, physical premises, regional branches, and strategic role in Tanzania.
3. "1.2 Mission and vision of company" (id: "s1_2"): Subdivided with explicit subheadings:
   - 1.2.1 Mission Statement
   - 1.2.2 Vision Statement
   - 1.2.3 Core Values & Quality Policy (Integrity, Innovation, Occupational Safety & Health / OSHA, Environmental Responsibility).
4. "1.3 Structure of company" (id: "s1_3"): Detailed narrative of the organizational organogram/hierarchy (Board, Executive Management, Technical/Engineering Divisions, Departmental Units, and the Trainee's attachment role).
5. "1.4 Primary function of company" (id: "s1_4"): Comprehensive description of core products, engineering services, industrial workflows, operational systems/infrastructure deployed, and client portfolio.

RULES:
- Total word count MUST be dense (~850 to 1,300 words, spanning 2 to 3 A4 pages).
- Written in formal, clear academic English.
- Avoid AI clichés (do NOT use delve, pivotal, tapestry, realm, seamless, testament, furthermore).
- Return ONLY valid JSON in the specified format:

\`\`\`json
{
  "chapterId": "chap1",
  "sections": [
    {
      "id": "s1_0",
      "code": "1.0",
      "title": "Introduction",
      "content": "..."
    },
    {
      "id": "s1_1",
      "code": "1.1",
      "title": "Overview of the company",
      "content": "1.1.1 Background of company\\n\\n..."
    },
    {
      "id": "s1_2",
      "code": "1.2",
      "title": "Mission and vision of company",
      "content": "1.2.1 Mission\\n...\\n\\n1.2.2 Vision\\n...\\n\\n1.2.3 Core Values and Quality Policy\\n..."
    },
    {
      "id": "s1_3",
      "code": "1.3",
      "title": "Structure of company",
      "content": "..."
    },
    {
      "id": "s1_4",
      "code": "1.4",
      "title": "Primary function of company",
      "content": "..."
    }
  ]
}
\`\`\``;

  try {
    const res = await fetch(`${activeBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: 'You are an engineering report writing expert. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 5000
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || '';
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
    const parsed = JSON.parse(jsonMatch[1].trim());

    return parsed.sections || [];
  } catch (err) {
    console.warn('Fallback generating rich local Chapter 1:', err);
    const firmName = companyName || 'The Host Organization';
    return [
      {
        id: 's1_0',
        code: '1.0',
        title: 'Introduction',
        content: `Industrial Practical Training (IPT) is an essential academic component of the engineering and technological curricula at ${universityName}. The program bridges the gap between theoretical principles mastered in lecture rooms and the pragmatic demands of engineering industries. Through structured immersion in a professional work environment, students acquire hands-on technical competencies, exposure to cutting-edge industrial systems, diagnostic acumen, and professional work ethics conforming to statutory engineering standards.\n\nThis chapter provides a comprehensive institutional overview of ${firmName}, where the technical attachment was conducted. It delineates the historical evolution of the enterprise, core corporate vision and mission mandates, administrative organogram, operational hierarchies, and the primary technical functions and services delivered to its client base.`
      },
      {
        id: 's1_1',
        code: '1.1',
        title: 'Overview of the company',
        content: `1.1.1 Background of company\n\n${firmName} is an established technological and engineering enterprise operating in Tanzania, with its primary operational base located at ${location}. Over the past years, the enterprise has consistently expanded its infrastructural capabilities to address dynamic technological demands across commercial, industrial, and public sectors.\n\nEstablished under statutory registration, the organization has evolved from an initial localized operations framework into a robust technical facility equipped with specialized workshops, engineering laboratory units, and advanced operational infrastructure. It contributes significantly to regional economic and infrastructural transformation by deploying standard engineering solutions, adhering strictly to national and international regulatory frameworks including Tanzania Bureau of Standards (TBS) and Occupational Safety and Health Authority (OSHA) compliance.`
      },
      {
        id: 's1_2',
        code: '1.2',
        title: 'Mission and vision of company',
        content: `1.2.1 Mission Statement\nTo deliver high-reliability, sustainable, and technologically sound engineering solutions through continuous innovation, disciplined operational execution, and customer-centric service delivery.\n\n1.2.2 Vision Statement\nTo be the premier engineering and technological enterprise of choice in East Africa, distinguished for technical excellence, operational integrity, and transformative industrial impact.\n\n1.2.3 Core Values and Quality Policy\nThe operations and engineering ethics at ${firmName} are governed by fundamental institutional pillars:\n• Integrity and Professional Ethics: Strict adherence to engineering transparency, honesty, and accountability.\n• Innovation and Technical Excellence: Continuous adoption of modern tools and engineering methodologies.\n• Occupational Safety and Environmental Stewardship: Zero-tolerance for unsafe practices, ensuring full PPE compliance and environmental protection.\n• Customer Satisfaction: Timely and quality execution of all client technical assignments.`
      },
      {
        id: 's1_3',
        code: '1.3',
        title: 'Structure of company',
        content: `${firmName} operates under a well-structured organizational hierarchy designed to ensure efficient administrative governance, seamless workflow coordination, and rigorous technical supervision. The governance framework is spearheaded by the Board of Directors and the Managing Director, who formulate strategic corporate policies.\n\nBeneath executive management, the structure branches into core functional directorates: the Directorate of Technical Engineering Services, Information and Communication Technology (ICT), Operations and Maintenance, Human Resources and Administration, and Finance. Each division is headed by a Senior Engineer / Head of Department (HOD), overseeing specialized teams of system engineers, technicians, and project supervisors. During the IPT attachment, the trainee was placed under the Engineering and Technical Operations Unit, reporting directly to the designated Industrial Supervisor.`
      },
      {
        id: 's1_4',
        code: '1.4',
        title: 'Primary function of company',
        content: `The primary functions of ${firmName} encompass specialized technical, maintenance, and engineering services tailored to industrial, corporate, and governmental institutions. Core technical responsibilities include:\n\n1. System Design and Engineering Deployment: Planning, schematic modeling, and physical installation of technological and engineering systems.\n2. Routine Preventative and Corrective Maintenance: Scheduled diagnostics, electrical/mechanical servicing, and emergency troubleshooting to ensure optimal system uptime.\n3. Quality Assurance and Testing: Systematic verification of performance parameters using certified testing instruments and calibration equipment.\n4. Technical Consultation and Client Support: Providing diagnostic insights, feasibility assessments, and technical training to client engineering personnel.`
      }
    ];
  }
}

/**
 * Generates an authoritative 5-day DIT IPT Weekly Logbook entry from brief/informal student notes
 */
export async function generateWeeklyLogbookEntry({
  apiKey = DEFAULT_HIVE_KEY,
  modelName = DEFAULT_MODEL,
  baseUrl = DEFAULT_HIVE_BASE_URL,
  weekNumber = 1,
  briefInput = '',
  dailyInputs = null,
  department = {},
  level = 'degree',
  companyName = ''
}) {
  const { activeKey, activeModel, activeBaseUrl } = resolveActiveCredentials({ apiKey, modelName, baseUrl });
  const deptName = department?.name || 'Engineering';
  const firm = companyName || 'Host Firm';

  let rawStudentNotes = '';
  if (dailyInputs && Object.values(dailyInputs).some(v => v && v.trim())) {
    rawStudentNotes = `STUDENT NOTES BY DAY (Note: Some days may be left blank or brief):
• Monday: ${dailyInputs.monday?.trim() || '(No notes provided - intelligently complement with realistic task)'}
• Tuesday: ${dailyInputs.tuesday?.trim() || '(No notes provided - intelligently complement with realistic task)'}
• Wednesday: ${dailyInputs.wednesday?.trim() || '(No notes provided - intelligently complement with realistic task)'}
• Thursday: ${dailyInputs.thursday?.trim() || '(No notes provided - intelligently complement with realistic task)'}
• Friday: ${dailyInputs.friday?.trim() || '(No notes provided - intelligently complement with realistic task)'}`;
    if (briefInput?.trim()) {
      rawStudentNotes += `\n\nAdditional Student Remarks: "${briefInput.trim()}"`;
    }
  } else {
    rawStudentNotes = `"${briefInput || 'General routine engineering duties and hands-on maintenance tasks'}"`;
  }

  const prompt = `You are an expert Tanzanian Engineering Supervisor and IPT Assessor at Dar es Salaam Institute of Technology (DIT).
A student from ${deptName} (${level === 'degree' ? 'Bachelor of Engineering - NTA Level 8' : 'Ordinary Diploma - NTA Level 6'}) undertaking Industrial Practical Training (IPT) at ${firm} has submitted raw notes for WEEK ${weekNumber}.

RAW STUDENT INPUT:
${rawStudentNotes}

OFFICIAL DIT IPT LOGBOOK BOOKLET SPECIFICATION (EXACT 4 PAGES PER WEEK):
The official physical DIT IPT logbook booklet is strictly organized into FOUR PAGES per week.

CRITICAL INSTRUCTIONS FOR AUTHENTICITY, VARIETY & FLEXIBILITY:
1. NO COOKIE-CUTTER OR REPETITIVE HEADINGS:
   - Multiple students doing training in the same department or company will use this system. They MUST NOT all have identical, fixed headings (e.g. NEVER default to the exact same "Objectives", "How It Works", "Safety", "Skills" on every report!).
   - Create DYNAMIC, NATURAL, AND HIGHLY SPECIFIC headings that directly describe the actual technical topic, modules, systems, or practical activities of this particular week.
   - Vary the structural angle naturally depending on the work. For example:
     • Structure Option A (Architecture & Implementation):
       - 1.0 Architectural Overview of [System / Task]
       - 2.0 Database Schema & Relational Integration
       - 3.0 Step-by-Step Implementation of Core Logic
       - 4.0 Security Measures & Error Prevention
       - 5.0 Diagnostic Challenges & Troubleshooting
       - 6.0 Competencies & Practical Engineering Insights
     • Structure Option B (Workflow, Setup & Testing):
       - 1.0 Contextual Background & Operational Scope
       - 2.0 Technical Setup & Module Configuration
       - 3.0 Practical Execution of Daily Activities
       - 4.0 Testing, Validation, and Performance Optimization
       - 5.0 Workplace Problem Resolution & Safety Protocols
       - 6.0 Key Technical Skills Acquired
     • Structure Option C (System Design & Troubleshooting):
       - 1.0 Technical Background of the Deployment Environment
       - 2.0 System Modeling & Interface Design
       - 3.0 Procedural Execution & Component Integration
       - 4.0 Real-World Exceptions Diagnosed & Solved
       - 5.0 Operational Best Practices, HSE Compliance & Practical Competencies
   - Tailor the sections uniquely and organically to the student's actual work so every report is fresh and different!

2. BALANCED LENGTH CONSTRAINTS (STRICTLY 2 TO 3 LINES ON SCREEN / 35 TO 50 WORDS PER SECTION):
   - PHYSICAL HANDWRITING LIMIT: The student is copying this text BY HAND into physical ruled lines of an official paper logbook. If you write long paragraphs, they will overflow the physical page and the student cannot copy them!
   - STRICT LENGTH LIMIT PER SECTION: Each section's "content" MUST be concise, balanced, and tightly written: exactly 2 to 3 clear sentences (approx 35 to 50 words total).
   - On a computer screen, each section must take NO MORE THAN 2 TO 3 LINES of text. Do NOT write long essays or walls of text exceeding 3 lines!
   - Balance: Express the core technical action, the method used, and the result or significance concisely in 2-3 sentences.
   - For sections using steps or points, use exactly 2 to 3 short, punchy lines (e.g. 1. ... 2. ... 3. ...), each being 1 short sentence so the total section remains under 3 lines on screen.

3. AUTHENTIC STUDENT-LEVEL VOCABULARY:
   - Use clean, natural, and realistic student-level English.
   - Avoid pretentious PhD-level jargon (avoid: "telemetry", "remediation", "orchestration", "concomitant", "delineate", "axiomatic", "paradigmatic", "attenuation dynamics", "dense strata").
   - Write like a bright, capable college trainee who understands what they built and can explain it clearly.

4. PAGE 1: Daily Summary Table (5 Rows: Monday to Friday):
   - 5 rows: Monday, Tuesday, Wednesday, Thursday, Friday.
   - "heading": Clean, descriptive task title (strictly NO tools in heading! Keep heading focused purely on the technical activity).
   - "inShort": Exactly 1 concise sentence (under 20 words) explaining what was accomplished that day.
   - "tools": Array of 2-4 exact tools/software/technologies used that day.
   - If the student left days blank, deduce realistic sequential tasks so all 5 rows are complete.

5. PAGE 2 & PAGE 3: Detailed Technical Report (Parts 1 and 2):
   - Choose 2 to 3 dynamic sections for Page 2, and 2 to 3 dynamic sections for Page 3 (total 5 to 6 sections across Pages 2 & 3).
   - Each section must have a unique, contextual "heading" (e.g. "1.0 ...", "2.0 ...", "3.0 ...", "4.0 ...", "5.0 ...", "6.0 ...") and concise "content" (2-3 sentences, maximum 3 lines on screen).

6. PAGE 4: Technical Diagram & Sketch (Mchoro wa Kiufundi):
   - Determine intelligently whether the work justifies an engineering diagram/sketch:
   • IF YES ("hasDiagram": true):
     - "diagramTitle": e.g. "Figure W${weekNumber}.1: System Flowchart / Architecture"
     - "diagramType": e.g. "Architecture Flowchart" | "Circuit Schematic" | "Network Topology" | "Mechanical Sketch" | "Database ERD"
     - "recommendationAdvice": 1-2 simple sentences on why drawing this diagram helps in the booklet.
     - "stepByStepDrawingInstructions": 4-5 simple numbered steps on how to draw it with pencil and ruler.
     - "keyLabelsToInclude": Array of essential labels to write on the sketch.
     - "asciiPreview": Clean ASCII diagram layout.
   • IF NO ("hasDiagram": false):
     - "recommendationAdvice": Clear statement that no sketch is required this week.
     - "alternativeAction": Advice to leave Page 4 blank or attach an operational worksite photograph.

7. Strict Requirements:
   - 1. STRICT LANGUAGE MANDATE: ALL OUTPUT MUST BE 100% IN SIMPLE, CLEAN, STUDENT-LEVEL ENGLISH ONLY! DO NOT USE ANY SWAHILI WORDS IN ANY PART OF THE GENERATED JSON.
   - 2. NO TOOLS IN DAILY HEADINGS: Keep tools strictly in the "tools" array, never in the daily task "heading".
   - 3. STRICT LENGTH LIMIT: Every section's "content" MUST fit in at most 2-3 lines on a computer screen (approx 35-50 words). Never generate long paragraphs!
   - 4. Avoid AI clichés (do NOT use delve, pivotal, seamless, testament, realm, tapestry, beacon, paramount, furthermore).
   - 5. CRITICAL JSON SYNTAX RULE: NEVER use unescaped double quotes (") inside string values. If referring to commands, codes, tools, or names, ALWAYS use single quotes (') like 'GET', 'API', 'Node.js', 'Postman'. Output MUST be strictly parseable JSON.
   - 6. Return STRICTLY valid JSON with this exact structure:

\`\`\`json
{
  "weekNumber": ${weekNumber},
  "title": "Week ${weekNumber}: [Clear Technical Focus Title]",
  "briefInput": "${(briefInput || '').replace(/"/g, "'")}",
  "page1_dailySummary": [
    {
      "day": "Monday",
      "heading": "Clean Activity Title (No Tools in Title)",
      "inShort": "One short sentence explaining what was done.",
      "tools": ["Tool 1", "Tool 2"]
    },
    {
      "day": "Tuesday",
      "heading": "Clean Activity Title",
      "inShort": "One short sentence explaining what was done.",
      "tools": ["Tool 1", "Tool 2"]
    },
    {
      "day": "Wednesday",
      "heading": "Clean Activity Title",
      "inShort": "One short sentence explaining what was done.",
      "tools": ["Tool 1", "Tool 2"]
    },
    {
      "day": "Thursday",
      "heading": "Clean Activity Title",
      "inShort": "One short sentence explaining what was done.",
      "tools": ["Tool 1", "Tool 2"]
    },
    {
      "day": "Friday",
      "heading": "Clean Activity Title",
      "inShort": "One short sentence explaining what was done.",
      "tools": ["Tool 1", "Tool 2"]
    }
  ],
  "page2_detailedReport": {
    "topic": "Comprehensive Topic for Page 2 & 3",
    "sections": [
      {
        "heading": "1.0 [Dynamic Contextual Heading 1]",
        "content": "[Concise 2-3 sentence technical description, strictly 35-50 words, maximum 3 lines on screen]"
      },
      {
        "heading": "2.0 [Dynamic Contextual Heading 2]",
        "content": "[Concise 2-3 sentence technical explanation or 2-3 short points, max 3 lines on screen]"
      },
      {
        "heading": "3.0 [Dynamic Contextual Heading 3]",
        "content": "[Concise 2-3 sentence execution summary or 3 short steps, max 3 lines on screen]"
      }
    ],
    "toolsAndEquipment": ["Tool 1", "Tool 2", "Safety Gear"]
  },
  "page3_detailedReport": {
    "sections": [
      {
        "heading": "4.0 [Dynamic Contextual Heading 4]",
        "content": "[Concise 2-3 sentence technical explanation, max 3 lines on screen]"
      },
      {
        "heading": "5.0 [Dynamic Contextual Heading 5]",
        "content": "[Concise 2-3 sentence problem, cause and solution summary, max 3 lines on screen]"
      },
      {
        "heading": "6.0 [Dynamic Contextual Heading 6]",
        "content": "[Concise 2-3 sentence competencies and safety summary, max 3 lines on screen]"
      }
    ],
    "safetyPrecautions": "Summary of safety and precautions...",
    "challengesAndSolutions": "Summary of challenges and fixes...",
    "skillsLearnt": "Summary of practical skills learned..."
  },
  "page4_technicalDiagram": {
    "hasDiagram": true,
    "diagramTitle": "Figure W${weekNumber}.1: [Diagram Title]",
    "diagramType": "Architecture Flowchart",
    "recommendationAdvice": "Why to draw this sketch...",
    "stepByStepDrawingInstructions": [
      "1. ...",
      "2. ...",
      "3. ...",
      "4. ..."
    ],
    "keyLabelsToInclude": ["Label 1", "Label 2", "Label 3"],
    "asciiPreview": "+-------------+\\n| System Node |\\n+-------------+",
    "alternativeAction": "If no diagram: leave blank or paste photo"
  }
}
\`\`\``;


  try {
    const res = await fetch(`${activeBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: 'You are an expert Tanzanian DIT Engineering IPT Assessor. You analyze the student\'s raw daily notes and generate authentic, matching engineering descriptions. Return ONLY a single raw valid JSON object. IMPORTANT: Do NOT use raw double quotes inside text values (use single quotes \'example\' instead). Output MUST be 100% valid JSON without markdown wrapping.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 3800
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || '';

    let parsed = safeParseJSON(rawText);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('safeParseJSON failed to parse raw text, activating emergency fallback logbook builder...');
      parsed = buildEmergencyFallbackLogbook({
        weekNumber,
        briefInput,
        dailyInputs,
        deptName,
        firm
      });
    } else {
      // Ensure all critical sections exist even if the model omitted one
      const fallback = buildEmergencyFallbackLogbook({
        weekNumber,
        briefInput,
        dailyInputs,
        deptName,
        firm
      });

      if (!parsed.page1_dailySummary || !Array.isArray(parsed.page1_dailySummary) || parsed.page1_dailySummary.length === 0) {
        parsed.page1_dailySummary = fallback.page1_dailySummary;
      } else if (parsed.page1_dailySummary.length < 5) {
        while (parsed.page1_dailySummary.length < 5) {
          parsed.page1_dailySummary.push(fallback.page1_dailySummary[parsed.page1_dailySummary.length]);
        }
      }

      if (!parsed.page2_detailedReport || !parsed.page2_detailedReport.sections || !Array.isArray(parsed.page2_detailedReport.sections)) {
        parsed.page2_detailedReport = fallback.page2_detailedReport;
      }

      if (!parsed.page3_detailedReport || !parsed.page3_detailedReport.sections || !Array.isArray(parsed.page3_detailedReport.sections)) {
        parsed.page3_detailedReport = fallback.page3_detailedReport;
      }

      if (!parsed.page4_technicalDiagram) {
        parsed.page4_technicalDiagram = fallback.page4_technicalDiagram;
      }
    }

    // Normalize backward compatibility fields
    if (parsed.page1_dailySummary && !parsed.days) {
      parsed.days = parsed.page1_dailySummary.map(d => ({
        day: d.day,
        date: d.day,
        task: `${d.heading}: ${d.inShort}`,
        tools: d.tools || []
      }));
    }

    // Ensure page2 and page3 combined description for report sync
    const p2Sections = parsed.page2_detailedReport?.sections || [];
    const p3Sections = parsed.page3_detailedReport?.sections || [];
    const allSections = [...p2Sections, ...p3Sections];

    const combinedSummary = allSections.map(s => `${s.heading}\n${s.content}`).join('\n\n');
    if (!parsed.weeklySummary) {
      parsed.weeklySummary = combinedSummary;
    }
    if (!parsed.skillsGained) {
      parsed.skillsGained = parsed.page3_detailedReport?.skillsLearnt ||
        p3Sections.find(s => s.heading.toLowerCase().includes('skill') || s.heading.toLowerCase().includes('competenc'))?.content ||
        'Acquired practical engineering competencies and tool manipulation.';
    }

    if (parsed.page2_detailedReport && !parsed.page2_detailedReport.detailedDescription) {
      parsed.page2_detailedReport.detailedDescription = p2Sections.map(s => `${s.heading}\n${s.content}`).join('\n\n');
    }

    return parsed;
  } catch (err) {
    console.error('Error generating weekly logbook entry:', err);
    throw new Error(`AI generation failed: ${err.message || 'Please check your internet connection or API key and try again.'}`);
  }
}
