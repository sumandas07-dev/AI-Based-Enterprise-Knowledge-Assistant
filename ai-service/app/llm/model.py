import os

from google import genai
from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")


def get_llm() -> ChatGroq:
    llm = ChatGroq(
        api_key=groq_api_key,
        model="openai/gpt-oss-120b",
        temperature=0,
    )

    return llm

def get_rewrite_llm() -> ChatGroq:
    """
    Return the lightweight LLM used for query rewriting.
    """
    response = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="openai/gpt-oss-20b",
        temperature=0,
        max_tokens=300,
    )

    return response



def get_gemini_client() -> genai.Client:
    """
    Return a Gemini client.

    The client is created lazily so importing modules does not
    require GEMINI_API_KEY until Gemini is actually used.
    """
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not configured"
        )

    return genai.Client(
        api_key=api_key
    )