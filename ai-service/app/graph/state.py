from typing import TypedDict
from langchain_core.documents import Document

class RAGState(TypedDict):
    question: str # Original query asked by user
    
    rewritten_ques: str | None # Rewritten standalone question. # None if the query has not been rewritten.
    
    chat_history: list[dict] # Recent conversation used for query rewriting
    
    document_id: str | None # Search only this document when provided
    
    documents: list[Document] # Documents retrieved from Pinecone
    
    is_relevant: bool # Whether the documents are relevant to the question
    rewrite_attempts: int 
    retrieval_scores: list[float]
    
    answer: str # Final RAG answer
    
    sources: list[dict] # Sources used for the answer


'''
{
    "question": "What about interns?",
    "rewritten_ques": "What about interns leave?",
    "chat_history": [
        {
            "role": "user",
            "content": "What is the maternity leave policy?"
        }
    ],
    "document_id": None,
    "documents": [],
    "rewrite_attempts": 0,
    "answer": "",
    "sources": [],
}
'''