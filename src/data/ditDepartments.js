export const DIT_DEPARTMENTS = [
  {
    id: 'computer',
    name: 'Computer Studies',
    code: 'CS',
    degrees: [
      'Bachelor of Engineering in Computer Engineering (BEng CE)',
      'Bachelor of Technology in Information Technology (BTech IT)',
      'Ordinary Diploma in Computer Engineering (ODCE - NTA 6)',
      'Ordinary Diploma in Information Technology (ODIT - NTA 6)'
    ],
    commonCompanies: ['TTCL', 'TANESCO', 'TRA', 'CRDB Bank', 'NMB Bank', 'Vodacom', 'Tigo / Yas', 'Airtel', 'TCRA', 'e-GA', 'Halmashauri / LGAs', 'Muhimbili National Hospital IT'],
    typicalTools: ['Cat6 UTP Cable', 'RJ45 Connectors', 'Crimping Tool', 'Cable Tester', 'Cisco Catalyst Switch', 'MikroTik Router', 'Punch Down Tool', 'VS Code', 'MySQL', 'Wireshark', 'Putty', 'Linux (Ubuntu/Debian) Server', 'Patch Panel'],
    sampleActivities: [
      'Structured Local Area Network (LAN) Cabling and Patching',
      'Configuration of MikroTik Router and Bandwidth Management',
      'Troubleshooting Client Workstations and Operating System Deployment',
      'Database Backup Automation and MySQL Query Optimization',
      'Fiber Optic Splicing and OTDR Line Testing',
      'Cisco Switch VLAN Configuration and Inter-VLAN Routing'
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    code: 'EE',
    degrees: [
      'Bachelor of Engineering in Electrical Engineering (BEng EE)',
      'Ordinary Diploma in Electrical Engineering (ODEE - NTA 6)',
      'Bachelor of Engineering in Renewable Energy (BEng RE)'
    ],
    commonCompanies: ['TANESCO', 'TPDC', 'Songas', 'Bakhresa Group', 'Kilombero Sugar', 'Tanzania Breweries Limited (TBL)', 'Dangote Cement', 'REA', 'DIT Solar Lab'],
    typicalTools: ['Digital Multimeter', 'Clamp Meter', 'Megger Insulation Tester', 'Earth Resistance Tester', 'Circuit Breakers (MCB, MCCB)', 'Single-phase & 3-phase Induction Motors', 'Solar PV Panels', 'Inverter (Grid-tie/Off-grid)', 'Charge Controller', 'PPE (Safety Boots, Insulated Gloves)'],
    sampleActivities: [
      'Substation Inspection and 33kV/11kV Transformer Oil Testing',
      'Troubleshooting Three-Phase Motor Control Circuits and Star-Delta Starters',
      'Installation of Solar Photovoltaic (PV) Systems and Inverter Calibration',
      'Building Electrical Conduit Installation and Consumer Unit Load Balancing',
      'Testing Earth Loop Impedance and Ground Rod Installation'
    ]
  },
  {
    id: 'civil',
    name: 'Civil and Building Engineering',
    code: 'CE',
    degrees: [
      'Bachelor of Engineering in Civil Engineering (BEng CE)',
      'Ordinary Diploma in Civil Engineering (ODCE - NTA 6)',
      'Ordinary Diploma in Building and Civil Engineering'
    ],
    commonCompanies: ['TANROADS', 'TARURA', 'National Housing Corporation (NHC)', 'TBA (Tanzania Building Agency)', 'DAWASA', 'CRJE', 'CCECC', 'Advent Construction'],
    typicalTools: ['Total Station (Leica/Topcon)', 'Auto Level (Dumpy Level)', 'Slump Cone & Tamping Rod', 'Concrete Compression Testing Machine', 'Schmidt Rebound Hammer', 'Theodolite', 'Standard Sieve Shaker', 'AutoCAD Civil 3D', 'Measuring Tape & Leveling Staff'],
    sampleActivities: [
      'Topographic Surveying and Leveling for Road Alignments',
      'Concrete Slump Test and Compressive Strength Cube Crushing',
      'Supervision of Reinforcement Steel (Rebar) Bending and Formwork Inspection',
      'Subgrade Soil Compaction Testing Using Sand Cone Method',
      'Structural Masonry Alignment and Mortar Quality Assessment'
    ]
  },
  {
    id: 'mechanical',
    name: 'Mechanical and Industrial Engineering',
    code: 'ME',
    degrees: [
      'Bachelor of Engineering in Mechanical Engineering (BEng ME)',
      'Ordinary Diploma in Mechanical Engineering (ODME - NTA 6)',
      'Bachelor of Engineering in Oil and Gas Engineering'
    ],
    commonCompanies: ['TAZARA', 'TRC (Tanzania Railways Corporation)', 'Toyota Tanzania', 'Scania Tanzania', 'Tanga Cement', 'Unga Limited', 'Puma Energy', 'Tazama Pipeline'],
    typicalTools: ['Vernier Caliper', 'Micrometer Screw Gauge', 'Lathe Machine', 'MIG/TIG Welding Machine', 'Hydraulic Press', 'Dial Indicator', 'Torque Wrench', 'SolidWorks / AutoCAD', 'Pressure Gauge'],
    sampleActivities: [
      'Turning and Facing Operations on Center Lathe Machine',
      'Preventive Maintenance on Centrifugal Pumps and Impeller Inspection',
      'Overhaul of Diesel Internal Combustion Engine and Valve Clearance Adjustment',
      'Shielded Metal Arc Welding (SMAW) on Structural Steel Joints',
      'HVAC Chiller System Servicing and Refrigerant Pressure Top-up'
    ]
  },
  {
    id: 'telecom',
    name: 'Electronics and Telecommunications',
    code: 'ETE',
    degrees: [
      'Bachelor of Engineering in Telecommunications (BEng TE)',
      'Ordinary Diploma in Electronics and Telecommunication Engineering (ODETE - NTA 6)'
    ],
    commonCompanies: ['TCRA', 'TTCL', 'Tigo', 'Vodacom', 'Airtel', 'Halotel', 'TCAA (Civil Aviation)', 'TBC', 'Azam TV', 'RSwitch'],
    typicalTools: ['Optical Time Domain Reflectometer (OTDR)', 'Fiber Fusion Splicer', 'Spectrum Analyzer', 'RF Power Meter', 'Soldering Iron & Desoldering Pump', 'Oscilloscope', 'BER Tester', 'BNC / SMA Coaxial Connectors'],
    sampleActivities: [
      'Fusion Splicing on G.652 Single-Mode Fiber and Insertion Loss Measurement',
      'Base Transceiver Station (BTS) Antenna Tilt Adjustment and VSWR Testing',
      'Troubleshooting Microwave Radio Links and Alignment of Dish Antennas',
      'PCB Component Soldering and Fault Diagnosis on Power Supply Boards',
      'Drive Testing and 4G LTE Signal Quality Optimization'
    ]
  }
];

export const DIT_LEVELS = [
  {
    id: 'diploma',
    name: 'Ordinary Diploma (OD - NTA Level 6)',
    focusDescription: 'Focuses heavily on hands-on practical procedures, step-by-step installation, routine maintenance, safety precautions, and troubleshooting methodology.'
  },
  {
    id: 'degree',
    name: 'Bachelor of Engineering / Technology (BEng/BTech - NTA Level 8)',
    focusDescription: 'Focuses on engineering analysis, international standards (IEEE, ISO, BS), design considerations, testing calculations, system architecture, and optimization.'
  }
];

export const WRITING_PERSONAS = [
  {
    id: 'troubleshooting',
    title: 'Diagnostic & Troubleshooting',
    description: 'Highlights technical friction, fault-finding, root-cause analysis, and systematic resolution.',
    badge: 'High Uniqueness',
    color: 'emerald'
  },
  {
    id: 'methodological',
    title: 'Step-by-Step Methodology',
    description: 'Emphasizes procedural execution, tool handling, sequence of operations, and standards compliance.',
    badge: 'Standard DIT',
    color: 'blue'
  },
  {
    id: 'specs_standards',
    title: 'Engineering Specs & Standards',
    description: 'Focuses on equipment ratings, metrics, frequencies, tolerances, and IEEE/BS compliance.',
    badge: 'Academic Deep',
    color: 'amber'
  },
  {
    id: 'safety_maintenance',
    title: 'Operational Safety & Preventive Maintenance',
    description: 'Emphasizes OSHA safety protocols, personal protective equipment (PPE), and preventive upkeep.',
    badge: 'Practical Hands-on',
    color: 'purple'
  }
];

export const IFM_DEPARTMENTS = [
  {
    id: 'insurance',
    name: 'Department of Insurance',
    faculty: 'Faculty of Insurance and Banking',
    code: 'INS',
    degrees: [
      'Bachelor of Science in Insurance and Risk Management (BSc IRM)',
      'Ordinary Diploma in Insurance and Risk Management (ODIRM)',
      'Bachelor of Science in Actuarial Science (BSc AS)'
    ],
    commonCompanies: ['NSSF', 'PSSSF', 'NHIF', 'WCF', 'TIRA (Tanzania Insurance Regulatory Authority)', 'Jubilee Insurance', 'Alliance Insurance', 'Heritage Insurance', 'Britam Insurance', 'Sanlam Tanzania', 'Strategis Insurance', 'Resolution Insurance'],
    typicalTools: ['SHIB (Social Health Insurance Benefits) System', 'CFMS (Core Fund Management System)', 'MMIS (Members Management Information System)', 'FIMS (Fund Identification System)', 'TIRA MIS Portal', 'Microsoft Excel (Actuarial & Risk Models)', 'CRM Portal', 'Electronic Document Management System (EDMS)'],
    sampleActivities: [
      'Enrolling New Members and Dependents in the SHIB / Social Security Portal',
      'Manual and Electronic Verification of Employee Member Contributions against Payroll',
      'Processing Member Contribution Adjustments and Ledger Corrections',
      'Verification and Assessment of Insurance Claims and Underwriting Documentation',
      'Issuance, Registration, and Distribution of Official Membership Smart Cards',
      'Customer Relationship Management and Member Benefits Consultation'
    ]
  },
  {
    id: 'banking',
    name: 'Department of Banking and Financial Services',
    faculty: 'Faculty of Insurance and Banking',
    code: 'BFS',
    degrees: [
      'Bachelor of Science in Banking and Finance (BSc BF)',
      'Ordinary Diploma in Banking and Finance (ODBF)'
    ],
    commonCompanies: ['CRDB Bank', 'NMB Bank', 'Bank of Tanzania (BOT)', 'NBC Bank', 'Stanbic Bank', 'Exim Bank', 'Azania Bank', 'Equity Bank Tanzania', 'TPB / TCBA Bank'],
    typicalTools: ['Core Banking System (Finacle / T24)', 'TISS (Tanzania Interbank Settlement System)', 'EFT / ACH Settlement Portal', 'SWIFT Interbank Network', 'KYC & AML Verification Portal', 'Microsoft Excel Financial Modeler'],
    sampleActivities: [
      'Customer Due Diligence (CDD) and KYC Account Verification',
      'Appraisal and Assessment of Credit and Loan Applications',
      'Processing Interbank Electronic Fund Transfers (TISS & EFT)',
      'Daily Cash Drawer Reconciliation and Vault Balancing',
      'Foreign Exchange (Forex) Transactions and Rates Reconciliation'
    ]
  },
  {
    id: 'accounting',
    name: 'Department of Accounting and Auditing',
    faculty: 'Faculty of Accounting, Banking and Finance',
    code: 'ACC',
    degrees: [
      'Bachelor of Accounting (BAC)',
      'Ordinary Diploma in Accounting (ODA)',
      'Bachelor of Science in Accounting and Finance (BSc AF)'
    ],
    commonCompanies: ['TRA (Tanzania Revenue Authority)', 'National Audit Office (CAG)', 'PwC Tanzania', 'Deloitte', 'KPMG', 'EY (Ernst & Young)', 'NSSF Finance', 'TANESCO Finance', 'Local Government Authorities (LGAs)'],
    typicalTools: ['Tally ERP 9 / Prime', 'QuickBooks Enterprise', 'SAP ERP Financials', 'EPICOR Financial System', 'TRA EFDMS Portal', 'ACL Audit Software', 'Microsoft Excel (Pivot Tables, VLOOKUP, Financial Statements)'],
    sampleActivities: [
      'General Ledger Posting and Multi-Account Bank Reconciliation',
      'Vouching and Audit Verification of Procurement Invoices and Receipts',
      'Computation and Submission of Statutory Tax Returns (PAYE, VAT, WHT)',
      'Preparation of Monthly Trial Balance and Financial Performance Reports',
      'Fixed Asset Register Tagging, Verification, and Depreciation Calculation'
    ]
  },
  {
    id: 'it_ifm',
    name: 'Department of Computer Science & IT',
    faculty: 'Faculty of Computing, Information Systems and Mathematics',
    code: 'ITM',
    degrees: [
      'Bachelor of Science in Information Technology (BSc IT)',
      'Bachelor of Science in Computer Science (BSc CS)',
      'Ordinary Diploma in Information Technology (ODIT)'
    ],
    commonCompanies: ['e-GA (e-Government Authority)', 'NSSF IT Directorate', 'TRA IT Unit', 'CRDB ICT', 'TTCL Corporation', 'Vodacom Tanzania', 'NMB Digital Banking Unit'],
    typicalTools: ['PostgreSQL / MySQL Server', 'Linux (Ubuntu/RHEL) Server', 'VS Code', 'Git / GitHub', 'Postman API Tester', 'Cisco Switch & Router', 'Active Directory (AD)', 'Jira Helpdesk'],
    sampleActivities: [
      'Database Backup Automation and Data Integrity Verification',
      'User Access Privilege Management and Active Directory Role Provisioning',
      'Technical Support for Core Enterprise ERP and Portal Troubleshooting',
      'API Integration Testing for Electronic Payment Gateways',
      'Local Area Network (LAN) Maintenance and Switch Port Configuration'
    ]
  },
  {
    id: 'taxation',
    name: 'Department of Tax Management & Economics',
    faculty: 'Faculty of Economics and Management',
    code: 'TAX',
    degrees: [
      'Bachelor of Science in Tax Management (BSc TM)',
      'Bachelor of Science in Economics and Finance (BSc EF)',
      'Ordinary Diploma in Tax Management (ODTM)'
    ],
    commonCompanies: ['TRA (Tanzania Revenue Authority)', 'Ministry of Finance and Planning', 'Bank of Tanzania (BOT)', 'EPZA', 'Kuehne + Nagel', 'Bolloré Logistics', 'Tax Consulting Firms'],
    typicalTools: ['TRA ITAX Portal', 'TANCIS (Tanzania Customs Integrated System)', 'ASYCUDA World', 'SPSS / Stata Data Analysis', 'Microsoft Excel Tax Models'],
    sampleActivities: [
      'Verification and Assessment of Customs Cargo Declarations in TANCIS',
      'Conducting Desk Tax Audits on VAT and Corporate Income Tax Returns',
      'Processing Taxpayer Registration and TIN Certificate Issuance',
      'Reconciliation of Electronic Fiscal Device (EFD) Daily Revenue Reports',
      'Macroeconomic Data Analysis and Financial Market Trend Assessment'
    ]
  }
];

export function getDepartmentsForUniversity(universityId = 'dit') {
  if (universityId === 'ifm') {
    return IFM_DEPARTMENTS;
  }
  return DIT_DEPARTMENTS;
}
