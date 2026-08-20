import base64
from unstructured.documents.elements import Image
from google.genai import types

from app.llm.model import get_gemini_client
from app.llm.prompts import VLM_IMAGE_PROMPT

async def describe_image(image: Image, caption: str = "", image_text: str = "") -> str:
    """
    Generate a semantic description of an extracted image
    using Gemini Vision.
    """
    print("\nvision.py\n")

    image_base64 = image.metadata.image_base64
    image_bytes = base64.b64decode(image_base64)

    client = get_gemini_client()

    prompt = f"""{VLM_IMAGE_PROMPT}

    Figure Caption:
    {caption if caption else "Not available"}

    Extracted Image Text:
    {image_text if image_text else "Not available"}
    """

    # Generate Description
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            prompt,
            types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/jpeg",
            ),
        ],
    )

    description = response.text.strip()

    return description