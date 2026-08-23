from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class HealthResponse(BaseModel):
    status: str
    service: str


class FastaRecord(BaseModel):
    sampleId: str
    sequenceLength: int = Field(..., ge=0)
    detectedSpecies: List[str]
    confidenceScore: float = Field(..., ge=0, le=1)
    sequenceHash: str
    markerType: str = "16S rRNA"
    motifHits: int = 0


class ParseFastaResponse(BaseModel):
    sampleId: str
    sequenceLength: int
    detectedSpecies: List[str]
    confidenceScore: float
    records: List[FastaRecord]


class PredictImpactRequest(BaseModel):
    temperatures: List[float] = Field(..., min_length=3)
    catchYields: List[float] = Field(..., min_length=3)
    species: Optional[str] = None
    polynomialDegree: int = Field(default=2, ge=1, le=3)

    @field_validator("temperatures", "catchYields")
    @classmethod
    def finite_values(cls, values: List[float]) -> List[float]:
        if any(v is None or v != v for v in values):  # NaN check
            raise ValueError("values must be finite numbers")
        return values

    @model_validator(mode="after")
    def aligned_series(self) -> "PredictImpactRequest":
        if len(self.temperatures) != len(self.catchYields):
            raise ValueError("temperatures and catchYields must have the same length")
        return self


class PredictImpactResponse(BaseModel):
    predictedCatchChangePercentage: float
    temperatureThreshold: float
    correlationScore: float
    insightSummary: str
    modelDegree: int
    sampleSize: int
    species: Optional[str] = None


class AlignSequenceRequest(BaseModel):
    sequence: str = Field(..., min_length=10)

    @field_validator("sequence")
    @classmethod
    def clean_sequence(cls, value: str) -> str:
        return value.strip().upper().replace(" ", "").replace("\n", "")


class AlignmentResult(BaseModel):
    query: str
    reference: str
    match: str
    queryLength: int
    referenceLength: int


class AlignSequenceResponse(BaseModel):
    species: str
    commonName: str
    matchConfidence: float
    conservationStatus: str
    alignment: AlignmentResult
    coordinates: List[List[float]]
