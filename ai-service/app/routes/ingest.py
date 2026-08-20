from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.rag.pipeline import ingest_document


router = APIRouter()


class IngestRequest(BaseModel):
    file_url: str
    document_id: str
    filename: str


@router.post("/ingest")
async def ingest(request: IngestRequest):

    try:
        result = await ingest_document(
            file_url=request.file_url,
            document_id=request.document_id,
            filename=request.filename,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )