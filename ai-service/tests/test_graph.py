import asyncio

from app.graph.graph import rag_graph


async def main():

    chat_history = [
        {
            "role": "user",
            "content": "What happens to birds in Buffalo during winter?"
        },
        {
            "role": "assistant",
            "content": (
                "Many birds leave Buffalo during winter "
                "and travel south."
            )
        }
    ]

    initial_state = {
        "question": "Why do they do that?",
        "rewritten_ques": None,
        "chat_history": chat_history,

        "document_id": "76265963-fa86-4cbb-81c3-1fedce5e657e",

        "documents": [],
        "retrieval_scores": [],
        "is_relevant": False,

        "rewrite_attempts": 0,

        "answer": "",
        "sources": [],
    }

    result = await rag_graph.ainvoke(initial_state)

    print("\nAnswer:")
    print(result["answer"])

    print("\nRewritten question:")
    print(result.get("rewritten_ques"))

    print("\nRewrite attempts:")
    print(result["rewrite_attempts"])

    print("\nSources:")
    print(result["sources"])


if __name__ == "__main__":
    asyncio.run(main())