const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/analyze';

/**
 * Calls the Python ML Service (Isolation Forest + TF-IDF) to analyze projects.
 * Enriches project objects with:
 * - mlAnomaly: boolean
 * - mlScore: number
 * - possibleDuplicate: boolean
 * - similarity: number
 * - riskReasons: array of strings
 * 
 * Includes graceful fallback if Python ML service is offline.
 */
export async function enrichProjectsWithML(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return projects;
  }

  try {
    const response = await fetch(ML_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects }),
      signal: AbortSignal.timeout(3000) // 3 seconds timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.results)) {
        const resultMap = new Map();
        data.results.forEach(res => resultMap.set(res.projectId, res));

        return projects.map(p => {
          const mlRes = resultMap.get(p.id);
          if (!mlRes) return p;

          return {
            ...p,
            mlAnomaly: mlRes.mlAnomaly,
            mlScore: mlRes.mlScore,
            riskScore: mlRes.riskScore || p.risk,
            riskLevel: mlRes.riskLevel || (p.risk >= 65 ? 'High' : p.risk >= 35 ? 'Medium' : 'Low'),
            possibleDuplicate: mlRes.possibleDuplicate,
            similarity: mlRes.similarity,
            matchedProjectId: mlRes.matchedProjectId,
            riskReasons: mlRes.reasons || [],
            riskAnalysis: {
              ...(p.riskAnalysis || {}),
              costAnomaly: Boolean((p.spent || 0) > (p.sanctioned || 0) * 1.15 || p.finSignal > 60),
              delayDetected: Boolean((p.delayDays || 0) > 90 || p.netSignal > 60),
              possibleDuplicate: mlRes.possibleDuplicate || Boolean(p.dupSignal > 60),
              fundUtilizationIssue: Boolean(p.photoSignal > 60),
              mlAnomaly: mlRes.mlAnomaly,
              mlScore: mlRes.mlScore
            }
          };
        });
      }
    }
  } catch (err) {
    console.warn(`[ML Integration]: Python ML Service unreachable (${err.message}). Using baseline fallback.`);
  }

  // Baseline fallback if Python service is offline
  return projects.map(p => {
    const isAnomaly = (p.risk || 0) >= 65 || Boolean((p.spent || 0) > (p.sanctioned || 0) * 1.15);
    const reasons = [];
    if ((p.spent || 0) > (p.sanctioned || 0) * 1.15) reasons.push('Actual cost significantly exceeds estimated sanctioned budget');
    if ((p.delayDays || 0) > 90) reasons.push(`Project execution delayed by ${p.delayDays} days beyond schedule`);
    if ((p.dupSignal || 0) > 60) reasons.push('High semantic similarity with existing sanctioned work (possible duplicate)');

    return {
      ...p,
      mlAnomaly: isAnomaly,
      mlScore: isAnomaly ? -0.15 : 0.05,
      riskLevel: p.risk >= 65 ? 'High' : p.risk >= 35 ? 'Medium' : 'Low',
      possibleDuplicate: Boolean((p.dupSignal || 0) > 60),
      similarity: p.dupSignal ? parseFloat((p.dupSignal / 100).toFixed(2)) : 0.1,
      matchedProjectId: null,
      riskReasons: reasons.length ? reasons : ['No significant anomalies flagged'],
      riskAnalysis: {
        ...(p.riskAnalysis || {}),
        costAnomaly: Boolean((p.spent || 0) > (p.sanctioned || 0) * 1.15 || p.finSignal > 60),
        delayDetected: Boolean((p.delayDays || 0) > 90 || p.netSignal > 60),
        possibleDuplicate: Boolean((p.dupSignal || 0) > 60),
        fundUtilizationIssue: Boolean(p.photoSignal > 60),
        mlAnomaly: isAnomaly,
        mlScore: isAnomaly ? -0.15 : 0.05
      }
    };
  });
}

/**
 * Enriches a single project object with ML analysis.
 */
export async function enrichSingleProjectWithML(project) {
  if (!project) return project;
  const enriched = await enrichProjectsWithML([project]);
  return enriched[0] || project;
}
