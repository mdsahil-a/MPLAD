import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

export function tierOf(risk) {
  if (typeof risk === 'string') {
    const lower = risk.toLowerCase();
    if (['high', 'med', 'medium', 'low'].includes(lower)) {
      return lower === 'medium' ? 'med' : lower;
    }
  }
  const r = typeof risk === 'number' ? risk : (parseInt(risk, 10) || 0);
  if (r >= 65) return 'high';
  if (r >= 35) return 'med';
  return 'low';
}

const initialSeedData = {
  users: [
    { id: 1, name: "Admin User", email: "admin@mplad.gov.in", password: "admin123", role: "Administrator" },
    { id: 2, name: "Aarav Nair", email: "aarav@mplad.gov.in", password: "aarav123", role: "System Administrator" }
  ],
  settings: {
    name: "Aarav Nair",
    email: "aarav@mplad.gov.in",
    role: "System Administrator",
    notifications: true
  },
  projects: [
    {
      id: 'MPL-1001',
      work: 'Construction of Community Hall in Ward 12',
      mp: 'A. Sharma',
      district: 'North district',
      category: 'Community Infrastructure',
      location: 'Bhopal, Madhya Pradesh',
      sanctioned: 4500000,
      spent: 4200000,
      estimatedCost: 3000000,
      actualCost: 4200000,
      progress: 25,
      delayDays: 180,
      status: 'Under Review',
      finSignal: 85,
      netSignal: 78,
      dupSignal: 12,
      photoSignal: 90,
      risk: 88,
      description: 'Construction of a multi-purpose community hall for public gatherings and local civic events.',
      riskAnalysis: {
        costAnomaly: true,
        delayDetected: true,
        possibleDuplicate: false,
        fundUtilizationIssue: true
      },
      timeline: [
        { date: '2025-01-15', event: 'Project Sanctioned' },
        { date: '2025-03-10', event: 'Initial Tranche Disbursed' },
        { date: '2025-08-01', event: 'Site Audit Flagged Cost Discrepancy' }
      ],
      documents: [
        { name: 'Sanction_Letter.pdf', size: '1.2 MB' },
        { name: 'Site_Inspection_Report.pdf', size: '3.4 MB' }
      ]
    },
    {
      id: 'MPL-1002',
      work: 'Drinking Water Supply & Borewell Upgrade',
      mp: 'R. Verma',
      district: 'Riverside constituency',
      category: 'Water & Sanitation',
      location: 'Indore, Madhya Pradesh',
      sanctioned: 2800000,
      spent: 2750000,
      estimatedCost: 2000000,
      actualCost: 2750000,
      progress: 40,
      delayDays: 150,
      status: 'Delayed',
      finSignal: 75,
      netSignal: 70,
      dupSignal: 80,
      photoSignal: 65,
      risk: 76,
      description: 'Installation of high-capacity solar borewells and distribution pipelines across 5 villages.',
      riskAnalysis: {
        costAnomaly: true,
        delayDetected: true,
        possibleDuplicate: true,
        fundUtilizationIssue: true
      },
      timeline: [
        { date: '2025-02-01', event: 'Sanction Approved' },
        { date: '2025-05-12', event: 'Contractor Work Commenced' }
      ],
      documents: [
        { name: 'Borewell_Plan.pdf', size: '2.1 MB' }
      ]
    },
    {
      id: 'MPL-1003',
      work: 'Road Widening & Asphalt Paving',
      mp: 'S. Reddy',
      district: 'Hill block',
      category: 'Roads & Bridges',
      location: 'Gwalior, Madhya Pradesh',
      sanctioned: 5800000,
      spent: 5600000,
      estimatedCost: 5000000,
      actualCost: 5600000,
      progress: 90,
      delayDays: 30,
      status: 'In Progress',
      finSignal: 45,
      netSignal: 30,
      dupSignal: 15,
      photoSignal: 25,
      risk: 38,
      description: 'Widening of 4km stretch connecting Gram Panchayat to main state highway.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2024-11-10', event: 'Project Started' },
        { date: '2025-06-20', event: 'Phase 1 Paving Complete' }
      ],
      documents: [
        { name: 'Road_Survey.pdf', size: '4.5 MB' }
      ]
    },
    {
      id: 'MPL-1004',
      work: 'Solar Street Lighting Installation',
      mp: 'K. Nair',
      district: 'Central ward',
      category: 'Renewable Energy',
      location: 'Jabalpur, Madhya Pradesh',
      sanctioned: 1500000,
      spent: 1450000,
      estimatedCost: 1500000,
      actualCost: 1450000,
      progress: 100,
      delayDays: 0,
      status: 'Completed',
      finSignal: 10,
      netSignal: 10,
      dupSignal: 5,
      photoSignal: 10,
      risk: 12,
      description: 'Erection of 120 standalone solar streetlights in un-electrified hamlet areas.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2025-01-05', event: 'Work Order Issued' },
        { date: '2025-04-18', event: 'Installation Verified & Completed' }
      ],
      documents: [
        { name: 'Completion_Certificate.pdf', size: '1.8 MB' }
      ]
    },
    {
      id: 'MPL-1005',
      work: 'Government High School Renovation',
      mp: 'M. Iyer',
      district: 'North district',
      category: 'Education',
      location: 'Ujjain, Madhya Pradesh',
      sanctioned: 3500000,
      spent: 3100000,
      estimatedCost: 3500000,
      actualCost: 3100000,
      progress: 70,
      delayDays: 45,
      status: 'In Progress',
      finSignal: 30,
      netSignal: 40,
      dupSignal: 10,
      photoSignal: 20,
      risk: 32,
      description: 'Structural repair, modern science lab setup, and classroom painting for Govt School.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2025-02-15', event: 'Tender Awarded' }
      ],
      documents: [
        { name: 'Lab_Equipment_List.pdf', size: '950 KB' }
      ]
    },
    {
      id: 'MPL-1006',
      work: 'Rural Primary Health Sub-Centre',
      mp: 'P. Singh',
      district: 'Riverside constituency',
      category: 'Healthcare',
      location: 'Rewa, Madhya Pradesh',
      sanctioned: 4800000,
      spent: 4600000,
      estimatedCost: 3200000,
      actualCost: 4600000,
      progress: 30,
      delayDays: 210,
      status: 'Under Review',
      finSignal: 92,
      netSignal: 85,
      dupSignal: 75,
      photoSignal: 80,
      risk: 86,
      description: 'Construction of a 10-bed primary healthcare sub-center with emergency facility.',
      riskAnalysis: {
        costAnomaly: true,
        delayDetected: true,
        possibleDuplicate: true,
        fundUtilizationIssue: true
      },
      timeline: [
        { date: '2024-09-01', event: 'Foundation Stone Laid' },
        { date: '2025-04-10', event: 'Work Halted Due to Fund Mismatch' }
      ],
      documents: [
        { name: 'Audit_Notice.pdf', size: '2.8 MB' }
      ]
    },
    {
      id: 'MPL-1007',
      work: 'Storm Water Drainage System',
      mp: 'A. Sharma',
      district: 'Hill block',
      category: 'Civic Infrastructure',
      location: 'Sagar, Madhya Pradesh',
      sanctioned: 3200000,
      spent: 3100000,
      estimatedCost: 3200000,
      actualCost: 3100000,
      progress: 60,
      delayDays: 60,
      status: 'In Progress',
      finSignal: 40,
      netSignal: 45,
      dupSignal: 20,
      photoSignal: 30,
      risk: 42,
      description: 'Construction of concrete roadside drains to prevent monsoon flooding.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2025-01-20', event: 'Excavation Started' }
      ],
      documents: [
        { name: 'Drainage_Map.pdf', size: '1.5 MB' }
      ]
    },
    {
      id: 'MPL-1008',
      work: 'Public Library & Study Center Building',
      mp: 'R. Verma',
      district: 'Central ward',
      category: 'Education & Culture',
      location: 'Satna, Madhya Pradesh',
      sanctioned: 2200000,
      spent: 2100000,
      estimatedCost: 2200000,
      actualCost: 2100000,
      progress: 85,
      delayDays: 15,
      status: 'In Progress',
      finSignal: 20,
      netSignal: 25,
      dupSignal: 5,
      photoSignal: 15,
      risk: 22,
      description: 'Two-story digital library equipped with computer stations for student competitive prep.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2024-12-01', event: 'Structure Erected' }
      ],
      documents: [
        { name: 'Furniture_Procurement.pdf', size: '800 KB' }
      ]
    },
    {
      id: 'MPL-1009',
      work: 'Veterinary Clinic & Cattle Shelter',
      mp: 'S. Reddy',
      district: 'North district',
      category: 'Agriculture & Animal Husbandry',
      location: 'Chhindwara, Madhya Pradesh',
      sanctioned: 3900000,
      spent: 3850000,
      estimatedCost: 2500000,
      actualCost: 3850000,
      progress: 35,
      delayDays: 140,
      status: 'Delayed',
      finSignal: 80,
      netSignal: 65,
      dupSignal: 30,
      photoSignal: 75,
      risk: 72,
      description: 'District veterinary care unit with surgical facilities for rural livestock.',
      riskAnalysis: {
        costAnomaly: true,
        delayDetected: true,
        possibleDuplicate: false,
        fundUtilizationIssue: true
      },
      timeline: [
        { date: '2025-02-10', event: 'Initial Payment Released' }
      ],
      documents: [
        { name: 'Site_Plan.pdf', size: '1.9 MB' }
      ]
    },
    {
      id: 'MPL-1010',
      work: 'Bus Shelter Construction in 4 Locations',
      mp: 'K. Nair',
      district: 'Riverside constituency',
      category: 'Transport Infrastructure',
      location: 'Dewas, Madhya Pradesh',
      sanctioned: 1200000,
      spent: 1150000,
      estimatedCost: 1200000,
      actualCost: 1150000,
      progress: 95,
      delayDays: 5,
      status: 'Near Completion',
      finSignal: 15,
      netSignal: 10,
      dupSignal: 5,
      photoSignal: 10,
      risk: 14,
      description: 'Passenger seating sheds with solar display boards along rural bus routes.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2025-03-01', event: 'Construction Completed on 3 Units' }
      ],
      documents: [
        { name: 'Bus_Shelter_Photos.pdf', size: '5.2 MB' }
      ]
    },
    {
      id: 'MPL-1011',
      work: 'Gram Panchayat Digital Infrastructure Setup',
      mp: 'M. Iyer',
      district: 'Hill block',
      category: 'IT & e-Governance',
      location: 'Ratlam, Madhya Pradesh',
      sanctioned: 1800000,
      spent: 1750000,
      estimatedCost: 1800000,
      actualCost: 1750000,
      progress: 80,
      delayDays: 20,
      status: 'In Progress',
      finSignal: 25,
      netSignal: 20,
      dupSignal: 10,
      photoSignal: 15,
      risk: 21,
      description: 'Providing optic fiber connectivity, laptops, and printers to 10 Gram Panchayats.',
      riskAnalysis: {
        costAnomaly: false,
        delayDetected: false,
        possibleDuplicate: false,
        fundUtilizationIssue: false
      },
      timeline: [
        { date: '2025-01-25', event: 'Hardware Delivered' }
      ],
      documents: [
        { name: 'Hardware_Receipts.pdf', size: '1.1 MB' }
      ]
    },
    {
      id: 'MPL-1012',
      work: 'Youth Sports Complex & Gymnasium',
      mp: 'P. Singh',
      district: 'Central ward',
      category: 'Sports & Youth Affairs',
      location: 'Vidisha, Madhya Pradesh',
      sanctioned: 5200000,
      spent: 4900000,
      estimatedCost: 3500000,
      actualCost: 4900000,
      progress: 20,
      delayDays: 190,
      status: 'Under Review',
      finSignal: 88,
      netSignal: 82,
      dupSignal: 60,
      photoSignal: 85,
      risk: 83,
      description: 'Indoor badminton court, open outdoor gym, and synthetic running track.',
      riskAnalysis: {
        costAnomaly: true,
        delayDetected: true,
        possibleDuplicate: true,
        fundUtilizationIssue: true
      },
      timeline: [
        { date: '2024-10-15', event: 'Fund Disbursed' },
        { date: '2025-05-02', event: 'Anomalous Expenditure Reported' }
      ],
      documents: [
        { name: 'Sports_Complex_Audit.pdf', size: '3.1 MB' }
      ]
    }
  ]
};

