from pathlib import Path

from langchain_core.documents import Document

from app.document_parser.parser import parse_pdf


async def load_document(file_path: str | Path) -> list[Document]:
    """
    Load a PDF and return LangChain Documents.
    """
    print("\nloader.py\n")

    file_path = Path(file_path)

    if file_path.suffix.lower() != ".pdf":
        raise ValueError(
            f"Unsupported file type: {file_path.suffix}"
        )

    return await parse_pdf(file_path)


'''
async def load_document(file_path: str | Path, document_id: str | None = None) -> list[Document]:

    path = Path(file_path)

    logger.info(
        "load_document() called | file=%s",
        path.name,
    )

    markdown = load_with_markitdown(path)

    document = Document(
        page_content=markdown,
        metadata={
            "source": path.name,
            "document_id": document_id,
            "parser": "markitdown",
        },
    )

    logger.info(
        "Document loading complete | parser=markitdown characters=%d",
        len(markdown),
    )

    return [document]
'''

'''
async def load_document(file_path: str | Path) -> list[Document]:
    """
    Inspect a document and select the appropriate parser.

    Flow:
        document
            ↓
        inspect_document()
            ↓
        use_docling?
         /       \
       yes        no
        ↓          ↓
     Docling     Local
    """

    path = Path(file_path)

    logger.info("load_document() called: %s", path.name) ################################

    # 1. Inspect document
    inspection = await inspect_document(path)

    # ---------------------------------------------------------
    # 2. PDF -> page-level routing
    # ---------------------------------------------------------
    if inspection.pages:
        docling_pages = [
            page.page_number
            for page in inspection.pages
            if page.use_docling
        ]

        local_pages = [
            page.page_number
            for page in inspection.pages
            if not page.use_docling
        ]

        logger.info("PDF routing | local_pages=%d docling_pages=%d",len(local_pages),len(docling_pages)) ########

        documents: list[Document] = [] 

        if local_pages:
            logger.info("Calling Local Parser") ###########
            documents.extend(
                load_with_local_parser(
                    file_path=path,
                    page_numbers=local_pages,
                )
            )
        
        if docling_pages:
            logger.info("Calling Docling Parser") ##########
            documents.extend(
                load_with_docling(
                    file_path=path,
                    page_numbers=docling_pages,
                )
            )

        return documents

    # ---------------------------------------------------------
    # 3. DOCX / TXT -> document-level routing
    # ---------------------------------------------------------
    if inspection.use_docling:

        logger.info("Parser selected: Docling | file=%s",path.name) ##########

        return load_with_docling(
            file_path=path
        )

    logger.info("Parser selected: Local | file=%s",path.name) ################################

    # If we reach here, use local parser (e.g. text, simple docx)

    return load_with_local_parser(path)
'''

'''
def load_document(file_path : str | Path) -> list[Document]:
    """
    Load a supported document and return its contents as
    LangChain Document objects.

    Supported formats:
    - PDF (.pdf)
    - Text (.txt)
    - Word (.docx)
    """
    path = Path(file_path)
    suffix = path.suffix.lower()
    # print("Calling Loader to Load the pdf...\n")
    if suffix == ".pdf":
        loader = PyPDFLoader(str(path))
    elif suffix ==  ".txt":
        loader = TextLoader(
            str(path),
            encoding="utf-8",
        )
    elif suffix == ".docx":
        loader = Docx2txtLoader(str(path))
    else:
        raise ValueError(
            f"Unsupported file type: {suffix}"
        )
        
    documents = loader.load()

    return documents
'''
