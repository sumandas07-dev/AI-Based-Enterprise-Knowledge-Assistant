import os

from dotenv import load_dotenv


load_dotenv() 


DEFAULT_TOP_K = int(
    os.getenv("RAG_TOP_K", "5")
)

MIN_RELEVANCE_SCORE = float(
    os.getenv("RAG_MIN_RELEVANCE_SCORE", "0.60")
)

MIN_RELEVANT_CHUNKS = int(
    os.getenv("RAG_MIN_RELEVANT_CHUNKS", "1")
)

MAX_REWRITE_ATTEMPTS = int(
    os.getenv("RAG_MAX_REWRITE_ATTEMPTS", "1")
)

MAX_HISTORY_MESSAGES = int(
    os.getenv("RAG_MAX_HISTORY_MESSAGES", "4")
)

MAX_MESSAGE_LENGTH = int(
    os.getenv("RAG_MAX_MESSAGE_LENGTH", "500")
)