import os
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_pinecone import PineconeVectorStore
from app.rag.embeddings import get_embedding_model

from app.config.pinecone import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
)

# Get the Vector Store Object
def get_vector_store() -> PineconeVectorStore:
    embedding_model = get_embedding_model()

    vector_store = PineconeVectorStore(
        index_name= PINECONE_INDEX_NAME,
        embedding= embedding_model,
        pinecone_api_key= PINECONE_API_KEY,
    )

    return vector_store


# Add Documents to Pinecone Vector Store
async def add_documents(chunks: list[Document], document_id: str, filename: str) -> list[str]:
    
    ids = []
    
    for index, chunk in enumerate(chunks):

        # Add metadata to every chunk
        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = filename
        chunk.metadata["chunk_index"] = index

        # Create a unique/stable Pinecone ID
        chunk_id = f"{document_id}_chunk_{index}"

        ids.append(chunk_id)

    vector_store = get_vector_store()

    await vector_store.aadd_documents(
        documents=chunks,
        ids=ids,
    )

    return ids


# Delete Documents from Pinecone Vector Store
async def delete_document_vectors(document_id: str) -> None:
    vector_store = get_vector_store()

    await vector_store.adelete(
        filter={
            "document_id": document_id,
        },
    )

'''
                 React
                   │
                   ▼
              Node Backend
             /      |       \
            /       |        \
       MongoDB  Cloudinary   Python AI
                              │
                           Pinecone
                              │
                             LLM
'''