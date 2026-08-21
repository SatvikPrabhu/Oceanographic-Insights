from __future__ import annotations

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

from schemas import PredictImpactRequest, PredictImpactResponse


def _choose_degree(n: int, requested: int) -> int:
    # Keep the polynomial conservative on small n to avoid wild extrapolation.
    max_degree = 1 if n < 6 else min(requested, 2 if n < 10 else 3)
    return max(1, max_degree)


def predict_catch_impact(payload: PredictImpactRequest) -> PredictImpactResponse:
    temps = np.asarray(payload.temperatures, dtype=float)
    yields = np.asarray(payload.catchYields, dtype=float)
    degree = _choose_degree(len(temps), payload.polynomialDegree)

    X = temps.reshape(-1, 1)
    model = make_pipeline(
        PolynomialFeatures(degree=degree, include_bias=False),
        LinearRegression(),
    )
    model.fit(X, yields)

    corr = float(np.corrcoef(temps, yields)[0, 1])
    if np.isnan(corr):
        corr = 0.0

    r2 = float(r2_score(yields, model.predict(X)))
    correlation_score = round(corr, 4)

    mean_temp = float(np.mean(temps))
    plus_one = model.predict(np.array([[mean_temp + 1.0]]))[0]
    at_mean = model.predict(np.array([[mean_temp]]))[0]
    baseline = at_mean if abs(at_mean) > 1e-9 else (float(np.mean(yields)) or 1.0)
    change_pct = float((plus_one - at_mean) / baseline * 100.0)

    grid = np.linspace(float(np.min(temps)), float(np.max(temps)), 80).reshape(-1, 1)
    predicted = model.predict(grid)
    peak_idx = int(np.argmax(predicted))
    peak_temp = float(grid[peak_idx][0])
    peak_yield = float(predicted[peak_idx])
    decline_cutoff = peak_yield * 0.8

    threshold = peak_temp
    for temp_val, pred in zip(grid[peak_idx:].ravel(), predicted[peak_idx:]):
        if pred <= decline_cutoff:
            threshold = float(temp_val)
            break
    else:
        # If yield never drops 20% past the peak, use the warm edge of the series.
        threshold = float(np.max(temps))

    species = payload.species or "target species"
    direction = "decline" if change_pct < 0 else "increase"
    insight = (
        f"A +1°C shift from the observed mean SST ({mean_temp:.2f}°C) is associated with "
        f"a {abs(change_pct):.1f}% {direction} in {species} catch yield "
        f"(Pearson r = {corr:.2f}, R² = {r2:.2f}, polynomial degree {degree}). "
        f"Catch is modelled to remain near peak until about {threshold:.2f}°C."
    )

    return PredictImpactResponse(
        predictedCatchChangePercentage=round(change_pct, 3),
        temperatureThreshold=round(threshold, 3),
        correlationScore=correlation_score,
        insightSummary=insight,
        modelDegree=degree,
        sampleSize=len(temps),
        species=payload.species,
    )
