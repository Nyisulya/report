import { getVivaTipForActivity } from '../data/vivaQuestions.js';
import { getUniversityStructure } from '../data/universityStructures.js';
import { analyticsService } from './analyticsService.js';

export const DEFAULT_DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
export const DEFAULT_MODEL = 'deepseek-flash';

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

  const interviewProtocol = isIFM ? `
   • When student selects or mentions CHAPTER 1 (INTRODUCTION):
     - If company details are missing: DO NOT write Chapter 1 yet. ASK: "Tuanze Chapter 1: Shirika/Kampuni ulilofanyia field linaitwaje (k.m. NSSF, CRDB, TRA), lipo mkoa gani, na ulikuwa kitengo/idara gani?" and provide chips.
     - Once student gives info: Generate the full 6 academic sections of Chapter 1 (1.1 Intro, 1.2 Attachment Overview & Objectives, 1.3 Host Org Overview & Dept, 1.4 Org Structure, 1.5 Industry Review, 1.6 Report Structure) in \`json_action\` (\`action: "update_chapter"\`), then ASK: "Chapter 1 imekamilika! Uko tayari tuanze Chapter 2 (Work Done & Lessons Learnt)?"

   • When student selects or mentions CHAPTER 2 (WORK DONE AND LESSONS LEARNT):
     - In \`json_action\`, set \`action: "update_chapter"\` containing "2.1 Chapter Introduction".
     - ASK: "Karibu Chapter 2! Tuanze na kazi ya kwanza uliyoifanya (2.2.1): Ni majukumu gani uliyotekeleza (k.m. Member enrollment katika SHIB, Contribution verification, Claims processing, Cashier/Banking reconciliation)?"
     - When student names their task: Expand into 2.2.X Description of Task, 2.3.X Lessons Learnt, 2.4 Summary of Work, and 2.5 Challenges Encountered.

   • When student selects or mentions CHAPTER 3 (LITERATURE REVIEW):
     - ASK: "Chapter 3 ni Literature Review ya kitaaluma: Tuchambue machapisho na nadharia gani za kimasomo (k.m. DAMA Data Management, COSO Internal Controls, SERVQUAL Service Quality, ILO Social Protection, ISO Records Management)?"
     - Generate an authoritative academic Literature Review with formal APA citations.

   • When student selects or mentions CHAPTER 4 (ANALYSIS):
     - ASK: "Chapter 4 ni Analysis: Tofauti gani na mapengo (gaps) uliziona kati ya nadharia ulizosoma darasani na utendaji halisi wa kazi (Theory vs Practice), na ujuzi gani umeimarika kwa taaluma yako?"
     - Generate dense analytical sections: 4.1 Intro, 4.2 Comparison between Theory & Practice, 4.3 Skills Enhanced, 4.4 The Gap Between Theory & Practice, 4.5 Career Development.

   • When student selects or mentions CHAPTER 5 (CONCLUSION AND RECOMMENDATIONS):
     - ASK: "Chapter 5: Ushauri gani unatoa kwa IFM (k.m. Kuongeza mifumo ya vitendo, mitaala ya kidijitali) na ushauri kwa Taasisi/Kampuni (k.m. Kuboresha mifumo ya SHIB/ICT, mafunzo kwa watumishi)?"
     - Generate 5.1 Conclusion, 5.2.1 Rec to IFM, 5.2.2 Rec to Host Org, and compile APA References.
` : `
   • When student selects or mentions CHAPTER 1:
     - If company details are missing: DO NOT write Chapter 1 yet. In your chat message, ASK: "Tuanze Chapter 1: Kampuni au Shirika ulilofanyia field linaitwaje, liko wapi (Location), na ulikuwa kitengo gani?" and provide chips of common companies.
     - Once student gives company info: Generate the full 5 deep sections of Chapter 1 in \`json_action\` (\`action: "update_chapter"\`), and then ASK: "Chapter 1 imekamilika na kujaza kurasa za A4! Uko tayari tuanze Chapter 2 (Technical Duties)?"
   
   • When student selects or mentions CHAPTER 2:
     - DO NOT invent tasks by yourself!
     - In \`json_action\`, set \`action: "update_chapter"\` containing ONLY "2.0 Introduction" and "2.1 Objectives".
     - In your chat message, ASK: "Karibu Chapter 2! Tuanze na kazi ya kwanza ya vitendo (2.2.1): Ni kazi au shughuli gani ya kiufundi uliyoifanya field?" and provide department-specific activity chips!
     - When student names their task: In your chat message, ASK: "Vifaa / tools gani mlitumia, na hitilafu gani ndogo ilijitokeza mkaitatua?" and provide tool chips.
     - Once student replies: Expand their answer into an authoritative 300-word engineering duty (with tools, procedure, troubleshooting, and Viva tip) in \`json_action\` (\`action: "add_task"\`), and then ASK: "Kazi ya 2.2.X imeingia kwenye ripoti! Je, tuongeze kazi nyingine ya 2.2.Y au twende Chapter 3 (Skills)?"
   
   • When student selects or mentions CHAPTER 3 (SKILLS & METHODOLOGY):
     - ASK: "Chapter 3: Ujuzi (skills) gani mpya ulijifunza field ambao hukuwa nao chuoni, na methodology gani mliitumia kufanya kazi?"
   
   • When student selects or mentions CHAPTER 4 (GAPS IN SKILLS & TECH):
     - ASK: "Chapter 4: Teknolojia au vifaa gani vya kisasa uliviona field lakini chuoni havifundishwi au havipo maabara?"
   
   • When student selects or mentions CHAPTER 5 (CONCLUSIONS & RECOMMENDATIONS):
     - ASK: "Chapter 5: Ushauri gani unatoa kwa chuo chako (${uniShort}) na ushauri gani kwa Kampuni/Host Firm?"
     - Once Chapter 5 is written: Execute THE SMART COMPILE (harvest abbreviations and generate abstract in preliminaries).
`;

  return `You are the ${roleTitle}.

YOUR CORE PERSONALITY & INTELLIGENCE:
1. NATURAL, HUMAN-LIKE & CONVERSATIONAL:
   - Talk naturally and intelligently in friendly Swahili (using standard technical English terms where appropriate).
   - NEVER sound robotic or use canned scripts. Think dynamically and respond specifically to whatever the student says.
   - You can chat, give tips, explain concepts, answer presentation/Viva questions, guide the student, and write entire report chapters.

2. CONVERSATIONAL INTERVIEW PROTOCOL (MANDATORY BEHAVIOR):
   - ⚠️ NEVER GENERATE CHAPTERS OR TASKS WITHOUT ASKING THE STUDENT FIRST!
   - You are an interactive mentor. You must ask concise, smart questions in Swahili and provide clickable chips.
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
    "admissionNo": "...",
    "department": "...",
    "program": "...",
    "classCode": "...",
    "firm": "...",
    "firmSupervisor": "...",
    "instituteSupervisor": "...",
    "academicYear": "...",
    "fieldSpan": "..."
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
    }))
  }, null, 2)}
\`\`\`

REMEMBER: Avoid AI clichés (delve, pivotal, tapestry, realm, seamless, testament). Write in formal academic engineering English inside \`json_action\`, while keeping your chat bubble friendly and conversational in Swahili!`;
}

