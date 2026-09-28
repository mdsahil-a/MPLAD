import { db } from '../data/db.js';
import { enrichProjectsWithML, enrichSingleProjectWithML } from '../services/mlService.js';

// Baseline anomaly detection algorithm for fallback
function calculateProjectRisk(project) {
  const costAnomaly = (project.actualCost || project.spent) > ((project.estimatedCost || project.sanctioned) * 1.15) || project.finSignal > 60;
  const delayDetected = (project.progress < 50 && project.delayDays > 90) || project.netSignal > 60;
  const possibleDuplicate = project.dupSignal > 60 || Boolean(project.riskAnalysis?.possibleDuplicate);
  const fundUtilizationIssue = project.photoSignal > 60 || Boolean(project.riskAnalysis?.fundUtilizationIssue);

  let anomalyCount = 0;
  if (costAnomaly) anomalyCount++;
  if (delayDetected) anomalyCount++;
  if (possibleDuplicate) anomalyCount++;
  if (fundUtilizationIssue) anomalyCount++;

  let calculatedRiskTier = 'low';
  if (anomalyCount >= 2 || project.risk >= 65) {
    calculatedRiskTier = 'high';
  } else if (anomalyCount === 1 || project.risk >= 35) {
    calculatedRiskTier = 'med';
  }

  return {
    costAnomaly,
    delayDetected,
    possibleDuplicate,
    fundUtilizationIssue,
    anomalyCount,
    riskTier: calculatedRiskTier
  };
}

export const getProjects = async (req, res) => {
  try {
    const rawProjects = db.getProjects(req.query);
    const enrichedProjects = await enrichProjectsWithML(rawProjects);
    res.json(enrichedProjects);
  } catch (err) {
    console.error('Error fetching projects with ML enrichment:', err);
    res.json(db.getProjects(req.query));
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  const project = db.getProjectById(id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  try {
    const enriched = await enrichSingleProjectWithML(project);
    const baselineAnalysis = calculateProjectRisk(enriched);

    res.json({
      ...enriched,
      riskAnalysis: {
        ...baselineAnalysis,
        ...(enriched.riskAnalysis || {})
      }
    });
  } catch (err) {
    console.error('Error fetching single project with ML enrichment:', err);
    res.json({
      ...project,
      riskAnalysis: calculateProjectRisk(project)
    });
  }
};
