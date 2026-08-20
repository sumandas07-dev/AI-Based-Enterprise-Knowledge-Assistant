from pathlib import Path

from app.service.file_service import download_pdf, delete_pdf_temp_file
from app.rag.loader import load_document
from app.rag.chunker import split_documents
from app.rag.vector_store import add_documents
from app.rag.retriever import retrieve_documents
from app.utils.formatting import format_context
from app.llm.prompts import RAG_PROMPT
from app.llm.model import get_llm

# Upload (Ingest) a Document
async def ingest_document(file_url: str, document_id: str, filename: str) -> list[str]:
    """
    Load, chunk, embed, and store a document in Pinecone.
    """
    temp_file_path: Path | None = None
    
    try:
        # Download PDF from Cloudinary
        temp_file_path = await download_pdf(file_url)

        # 2. Load PDF
        documents = await load_document(temp_file_path)

        # 3. Split into chunks
        chunks = split_documents(documents)

        # 4. Embed and store in Pinecone
        ids = await add_documents(
            chunks=chunks,
            document_id=document_id,
            filename=filename,
        )

        # 5. Return document IDs

        return ids
    
    except Exception as error:
        print(f"Error ingest_document: {error}")
        raise

    finally:
        if temp_file_path is not None:
            delete_pdf_temp_file(temp_file_path)


# Answer Question (RAG)
async def answer_question(question: str, document_id: str | None = None, chat_history: list | None = None) -> dict:
    try:
        # Run using LangGraph state graph workflow
        initial_state = {
            "question": question,
            "rewritten_ques": None,
            "chat_history": chat_history or [],
            "document_id": document_id,
            "documents": [],
            "retrieval_scores": [],
            "is_relevant": False,
            "rewrite_attempts": 0,
            "answer": "",
            "sources": []
        }

        from app.graph.graph import rag_graph
        result = await rag_graph.ainvoke(initial_state)

        return {
            "answer": result["answer"],
            "sources": result["sources"],
        }

    except Exception as error:
        print(f"Error answer_question: {error}")
        raise