/**
 * Calls DeepSeek v4 Flash directly with conversation history and document context
 */
export async function sendChatMessageToAI({
  messages,
  reportData,
  apiKey = DEFAULT_DEEPSEEK_KEY,
  modelName = DEFAULT_MODEL
}) {
  const activeKey = (apiKey && apiKey.trim().length > 5) ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;
  const activeModel = modelName || DEFAULT_MODEL;

  const systemInstruction = buildMasterSystemPrompt(reportData);

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  const endpoint = 'https://api.deepseek.com/chat/completions';

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
        max_tokens: 6000,
        stream: false
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content?.trim() || '';

    // Parse action block (supports json_action or json)
    let cleanText = rawContent;
    let actionData = null;
    let chips = [];

    const actionMatch = rawContent.match(/```(?:json_action|json)\s*([\s\S]*?)\s*```/i);
    if (actionMatch) {
      try {
        const parsed = JSON.parse(actionMatch[1].trim());
        if (parsed && typeof parsed === 'object' && (parsed.action || parsed.metadata || parsed.task || parsed.sections || parsed.preliminaries || parsed.chips)) {
          actionData = parsed;
          if (actionData.chips && Array.isArray(actionData.chips)) {
            chips = actionData.chips;
          }
          cleanText = rawContent.replace(/```(?:json_action|json)\s*[\s\S]*?\s*```/i, '').trim();
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
  apiKey = DEFAULT_DEEPSEEK_KEY,
  modelName = DEFAULT_MODEL,
  department = {},
  level = 'degree',
  companyName = '',
  persona = 'methodological',
  activityName = '',
  toolsUsed = '',
  specificDevice = '',
  challengeEncountered = ''
}) {
  const activeKey = (apiKey && apiKey.trim().length > 5) ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;
  const activeModel = modelName || DEFAULT_MODEL;

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
    const res = await fetch('https://api.deepseek.com/chat/completions', {
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
  apiKey = DEFAULT_DEEPSEEK_KEY,
  modelName = DEFAULT_MODEL,
  universityId = 'dit',
  universityName = 'Dar es Salaam Institute of Technology (DIT)',
  companyName = '',
  location = 'Dar es Salaam, Tanzania',
  department = 'Computer Studies',
  industry = 'Engineering and Technology Operations'
}) {
  const activeKey = (apiKey && apiKey.trim().length > 5) ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;
  const activeModel = modelName || DEFAULT_MODEL;

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
    const res = await fetch('https://api.deepseek.com/chat/completions', {
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
  apiKey = DEFAULT_DEEPSEEK_KEY,
  modelName = DEFAULT_MODEL,
  weekNumber = 1,
  briefInput = '',
  dailyInputs = null,
  department = {},
  level = 'degree',
  companyName = ''
}) {
  const activeKey = (apiKey && apiKey.trim().length > 5) ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;
  const activeModel = modelName || DEFAULT_MODEL;
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
   - 5. Return STRICTLY valid JSON with this exact structure:

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
    "asciiPreview": "+-------------+\n| System Node |\n+-------------+",
    "alternativeAction": "If no diagram: leave blank or paste photo"
  }
}
\`\`\``;


  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: 'You are an expert Tanzanian DIT Engineering IPT Assessor. You analyze the student\'s raw daily notes and generate authentic, matching engineering descriptions. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3800
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Engine error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || '';

    // Robust JSON extraction, control-character sanitization, and auto-repair
    function sanitizeJSON(str) {
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
            // drop non-printable control character
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

    let parsed = null;
    try {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let jsonStr = match ? match[1].trim() : rawText.trim();
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
      parsed = JSON.parse(sanitizeJSON(jsonStr));
    } catch (parseErr) {
      console.warn('Direct JSON parse failed, attempting auto-repair with sanitization...', parseErr);
      let repaired = rawText;
      const firstBrace = repaired.indexOf('{');
      if (firstBrace !== -1) repaired = repaired.substring(firstBrace);
      repaired = repaired.replace(/,\s*([\]}])/g, '$1');
      const quotes = (repaired.match(/(?<!\\)"/g) || []).length;
      if (quotes % 2 !== 0) repaired += '"';
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
      parsed = JSON.parse(sanitizeJSON(repaired));
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
