import os

from dotenv import load_dotenv


load_dotenv()


PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")


def check_pinecone_config():
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is not configured")
    if not PINECONE_INDEX_NAME:
        raise ValueError("PINECONE_INDEX_NAME is not configured")