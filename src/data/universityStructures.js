/**
 * University Report Structure Library
 * Defines official IPT / PT report guidelines for Tanzanian higher learning institutions.
 */

export const UNIVERSITY_STRUCTURES = [
  {
    id: 'dit',
    name: 'Dar es Salaam Institute of Technology',
    shortName: 'DIT',
    location: 'Dar es Salaam',
    motto: 'Technology for Development',
    crestColor: '#0284c7',
    badge: 'Standard IPT Guideline',
    coverPageFormat: {
      header: 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)',
      title: 'INDUSTRIAL PRACTICAL TRAINING (IPT) TECHNICAL REPORT',
      fields: [
        { key: 'studentName', label: 'STUDENT NAME' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'admissionNo', label: 'ADMISSION NUMBER' },
        { key: 'program', label: 'PROGRAM' },
        { key: 'ntaLevel', label: 'NTA LEVEL' },
        { key: 'classCode', label: 'CLASS' },
        { key: 'module', label: 'MODULE', defaultValue: 'INDUSTRIAL PRACTICAL TRAINING (IPT)' },
        { key: 'firm', label: 'FIRM' },
        { key: 'firmSupervisor', label: "FIRM'S SUPERVISOR" },
        { key: 'instituteSupervisor', label: 'INSTITUTE SUPERVISOR' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'fieldSpan', label: 'FIELD SPAN' }
      ]
    },
    preliminaries: [
      { id: 'abstract', roman: 'i', title: 'Abstract', desc: 'Muhtasari wa ripoti nzima ya IPT' },
      { id: 'acknowledgement', roman: 'ii', title: 'Acknowledgement', desc: 'Shukrani kwa Mungu, DIT, na Kampuni' },
      { id: 'declaration', roman: 'iii', title: 'Declaration', desc: 'Tamko la uhalisi wa kazi yako' },
      { id: 'abbreviations', roman: 'iv', title: 'List of abbreviations', desc: 'Ufafanuzi wa vifupisho vilivyotumika' },
      { id: 'figures', roman: 'v', title: 'Table of figures', desc: 'Orodha ya picha, michoro na majedwali' },
      { id: 'toc', roman: 'vi', title: 'Table of contents', desc: 'Yaliyomo na namba za kurasa' }
    ],
    chapters: [
      {
        number: 1,
        title: 'INTRODUCTION & COMPANY OVERVIEW',
        sections: [
          { code: '1.0', title: 'Introduction' },
          { code: '1.1', title: 'Overview of the company', subSections: [{ code: '1.1.1', title: 'Background of company' }] },
          { code: '1.2', title: 'Mission and vision of company', subSections: [{ code: '1.2.1', title: 'Mission' }, { code: '1.2.2', title: 'Vision' }, { code: '1.2.3', title: 'Core values and quality policy' }] },
          { code: '1.3', title: 'Structure of company' },
          { code: '1.4', title: 'Primary function of company' }
        ]
      },
      {
        number: 2,
        title: 'TECHNICAL PART / DUTIES UNDERTAKEN',
        sections: [
          { code: '2.0', title: 'Introduction' },
          { code: '2.1', title: 'Objectives' },
          { code: '2.2', title: 'Duties undertaken (Kazi zote za kiufundi ulizofanya)' }
        ]
      },
      {
        number: 3,
        title: 'SKILLS & METHODOLOGY',
        sections: [
          { code: '3.1', title: 'Improvement of the existing skills' },
          { code: '3.2', title: 'New skills learnt' },
          { code: '3.3', title: 'Methodology' }
        ]
      },
      {
        number: 4,
        title: 'GAPS IN SKILLS & TECHNOLOGY',
        sections: [
          { code: '4.1', title: 'Gaps in skills (Ujuzi uliopo field lakini DIT haupo)' },
          { code: '4.2', title: 'Gaps in technology (Teknolojia au vifaa vilivyopo field lakini DIT havipo)' }
        ]
      },
      {
        number: 5,
        title: 'CONCLUSIONS AND RECOMMENDATIONS',
        sections: [
          { code: '5.1', title: 'Conclusion' },
          { 
            code: '5.2', 
            title: 'Recommendations',
            subSections: [
              { code: '5.2.1', title: 'Recommendations to institute (DIT)' },
              { code: '5.2.2', title: 'Recommendations to organisation (Firm)' }
            ]
          }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch (Binding)',
      otherMargins: '1.0 inch'
    }
  },
  {
    id: 'ifm',
    name: 'The Institute of Finance Management',
    shortName: 'IFM',
    location: 'Shaaban Robert Street, Dar es Salaam',
    motto: 'Knowledge is Light',
    crestColor: '#059669',
    badge: 'IFM Field & Practical Training Standard',
    courseCode: 'IRU08505',
    moduleTitle: 'FIELD AND PROJECT WORK PRACTICE',
    coverPageFormat: {
      header: 'THE INSTITUTE OF FINANCE MANAGEMENT\nFACULTY OF INSURANCE AND BANKING\nDEPARTMENT OF INSURANCE',
      title: 'A REPORT ON PRACTICAL TRAINING CONDUCTED AT',
      fields: [
        { key: 'faculty', label: 'FACULTY' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'program', label: 'PROGRAMME' },
        { key: 'yearOfStudy', label: 'YEAR OF STUDY' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'courseCode', label: 'COURSE CODE', defaultValue: 'IRU08505: FIELD AND PROJECT WORK PRACTICE' },
        { key: 'firm', label: 'HOST ORGANIZATION (FIRM)' },
        { key: 'studentName', label: 'CANDIDATE NAME' },
        { key: 'admissionNo', label: 'REGISTRATION NUMBER (REG NO)' },
        { key: 'supervisionDate', label: 'SUPERVISION DATE' },
        { key: 'instituteSupervisor', label: 'SUPERVISOR' }
      ]
    },
    preliminaries: [
      { id: 'acknowledgement', roman: 'i', title: 'Acknowledgment', desc: 'Shukrani kwa Mungu, wazazi, NSSF/Kampuni na Msimamizi' },
      { id: 'abbreviations', roman: 'ii', title: 'List of Abbreviations', desc: 'Ufafanuzi wa vifupisho vilivyotumika (CFMS, SHIB, MMIS, NSSF...)' },
      { id: 'abstract', roman: 'iii', title: 'Executive Summary', desc: 'Muhtasari wa kina wa mafunzo ya vitendo (8 weeks) na matokeo' },
      { id: 'figures', roman: 'iv', title: 'List of Figures', desc: 'Orodha ya vielelezo na michoro ya kiutawala' },
      { id: 'toc', roman: 'v', title: 'Table of Contents', desc: 'Yaliyomo na namba za kurasa (Sura ya 1 hadi ya 5)' }
    ],
    chapters: [
      {
        number: 1,
        title: 'INTRODUCTION',
        sections: [
          { code: '1.1', title: 'Chapter Introduction' },
          { code: '1.2', title: 'Overview of Field Attachment', subSections: [{ code: '1.2.1', title: 'Objectives of field practical training' }] },
          { code: '1.3', title: 'An Overview of Fieldwork Placement / Host Organization', subSections: [
            { code: '1.3.1', title: 'Department of Placement & Core Functions' },
            { code: '1.3.2', title: 'Products and Services Offered by Organization' },
            { code: '1.3.3', title: 'Mission and Vision' }
          ] },
          { code: '1.4', title: 'Organization Structure of Host Firm' },
          { code: '1.5', title: 'Review of the Industry / Sector' },
          { code: '1.6', title: 'The Structure of the Report Organization' }
        ]
      },
      {
        number: 2,
        title: 'WORK DONE AND LESSONS LEARNT',
        sections: [
          { code: '2.1', title: 'Chapter Introduction' },
          { code: '2.2', title: 'Description of Tasks Performed' },
          { code: '2.3', title: 'Lessons Learnt from the Tasks' },
          { code: '2.4', title: 'Summary of the Work Done' },
          { code: '2.5', title: 'Challenges Encountered During Fieldwork' }
        ]
      },
      {
        number: 3,
        title: 'LITERATURE REVIEW',
        sections: [
          { code: '3.1', title: 'Chapter Introduction' },
          { code: '3.2', title: 'Review of Literature Related to Key Tasks Performed' }
        ]
      },
      {
        number: 4,
        title: 'ANALYSIS',
        sections: [
          { code: '4.1', title: 'Chapter Introduction' },
          { code: '4.2', title: 'Comparison between Theories and Practice' },
          { code: '4.3', title: 'Skills Enhanced During Practical Training' },
          { code: '4.4', title: 'The Gap Between Theories and Practices' },
          { code: '4.5', title: 'Working Experience and Career Development' }
        ]
      },
      {
        number: 5,
        title: 'CONCLUSION AND RECOMMENDATIONS',
        sections: [
          { code: '5.1', title: 'Conclusion' },
          { 
            code: '5.2', 
            title: 'Recommendations',
            subSections: [
              { code: '5.2.1', title: 'Recommendations to Institute (IFM)' },
              { code: '5.2.2', title: 'Recommendations to Host Organization' }
            ]
          }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch (Binding)',
      otherMargins: '1.0 inch'
    },
    specialRequirements: {
      hasLiteratureReview: true,
      hasAnalysisChapter: true,
      prefersExecutiveSummary: true,
      referenceStyle: 'APA 7th Edition'
    }
  },
  {
    id: 'udsm',
    name: 'University of Dar es Salaam',
    shortName: 'UDSM (CoICT / CoET)',
    location: 'Dar es Salaam (Kijitonyama / Mlimani)',
    motto: 'Hekima ni Uhuru',
    crestColor: '#1d4ed8',
    badge: 'CoICT / CoET Standard',
    coverPageFormat: {
      header: 'UNIVERSITY OF DAR ES SALAAM\nCOLLEGE OF INFORMATION AND COMMUNICATION TECHNOLOGIES (CoICT)',
      title: 'PRACTICAL TRAINING (PT) REPORT',
      fields: [
        { key: 'studentName', label: 'STUDENT NAME' },
        { key: 'admissionNo', label: 'REGISTRATION NUMBER' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'program', label: 'DEGREE PROGRAMME' },
        { key: 'firm', label: 'HOST INSTITUTION' },
        { key: 'firmSupervisor', label: 'HOST SUPERVISOR' },
        { key: 'instituteSupervisor', label: 'ACADEMIC SUPERVISOR' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'fieldSpan', label: 'TRAINING PERIOD' }
      ]
    },
    preliminaries: [
      { id: 'abstract', roman: 'i', title: 'Executive Summary', desc: 'Summary of engineering training and results' },
      { id: 'declaration', roman: 'ii', title: 'Declaration & Certification', desc: 'Originality statement' },
      { id: 'acknowledgement', roman: 'iii', title: 'Acknowledgements', desc: 'Gratitude to faculty and host firm' },
      { id: 'toc', roman: 'iv', title: 'Table of Contents', desc: 'Index of topics' },
      { id: 'abbreviations', roman: 'v', title: 'List of Acronyms', desc: 'Definitions of key terms' }
    ],
    chapters: [
      {
        number: 1,
        title: 'ORGANIZATION PROFILE AND PLACEMENT',
        sections: [
          { code: '1.1', title: 'Introduction and Institutional History' },
          { code: '1.2', title: 'Core Mandate, Vision and Mission' },
          { code: '1.3', title: 'Organizational Organogram' },
          { code: '1.4', title: 'Department of Attachment and Key Functions' }
        ]
      },
      {
        number: 2,
        title: 'TECHNICAL ACTIVITIES AND PROJECTS EXECUTED',
        sections: [
          { code: '2.1', title: 'Overview of Technical Engagements' },
          { code: '2.2', title: 'System Analysis, Design and Implementations' },
          { code: '2.3', title: 'Routine Maintenance and Field Engineering Operations' }
        ]
      },
      {
        number: 3,
        title: 'KNOWLEDGE TRANSFER AND PRACTICAL COMPETENCIES',
        sections: [
          { code: '3.1', title: 'Practical Application of Academic Modules' },
          { code: '3.2', title: 'New Engineering Tools and Methodologies Mastered' },
          { code: '3.3', title: 'Safety Protocols and Professional Engineering Standards' }
        ]
      },
      {
        number: 4,
        title: 'CRITICAL ANALYSIS, CHALLENGES AND MITIGATIONS',
        sections: [
          { code: '4.1', title: 'Technical and Operational Bottlenecks' },
          { code: '4.2', title: 'Problem Solving Methodologies and Solutions' },
          { code: '4.3', title: 'Gap Analysis between Theory and Industry Realities' }
        ]
      },
      {
        number: 5,
        title: 'CONCLUSIONS AND STRATEGIC RECOMMENDATIONS',
        sections: [
          { code: '5.1', title: 'General Conclusion' },
          { code: '5.2', title: 'Recommendations to UDSM CoICT' },
          { code: '5.3', title: 'Recommendations to Host Enterprise' }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch',
      otherMargins: '1.0 inch'
    }
  },
  {
    id: 'nit',
    name: 'National Institute of Transport',
    shortName: 'NIT',
    location: 'Mabibo, Dar es Salaam',
    motto: 'Excellence in Logistics & Transport Technology',
    crestColor: '#15803d',
    badge: 'NIT Logistics & Engineering',
    coverPageFormat: {
      header: 'NATIONAL INSTITUTE OF TRANSPORT (NIT)\nFACULTY OF ENGINEERING AND TECHNOLOGY',
      title: 'FIELD PRACTICAL TRAINING (FPT) REPORT',
      fields: [
        { key: 'studentName', label: 'STUDENT NAME' },
        { key: 'admissionNo', label: 'REGISTRATION NUMBER' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'program', label: 'PROGRAMME' },
        { key: 'ntaLevel', label: 'NTA LEVEL' },
        { key: 'firm', label: 'NAME OF ORGANIZATION' },
        { key: 'firmSupervisor', label: 'INDUSTRIAL SUPERVISOR' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'fieldSpan', label: 'PERIOD OF ATTACHMENT' }
      ]
    },
    preliminaries: [
      { id: 'abstract', roman: 'i', title: 'Executive Summary', desc: 'FPT technical summary' },
      { id: 'acknowledgement', roman: 'ii', title: 'Acknowledgement', desc: 'Appreciations' },
      { id: 'declaration', roman: 'iii', title: 'Declaration', desc: 'Declaration of originality' },
      { id: 'abbreviations', roman: 'iv', title: 'List of Abbreviations', desc: 'Acronym definitions' },
      { id: 'toc', roman: 'v', title: 'Table of Contents', desc: 'Index' }
    ],
    chapters: [
      {
        number: 1,
        title: 'INTRODUCTION AND BACKGROUND OF THE FIRM',
        sections: [
          { code: '1.1', title: 'Background of Host Organization' },
          { code: '1.2', title: 'Mission, Vision, and Objectives' },
          { code: '1.3', title: 'Administrative Structure' },
          { code: '1.4', title: 'Departmental Operations and Services' }
        ]
      },
      {
        number: 2,
        title: 'ACTIVITIES AND TECHNICAL TASKS PERFORMED',
        sections: [
          { code: '2.1', title: 'Weekly Technical Schedule' },
          { code: '2.2', title: 'Detailed Description of Work Done' },
          { code: '2.3', title: 'Equipment, Tools and Safety Gears Deployed' }
        ]
      },
      {
        number: 3,
        title: 'SKILLS, KNOWLEDGE AND COMPETENCIES GAINED',
        sections: [
          { code: '3.1', title: 'Technical Competencies Acquired' },
          { code: '3.2', title: 'Managerial and Teamwork Skills' },
          { code: '3.3', title: 'Industrial Health and Safety Standards Applied' }
        ]
      },
      {
        number: 4,
        title: 'CHALLENGES AND LIMITATIONS',
        sections: [
          { code: '4.1', title: 'Technical Difficulties Experienced' },
          { code: '4.2', title: 'Problem Solving and Countermeasures' }
        ]
      },
      {
        number: 5,
        title: 'CONCLUSION AND RECOMMENDATIONS',
        sections: [
          { code: '5.1', title: 'Conclusion' },
          { code: '5.2', title: 'Recommendations to NIT' },
          { code: '5.3', title: 'Recommendations to the Host Institution' }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch',
      otherMargins: '1.0 inch'
    }
  },
  {
    id: 'must',
    name: 'Mbeya University of Science and Technology',
    shortName: 'MUST',
    location: 'Mbeya',
    motto: 'Endeavouring to Lead in Technology',
    crestColor: '#b45309',
    badge: 'MUST Practical Training Standard',
    coverPageFormat: {
      header: 'MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY (MUST)\nCOLLEGE OF ENGINEERING AND TECHNOLOGY',
      title: 'PRACTICAL TRAINING (PT) REPORT',
      fields: [
        { key: 'studentName', label: 'STUDENT NAME' },
        { key: 'admissionNo', label: 'REGISTRATION NUMBER' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'program', label: 'PROGRAMME OF STUDY' },
        { key: 'ntaLevel', label: 'NTA LEVEL' },
        { key: 'firm', label: 'HOST COMPANY' },
        { key: 'firmSupervisor', label: 'FIELD SUPERVISOR' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'fieldSpan', label: 'TRAINING DATES' }
      ]
    },
    preliminaries: [
      { id: 'abstract', roman: 'i', title: 'Abstract', desc: 'Summary of training' },
      { id: 'acknowledgement', roman: 'ii', title: 'Acknowledgement', desc: 'Gratitude' },
      { id: 'declaration', roman: 'iii', title: 'Declaration', desc: 'Student declaration' },
      { id: 'toc', roman: 'iv', title: 'Table of Contents', desc: 'Content index' }
    ],
    chapters: [
      {
        number: 1,
        title: 'ORGANIZATION PROFILE',
        sections: [
          { code: '1.1', title: 'Historical Background' },
          { code: '1.2', title: 'Vision, Mission, and Core Values' },
          { code: '1.3', title: 'Organization Structure' }
        ]
      },
      {
        number: 2,
        title: 'PRACTICAL TRAINING ACTIVITIES',
        sections: [
          { code: '2.1', title: 'Technical Operations Executed' },
          { code: '2.2', title: 'Tools and Methodology Deployed' }
        ]
      },
      {
        number: 3,
        title: 'LESSONS LEARNT AND NEW COMPETENCIES',
        sections: [
          { code: '3.1', title: 'Practical Skills and Competencies' },
          { code: '3.2', title: 'Theory vs Practical Realities' }
        ]
      },
      {
        number: 4,
        title: 'PROBLEMS ENCOUNTERED AND SOLUTIONS',
        sections: [
          { code: '4.1', title: 'Challenges Met During Training' },
          { code: '4.2', title: 'Remedies Applied' }
        ]
      },
      {
        number: 5,
        title: 'CONCLUSION AND RECOMMENDATIONS',
        sections: [
          { code: '5.1', title: 'Conclusion' },
          { code: '5.2', title: 'Recommendations' }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch',
      otherMargins: '1.0 inch'
    }
  },
  {
    id: 'atc',
    name: 'Arusha Technical College',
    shortName: 'ATC',
    location: 'Arusha',
    motto: 'Technical Skills for Sustainable Development',
    crestColor: '#0f766e',
    badge: 'ATC Technical Standard',
    coverPageFormat: {
      header: 'ARUSHA TECHNICAL COLLEGE (ATC)\nDEPARTMENT OF ELECTRICAL AND ELECTRONICS',
      title: 'INDUSTRIAL PRACTICAL TRAINING (IPT) REPORT',
      fields: [
        { key: 'studentName', label: 'STUDENT NAME' },
        { key: 'admissionNo', label: 'REGISTRATION NUMBER' },
        { key: 'department', label: 'DEPARTMENT' },
        { key: 'program', label: 'PROGRAMME' },
        { key: 'firm', label: 'COMPANY / FIRM' },
        { key: 'academicYear', label: 'ACADEMIC YEAR' },
        { key: 'fieldSpan', label: 'TRAINING PERIOD' }
      ]
    },
    preliminaries: [
      { id: 'abstract', roman: 'i', title: 'Abstract', desc: 'IPT overview' },
      { id: 'acknowledgement', roman: 'ii', title: 'Acknowledgement', desc: 'Gratitude' },
      { id: 'declaration', roman: 'iii', title: 'Declaration', desc: 'Declaration of original work' },
      { id: 'toc', roman: 'iv', title: 'Table of Contents', desc: 'Contents list' }
    ],
    chapters: [
      {
        number: 1,
        title: 'HOST COMPANY PROFILE',
        sections: [
          { code: '1.1', title: 'Introduction & History' },
          { code: '1.2', title: 'Mission and Vision' },
          { code: '1.3', title: 'Organizational Setup' }
        ]
      },
      {
        number: 2,
        title: 'TECHNICAL WORK DONE',
        sections: [
          { code: '2.1', title: 'Workshop & Site Operations' },
          { code: '2.2', title: 'Testing, Diagnostics and Maintenance' }
        ]
      },
      {
        number: 3,
        title: 'KNOWLEDGE AND SKILLS GAINED',
        sections: [
          { code: '3.1', title: 'Hands-on Technical Experience' },
          { code: '3.2', title: 'Safety Protocols' }
        ]
      },
      {
        number: 4,
        title: 'CHALLENGES AND RECOMMENDATIONS',
        sections: [
          { code: '4.1', title: 'Challenges Encountered' },
          { code: '4.2', title: 'Recommendations to ATC and Firm' }
        ]
      }
    ],
    formatting: {
      font: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      leftMargin: '1.5 inch',
      otherMargins: '1.0 inch'
    }
  }
];

export function getUniversityStructure(universityId = 'dit') {
  return UNIVERSITY_STRUCTURES.find(u => u.id === universityId) || UNIVERSITY_STRUCTURES[0];
}
