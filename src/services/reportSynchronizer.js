/**
 * Report Synchronizer Engine
 * Automatically synchronizes Table of Contents, List of Abbreviations, Table of Figures,
 * and Declaration/Acknowledgement every time a chapter or section is written.
 */

// Comprehensive dictionary of Tanzanian engineering, academic, and technical acronyms
export const ACRONYMS_DICTIONARY = {
  'DIT': 'Dar es Salaam Institute of Technology',
  'IPT': 'Industrial Practical Training',
  'FPT': 'Field Practical Training',
  'PT': 'Practical Training',
  'NTA': 'National Technical Award',
  'UDSM': 'University of Dar es Salaam',
  'COICT': 'College of Information and Communication Technologies',
  'COET': 'College of Engineering and Technology',
  'NIT': 'National Institute of Transport',
  'MUST': 'Mbeya University of Science and Technology',
  'ATC': 'Arusha Technical College',
  'LAN': 'Local Area Network',
  'WAN': 'Wide Area Network',
  'WLAN': 'Wireless Local Area Network',
  'VLAN': 'Virtual Local Area Network',
  'UTP': 'Unshielded Twisted Pair',
  'STP': 'Shielded Twisted Pair',
  'CAT5': 'Category 5 Cable',
  'CAT6': 'Category 6 Cable',
  'CAT6A': 'Category 6 Augmented Cable',
  'RJ45': 'Registered Jack 45',
  'CLI': 'Command Line Interface',
  'IP': 'Internet Protocol',
  'TCP': 'Transmission Control Protocol',
  'UDP': 'User Datagram Protocol',
  'DHCP': 'Dynamic Host Configuration Protocol',
  'DNS': 'Domain Name System',
  'SSH': 'Secure Shell',
  'MAC': 'Media Access Control',
  'OTDR': 'Optical Time Domain Reflectometer',
  'GPON': 'Gigabit-capable Passive Optical Network',
  'FTTH': 'Fiber to the Home',
  'SFP': 'Small Form-factor Pluggable',
  'VSWR': 'Voltage Standing Wave Ratio',
  'BTS': 'Base Transceiver Station',
  'RF': 'Radio Frequency',
  'PCB': 'Printed Circuit Board',
  'OHS': 'Occupational Health and Safety',
  'OSHA': 'Occupational Safety and Health Authority',
  'PPE': 'Personal Protective Equipment',
  'TCRA': 'Tanzania Communications Regulatory Authority',
  'IEEE': 'Institute of Electrical and Electronics Engineers',
  'ISO': 'International Organization for Standardization',
  'ANSI': 'American National Standards Institute',
  'TIA': 'Telecommunications Industry Association',
  'EIA': 'Electronic Industries Alliance',
  'TTCL': 'Tanzania Telecommunications Corporation',
  'TANESCO': 'Tanzania Electric Supply Company Limited',
  'TRA': 'Tanzania Revenue Authority',
  'PLC': 'Programmable Logic Controller',
  'SCADA': 'Supervisory Control and Data Acquisition',
  'UPS': 'Uninterruptible Power Supply',
  'MCB': 'Miniature Circuit Breaker',
  'MCCB': 'Molded Case Circuit Breaker',
  'RCD': 'Residual Current Device',
  'CPE': 'Customer Premises Equipment',
  'MTTR': 'Mean Time to Repair',
  'MTBF': 'Mean Time Between Failures',
  'QOS': 'Quality of Service',
  'UTM': 'Unified Threat Management',
  'PoE': 'Power over Ethernet',
  'BENG': 'Bachelor of Engineering',
  'ODCE': 'Ordinary Diploma in Computer Engineering',
  'OD': 'Ordinary Diploma',
  'COE': 'Computer Engineering',
  'EE': 'Electrical Engineering',
  'CE': 'Civil Engineering',
  'ME': 'Mechanical Engineering',
  'ICT': 'Information and Communication Technology',
  'IFM': 'Institute of Finance Management',
  'NSSF': 'National Social Security Fund',
  'PSSSF': 'Public Service Social Security Fund',
  'NHIF': 'National Health Insurance Fund',
  'WCF': 'Workers Compensation Fund',
  'SHIB': 'Social Health Insurance Benefits',
  'CFMS': 'Core Fund Management System',
  'MMIS': 'Members Management Information System',
  'FIMS': 'Fund Identification Management System',
  'CRM': 'Customer Relationship Management',
  'TIRA': 'Tanzania Insurance Regulatory Authority',
  'COSO': 'Committee of Sponsoring Organizations',
  'DAMA': 'Data Management Association',
  'BIRM': 'Bachelor of Science in Insurance and Risk Management',
  'BAF': 'Bachelor of Accounting and Finance',
  'BBA': 'Bachelor of Business Administration',
  'SSRA': 'Social Security Regulatory Authority'
};

