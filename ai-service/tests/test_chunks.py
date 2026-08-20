import asyncio
from pathlib import Path
from collections import Counter

from app.document_parser.parser import parse_pdf
from app.rag.chunker import split_documents


async def main():

    file_path = Path("./pdf/2312.10997v5.pdf")

    print("\n========================================")
    print("CHUNK TEST - BEFORE PINECONE")
    print("========================================")

    # ----------------------------------------
    # 1. Parse PDF
    # ----------------------------------------

    print("\nParsing PDF...")

    documents = await parse_pdf(file_path)

    print(f"Parsed Documents : {len(documents)}")


    # ----------------------------------------
    # 2. Create chunks
    # ----------------------------------------

    print("\nRunning chunker...")

    chunks = split_documents(documents)

    print(f"Total Chunks      : {len(chunks)}")


    # ----------------------------------------
    # 3. Count chunk types
    # ----------------------------------------

    chunk_types = Counter(
        chunk.metadata.get("chunk_type", "MISSING")
        for chunk in chunks
    )

    element_types = Counter(
        chunk.metadata.get("element_type", "MISSING")
        for chunk in chunks
    )

    print("\n========== CHUNK TYPES ==========")

    for chunk_type, count in chunk_types.items():
        print(f"{chunk_type:<15} : {count}")

    print("\n========== ELEMENT TYPES ==========")

    for element_type, count in element_types.items():
        print(f"{element_type:<15} : {count}")


    # ----------------------------------------
    # 4. Check Image and Table chunks
    # ----------------------------------------

    special_chunks = [
        chunk
        for chunk in chunks
        if chunk.metadata.get("element_type") in {
            "Image",
            "Table",
        }
    ]

    print("\n========================================")
    print("IMAGE / TABLE CHUNKS")
    print("========================================")

    print(
        f"Total Image/Table chunks : {len(special_chunks)}"
    )


    for index, chunk in enumerate(special_chunks, start=1):

        print("\n----------------------------------------")
        print(f"SPECIAL CHUNK {index}")

        print("\nMetadata:")
        print(chunk.metadata)

        print("\nContent:")
        print(chunk.page_content[:1000])


    # ----------------------------------------
    # 5. Show first few normal text chunks
    # ----------------------------------------

    print("\n========================================")
    print("SAMPLE TEXT CHUNKS")
    print("========================================")

    text_chunks = [
        chunk
        for chunk in chunks
        if chunk.metadata.get("element_type") == "Text"
    ]

    for index, chunk in enumerate(text_chunks[:10], start=1):

        print("\n----------------------------------------")
        print(f"TEXT CHUNK {index}")

        print("\nMetadata:")
        print(chunk.metadata)

        print("\nContent:")
        print(chunk.page_content[:500])


    # ----------------------------------------
    # 6. Specifically check page 16
    # ----------------------------------------

    print("\n========================================")
    print("PAGE 16 CHECK")
    print("========================================")

    page_16_chunks = [
        chunk
        for chunk in chunks
        if chunk.metadata.get("page") == 16
    ]

    print(
        f"Chunks on page 16 : {len(page_16_chunks)}"
    )

    for index, chunk in enumerate(page_16_chunks, start=1):

        print("\n----------------------------------------")
        print(f"PAGE 16 CHUNK {index}")

        print("Metadata:")
        print(chunk.metadata)

        print("\nContent:")
        print(chunk.page_content[:1000])


    # ----------------------------------------
    # 7. IMPORTANT
    # ----------------------------------------

    print("\n========================================")
    print("TEST FINISHED")
    print("========================================")

    print(
        "\nNothing was sent to Pinecone."
    )

    print(
        "vector_store.py was NOT called."
    )


if __name__ == "__main__":
    asyncio.run(main())