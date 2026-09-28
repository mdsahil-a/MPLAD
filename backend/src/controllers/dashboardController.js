import { db, tierOf } from '../data/db.js';

export const getDashboardData = (req, res) => {
  const stats = db.getStats();
  const recentAlerts = db.getProjects().slice(0, 3);

  res.json({
    success: true,
    totalProjects: stats.total,
    flaggedProjects: stats.flaggedProjects,
    highRiskProjects: stats.highRiskProjects,
    totalFunds: stats.totalFunds,
    riskDistribution: stats.riskDistribution,
    stats: stats,
    recentAlerts: recentAlerts.map(p => ({
      id: p.id,
      work: p.work,
      mp: p.mp,
      district: p.district,
      risk: p.risk,
      tier: tierOf(p.risk),
      status: p.status
    }))
  });
};
