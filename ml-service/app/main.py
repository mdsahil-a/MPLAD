from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from app.anomaly import analyze_projects_batch

app = FastAPI(
    title="MPLAD Anomaly Detection ML Service",
    description="Isolation Forest & Analytics Service for SIH26102 Prototype",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectAnalysisRequest(BaseModel):
    projects: List[Dict[str, Any]]

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "MPLAD Python ML Service (Isolation Forest)",
        "version": "1.0.0"
    }

@app.post("/analyze")
def analyze_projects(payload: ProjectAnalysisRequest):
    results = analyze_projects_batch(payload.projects)
    return {"results": results}
