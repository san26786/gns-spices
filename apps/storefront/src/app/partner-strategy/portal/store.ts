'use client';

import { create } from 'zustand';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export type Priority = 'A+' | 'A' | 'B' | 'C' | 'D';
export type DistStatus =
  | 'Not Assessed'
  | 'Priority'
  | 'Distributor Required'
  | 'Pilot'
  | 'Active'
  | 'Expansion';

export type Territory = {
  id: string;
  state: string;
  district: string;
  population: number;
  blocks: number;
  gramPanchayats: number;
  estRetailOpportunity: number;
  distributorRequirement: number;
  priority: Priority;
  status: DistStatus;
};

export type JaunpurBlock = {
  id: string;
  block: string;
  population: number;
  gramPanchayats: number;
  estRetailers: number;
  distributorRequirement: number;
  monthlySalesPotential: number; // ₹ lakhs
  priority: Priority;
  status: DistStatus;
};

export type TerritoryWeights = {
  population: number;
  households: number;
  gramPanchayats: number;
  retailOpportunity: number;
  existingSales: number;
  urbanMarket: number;
  logistics: number;
  competition: number;
  productFit: number;
};

export type DistCriteriaWeights = {
  fmcgNetwork: number;
  workingCapital: number;
  warehouse: number;
  deliveryCapability: number;
  retailerRelationships: number;
  salesTeam: number;
  localReputation: number;
  technologyCapability: number;
  growthCommitment: number;
};

export type RetailerTier = {
  id: string;
  name: string;
  range: string;
  monthlyPacks: number;
  basePrice: number;         // ₹ per pack (distributor to retailer)
  volumeDiscount: number;    // %
  promoDiscount: number;     // %
  sellingPrice: number;      // ₹ per pack (retailer to consumer)
};

export type Risk = {
  id: string;
  name: string;
  level: 'Low' | 'Medium' | 'High';
  impact: string;
  mitigation: string;
  owner: string;
  status: 'Open' | 'Monitoring' | 'Mitigated' | 'Escalated';
};

export type RoadmapYear = {
  year: string;
  label: string;
  states: number;
  districts: number;
  distributors: number;
  retailers: number;
  annualSales: number;      // ₹ crore
  contribution: number;      // ₹ crore
  workingCapital: number;    // ₹ crore
  management: number;        // # people
};

export type DecisionStatus =
  | 'none'
  | 'approved'
  | 'more_data'
  | 'revise'
  | 'declined';

/* ------------------------------------------------------------------ */
/*  STATE                                                              */
/* ------------------------------------------------------------------ */

export interface PortalState {
  // Nav
  activeSection: string;

  // Section 5 — territory scoring
  territoryWeights: TerritoryWeights;
  territoryCandidate: {
    name: string;
    scores: Record<keyof TerritoryWeights, number>;
  };

  // Section 3 — India territory planning
  territories: Territory[];
  territoriesFilter: {
    state: string;
    priority: string;
    status: string;
  };

  // Section 4 — Jaunpur blocks
  jaunpurBlocks: JaunpurBlock[];

  // Section 6 — distributor scoring
  distributorWeights: DistCriteriaWeights;
  distributorCandidate: {
    name: string;
    scores: Record<keyof DistCriteriaWeights, number>;
  };

  // Section 7 — retailer profitability tiers
  retailerTiers: RetailerTier[];

  // Section 8 — distributor profitability
  distProfit: {
    monthlyVolume: number;    // packs
    purchasePrice: number;    // ₹/pack
    sellingPrice: number;     // ₹/pack
    volumeIncentive: number;  // %
    targetBonus: number;      // %
    logisticsPct: number;     // %
    salesPct: number;         // %
    warehousePct: number;     // %
    wcCostPct: number;        // %
  };

