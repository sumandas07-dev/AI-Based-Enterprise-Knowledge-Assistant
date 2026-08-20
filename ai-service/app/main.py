from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.rag.pipeline import ingest_document, answer_question
from app.rag.vector_store import delete_document_vectors

app = FastAPI(title="Enterprise Knowledge Assistant AI Service")

class IngestRequest(BaseModel):
    file_url: str
    document_id: str
    filename: str

class QueryRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    chat_history: Optional[list] = []

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health_check():
    return {
        "status": "ok",
        "service": "ai-service"
    }

@app.post("/ingest")
async def ingest(request: IngestRequest):
    try:
        ids = await ingest_document(
            file_url=request.file_url,
            document_id=request.document_id,
            filename=request.filename,
        )
        return {"status": "success", "ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query(request: QueryRequest):
    try:
        result = await answer_question(
            question=request.question,
            document_id=request.document_id,
            chat_history=request.chat_history,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def api_chat(request: QueryRequest):
    try:
        result = await answer_question(
            question=request.question,
            document_id=request.document_id,
            chat_history=request.chat_history,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        await delete_document_vectors(document_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
