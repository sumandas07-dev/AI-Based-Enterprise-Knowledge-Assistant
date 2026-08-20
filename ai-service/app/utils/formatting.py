from langchain_core.documents import Document
from app.config.rag import (
    MAX_HISTORY_MESSAGES,
    MAX_MESSAGE_LENGTH
)


# Format Context for LLM
def format_context(documents: list[Document]) -> str:
    """
    Combine retrieved document chunks into a single context string
    for the LLM.
    """
    texts = []

    for document in documents:
        texts.append(document.page_content)

    context = "\n\n".join(texts)

    return context


def format_chat_history(chat_history: list[dict]) -> str:
    """
    Format only recent conversation messages for query rewriting.
    """

    recent_messages = chat_history[-MAX_HISTORY_MESSAGES:]
    formatted_messages = []

    for message in recent_messages:
        role = message.get("role", "user")
        content = message.get("content", "")

        content = content[:MAX_MESSAGE_LENGTH]
        formatted_messages.append(
            f"{role}: {content}"
        )
    return "\n".join(formatted_messages)