  // Section 9 — GNS profitability
  gnsProfit: {
    kamdhenuPrice: number;    // ₹/pack — what GNS pays supplier
    gnsSellingPrice: number;  // ₹/pack — what GNS charges downstream
    monthlyVolume: number;    // packs
    supplierIncentive: number;// %
    volumeIncentive: number;  // %
    marketingSupport: number; // %
    logisticsPct: number;     // %
    salesPct: number;
    adminPct: number;
    wcCostPct: number;
  };
  gnsScenarioFactors: { conservative: number; base: number; growth: number };
  gnsScenario: 'conservative' | 'base' | 'growth';

  // Section 10 — retailer network simulator
  retailerSim: {
    numRetailers: number;
    avgMonthlyPurchase: number;   // ₹
    activePct: number;             // %
    gnsContribPct: number;         // %
    distContribPct: number;        // %
    retailerGrossMarginPct: number;// %
  };

  // Section 11 — national scale
  nationalSim: {
    states: number;
    districts: number;
    avgDistPerDistrict: number;
    avgRetailersPerDist: number;
    avgMonthlyRetailerPurchase: number; // ₹
    gnsContribPct: number;              // %
  };

  // Section 12 — 5-year roadmap
  roadmap: RoadmapYear[];

  // Section 13 — working capital
  workingCapital: {
    monthlyPurchases: number;  // ₹ lakh
    stockDays: number;
    receivablesDays: number;
    payablesDays: number;
    thresholdCr: number;       // ₹ crore
  };

  // Section 14 — risks
  risks: Risk[];

  // Section 15 — decision
  decision: {
    totalInvestment: number;      // ₹ lakh
    expectedAnnualRevenue: number;// ₹ crore
    expectedContribution: number; // ₹ crore
    breakEvenMonth: number;
    expectedROI: number;          // %
    paybackMonths: number;
    activeRetailers: number;
    districtsCovered: number;
    status: DecisionStatus;
    decisionNote: string;
  };

  // Section 03 — top-level 70:30 profit-pool split
  topSplit: {
    udyam: number;   // 70
    udaan: number;   // 30
  };

  // Section 03 — GNS UDYAM (enterprise route) — 6 roles sharing the UDYAM pool
  udyamSplit: {
    regionalPartner: number;
    districtPartner: number;
    wholesaler: number;
    distributor: number;
    channelPartner: number;
    retailer: number;
  };

  // Section 03 — GNS UDAAN (community route) — 4 levels sharing the UDAAN pool
  udaanSplit: {
    advocate: number;
    retailCoordinator: number;
    microEntrepreneur: number;
    communityEntrepreneur: number;
  };

  // Section 04 — participant route choice
  routeChoice: {
    chosen: 'none' | 'udyam' | 'udaan' | 'exploring';
    role: string;
    interestNote: string;
  };

  // Section 16 — notes
  notes: {
    strategic: string;
    commercial: string;
    supplier: string;
    distributor: string;
    risk: string;
    nextActions: string;
    updatedBy: string;
    lastUpdated: string;
    version: string;
  };

