from app.model import AnomalyModel
from app.rules import evaluate_project_rules
from app.duplicate import detect_duplicates

model_instance = AnomalyModel()

def analyze_projects_batch(projects):
    """
    Executes ML Isolation Forest anomaly analysis, TF-IDF duplicate detection,
    and rule-based explanation synthesis on input MPLAD project batch.
    """
    if not projects:
        return []

    ml_results = model_instance.fit_predict(projects)
    dup_results = detect_duplicates(projects)

    results = []
    for i, p in enumerate(projects):
        p_id = p.get("id")
        ml_item = ml_results[i]
        dup_item = dup_results[i]

        reasons = evaluate_project_rules(p)

        is_anomaly = bool(ml_item["mlAnomaly"] or len(reasons) >= 2 or dup_item["possibleDuplicate"])
        
        base_risk = float(p.get("risk") or 50)
        if ml_item["mlAnomaly"]:
            base_risk = max(base_risk, 72.0)
        if len(reasons) >= 2:
            base_risk = max(base_risk, 68.0)

        risk_score = int(round(min(100.0, max(0.0, base_risk))))

        if risk_score >= 65:
            risk_level = "High"
        elif risk_score >= 35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        results.append({
            "projectId": p_id,
            "mlAnomaly": is_anomaly,
            "mlScore": ml_item["mlScore"],
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "possibleDuplicate": dup_item["possibleDuplicate"],
            "similarity": dup_item["similarity"],
            "matchedProjectId": dup_item["matchedProjectId"],
            "reasons": reasons if len(reasons) > 0 else ["No significant anomalies flagged by ML model"]
        })

    return results
