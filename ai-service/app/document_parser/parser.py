from pathlib import Path
from unstructured.documents.elements import Image, Table, FigureCaption
from langchain_core.documents import Document

from app.document_parser.unstructured_parser import extract_pdf_elements, get_figure_caption
from app.document_parser.image_filter import should_describe_image
from app.document_parser.vision import describe_image

async def parse_pdf(file_path: str | Path) -> list[Document]:
    """
    Parse a PDF into LangChain Documents.
    """
    print("\nparser.py\n")
    elements = extract_pdf_elements(file_path)

    documents = []

    for i, element in enumerate(elements):
        metadata = {
            "source": Path(file_path).name,
            "page": element.metadata.page_number,
            "element_type": type(element).__name__,

            "chunk_type": "text",
            "element_index": i,
        }

        # Images
        if isinstance(element, Image):
            metadata["chunk_type"] = "image"

            image_base64 = getattr(
                element.metadata,
                "image_base64",
                None,
            )

            if not image_base64:
                continue

            caption = get_figure_caption(
                elements=elements,
                image_index=i,
            )

            metadata["figure_caption"] = caption

            # OCR text extracted by Unstructured
            ocr_text = str(element).strip()

            # Skip decorative images
            if not should_describe_image(
                image=element,
                caption=caption,
            ):
                print(f"Skipped VLM for page {metadata['page']}")
                content = ocr_text

            else:
                print(f"Calling VLM for page {metadata['page']}")

                try:
                    content = await describe_image(
                        image=element,
                        caption=caption,
                        image_text=ocr_text,
                    )
                    print("\n========== VLM DESCRIPTION ==========")
                    print(content)
                    print("=" * 80)
                except Exception as e:
                    print(f"Failed to describe image: {e}")
                    content = ocr_text

        # Tables
        elif isinstance(element, Table):
            metadata["chunk_type"] = "table"

            content = getattr(
                element.metadata,
                "text_as_html",
                str(element),
            )
        
        # Everything else like, Text Elements
        else:
            content = str(element)

        content = content.strip()

        if not content or content.strip("_-• ") == "":
            continue

        documents.append(
            Document(
                page_content=content,
                metadata=metadata,
            )
        )

    return documents