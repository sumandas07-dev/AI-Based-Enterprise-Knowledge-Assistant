# from collections import Counter

# from app.document_parser.unstructured_parser import extract_pdf_elements


# def main():
#     file_path = "./pdf/2312.10997v5.pdf"

#     elements = extract_pdf_elements(file_path)

#     print("\n========== UNSTRUCTURED RESULT ==========")
#     print(f"Total elements: {len(elements)}")

#     # Count element types
#     element_types = Counter(
#         type(element).__name__
#         for element in elements
#     )

#     print("\n========== ELEMENT TYPES ==========")

#     for element_type, count in element_types.items():
#         print(f"{element_type}: {count}")

#     # Print only Images and Tables
#     print("\n========== VISUAL ELEMENTS ==========")

#     for i, element in enumerate(elements, start=1):

#         element_type = type(element).__name__

#         if element_type not in ("Image", "Table"):
#             continue

#         print(f"\n========== ELEMENT {i} ==========")

#         print(f"Type: {element_type}")
#         print(f"Page: {element.metadata.page_number}")

#         print("\n--- TEXT ---")
#         print(str(element)[:500])

#         image_base64 = getattr(
#             element.metadata,
#             "image_base64",
#             None,
#         )

#         print(
#             "\nImage Base64:",
#             "YES" if image_base64 else "NO",
#         )

#         if image_base64:
#             print(f"Base64 length: {len(image_base64)}")


# if __name__ == "__main__":
#     main()

from app.document_parser.unstructured_parser import extract_pdf_elements


def main():
    file_path = "./pdf/2312.10997v5.pdf"

    elements = extract_pdf_elements(file_path)

    print("\n========== UNSTRUCTURED TEST ==========")
    print(f"Total elements: {len(elements)}")

    image_count = 0
    table_count = 0

    for element in elements:
        element_type = type(element).__name__

        # We only care about visual elements in this test
        if element_type not in ("Image", "Table"):
            continue

        if element_type == "Image":
            image_count += 1
        elif element_type == "Table":
            table_count += 1

        page = element.metadata.page_number

        image_base64 = getattr(
            element.metadata,
            "image_base64",
            None,
        )

        print("\n------------------------------")
        print(f"Type: {element_type}")
        print(f"Page: {page}")
        print(f"Text: {str(element)[:300]}")
        print(f"Base64 available: {bool(image_base64)}")

        if image_base64:
            print(f"Base64 length: {len(image_base64)}")

    print("\n========== SUMMARY ==========")
    print(f"Images: {image_count}")
    print(f"Tables: {table_count}")


if __name__ == "__main__":
    main()