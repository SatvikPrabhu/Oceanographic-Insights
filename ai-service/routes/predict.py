from fastapi import APIRouter, HTTPException

from schemas import PredictImpactRequest, PredictImpactResponse
from services.impact_service import predict_catch_impact

router = APIRouter(tags=["prediction"])


@router.post("/predict-impact", response_model=PredictImpactResponse)
def predict_impact(payload: PredictImpactRequest) -> PredictImpactResponse:
    try:
        return predict_catch_impact(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
