/**
 * Clean Empty Initial Report State (No dummy/pre-filled mock data)
 * Everything starts blank and is populated purely by the AI as the student answers questions.
 */

export const INITIAL_REPORT_STATE = {
  metadata: {
    universityId: 'dit',
    universityName: 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)',
    studentName: '',
    admissionNo: '',
    regNumber: '',
    department: '',
    deptId: '',
    program: '',
    courseName: '',
    ntaLevel: '',
    classCode: '',
    module: 'INDUSTRIAL PRACTICAL TRAINING (IPT)',
    firm: '',
    companyName: '',
    companyBranch: '',
    firmSupervisor: '',
    industrialSupervisor: '',
    instituteSupervisor: '',
    academicSupervisor: '',
    academicYear: '',
    fieldSpan: '',
    trainingPeriod: '',
    submissionYear: '',
    submissionMonth: ''
  },
  preliminaries: {
    abstract: '',
    acknowledgement: '',
    declaration: '',
    abbreviations: [],
    tableOfFigures: []
  },
  chapters: [
    {
      id: 'chap1',
      number: 1,
      title: 'INTRODUCTION & COMPANY OVERVIEW',
      sections: []
    },
    {
      id: 'chap2',
      number: 2,
      title: 'TECHNICAL PART / DUTIES UNDERTAKEN',
      sections: []
    },
    {
      id: 'chap3',
      number: 3,
      title: 'SKILLS & METHODOLOGY',
      sections: []
    },
    {
      id: 'chap4',
      number: 4,
      title: 'GAPS IN SKILLS & TECHNOLOGY',
      sections: []
    },
    {
      id: 'chap5',
      number: 5,
      title: 'CONCLUSIONS AND RECOMMENDATIONS',
      sections: []
    }
  ],
  logbooks: []
};
