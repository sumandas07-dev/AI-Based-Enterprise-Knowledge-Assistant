import asyncio
import time

from app.rag.loader import load_document


async def main():
    file_path = "./pdf/2312.10997v5.pdf"

    start = time.perf_counter()

    documents = await load_document(file_path)

    end = time.perf_counter()

    print("\n========== LOADER RESULT ==========")
    print(f"Total Documents : {len(documents)}")
    print(f"Loading Time    : {end - start:.2f} seconds")

    # Count document types
    image_docs = 0
    table_docs = 0
    text_docs = 0

    for document in documents:
        element_type = document.metadata.get("element_type")

        if element_type == "Image":
            image_docs += 1
        elif element_type == "Table":
            table_docs += 1
        else:
            text_docs += 1

    print("\n========== DOCUMENT SUMMARY ==========")
    print(f"Image Documents : {image_docs}")
    print(f"Table Documents : {table_docs}")
    print(f"Text Documents  : {text_docs}")

    # print("\n========== SAMPLE DOCUMENTS ==========")

    # for i, document in enumerate(documents[:5], start=1):
    #     print(f"\n---------- DOCUMENT {i} ----------")

    #     print("Metadata:")
    #     print(document.metadata)

    #     print("\nContent Preview:")
    #     print(document.page_content[:500])

    #     print("-" * 80)
    print("\n========== PAGE 13 TABLE ==========\n")

    for document in documents:
        if (
            document.metadata.get("element_type") == "Table"
            and document.metadata.get("page") == 13
        ):
            print("Metadata:")
            print(document.metadata)

            print("\nHTML:")
            print(document.page_content)

            break


if __name__ == "__main__":
    asyncio.run(main())