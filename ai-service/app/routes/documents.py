from fastapi import APIRouter, HTTPException

from app.rag.pipeline import delete_document


router = APIRouter()


@router.delete("/documents/{document_id}")
async def delete_document_route(document_id: str):

    try:
        result = await delete_document(document_id)

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )