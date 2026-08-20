from langchain_core.documents import Document

from app.rag.vector_store import get_vector_store
from app.config.rag import DEFAULT_TOP_K


# Retrieve Documents from Pinecone Vector Store
async def retrieve_documents(query: str, document_id: str | None = None, top_k: int = DEFAULT_TOP_K) -> list[tuple[Document, float]]:
    """
    Retrieve the most relevant document chunks for a user query.
    """

    vector_store = get_vector_store()

    search_filter = None
    if document_id:
        search_filter = {
            "document_id": document_id,
        }
    
    results = await vector_store.asimilarity_search_with_relevance_scores(
        query=query,
        k=top_k,
        filter=search_filter,
    )

# '''
    print("\n========== RETRIEVAL RESULTS ==========")
    for i, (document, score) in enumerate(results, start=1):
        print(f"\n--- Result {i} ---")
        print("Score:", score)
        print("Page:", document.metadata.get("page"))
        print("Element:", document.metadata.get("element_type"))
        print("Chunk type:", document.metadata.get("chunk_type"))
        print("Content:")
        print(document.page_content[:1000])
    print("=" * 50)
# '''

    return results
