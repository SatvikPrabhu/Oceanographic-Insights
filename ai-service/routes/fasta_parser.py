from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from schemas import ParseFastaResponse
from services.fasta_service import parse_fasta_bytes

router = APIRouter(tags=["fasta"])


@router.post("/parse-fasta", response_model=ParseFastaResponse)
async def parse_fasta(
    request: Request,
    file: UploadFile | None = File(default=None),
) -> ParseFastaResponse:
    if file is not None:
        raw = await file.read()
    else:
        raw = await request.body()

    if not raw:
        raise HTTPException(
            status_code=400,
            detail="Provide a FASTA file (field name 'file') or a raw FASTA body",
        )

    try:
        return parse_fasta_bytes(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
