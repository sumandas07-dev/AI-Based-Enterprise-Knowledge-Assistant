from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(documents: list[Document]) -> list[Document]:
    """
    Consolidate and Contextualize document splitting (Zero Data Loss):

    1. Structural Merging: Accumulate all contiguous text elements (including short fragments,
       footers, page numbers, list items) into running section buffers instead of dropping them
       or embedding them alone.
    2. Context-Aware Grouping: Track active Title/Header elements and prepend 'Header: <title>\n\n'
       to all subsequent consolidated text chunks. Titles are not embedded as standalone chunks.
    3. Smart Chunking: Pass consolidated text blocks to RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).
    4. Preserve VLM Image/Table Chunks: Keep Image (VLM descriptions) and Table chunks intact.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[Document] = []
    active_header: str | None = None
    current_group_docs: list[Document] = []

    def flush_current_group():
        nonlocal current_group_docs, active_header, chunks

        if not current_group_docs:
            return

        combined_text = "\n\n".join(
            doc.page_content.strip()
            for doc in current_group_docs
            if doc.page_content and doc.page_content.strip()
        )
        if not combined_text.strip():
            current_group_docs = []
            return

        base_metadata = dict(current_group_docs[0].metadata)
        base_metadata["element_type"] = "Text"
        base_metadata["chunk_type"] = "text"
        if active_header:
            base_metadata["header"] = active_header

        split_texts = splitter.split_text(combined_text)

        for text_segment in split_texts:
            if active_header:
                content = f"Header: {active_header}\n\n{text_segment}"
            else:
                content = text_segment

            chunks.append(
                Document(
                    page_content=content,
                    metadata=dict(base_metadata),
                )
            )

        current_group_docs = []

    for doc in documents:
        element_type = doc.metadata.get("element_type", "")

        # 1. Keep Tables intact
        if element_type == "Table":
            flush_current_group()
            chunks.append(doc)
            continue

        # 2. Keep Image descriptions intact
        if element_type == "Image":
            flush_current_group()
            chunks.append(doc)
            continue

        # 3. Handle Title / Header elements (track active header, do not emit standalone chunk)
        if element_type in ("Title", "Header", "Headline"):
            flush_current_group()
            active_header = doc.page_content.strip()
            continue

        # 4. Accumulate ALL text elements into running buffer without dropping data
        current_group_docs.append(doc)

    # Flush remaining text group at the end
    flush_current_group()

    return chunks