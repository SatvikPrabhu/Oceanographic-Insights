from fastapi import APIRouter, HTTPException

from schemas import AlignSequenceRequest, AlignSequenceResponse
from services.fasta_service import _match_species, _motif_in_sequence
from markers import MARINE_SPECIES_MARKERS

router = APIRouter(tags=["alignment"])


def _create_alignment_visualization(query: str, reference: str) -> dict:
    """Create side-by-side alignment visualization."""
    query_clean = query.upper().replace(" ", "").replace("\n", "")
    ref_clean = reference.upper().replace(" ", "").replace("\n", "")
    
    # Simple visualization - show first 60 bases with match highlighting
    max_len = 60
    query_display = query_clean[:max_len]
    ref_display = ref_clean[:max_len]
    
    # Create match string
    match_chars = []
    for i, (q, r) in enumerate(zip(query_display, ref_display)):
        if q == r:
            match_chars.append("|")
        else:
            match_chars.append(" ")
    
    match_display = "".join(match_chars)
    
    return {
        "query": query_display,
        "reference": ref_display,
        "match": match_display,
        "queryLength": len(query_clean),
        "referenceLength": len(ref_clean),
    }


def _get_species_coordinates(species_name: str) -> list:
    """Return demo coordinates for species (can be replaced with DB query)."""
    # Demo coordinates based on seed data alert zones
    if "Mackerel" in species_name or "kanagurta" in species_name:
        return [[74.20, 12.87], [74.25, 12.85], [74.15, 12.89]]  # Arabian Sea
    elif "Tuna" in species_name or "albacares" in species_name:
        return [[72.5, 15.0], [72.6, 15.1], [72.4, 14.9]]  # Central Arabian Sea
    elif "Sardine" in species_name or "longiceps" in species_name:
        return [[83.32, 17.68], [83.35, 17.7], [83.3, 17.65]]  # Bay of Bengal
    else:
        return [[75.0, 15.0]]  # Default location


@router.post("/align-sequence", response_model=AlignSequenceResponse)
def align_sequence(payload: AlignSequenceRequest) -> AlignSequenceResponse:
    """Align input FASTA sequence against reference species markers."""
    sequence = payload.sequence.strip().upper().replace(" ", "").replace("\n", "")
    
    if not sequence:
        raise HTTPException(status_code=400, detail="Sequence cannot be empty")
    
    if len(sequence) < 10:
        raise HTTPException(status_code=400, detail="Sequence too short for alignment")
    
    # Match species using existing logic
    detected, confidence, hits, marker_type = _match_species(sequence)
    
    if not detected:
        # Return no match result
        return AlignSequenceResponse(
            species="Unknown",
            commonName="Unknown Species",
            matchConfidence=0.0,
            conservationStatus="Data Deficient",
            alignment={
                "query": sequence[:60],
                "reference": "N/A",
                "match": "",
                "queryLength": len(sequence),
                "referenceLength": 0,
            },
            coordinates=[],
        )
    
    # Get best match
    best_species = detected[0]
    species_profile = MARINE_SPECIES_MARKERS.get(best_species, {})
    
    # Get reference sequence (first motif as reference)
    reference_motif = species_profile.get("motifs", [""])[0]
    
    # Create alignment visualization
    alignment = _create_alignment_visualization(sequence, reference_motif)
    
    # Get coordinates
    coordinates = _get_species_coordinates(best_species)
    
    return AlignSequenceResponse(
        species=species_profile.get("scientificName", best_species),
        commonName=best_species,
        matchConfidence=round(confidence * 100, 1),
        conservationStatus=species_profile.get("conservationStatus", "Data Deficient"),
        alignment=alignment,
        coordinates=coordinates,
    )
