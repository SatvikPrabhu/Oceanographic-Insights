from __future__ import annotations

import hashlib
from io import StringIO
from typing import List

from Bio import SeqIO
from Bio.Seq import Seq

from markers import MARINE_SPECIES_MARKERS
from schemas import FastaRecord, ParseFastaResponse

DETECTION_THRESHOLD = 0.34


def _decode_fasta(raw: bytes) -> str:
    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def _ensure_fasta(text: str) -> str:
    stripped = text.strip()
    if not stripped:
        raise ValueError("FASTA payload is empty")
    if not stripped.startswith(">"):
        return ">uploaded_sample\n" + stripped.replace(" ", "").replace("\r", "")
    return stripped


def _motif_in_sequence(sequence: str, motif: str) -> bool:
    motif = motif.upper()
    rc = str(Seq(motif).reverse_complement())
    return motif in sequence or rc in sequence


def _match_species(sequence: str) -> tuple[List[str], float, int, str]:
    dna = sequence.upper().replace("U", "T")
    detected: List[str] = []
    scores: List[float] = []
    total_hits = 0
    marker_type = "16S rRNA"

    for species, profile in MARINE_SPECIES_MARKERS.items():
        motifs = profile["motifs"]
        hits = sum(1 for motif in motifs if _motif_in_sequence(dna, motif))
        score = hits / len(motifs) if motifs else 0.0
        total_hits += hits
        if score >= DETECTION_THRESHOLD:
            detected.append(species)
            scores.append(score)
            marker_type = profile["markerType"]

    confidence = round(max(scores) if scores else 0.0, 4)
    return detected, confidence, total_hits, marker_type


def parse_fasta_bytes(raw: bytes) -> ParseFastaResponse:
    text = _ensure_fasta(_decode_fasta(raw))
    records = list(SeqIO.parse(StringIO(text), "fasta"))
    if not records:
        raise ValueError("No FASTA records could be parsed")

    parsed: List[FastaRecord] = []
    for record in records:
        sequence = str(record.seq).replace(" ", "").replace("\n", "")
        detected, confidence, hits, marker_type = _match_species(sequence)
        digest = hashlib.sha256(sequence.encode("utf-8")).hexdigest()
        parsed.append(
            FastaRecord(
                sampleId=record.id or "unknown",
                sequenceLength=len(sequence),
                detectedSpecies=detected,
                confidenceScore=confidence,
                sequenceHash=digest,
                markerType=marker_type,
                motifHits=hits,
            )
        )

    primary = parsed[0]
    unique_species = sorted({name for item in parsed for name in item.detectedSpecies})
    mean_confidence = round(
        sum(item.confidenceScore for item in parsed) / len(parsed),
        4,
    )

    return ParseFastaResponse(
        sampleId=primary.sampleId,
        sequenceLength=primary.sequenceLength,
        detectedSpecies=unique_species or primary.detectedSpecies,
        confidenceScore=mean_confidence,
        records=parsed,
    )
