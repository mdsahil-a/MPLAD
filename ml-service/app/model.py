import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyModel:
    def __init__(self):
        # Isolation Forest for unsupervised anomaly detection
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.25,
            random_state=42
        )
        self.is_fitted = False

    def extract_features(self, projects):
        features = []
        for p in projects:
            sanctioned = float(p.get("sanctioned") or p.get("estimatedCost") or 1)
            spent = float(p.get("spent") or p.get("actualCost") or 0)
            progress = float(p.get("progress") or 0)
            delay = float(p.get("delayDays") or 0)
            
            fin_sig = float(p.get("finSignal") or 0)
            net_sig = float(p.get("netSignal") or 0)
            photo_sig = float(p.get("photoSignal") or 0)

            cost_ratio = spent / max(sanctioned, 1.0)
            
            features.append([
                cost_ratio,
                sanctioned / 100000.0,
                spent / 100000.0,
                progress,
                delay,
                fin_sig,
                net_sig,
                photo_sig
            ])
        return np.array(features)

    def fit_predict(self, projects):
        if not projects:
            return []

        X = self.extract_features(projects)
        
        # Fit model on current project data batch
        self.model.fit(X)
        self.is_fitted = True

        predictions = self.model.predict(X)  # -1 for anomaly, 1 for normal
        scores = self.model.decision_function(X) # lower score = more anomalous

        results = []
        for idx, p in enumerate(projects):
            is_anomaly = bool(predictions[idx] == -1)
            raw_score = float(scores[idx])
            results.append({
                "projectId": p.get("id"),
                "mlAnomaly": is_anomaly,
                "mlScore": round(raw_score, 4)
            })
        return results
