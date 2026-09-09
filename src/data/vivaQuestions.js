export const VIVA_QUESTIONS_BANK = {
  computer: [
    {
      keyword: ['crimp', 'cable', 'cat6', 'rj45', 'lan', 't568'],
      question: "Why did your team adopt the T568B wiring standard instead of T568A, and what would occur if one end was T568A and the other T568B?",
      expectedAnswer: "T568B is widely standard in commercial LANs in Tanzania. If one end is T568A and the other T568B, it forms a Crossover cable (historically used for direct DTE-to-DTE links before Auto-MDIX)."
    },
    {
      keyword: ['switch', 'vlan', 'cisco', 'port'],
      question: "What is the key engineering benefit of configuring VLANs on an access switch, and how does inter-VLAN routing work?",
      expectedAnswer: "VLANs partition broadcast domains, improve security, and reduce unnecessary network congestion. Inter-VLAN routing requires a Layer 3 switch or a Router-on-a-Stick using 802.1Q subinterfaces."
    },
    {
      keyword: ['ip', 'subnet', 'router', 'gateway', 'dhcp'],
      question: "If a workstation can ping its local default gateway but cannot reach external internet hosts (e.g., 8.8.8.8), what are the first two troubleshooting steps?",
      expectedAnswer: "1. Check NAT/PAT overload configuration on the border router. 2. Verify static default route (0.0.0.0/0) or DNS resolution and ISP gateway uplink."
    },
    {
      keyword: ['database', 'mysql', 'sql', 'backup'],
      question: "What is the difference between a cold backup and a hot backup in an enterprise database environment?",
      expectedAnswer: "A cold backup requires taking the database offline (preventing read/write during copy), whereas a hot backup captures consistent transaction logs while the database remains active."
    },
    {
      keyword: ['fiber', 'splice', 'otdr', 'optical'],
      question: "What is the acceptable maximum splice loss per fusion in single-mode fiber, and how does an OTDR detect reflective vs non-reflective events?",
      expectedAnswer: "Acceptable loss is typically under 0.05 dB for single-mode fiber. Reflective events (connectors/mechanical breaks) show sharp upward spikes (Fresnel reflection), whereas fusion splices show downward steps."
    }
  ],
  electrical: [
    {
      keyword: ['motor', 'star-delta', 'starter', 'induction'],
      question: "Why is a Star-Delta starter employed for starting three-phase squirrel cage induction motors rather than Direct-On-Line (DOL)?",
      expectedAnswer: "Star-Delta reduces the inrush starting current to approximately 1/3 (33%) of the DOL starting current, preventing severe line voltage dips on the utility grid."
    },
    {
      keyword: ['transformer', 'oil', 'substation', 'dielectric'],
      question: "What does the dielectric breakdown voltage test of transformer oil signify, and what is the minimum acceptable threshold for 33kV transformers?",
      expectedAnswer: "It measures the insulating oil's ability to withstand electrical stress without arcing, indicating moisture and particulate contamination. For 33kV, oil should typically exceed 30kV to 40kV breakdown."
    },
    {
      keyword: ['solar', 'inverter', 'pv', 'battery'],
      question: "What is the operational distinction between MPPT (Maximum Power Point Tracking) and PWM charge controllers?",
      expectedAnswer: "MPPT actively optimizes the voltage and current ratio from the PV array to extract maximum wattage regardless of irradiance, yielding 20-30% higher efficiency than PWM."
    },
    {
      keyword: ['earth', 'ground', 'megger', 'resistance'],
      question: "According to IEE regulations, what is the maximum acceptable earthing resistance for a standard residential/commercial distribution installation?",
      expectedAnswer: "Earth resistance should ideally be less than 1 to 5 Ohms (under 1 Ohm for substations and telecommunication shelters)."
    }
  ],
  civil: [
    {
      keyword: ['slump', 'concrete', 'cube', 'strength'],
      question: "What does a high concrete slump indicate, and how does the water-cement ratio directly influence 28-day compressive cube strength?",
      expectedAnswer: "A high slump indicates higher workability but potentially excessive water. A higher water-cement ratio increases capillary porosity, significantly reducing final 28-day compressive strength."
    },
    {
      keyword: ['total station', 'theodolite', 'level', 'survey'],
      question: "What is the principle difference between Backsight (BS), Intermediate Sight (IS), and Foresight (FS) in differential leveling?",
      expectedAnswer: "BS is the first staff reading taken on a point of known elevation (Benchmark). FS is the last reading before shifting the instrument. IS are any intermediate staff readings taken between BS and FS."
    },
    {
      keyword: ['soil', 'compaction', 'sand cone', 'proctor'],
      question: "What is Optimum Moisture Content (OMC) in subgrade soil compaction?",
      expectedAnswer: "OMC is the exact moisture percentage at which a given soil achieves its Maximum Dry Density (MDD) under a standardized compactive effort."
    }
  ],
  mechanical: [
    {
      keyword: ['lathe', 'turning', 'facing', 'tolerance'],
      question: "How do you calculate the required spindle speed (RPM) for a turning operation given a workpiece diameter and cutting speed (Vc)?",
      expectedAnswer: "RPM (N) = (1000 * Vc) / (pi * Diameter), where Vc is cutting speed in m/min and Diameter is in mm."
    },
    {
      keyword: ['pump', 'centrifugal', 'cavitation', 'impeller'],
      question: "What causes cavitation in centrifugal pumps, and what physical signs indicate its occurrence during operation?",
      expectedAnswer: "Cavitation occurs when local fluid pressure drops below vapor pressure, forming vapor bubbles that violently collapse on the impeller blades. Signs include crackling sounds (like pumping gravel) and vibration."
    }
  ]
};

export function getVivaTipForActivity(deptId, activityText) {
  const deptBank = VIVA_QUESTIONS_BANK[deptId] || VIVA_QUESTIONS_BANK.computer;
  const lower = (activityText || '').toLowerCase();

  for (const item of deptBank) {
    if (item.keyword.some(k => lower.includes(k))) {
      return item;
    }
  }

  // Default fallback question
  return {
    question: "Explain the standard safety precautions and international technical codes adhered to during the execution of this task.",
    expectedAnswer: "Highlight relevant PPE (Personal Protective Equipment), isolation procedures, standards compliance, and supervisor sign-off protocols."
  };
}
