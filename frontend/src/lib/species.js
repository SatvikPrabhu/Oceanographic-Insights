export const SPECIES_OPTIONS = [
  "All species",
  "Mackerel",
  "Sardine",
  "Tuna",
  "Hilsa",
  "Indian Prawn",
  "Pomfret",
  "Anchovy",
];

const ALIASES = [
  { canonical: "Mackerel", needles: ["mackerel", "rastrelliger"] },
  { canonical: "Sardine", needles: ["sardine", "sardinella"] },
  { canonical: "Tuna", needles: ["tuna", "thunnus", "yellowfin"] },
  { canonical: "Hilsa", needles: ["hilsa", "tenualosa"] },
  { canonical: "Indian Prawn", needles: ["prawn", "penaeus"] },
  { canonical: "Pomfret", needles: ["pomfret"] },
  { canonical: "Anchovy", needles: ["anchovy"] },
];

export function canonicalSpecies(name) {
  if (!name) return name;
  const lower = String(name).toLowerCase();
  const hit = ALIASES.find(
    (alias) => alias.canonical.toLowerCase() === lower || alias.needles.some((needle) => lower.includes(needle))
  );
  return hit?.canonical || name;
}

export function namesMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  if (left.includes(right) || right.includes(left)) return true;
  const canonA = canonicalSpecies(a);
  const canonB = canonicalSpecies(b);
  return canonA === canonB;
}

export function matchesSpecies(record, species) {
  if (!species || species === "All species") return true;
  const names = [record.species, ...(record.detectedSpecies || [])].filter(Boolean);
  return names.some((name) => namesMatch(name, species));
}

export function uniqueSpeciesNames(names = []) {
  const extras = [];
  names.filter(Boolean).forEach((name) => {
    const alreadyListed = SPECIES_OPTIONS.some((option) => option !== "All species" && namesMatch(option, name));
    const alreadyExtra = extras.some((item) => namesMatch(item, name));
    if (!alreadyListed && !alreadyExtra) extras.push(name);
  });
  return extras;
}