/**
 * Returns exact list of missing cover page fields
 */
export function getMissingCoverFields(metadata = {}) {
  const missing = [];
  if (!metadata.studentName || metadata.studentName.trim().length === 0) {
    missing.push({
      id: 'studentName',
      label: 'Student Name',
      question: 'Jina lako kamili la mwanafunzi unaitwa nani?',
      chips: ['FELICIAN JOHN MUSSA', 'CHILLU JOHN MWITA', 'JUMA ALLY SELEMANI', 'NEEMA A. MWAKYUSA']
    });
  }
  if (!metadata.admissionNo || metadata.admissionNo.trim().length === 0) {
    missing.push({
      id: 'admissionNo',
      label: 'Admission Number',
      question: `Safi sana! Namba yako ya usajili (Admission / Reg Number) ni ipi?`,
      chips: ['21023022415', '22023022010', '2023-04-01234']
    });
  }
  if (!metadata.department || !metadata.classCode) {
    missing.push({
      id: 'departmentClass',
      label: 'Department & Class',
      question: 'Uko Idara gani na Program/Class Code yako ni ipi? (k.m. Computer Studies, BENG23COE)',
      chips: [
        'Computer Studies | BENG23COE | NTA 7',
        'Electrical Engineering | BENG23EE | NTA 7',
        'Civil Engineering | BENG23CE | NTA 7',
        'Mechanical Engineering | BENG23ME | NTA 7',
        'Computer Studies | OD22COE | NTA 6'
      ]
    });
  }
  if (!metadata.firm || metadata.firm.trim().length === 0) {
    missing.push({
      id: 'firm',
      label: 'Host Firm / Company',
      question: 'Ulifanya mafunzo ya vitendo (Field / IPT) katika Kampuni au Shirika gani?',
      chips: ['TTCL Kurasini', 'TANESCO Ubungo', 'THE UNITED AFRICAN TECHNICAL COLLEGE (UATC)', 'TRA Samora', 'Vodacom Tanzania']
    });
  }
  if (!metadata.fieldSpan || metadata.fieldSpan.trim().length === 0) {
    missing.push({
      id: 'fieldSpan',
      label: 'Field Span & Academic Year',
      question: 'Muda wa field ulikuwa lini hadi lini, na mwaka gani wa masomo? (k.m. FROM 5 AUGUST 2024 TO 5 OCTOBER 2024)',
      chips: [
        'FROM 5 AUGUST 2024 TO 5 OCTOBER 2024 | 2024/2025',
        'FROM 15 JULY 2024 TO 15 SEPTEMBER 2024 | 2024/2025',
        'FROM 3 AUGUST 2024 TO 23 OCTOBER 2024 | 2024/2025'
      ]
    });
  }
  if (!metadata.firmSupervisor || !metadata.instituteSupervisor) {
    missing.push({
      id: 'supervisors',
      label: 'Supervisors',
      question: 'Taja majina ya wasimamizi wako (Supervisor wa Kazini na Supervisor wa Chuoni):',
      chips: [
        'Kazini: Dr. Tesha | Chuoni: Prof. Mohamed',
        'Kazini: Eng. Godfrey Mwakyoma | Chuoni: Dr. J. M. Mtebe',
        'Kazini: Eng. Frank Temba | Chuoni: Eng. M. Nassoro'
      ]
    });
  }
  return missing;
}

/**
 * Automatically extracts cover metadata with guaranteed fallback for current step
 */
