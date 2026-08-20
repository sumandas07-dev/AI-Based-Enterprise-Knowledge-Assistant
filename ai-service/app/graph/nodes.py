from app.graph.state import RAGState
from app.rag.retriever import retrieve_documents
from app.config.rag import (
    MIN_RELEVANCE_SCORE,
    MIN_RELEVANT_CHUNKS,
    MAX_REWRITE_ATTEMPTS
)
from app.utils.formatting import format_chat_history, format_context
from app.llm.prompts import QUERY_REWRITE_PROMPT, RAG_PROMPT
from app.llm.model import (get_rewrite_llm, get_llm)

# Retrieve Node
async def retrieve_node(state: RAGState) -> dict:
    """
    Retrieve relevant document chunks from Pinecone.
    """
    question = state["question"]
    rewritten_ques = state.get("rewritten_ques")
    document_id = state.get("document_id")
    
    search_query = rewritten_ques or question
    
    result_documents = await retrieve_documents(
        query=search_query,
        document_id=document_id,
        # top_k=5
    )

    # Separate the result_documents = [(doc1, 0.1), (doc2, 0,2), ...]
    documents = []
    scores = []
    for doc, score in result_documents:
        documents.append(doc)
        scores.append(score)

    return {
        "documents": documents,
        "retrieval_scores": scores,
    }

# grade_document_node checks whether the retrieved documents/chunks are relevant to the question
async def grade_documents_node(state: RAGState) -> dict:
    """
    Determine whether enough relevant document chunks
    were retrieved to answer the question.
    """
    documents = state.get("documents", [])
    scores = state.get("retrieval_scores", [])

    if not documents or not scores:
        return {
            "is_relevant": False,
            "documents": [],
            "retrieval_scores": [],
        }

    relevant_documents = []
    relevant_scores = []

    for document, score in zip(documents, scores):
        if score >= MIN_RELEVANCE_SCORE:
            relevant_documents.append(document)
            relevant_scores.append(score)

    is_relevant = (
        len(relevant_documents) >= MIN_RELEVANT_CHUNKS
    )

    print("Retrieval scores:", scores) ###########
    print("Is relevant:", is_relevant) ###########

    return {
        "documents": relevant_documents,
        "retrieval_scores": relevant_scores,
        "is_relevant": is_relevant,
    }

# The question rewritten node is responsible for rewriting the question
async def rewrite_query_node(state: RAGState) -> dict:
    """
    Rewrite a context-dependent question into a standalone
    search query using recent conversation history.
    """

    question = state["question"]
    chat_history = state.get("chat_history", [])
    rewrite_attempts = state.get("rewrite_attempts", 0)

    # Safety guard against repeated rewrites
    if rewrite_attempts >= MAX_REWRITE_ATTEMPTS:
        return {}
    
    # Without conversation history there is nothing
    # useful to recover for rewriting.
    if not chat_history:
        return {
            "rewrite_attempts": rewrite_attempts + 1,
        }

    formatted_history = format_chat_history(chat_history)

    prompt = QUERY_REWRITE_PROMPT.invoke({
        "chat_history": formatted_history,
        "question": question,
    })
    
    llm = get_rewrite_llm()
    response = await llm.ainvoke(prompt)

    rewritten_ques = response.content.strip()

    print("REWRITE RESPONSE:", response)
    print("REWRITE CONTENT:", repr(response.content))

    # Defensive fallback if model returns empty output
    if not rewritten_ques:
        return {
            "rewrite_attempts": rewrite_attempts + 1 
        }
    
    return {
        "rewritten_ques": rewritten_ques,
        "rewrite_attempts": rewrite_attempts + 1,
    }

# The answer generation node is responsible for generating the final answer
async def generate_answer_node(state: RAGState) -> dict:
    """
    Generate the final answer using the retrived documents.
    """
    question = state["question"]
    rewrite_ques = state.get("rewritten_ques")
    documents = state.get("documents", [])

    answer_question = rewrite_ques or question

    context = format_context(documents)

    prompt = RAG_PROMPT.invoke({
        "context": context,
        "question": answer_question,
    })

    llm = get_llm()

    response = await llm.ainvoke(prompt)

    return {
        "answer": response.content,
    }

# The source node is responsible for building the sources
async def build_sources_node(state: RAGState) -> dict:
    """
    Build unique source citations from the documents
    used to generate the answer.

    Example:
    documents:
    [
        Document(metadata={
            "document_id": "doc-123",
            "filename": "Bird-Fact-Sheet.pdf",
            "page": 0
        }),
        Document(metadata={
            "document_id": "doc-123",
            "filename": "Bird-Fact-Sheet.pdf",
            "page": 0
        }),
        Document(metadata={
            "document_id": "doc-123",
            "filename": "Bird-Fact-Sheet.pdf",
            "page": 1
        })
    ]

    output:
    {
        "sources": [
            {
                "document_id": "doc-123",
                "filename": "Bird-Fact-Sheet.pdf",
                "page": 1
            },
            {
                "document_id": "doc-123",
                "filename": "Bird-Fact-Sheet.pdf",
                "page": 2
            }
        ]
    }
    """

    documents = state.get("documents", [])

    sources = []
    seen_sources = set()

    for document in documents:
        document_id = document.metadata.get("document_id")
        filename = document.metadata.get("filename")
        page = document.metadata.get("page")

        # Unique combination of document + page
        source_key = (document_id, page)

        # Avoid duplicate citations from the same page
        if source_key not in seen_sources:
            seen_sources.add(source_key)

            sources.append({
                "document_id": document_id,
                "filename": filename,
                "page": page if page is not None else None,
            })

    return {
        "sources": sources,
    }

# Fallback Node
async def fallback_node(state: RAGState) -> dict:
    """
    Return a safe fallback response when no relevant
    information is found in the knowledge base.
    """

    return {
        "answer": (
            "I couldn't find enough relevant information "
            "in the available documents to answer this question."
        ),
        "sources": [],
    }