"""Demo 16S rRNA oligonucleotide signatures for common Indian marine taxa."""

from typing import Dict, List, TypedDict


class MarkerProfile(TypedDict):
    scientificName: str
    markerType: str
    motifs: List[str]


MARINE_SPECIES_MARKERS: Dict[str, MarkerProfile] = {
    "Mackerel": {
        "scientificName": "Rastrelliger kanagurta",
        "markerType": "16S rRNA",
        "motifs": [
            "GCTACACACCGCCCGTCA",
            "TTGGGTGAGGAGGA",
            "ACGGGGAATAACAG",
        ],
    },
    "Sardine": {
        "scientificName": "Sardinella longiceps",
        "markerType": "16S rRNA",
        "motifs": [
            "CGAACGCTGGCGGC",
            "TAGTCCACGCCGTA",
            "AAGGTGGCTTGGTA",
        ],
    },
    "Tuna": {
        "scientificName": "Thunnus albacares",
        "markerType": "16S rRNA",
        "motifs": [
            "AAAGATATCGGCACC",
            "CTAGCCGCAGGCATC",
            "TTCGGGCCTGAACTC",
        ],
    },
    "Hilsa": {
        "scientificName": "Tenualosa ilisha",
        "markerType": "16S rRNA",
        "motifs": [
            "GTCGAACGGTAACAG",
            "CCTGGCTCAGGATGA",
        ],
    },
    "Indian Prawn": {
        "scientificName": "Penaeus indicus",
        "markerType": "16S rRNA",
        "motifs": [
            "TGGTCGGTGCAGAA",
            "CGAGGCTCAGCGTA",
        ],
    },
}
