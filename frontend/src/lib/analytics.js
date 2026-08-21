import { canonicalSpecies } from "./species";

export function dayKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || null;
  return date.toISOString().slice(0, 10);
}

export function buildSstCatchSeries(ocean = [], fisheries = []) {
  const buckets = new Map();

  function bucket(day) {
    if (!day) return null;
    if (!buckets.has(day)) {
      buckets.set(day, { day, temps: [], catchKg: 0 });
    }
    return buckets.get(day);
  }

  ocean.forEach((row) => {
    const entry = bucket(dayKey(row.timestamp));
    if (entry && Number.isFinite(Number(row.surfaceTemperature))) {
      entry.temps.push(Number(row.surfaceTemperature));
    }
  });

  fisheries.forEach((row) => {
    const entry = bucket(dayKey(row.timestamp));
    if (entry) {
      entry.catchKg += Number(row.catchWeightKg) || 0;
    }
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((entry) => ({
      day: entry.day,
      sst: entry.temps.length
        ? Number((entry.temps.reduce((sum, n) => sum + n, 0) / entry.temps.length).toFixed(2))
        : null,
      catchKg: Number(entry.catchKg.toFixed(1)),
    }));
}

export function ednaFrequency(edna = []) {
  const counts = new Map();
  edna.forEach((row) => {
    (row.detectedSpecies || []).forEach((name) => {
      if (!name) return;
      const label = canonicalSpecies(name);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count);
}

export function alignedPredictPayload(series, species) {
  const rows = series.filter((row) => row.sst != null && Number.isFinite(row.catchKg));
  if (rows.length < 3) return null;
  return {
    temperatures: rows.map((row) => row.sst),
    catchYields: rows.map((row) => row.catchKg),
    species: species && species !== "All species" ? species : "regional catch",
    polynomialDegree: 2,
  };
}
