from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rag.pipeline import answer_question


router = APIRouter()


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)
    document_id: str | None = None
    chat_history: list[dict] = []


@router.post("/query")
async def query(request: QueryRequest):

    try:
        result = await answer_question(
            question=request.question,
            document_id=request.document_id,
            chat_history=request.chat_history,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )