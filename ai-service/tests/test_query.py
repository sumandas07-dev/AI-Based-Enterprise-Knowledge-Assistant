from app.rag.retriever import retrieve_documents
from app.rag.pipeline import answer_question
import asyncio


async def main():
    question = "What is Retrieval-Augmented Generation?"

    result = await answer_question(question)#, 'cd5ebf42-a342-4975-843c-98d24c1dec39')


    print("\nQuestion:")
    print(question)

    print("\nAnswer:")
    print(result["answer"])

    print("\nSources:")

    for source in result["sources"]:
        print(
            f"- {source['filename']} "
            f"(Page {source['page']})"
        )

if __name__ == "__main__":
    asyncio.run(main())

# documents = await retrieve_documents(question)

# print("Retrieved:", len(documents))

# for index, document in enumerate(documents):
#     print(f"\n--- Result {index + 1} ---")

#     print(document.page_content)

#     print("\nMetadata:")
#     print(document.metadata)