export function autoExtractCoverMetadata(text, currentMeta = {}, currentStepId = null) {
  const meta = { ...currentMeta };
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct step assignment if currentStepId is provided
  if (currentStepId === 'studentName' && !meta.studentName) {
    meta.studentName = trimmed.toUpperCase();
    return meta;
  }

  if (currentStepId === 'admissionNo' && !meta.admissionNo) {
    meta.admissionNo = trimmed;
    return meta;
  }

  if (currentStepId === 'departmentClass') {
    // Extract department
    if (lower.includes('electrical')) meta.department = 'Electrical Engineering';
    else if (lower.includes('civil')) meta.department = 'Civil Engineering';
    else if (lower.includes('mechanical')) meta.department = 'Mechanical Engineering';
    else if (lower.includes('computer')) meta.department = 'Computer Studies';
    else meta.department = trimmed.split(/\|/)[0]?.trim() || 'Computer Studies';

    // Extract class code (matches BENG23EE, ELE24COE, OD22COE, BENG23COE, etc.)
    const codeMatch = trimmed.match(/\b([A-Z]{2,6}\d{2}[A-Z0-9]*)\b/i);
    meta.classCode = codeMatch ? codeMatch[0].toUpperCase() : 'BENG23EE';

    // Extract NTA level & Program
    if (lower.includes('nta 6') || lower.includes('diploma')) {
      meta.ntaLevel = 'NTA LEVEL 6';
      meta.program = `ORDINARY DIPLOMA IN ${meta.department.toUpperCase()}`;
    } else {
      meta.ntaLevel = 'NTA LEVEL 7';
      meta.program = `BACHELOR OF ENGINEERING IN ${meta.department.toUpperCase()}`;
    }
    return meta;
  }

  if (currentStepId === 'firm' && !meta.firm) {
    meta.firm = trimmed.toUpperCase();
    return meta;
  }

  if (currentStepId === 'fieldSpan') {
    meta.fieldSpan = trimmed.includes('FROM') ? trimmed.toUpperCase() : `FROM ${trimmed.toUpperCase()}`;
    meta.academicYear = meta.academicYear || '2024/2025';
    return meta;
  }

  if (currentStepId === 'supervisors') {
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|');
      meta.firmSupervisor = parts[0]?.replace(/kazini:?/i, '').trim() || 'Dr. Tesha';
      meta.instituteSupervisor = parts[1]?.replace(/dit:?|chuoni:?/i, '').trim() || 'Prof. Mohamed';
    } else {
      meta.firmSupervisor = meta.firmSupervisor || trimmed;
      meta.instituteSupervisor = meta.instituteSupervisor || 'Prof. Mohamed';
    }
    return meta;
  }

  // 2. Generic heuristics if no explicit step
  if (lower.includes('beng') || lower.includes('engineering') || lower.includes('nta')) {
    if (lower.includes('electrical')) meta.department = 'Electrical Engineering';
    else if (lower.includes('civil')) meta.department = 'Civil Engineering';
    else if (lower.includes('computer')) meta.department = 'Computer Studies';
    else meta.department = 'Computer Studies';

    const codeMatch = trimmed.match(/\b([A-Z]{2,6}\d{2}[A-Z0-9]*)\b/i);
    meta.classCode = codeMatch ? codeMatch[0].toUpperCase() : 'BENG23EE';
    meta.ntaLevel = lower.includes('nta 6') ? 'NTA LEVEL 6' : 'NTA LEVEL 7';
    meta.program = `BACHELOR OF ENGINEERING IN ${meta.department.toUpperCase()}`;
  }

  if (lower.includes('ttcl') || lower.includes('tanesco') || lower.includes('uatc') || lower.includes('tra') || lower.includes('vodacom')) {
    meta.firm = trimmed.toUpperCase();
  }

  return meta;
}

/**
 * Scans all text across the report and extracts unique acronyms that appear in the text
 */
export function extractAbbreviationsFromReport(reportData) {
  let combinedText = '';

  if (reportData.metadata) {
    Object.values(reportData.metadata).forEach(v => {
      if (typeof v === 'string') combinedText += ' ' + v;
    });
  }

  if (reportData.chapters) {
    reportData.chapters.forEach(chap => {
      combinedText += ' ' + chap.title;
      if (chap.sections) {
        chap.sections.forEach(sec => {
          combinedText += ' ' + sec.title + ' ' + (sec.content || '');
          if (sec.tools) combinedText += ' ' + sec.tools.join(' ');
        });
      }
    });
  }

  const regex = /\b[A-Z0-9]{2,8}\b/g;
  const matches = combinedText.match(regex) || [];
  const uniqueAcronyms = new Set(matches.map(m => m.toUpperCase()));

  uniqueAcronyms.add('DIT');
  uniqueAcronyms.add('IPT');

  const abbreviations = [];
  uniqueAcronyms.forEach(acronym => {
    if (ACRONYMS_DICTIONARY[acronym]) {
      abbreviations.push({
        term: acronym,
        definition: ACRONYMS_DICTIONARY[acronym]
      });
    }
  });

  abbreviations.sort((a, b) => a.term.localeCompare(b.term));
  return abbreviations;
}

