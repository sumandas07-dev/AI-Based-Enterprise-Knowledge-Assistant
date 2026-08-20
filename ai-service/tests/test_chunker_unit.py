from app.rag.chunker import split_documents
from langchain_core.documents import Document


def test_split_documents_consolidate_and_contextualize():
    docs = [
        Document(page_content="II. OVERVIEW OF RAG", metadata={"element_type": "Title", "page": 1}),
        Document(
            page_content="The RAG research paradigm is continuously evolving across enterprise knowledge assistants.",
            metadata={"element_type": "NarrativeText", "page": 1},
        ),
        Document(
            page_content="1. Naive RAG: Early implementations focused on basic chunking.",
            metadata={"element_type": "ListItem", "page": 1},
        ),
        Document(page_content="SKU-9921-X", metadata={"element_type": "UncategorizedText", "page": 1}),
        Document(page_content="4", metadata={"element_type": "PageNumber", "page": 1}),
        Document(page_content="arXiv:2312.10997v5", metadata={"element_type": "Header", "page": 1}),
        Document(page_content="<table>Sample Table</table>", metadata={"element_type": "Table", "page": 1}),
        Document(
            page_content="2. Advanced RAG: Incorporates pre-retrieval techniques.",
            metadata={"element_type": "ListItem", "page": 2},
        ),
        Document(page_content="Image VLM description of architectural diagram", metadata={"element_type": "Image", "page": 2}),
    ]

    chunks = split_documents(docs)

    # 1. No standalone title element
    standalone_titles = [c for c in chunks if c.page_content.strip() == "II. OVERVIEW OF RAG"]
    assert len(standalone_titles) == 0, "Title should not be a standalone chunk"

    # 2. Check header prepending on text chunks
    text_chunks = [c for c in chunks if c.metadata.get("element_type") == "Text"]
    assert len(text_chunks) >= 1
    for tc in text_chunks:
        assert "Header: " in tc.page_content

    # 3. ZERO DATA LOSS verification (all fragments like SKU-9921-X, "4", and "arXiv:2312.10997v5" are preserved inside merged chunks)
    all_text = " ".join(c.page_content for c in chunks)
    assert "SKU-9921-X" in all_text, "Enterprise SKU must be preserved"
    assert "4" in all_text, "Page number or clause fragment must be preserved"
    assert "arXiv:2312.10997v5" in all_text, "Header tag must be preserved"

    # 4. Check Table and Image chunks preservation
    table_chunks = [c for c in chunks if c.metadata.get("element_type") == "Table"]
    assert len(table_chunks) == 1
    assert table_chunks[0].page_content == "<table>Sample Table</table>"

    image_chunks = [c for c in chunks if c.metadata.get("element_type") == "Image"]
    assert len(image_chunks) == 1
    assert image_chunks[0].page_content == "Image VLM description of architectural diagram"


if __name__ == "__main__":
    test_split_documents_consolidate_and_contextualize()
    print("\nALL CONSOLIDATE & CONTEXTUALIZE UNIT TESTS PASSED SUCCESSFULLY!")