// Database helper engine
class DummyDatabase {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.save(initialSeedData);
        console.log('[Dummy Database] Initialized database.json with seed data.');
      }
    } catch (err) {
      console.error('[Dummy Database Error]: Failed to initialize database file:', err);
    }
  }

  read() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Dummy Database Error]: Failed to read database file:', err);
    }
    return initialSeedData;
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Dummy Database Error]: Failed to write database file:', err);
    }
  }

  // Database Query Methods
  getProjects(filters = {}) {
    const data = this.read();
    let projects = [...(data.projects || [])];
    const { status, risk, tier, search, district } = filters;

    const targetTier = tier || risk;
    if (targetTier && targetTier !== 'all') {
      projects = projects.filter(p => {
        const pTier = tierOf(p.risk);
        return pTier.toLowerCase() === targetTier.toLowerCase() ||
               p.status?.toLowerCase() === targetTier.toLowerCase();
      });
    }

    if (status) {
      projects = projects.filter(p => p.status?.toLowerCase() === status.toLowerCase());
    }

    if (district) {
      projects = projects.filter(p => p.district?.toLowerCase().includes(district.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(p =>
        p.work.toLowerCase().includes(q) ||
        p.mp.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.district && p.district.toLowerCase().includes(q))
      );
    }

    return projects.sort((a, b) => (b.risk || 0) - (a.risk || 0));
  }

  getProjectById(id) {
    const data = this.read();
    return (data.projects || []).find(p => p.id.toLowerCase() === id.toLowerCase());
  }

  getStats() {
    const projects = this.getProjects();
    const total = projects.length;
    const high = projects.filter(p => tierOf(p.risk) === 'high').length;
    const med = projects.filter(p => tierOf(p.risk) === 'med').length;
    const low = projects.filter(p => tierOf(p.risk) === 'low').length;
    const fundReleased = projects.reduce((sum, p) => sum + (p.spent || 0), 0);

    return {
      total,
      high,
      med,
      low,
      flaggedProjects: high + med,
      highRiskProjects: high,
      totalProjects: total,
      totalFunds: fundReleased,
      fundReleased,
      riskDistribution: { high, medium: med, low }
    };
  }

  getAlerts(filters = {}) {
    const projects = this.getProjects(filters);
    return projects.map((p, index) => {
      const pTier = tierOf(p.risk);
      let alertType = 'Flagged for Review';
      if (p.finSignal > 60) alertType = 'Cost Anomaly';
      else if (p.netSignal > 60) alertType = `Project Delay (${p.delayDays} days)`;
      else if (p.dupSignal > 60) alertType = 'Possible Duplicate';
      else if (p.photoSignal > 60) alertType = 'Unusual Fund Utilization';

      return {
        id: index + 1,
        projectId: p.id,
        work: p.work,
        district: p.district,
        type: alertType,
        message: `${alertType} identified for project ${p.id} in ${p.district}.`,
        risk: p.risk,
        tier: pTier,
        status: p.status || 'Under Review',
        createdAt: new Date(Date.now() - (index + 1) * 7200000).toISOString()
      };
    });
  }

  getReports() {
    const stats = this.getStats();
    const projects = this.getProjects();

    const byDistrict = {};
    projects.forEach(p => {
      const d = p.district || 'Unassigned';
      byDistrict[d] = (byDistrict[d] || 0) + 1;
    });

    const topDistricts = Object.entries(byDistrict)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      stats,
      totalProjects: stats.total,
      flaggedProjects: stats.flaggedProjects,
      highRiskProjects: stats.highRiskProjects,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      delayedProjects: projects.filter(p => p.status === 'Delayed' || p.delayDays > 60).length,
      totalFunds: stats.totalFunds,
      statusDistribution: {
        submitted: 0.42,
        inProgress: 0.31,
        denied: 0.14,
        others: 0.13
      },
      topDistricts
    };
  }

  getSettings() {
    const data = this.read();
    return data.settings || initialSeedData.settings;
  }

  updateSettings(newSettings) {
    const data = this.read();
    data.settings = { ...data.settings, ...newSettings };
    this.save(data);
    return data.settings;
  }

  getMapData() {
    const projects = this.getProjects();
    const stats = this.getStats();

    const zones = [
      {
        id: 'zone-bhopal',
        name: 'Bhopal HQ Zone',
        constituency: 'Bhopal North & Central',
        district: 'North district',
        lat: 23.2599,
        lng: 77.4126,
        x: 46,
        y: 48,
        riskScore: 88,
        riskTier: 'high',
        activeProjects: 3,
        flaggedAnomalies: 2,
        totalSanctioned: 11200000,
        utilized: 10400000,
        mainIssue: 'Cost Overrun & Geotag Photo Mismatch'
      },
      {
        id: 'zone-indore',
        name: 'Indore Zone',
        constituency: 'Riverside Constituency',
        district: 'Riverside constituency',
        lat: 22.7196,
        lng: 75.8577,
        x: 36,
        y: 56,
        riskScore: 76,
        riskTier: 'high',
        activeProjects: 3,
        flaggedAnomalies: 2,
        totalSanctioned: 8800000,
        utilized: 8500000,
        mainIssue: 'Duplicate Borewell Work & Execution Delay'
      },
      {
        id: 'zone-gwalior',
        name: 'Gwalior Zone',
        constituency: 'Hill Block',
        district: 'Hill block',
        lat: 26.2183,
        lng: 78.1828,
        x: 52,
        y: 32,
        riskScore: 38,
        riskTier: 'med',
        activeProjects: 3,
        flaggedAnomalies: 1,
        totalSanctioned: 10800000,
        utilized: 10450000,
        mainIssue: 'Monsoon Work Delay'
      },
      {
        id: 'zone-jabalpur',
        name: 'Jabalpur Zone',
        constituency: 'Central Ward',
        district: 'Central ward',
        lat: 23.1815,
        lng: 79.9864,
        x: 64,
        y: 52,
        riskScore: 12,
        riskTier: 'low',
        activeProjects: 3,
        flaggedAnomalies: 0,
        totalSanctioned: 5100000,
        utilized: 5000000,
        mainIssue: 'All Systems Operational'
      },
      {
        id: 'zone-rewa',
        name: 'Rewa Zone',
        constituency: 'Eastern Sector',
        district: 'Riverside constituency',
        lat: 24.5362,
        lng: 81.3037,
        x: 74,
        y: 42,
        riskScore: 86,
        riskTier: 'high',
        activeProjects: 2,
        flaggedAnomalies: 2,
        totalSanctioned: 9600000,
        utilized: 9200000,
        mainIssue: 'Primary Health Sub-Centre Payment Hold'
      },
      {
        id: 'zone-ujjain',
        name: 'Ujjain Zone',
        constituency: 'Western Block',
        district: 'North district',
        lat: 23.1765,
        lng: 75.7885,
        x: 28,
        y: 48,
        riskScore: 32,
        riskTier: 'low',
        activeProjects: 2,
        flaggedAnomalies: 0,
        totalSanctioned: 7400000,
        utilized: 6950000,
        mainIssue: 'Routine Monitoring'
      },
      {
        id: 'zone-sagar',
        name: 'Sagar Zone',
        constituency: 'Central Drainage Block',
        district: 'Hill block',
        lat: 23.8388,
        lng: 78.7378,
        x: 56,
        y: 44,
        riskScore: 42,
        riskTier: 'med',
        activeProjects: 2,
        flaggedAnomalies: 1,
        totalSanctioned: 6400000,
        utilized: 6200000,
        mainIssue: 'Civic Infrastructure Audit'
      },
      {
        id: 'zone-satna',
        name: 'Satna Zone',
        constituency: 'Northern Education District',
        district: 'Central ward',
        lat: 24.6005,
        lng: 80.8322,
        x: 70,
        y: 38,
        riskScore: 22,
        riskTier: 'low',
        activeProjects: 1,
        flaggedAnomalies: 0,
        totalSanctioned: 2200000,
        utilized: 2100000,
        mainIssue: 'Normal Progress'
      }
    ];

    const connections = [
      { from: 'zone-bhopal', to: 'zone-indore', risk: 'high' },
      { from: 'zone-bhopal', to: 'zone-rewa', risk: 'high' },
      { from: 'zone-bhopal', to: 'zone-gwalior', risk: 'med' },
      { from: 'zone-bhopal', to: 'zone-jabalpur', risk: 'low' },
      { from: 'zone-bhopal', to: 'zone-sagar', risk: 'med' },
      { from: 'zone-indore', to: 'zone-ujjain', risk: 'low' }
    ];

    return {
      success: true,
      stats: {
        totalTrackedProjects: stats.total,
        totalSanctionedFunds: stats.fundReleased,
        highRiskZonesCount: zones.filter(z => z.riskTier === 'high').length,
        activeHotspots: zones.filter(z => z.riskTier !== 'low').length,
        systemHealth: '88% - Interactive GIS Active'
      },
      zones,
      connections
    };
  }
}

export const db = new DummyDatabase();

