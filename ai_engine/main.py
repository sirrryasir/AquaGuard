import os
import random
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import xgboost as xgb
# from model import load_model, predict_drought # Import from model.py when ready

app = FastAPI(title="BARWAAXO-AI Engine", version="1.0.0")

class ForecastRequest(BaseModel):
    village_id: int
    rainfall_30d: float
    avg_temp: float
    ndvi: float
    soil_moisture: float

class ForecastResponse(BaseModel):
    village_id: int
    drought_risk: float # 0-1
    predicted_level: str # Low, Medium, High, Severe
    confidence_score: float

# Placeholder for loaded model
model = None

@app.on_event("startup")
async def startup_event():
    global model
    # model = load_model()
    print("AI Model loaded (placeholder)")

@app.get("/")
def read_root():
    return {"status": "online", "service": "BARWAAXO-AI Engine"}

@app.post("/predict", response_model=ForecastResponse)
def predict(request: ForecastRequest):
    # In a real scenario, we would use the model.predict here
    # For prototype, we will use a heuristic or dummy prediction if model is not trained
    
    # Simple Heuristic for prototype
    risk_score = 0.0
    
    # Low rainfall increases risk
    if request.rainfall_30d < 50:
        risk_score += 0.4
    elif request.rainfall_30d < 100:
        risk_score += 0.2
        
    # High temp increases risk
    if request.avg_temp > 35:
        risk_score += 0.3
    elif request.avg_temp > 30:
        risk_score += 0.1
        
    # Low NDVI (vegetation) increases risk
    if request.ndvi < 0.3:
        risk_score += 0.3
        
    # Cap at 0.99
    risk_score = min(0.99, risk_score)
    
    level = "Low"
    if risk_score > 0.8:
        level = "Severe"
    elif risk_score > 0.6:
        level = "High"
    elif risk_score > 0.4:
        level = "Medium"
        
    return {
        "village_id": request.village_id,
        "drought_risk": round(risk_score, 2),
        "predicted_level": level,
        "confidence_score": 0.85
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
