import asyncio
import time

from app.rag.vector_store import delete_document_vectors


async def main():

    document_id = "10e35f46-f958-47a0-aa21-fd3825b99539"

    print("\n========== DELETE VECTOR TEST ==========")
    print(f"Document ID : {document_id}")

    start = time.perf_counter()

    try:
        await delete_document_vectors(document_id)

        end = time.perf_counter()

        print("\n========== DELETE COMPLETE ==========")
        print(f"Document ID : {document_id}")
        print(f"Time Taken  : {end - start:.2f} seconds")

    except Exception as e:
        end = time.perf_counter()

        print("\n========== DELETE FAILED ==========")
        print(f"Error      : {e}")
        print(f"Time Taken : {end - start:.2f} seconds")


if __name__ == "__main__":
    asyncio.run(main())