  // helpers
  setActive: (s: string) => void;
  patch: (p: Partial<PortalState>) => void;
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/*  INITIAL DATA                                                       */
/* ------------------------------------------------------------------ */

const JAUNPUR_BLOCK_NAMES = [
  'Badlapur',
  'Barsathi',
  'Baksha',
  'Dharmapur',
  'Dobhi',
  'Jalalpur',
  'Karanjakala',
  'Kerakat',
  'Khuthan',
  'Machhlishahr',
  'Mariahu',
  'Muftiganj',
  'Mungra Badshahpur',
  'Ramnagar',
  'Rampur',
  'Shahganj',
  'Sikrara',
  'Sirkoni',
  'Sondhi',
  'Sujanganj',
  'Suithakala',
];

function initialJaunpurBlocks(): JaunpurBlock[] {
  return JAUNPUR_BLOCK_NAMES.map((name, i) => {
    const gp = 40 + ((i * 7) % 30);
    const pop = 150000 + ((i * 12000) % 90000);
    const retailers = 300 + ((i * 43) % 400);
    const priority: Priority = i < 6 ? 'A' : i < 12 ? 'B' : i < 18 ? 'C' : 'D';
    return {
      id: `blk-${i}`,
      block: name,
      population: pop,
      gramPanchayats: gp,
      estRetailers: retailers,
      distributorRequirement: retailers > 500 ? 2 : 1,
      monthlySalesPotential: Math.round((retailers * 30) / 100), // ₹ lakh
      priority,
      status: 'Not Assessed',
    };
  });
}

function initialTerritories(): Territory[] {
  const rows: Omit<Territory, 'id'>[] = [
    { state: 'Uttar Pradesh', district: 'Jaunpur',       population: 4494204, blocks: 21, gramPanchayats: 1069, estRetailOpportunity: 12000, distributorRequirement: 6, priority: 'A+', status: 'Pilot' },
    { state: 'Uttar Pradesh', district: 'Varanasi',      population: 3676841, blocks: 8,  gramPanchayats: 694,  estRetailOpportunity: 15000, distributorRequirement: 8, priority: 'A+', status: 'Priority' },
    { state: 'Uttar Pradesh', district: 'Prayagraj',     population: 5954391, blocks: 20, gramPanchayats: 1541, estRetailOpportunity: 18000, distributorRequirement: 9, priority: 'A',  status: 'Priority' },
    { state: 'Uttar Pradesh', district: 'Azamgarh',      population: 4613913, blocks: 22, gramPanchayats: 1859, estRetailOpportunity: 14000, distributorRequirement: 7, priority: 'A',  status: 'Distributor Required' },
    { state: 'Uttar Pradesh', district: 'Ghazipur',      population: 3620268, blocks: 16, gramPanchayats: 1237, estRetailOpportunity: 11000, distributorRequirement: 5, priority: 'B',  status: 'Not Assessed' },
    { state: 'Bihar',         district: 'Patna',         population: 5838465, blocks: 23, gramPanchayats: 322,  estRetailOpportunity: 20000, distributorRequirement: 10,priority: 'A+', status: 'Not Assessed' },
    { state: 'Bihar',         district: 'Gaya',          population: 4391418, blocks: 24, gramPanchayats: 332,  estRetailOpportunity: 12000, distributorRequirement: 6, priority: 'A',  status: 'Not Assessed' },
    { state: 'Madhya Pradesh',district: 'Indore',        population: 3276697, blocks: 4,  gramPanchayats: 335,  estRetailOpportunity: 14000, distributorRequirement: 7, priority: 'A+', status: 'Not Assessed' },
    { state: 'Madhya Pradesh',district: 'Bhopal',        population: 2371061, blocks: 2,  gramPanchayats: 222,  estRetailOpportunity: 10000, distributorRequirement: 5, priority: 'A',  status: 'Not Assessed' },
    { state: 'Rajasthan',     district: 'Jaipur',        population: 6626178, blocks: 13, gramPanchayats: 512,  estRetailOpportunity: 18000, distributorRequirement: 9, priority: 'A+', status: 'Not Assessed' },
    { state: 'Maharashtra',   district: 'Pune',          population: 9429408, blocks: 14, gramPanchayats: 1400, estRetailOpportunity: 25000, distributorRequirement: 12,priority: 'A+', status: 'Not Assessed' },
    { state: 'Gujarat',       district: 'Ahmedabad',     population: 7214225, blocks: 9,  gramPanchayats: 480,  estRetailOpportunity: 20000, distributorRequirement: 10,priority: 'A+', status: 'Not Assessed' },
    { state: 'Karnataka',     district: 'Bengaluru Rural',population: 990923, blocks: 4,  gramPanchayats: 232,  estRetailOpportunity: 6000,  distributorRequirement: 3, priority: 'B',  status: 'Not Assessed' },
    { state: 'Tamil Nadu',    district: 'Chennai',       population: 4646732, blocks: 0,  gramPanchayats: 0,    estRetailOpportunity: 22000, distributorRequirement: 11,priority: 'A',  status: 'Not Assessed' },
    { state: 'West Bengal',   district: 'North 24 Parganas',population:10009781,blocks:22,gramPanchayats: 200,  estRetailOpportunity: 24000, distributorRequirement: 12,priority: 'A+', status: 'Not Assessed' },
  ];
  return rows.map((r, i) => ({ ...r, id: `terr-${i}` }));
}

function initialRetailerTiers(): RetailerTier[] {
  return [
    { id: 't1', name: 'Starter',       range: '< ₹25K / month',      monthlyPacks: 150,  basePrice: 120, volumeDiscount: 0,   promoDiscount: 0,   sellingPrice: 150 },
    { id: 't2', name: 'Growth',        range: '₹25K – ₹50K / month', monthlyPacks: 350,  basePrice: 118, volumeDiscount: 1.5, promoDiscount: 0.5, sellingPrice: 150 },
    { id: 't3', name: 'Preferred',     range: '₹50K – ₹1L / month',  monthlyPacks: 700,  basePrice: 115, volumeDiscount: 2.5, promoDiscount: 1.0, sellingPrice: 150 },
    { id: 't4', name: 'Premium',       range: '₹1L – ₹2.5L / month', monthlyPacks: 1600, basePrice: 112, volumeDiscount: 4.0, promoDiscount: 1.5, sellingPrice: 150 },
    { id: 't5', name: 'Super Partner', range: '₹2.5L – ₹5L / month', monthlyPacks: 3300, basePrice: 108, volumeDiscount: 6.0, promoDiscount: 2.0, sellingPrice: 150 },
    { id: 't6', name: 'Area Partner',  range: '₹5L+ / month',        monthlyPacks: 6000, basePrice: 104, volumeDiscount: 8.0, promoDiscount: 2.5, sellingPrice: 150 },
  ];
}

function initialRisks(): Risk[] {
  const base: Omit<Risk, 'id'>[] = [
    { name: 'Commercial Risk',     level: 'Medium', impact: 'Margin pressure if supplier terms tighten.',           mitigation: 'Lock volume-linked pricing bands.',              owner: 'GNS Commercial',  status: 'Open' },
    { name: 'Supply Risk',         level: 'Medium', impact: 'Fill-rate volatility from single supplier.',           mitigation: 'Fortnightly S&OP; safety stock at RDC.',          owner: 'Supply Chain',    status: 'Monitoring' },
    { name: 'Price Risk',          level: 'Medium', impact: 'Input costs shifting retail price ladder.',            mitigation: 'Quarterly price review clause.',                  owner: 'Commercial',      status: 'Open' },
    { name: 'Distributor Risk',    level: 'High',   impact: 'Wrong distributor selection compounds silently.',      mitigation: '90-day probation + scorecard gates.',             owner: 'Sales Ops',       status: 'Open' },
    { name: 'Credit Risk',         level: 'High',   impact: 'Distributor credit slippage strains WC.',              mitigation: 'Cap credit days; digital ledger; bank guarantees.',owner: 'Finance',        status: 'Open' },
    { name: 'Inventory Risk',      level: 'Medium', impact: 'Slow-movers block WC and warehouse space.',            mitigation: 'SKU rationalisation; monthly stock review.',      owner: 'Supply Chain',    status: 'Open' },
    { name: 'Channel Conflict',    level: 'Medium', impact: 'Overlapping territories damage trust.',                mitigation: 'Written territory rights; performance-linked.',   owner: 'Sales Ops',       status: 'Monitoring' },
    { name: 'Competition',         level: 'Medium', impact: 'Existing FMCG distributors defend the shelf.',         mitigation: 'Anchor retailer programme; exclusive SKUs.',      owner: 'Marketing',       status: 'Open' },
    { name: 'Execution Risk',      level: 'High',   impact: 'Plan-on-paper vs field reality gap.',                  mitigation: 'Weekly field cadence; leading-indicator KPIs.',   owner: 'COO',             status: 'Open' },
    { name: 'Working Capital',     level: 'High',   impact: 'WC scales faster than contribution if unmanaged.',      mitigation: 'Threshold alerts; CFO sign-off on scale gates.',  owner: 'CFO',             status: 'Open' },
  ];
  return base.map((r, i) => ({ ...r, id: `risk-${i}` }));
}

function initialRoadmap(): RoadmapYear[] {
  return [
    { year: 'Year 1', label: 'Jaunpur',             states: 1, districts: 1,  distributors: 6,   retailers: 500,    annualSales: 18,   contribution: 0.9,  workingCapital: 3.5,   management: 8   },
    { year: 'Year 2', label: 'Uttar Pradesh',       states: 1, districts: 12, distributors: 60,  retailers: 6000,   annualSales: 216,  contribution: 12.9, workingCapital: 32,    management: 45  },
    { year: 'Year 3', label: 'Multi-State',         states: 4, districts: 40, distributors: 200, retailers: 20000,  annualSales: 720,  contribution: 43.2, workingCapital: 108,   management: 150 },
    { year: 'Year 4', label: 'National Expansion',  states: 10,districts: 100,distributors: 500, retailers: 50000,  annualSales: 1800, contribution: 108,  workingCapital: 270,   management: 380 },
    { year: 'Year 5', label: 'National Network',    states: 20,districts: 200,distributors: 1000,retailers: 100000, annualSales: 3600, contribution: 216,  workingCapital: 540,   management: 750 },
  ];
}

function baseline(): Omit<PortalState, 'setActive' | 'patch' | 'reset'> {
  return {
    activeSection: 'overview',

    territoryWeights: {
      population: 25, households: 15, gramPanchayats: 15, retailOpportunity: 15,
      existingSales: 10, urbanMarket: 5, logistics: 5, competition: 5, productFit: 5,
    },
    territoryCandidate: {
      name: 'Jaunpur',
      scores: {
        population: 22, households: 12, gramPanchayats: 14, retailOpportunity: 13,
        existingSales: 5, urbanMarket: 3, logistics: 4, competition: 4, productFit: 4,
      },
    },

    territories: initialTerritories(),
    territoriesFilter: { state: '', priority: '', status: '' },

    jaunpurBlocks: initialJaunpurBlocks(),

    distributorWeights: {
      fmcgNetwork: 20, workingCapital: 15, warehouse: 10, deliveryCapability: 10,
      retailerRelationships: 15, salesTeam: 10, localReputation: 10,
      technologyCapability: 5, growthCommitment: 5,
    },
    distributorCandidate: {
      name: 'Candidate A',
      scores: {
        fmcgNetwork: 15, workingCapital: 11, warehouse: 7, deliveryCapability: 7,
        retailerRelationships: 12, salesTeam: 7, localReputation: 8,
        technologyCapability: 3, growthCommitment: 4,
      },
    },

    retailerTiers: initialRetailerTiers(),

    distProfit: {
      monthlyVolume: 25000, purchasePrice: 108, sellingPrice: 118,
      volumeIncentive: 1.5, targetBonus: 1.0,
      logisticsPct: 1.2, salesPct: 1.5, warehousePct: 0.8, wcCostPct: 0.6,
    },

    gnsProfit: {
      kamdhenuPrice: 100, gnsSellingPrice: 108, monthlyVolume: 500000,
      supplierIncentive: 1.5, volumeIncentive: 0.5, marketingSupport: 1.0,
      logisticsPct: 0.8, salesPct: 1.2, adminPct: 0.8, wcCostPct: 0.5,
    },
    gnsScenarioFactors: { conservative: 0.7, base: 1.0, growth: 1.35 },
    gnsScenario: 'base',

    retailerSim: {
      numRetailers: 500, avgMonthlyPurchase: 30000, activePct: 80,
      gnsContribPct: 5, distContribPct: 6, retailerGrossMarginPct: 12,
    },

    nationalSim: {
      states: 4, districts: 40, avgDistPerDistrict: 5,
      avgRetailersPerDist: 100, avgMonthlyRetailerPurchase: 30000,
      gnsContribPct: 5,
    },

    roadmap: initialRoadmap(),

    workingCapital: {
      monthlyPurchases: 150, // ₹ lakh / mo
      stockDays: 30, receivablesDays: 21, payablesDays: 15,
      thresholdCr: 5,
    },

    risks: initialRisks(),

    decision: {
      totalInvestment: 350, expectedAnnualRevenue: 18, expectedContribution: 1.0,
      breakEvenMonth: 14, expectedROI: 32, paybackMonths: 30,
      activeRetailers: 400, districtsCovered: 1,
      status: 'none', decisionNote: '',
    },

    topSplit: {
      udyam: 70,
      udaan: 30,
    },
    udyamSplit: {
      regionalPartner: 10,
      districtPartner: 15,
      wholesaler: 15,
      distributor: 20,
      channelPartner: 15,
      retailer: 25,
    },
    udaanSplit: {
      advocate: 40,
      retailCoordinator: 25,
      microEntrepreneur: 20,
      communityEntrepreneur: 15,
    },

    routeChoice: {
      chosen: 'none',
      role: '',
      interestNote: '',
    },

    notes: {
      strategic: '', commercial: '', supplier: '', distributor: '', risk: '',
      nextActions: '', updatedBy: '', lastUpdated: '', version: 'v1.0',
    },
  };
}

/* ------------------------------------------------------------------ */
/*  STORE                                                              */
/* ------------------------------------------------------------------ */

export const usePortal = create<PortalState>((set) => ({
  ...baseline(),
  setActive: (s) => set({ activeSection: s }),
  patch: (p) => set(p as Partial<PortalState>),
  reset: () => set(baseline()),
}));

/* ------------------------------------------------------------------ */
/*  PER-PARTNER PERSISTENCE                                            */
/* ------------------------------------------------------------------ */

const KEY = (partner: string) => `gns:kamdhenu-strategy:${partner}`;

const NON_PERSIST: Array<keyof PortalState> = ['activeSection'];

export function hydrateFor(partner: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY(partner));
    if (!raw) return;
    const data = JSON.parse(raw);
    usePortal.setState(data);
  } catch {
    /* corrupt payload — ignore */
  }
}

