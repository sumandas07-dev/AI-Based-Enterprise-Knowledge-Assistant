from pathlib import Path
from unstructured.partition.pdf import partition_pdf

def extract_pdf_elements(file_path: str | Path) :
    """
    Extract structured elements, images, tables, figures 
    from a PDF file using unstructured library 
    """
    path = Path(file_path)
    print("\nunstructured_parser.py\n")

    # Extract elements using partition_pdf
    elements = partition_pdf(
        filename= str(path),
        strategy="hi_res",

        # Preserve detected table structure
        infer_table_structure=True,

        # Keep image/table payloads in metadata as Base64
        extract_image_block_types=["Image", "Table"],
        extract_image_block_to_payload=True,
    )
    return elements


def get_figure_caption(elements, image_index: int) -> str:
    """
    Find the figure caption associated with an image.

    Looks at the two elements before and after the image.
    Returns the first nearby element whose text starts with
    'Fig' or 'Figure'.
    """

    for offset in (-2, -1, 1, 2):
        index = image_index + offset

        if index < 0 or index >= len(elements):
            continue

        text = str(elements[index]).strip()

        if not text:
            continue

        lower_text = text.lower()

        if (
            lower_text.startswith("fig.")
            or lower_text.startswith("fig ")
            or lower_text.startswith("figure")
        ):
            return text

    return ""