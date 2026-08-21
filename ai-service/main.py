from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.fasta_parser import router as fasta_router
from routes.predict import router as predict_router
from schemas import HealthResponse

app = FastAPI(
    title="Oceanographic AI Service",
    description="Molecular biodiversity (eDNA) parsing and fisheries impact models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fasta_router)
app.include_router(predict_router)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="ai-service")