export function persistFor(partner: string) {
  if (typeof window === 'undefined') return () => {};
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const unsub = usePortal.subscribe((state) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      try {
        const s = state as unknown as Record<string, unknown>;
        const snapshot: Record<string, unknown> = {};
        for (const k of Object.keys(s)) {
          if (typeof s[k] === 'function') continue;
          if (NON_PERSIST.includes(k as keyof PortalState)) continue;
          snapshot[k] = s[k];
        }
        localStorage.setItem(KEY(partner), JSON.stringify(snapshot));
      } catch {
        /* quota / stringify errors — ignore */
      }
    }, 250);
  });
  return () => {
    if (timeout) clearTimeout(timeout);
    unsub();
  };
}

/* ------------------------------------------------------------------ */
/*  DERIVED HELPERS                                                    */
/* ------------------------------------------------------------------ */

export function inr(n: number, digits = 0): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

export function inrCr(n: number, digits = 2): string {
  return `₹${inr(n, digits)} Cr`;
}
export function inrLakh(n: number, digits = 1): string {
  return `₹${inr(n, digits)} L`;
}

export function priorityFromScore(score: number): Priority {
  if (score >= 80) return 'A+';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
}

export function distRecommendationFromScore(
  score: number,
): 'Strategic' | 'Preferred' | 'Eligible' | 'Not Recommended' {
  if (score >= 90) return 'Strategic';
  if (score >= 80) return 'Preferred';
  if (score >= 70) return 'Eligible';
  return 'Not Recommended';
}
