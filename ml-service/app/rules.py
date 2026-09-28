def evaluate_project_rules(project):
    """
    Evaluates business & domain rules to provide clear human-readable explanations
    for flagged project anomalies.
    """
    reasons = []
    
    sanctioned = float(project.get("sanctioned") or project.get("estimatedCost") or 0)
    spent = float(project.get("spent") or project.get("actualCost") or 0)
    progress = float(project.get("progress") or 0)
    delay_days = float(project.get("delayDays") or 0)
    
    fin_signal = float(project.get("finSignal") or 0)
    net_signal = float(project.get("netSignal") or 0)
    dup_signal = float(project.get("dupSignal") or 0)
    photo_signal = float(project.get("photoSignal") or 0)

    # Rule 1: Cost overrun detection
    if (sanctioned > 0 and spent > sanctioned * 1.15) or fin_signal > 60:
        reasons.append("Actual cost significantly exceeds estimated sanctioned budget")
        
    # Rule 2: Low physical completion vs high fund disbursement
    if (sanctioned > 0 and (spent / sanctioned) > 0.70 and progress < 45) or photo_signal > 60:
        reasons.append("Fund utilization is high compared to low physical completion")

    # Rule 3: Execution delay detection
    if delay_days > 90 or net_signal > 60:
        reasons.append(f"Project execution delayed by {int(delay_days)} days beyond schedule")

    # Rule 4: Duplicate similarity indicator
    if dup_signal > 60:
        reasons.append("High semantic similarity with existing sanctioned work (possible duplicate)")

    return reasons
