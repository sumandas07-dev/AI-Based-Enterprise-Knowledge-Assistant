'''
from app.rag.retriever import retrieve_documents
from app.rag.pipeline import answer_question
import asyncio


async def main():
    # question = "What is the vision statement in section 1 TCS CSR Vision and Mission?"
    # question = "Empower communities by connecting people to opportunities in the digital economy?"
    # question = "According to the TCS CSR Vision and Mission section, what is the vision?"
    question = "What are the three stages of RAG ?"

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
'''

import asyncio

from app.rag.pipeline import answer_question


async def main():

    chat_history = [
        {
            "role": "user",
            "content": "What happens to birds in Buffalo during winter?"
        },
        {
            "role": "assistant",
            "content": (
                "In Buffalo, many birds migrate away during the winter, traveling south to find a warmer climate. They return in the spring when food becomes more abundant."
            )
        }
    ]

    question = "Why do they do that?"

    result = await answer_question(
        question=question,
        document_id=None,
        chat_history=chat_history or [],
    )

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