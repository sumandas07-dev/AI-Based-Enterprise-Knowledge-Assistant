# import asyncio
# import time

# from app.rag.loader import load_document
# from app.rag.chunker import split_documents


# async def main():

#     file_path = "./pdf/2312.10997v5.pdf"

#     start = time.perf_counter()

#     documents = await load_document(file_path)

#     print(f"\nParsed Documents : {len(documents)}")

#     chunks = split_documents(documents)

#     end = time.perf_counter()

#     print(f"Total Chunks : {len(chunks)}")
#     print(f"Time : {end-start:.2f}s")

#     print("\n========== SAMPLE CHUNKS ==========\n")

#     for i, chunk in enumerate(chunks[:10], start=1):

#         print(f"Chunk {i}")
#         print(chunk.metadata)
#         print(chunk.page_content[:500])
#         print("-" * 80)


# if __name__ == "__main__":
#     asyncio.run(main())


import asyncio
import time
import uuid

from app.rag.pipeline import ingest_document


async def main():

    file_url = "https://api.cloudinary.com/v1_1/dnmhkkjdm/raw/download?timestamp=1786283279&public_id=enterprise-documents%2F2312.10997v5.pdf&format=pdf&type=authenticated&expires_at=1786283879&signature=643665f1314d244f8557e6b4db98d9095ff3bec1&api_key=783642274853231"
    document_id = "testing-doc"
    filename = "2312.10997v5.pdf"

    print("========== INGESTION TEST ==========")
    print(f"Document ID : {document_id}")

    start = time.perf_counter()

    ids = await ingest_document(
        file_url=file_url,
        document_id=document_id,
        filename=filename,
    )

    end = time.perf_counter()

    print("\n========== COMPLETE ==========")
    print(f"Stored vectors : {len(ids)}")
    print(f"Time taken     : {end-start:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main())