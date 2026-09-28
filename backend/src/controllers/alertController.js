import { db } from '../data/db.js';
import { enrichProjectsWithML } from '../services/mlService.js';

export const getAlerts = async (req, res) => {
  try {
    const rawProjects = db.getProjects(req.query);
    const enrichedProjects = await enrichProjectsWithML(rawProjects);
    
    const alerts = enrichedProjects.map((p, index) => {
      let alertType = 'Flagged for Review';
      if (p.mlAnomaly) {
        alertType = p.riskReasons?.[0] || 'Isolation Forest ML Anomaly';
      } else if (p.finSignal > 60) {
        alertType = 'Cost Anomaly';
      } else if (p.netSignal > 60) {
        alertType = `Project Delay (${p.delayDays || 0} days)`;
      } else if (p.dupSignal > 60 || p.possibleDuplicate) {
        alertType = 'Possible Duplicate Work';
      }

      return {
        id: p.id, // Project ID e.g. MPL-1001
        alertId: index + 1,
        projectId: p.id,
        work: p.work,
        district: p.district,
        mp: p.mp,
        type: alertType,
        message: `${alertType} identified for project ${p.id} in ${p.district}.`,
        risk: p.risk,
        tier: p.riskLevel?.toLowerCase() === 'high' ? 'high' : p.riskLevel?.toLowerCase() === 'medium' ? 'med' : 'low',
        mlAnomaly: p.mlAnomaly,
        mlScore: p.mlScore,
        possibleDuplicate: p.possibleDuplicate,
        riskReasons: p.riskReasons || [],
        status: p.status || 'Under Review',
        createdAt: new Date(Date.now() - (index + 1) * 7200000).toISOString()
      };
    });

    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts with ML enrichment:', err);
    res.json(db.getAlerts(req.query));
  }
};