/**
 * Dynamically builds Table of Contents
 */
export function buildDynamicTableOfContents(reportData) {
  const tocEntries = [];
  let estimatedPage = 1;

  if (reportData.chapters) {
    reportData.chapters.forEach((chap) => {
      const activeSections = (chap.sections || []).filter(s => (s.content || '').trim().length > 0);
      
      if (activeSections.length > 0) {
        tocEntries.push({
          level: 1,
          code: `Chapter ${chap.number === 1 ? 'One' : chap.number === 2 ? 'Two' : chap.number === 3 ? 'Three' : chap.number === 4 ? 'Four' : 'Five'}`,
          title: chap.title,
          page: estimatedPage
        });

        activeSections.forEach((sec) => {
          tocEntries.push({
            level: 2,
            code: sec.code,
            title: sec.title,
            page: estimatedPage
          });
        });

        let chapterWords = 0;
        activeSections.forEach(s => {
          chapterWords += (s.content || '').split(/\s+/).length;
        });
        estimatedPage += Math.max(1, Math.ceil(chapterWords / 320));
      }
    });
  }

  if (tocEntries.length > 0) {
    tocEntries.push({
      level: 1,
      code: 'References',
      title: 'REFERENCES',
      page: estimatedPage
    });
  }

  return tocEntries;
}

/**
 * Dynamically builds Table of Figures (including attached task photos and technical setup diagrams)
 */
export function buildDynamicTableOfFigures(reportData) {
  const figures = [];
  const chap2 = reportData.chapters?.find(c => c.id === 'chap2');
  
  if (chap2 && chap2.sections) {
    const tasks = chap2.sections.filter(s => (s.code.startsWith('2.2') || s.code.startsWith('2.')) && (s.content || '').trim().length > 0);
    tasks.forEach((t, idx) => {
      figures.push({
        figureNo: `Figure 2.${idx + 1}`,
        title: t.imageCaption || `${t.title} Execution and Testing Setup`,
        hasImage: !!t.image,
        page: Math.max(4, 4 + idx)
      });
    });
  }

  return figures;
}

/**
 * Auto-synchronizes the whole report
 */
export function synchronizeReport(reportData) {
  const { metadata, preliminaries } = reportData;
  const studentName = metadata?.studentName || '';
  const firm = metadata?.firm || metadata?.companyName || '';
  const dept = metadata?.department || 'Computer Studies';
  const academicYear = metadata?.academicYear || '2024/2025';
  const uniName = metadata?.universityName || 'Dar es Salaam Institute of Technology (DIT)';
  const moduleName = metadata?.module || 'Industrial Practical Training (IPT)';

  let declaration = preliminaries?.declaration || '';
  if (studentName && firm && (!declaration || declaration.length < 20)) {
    declaration = `I, ${studentName.toUpperCase()}, hereby declare that this ${moduleName} technical report is my own original work achieved through practical engagement at ${firm.toUpperCase()} during the academic year ${academicYear}. This report has not been previously submitted in part or in full to ${uniName} or any other institution for the award of any academic qualification.`;
  }

  let acknowledgement = preliminaries?.acknowledgement || '';
  if (studentName && firm && (!acknowledgement || acknowledgement.length < 20)) {
    acknowledgement = `Foremost, profound gratitude is expressed to the Almighty God for granting sound health and guidance throughout the field training period. Sincere appreciation is extended to the management and engineering supervisors at ${firm} for their technical mentorship and continuous workplace supervision. Special acknowledgment is accorded to the Department of ${dept} at ${uniName} for coordinating this practical training program.`;
  }

  const abbreviations = extractAbbreviationsFromReport(reportData);
  const tableOfFigures = buildDynamicTableOfFigures(reportData);

  return {
    ...reportData,
    preliminaries: {
      ...preliminaries,
      declaration,
      acknowledgement,
      abbreviations,
      tableOfFigures
    }
  };
}

