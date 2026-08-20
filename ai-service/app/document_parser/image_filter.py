from unstructured.documents.elements import Image


def should_describe_image(image: Image, caption: str = "") -> bool:
    """
    Send an image to the VLM only if it has a nearby FigureCaption.
    """

    print("\nimage_filter.py\n")

    print("=" * 50)
    print(f"Page: {image.metadata.page_number}")
    print(f"Caption: {caption}")
    print("=" * 50)

    return bool(caption and caption.strip())

'''
def should_describe_image(image: Image, caption: str = "") -> bool:
    """
    Decide whether an image should be sent to the VLM.
    """
    print("\nimage_filter.py\n")
    ocr_text = str(image).strip()

    print("=" * 50)
    print(f"Page: {image.metadata.page_number}")
    print(f"Caption: {caption}")
    print(f"OCR words: {len(ocr_text.split())}")
    print(f"OCR preview: {ocr_text[:120]}")
    print("=" * 50)

    # Images with captions are usually meaningful
    if caption and caption.strip():
        return True

    # Images with lots of OCR text are likely diagrams
    if len(ocr_text.split()) >= 15:
        return True

    return False
'''