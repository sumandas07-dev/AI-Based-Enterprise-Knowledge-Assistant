import asyncio
import time

from app.rag.loader import load_document


async def main():
    file_path = "./pdf/2312.10997v5.pdf"

    start_time = time.perf_counter()

    documents = await load_document(file_path)

    end_time = time.perf_counter()

    print("\n========== SMART LOADER RESULT ==========")
    print(f"Documents returned: {len(documents)}")
    print(f"Total loading time: {end_time - start_time:.2f} seconds")

    for i, document in enumerate(documents, start=1):

        print(f"\n========== DOCUMENT {i} ==========")

        print("\n--- CONTENT ---")
        print(document.page_content)

        print("\n--- METADATA ---")
        print(document.metadata)


if __name__ == "__main__":
    asyncio.run(main())