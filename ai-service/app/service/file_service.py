from pathlib import Path
from tempfile import NamedTemporaryFile
import httpx
import os

async def download_pdf(file_url: str) -> Path:
    """
    Download a PDF from Cloudinary and save it
    to a temporary file.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            file_url,
            follow_redirects=True,
            timeout=60.0,
        )
        response.raise_for_status() # Raise an error for bad response

    # with NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as temp_file:
    #     temp_file.write(response.content)
    #     temp_file_path = Path(temp_file.name)
    # return temp_file_path

    temp_file = NamedTemporaryFile(
        mode='wb',
        suffix='.pdf',
        delete=False,
    )
    try:
        temp_file.write(response.content)
        temp_file.close()
        temp_file_path = Path(temp_file.name)

        return temp_file_path
        
    except Exception:
        temp_file.close()

        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        
        raise

    
    
def delete_pdf_temp_file(file_path: str | Path) -> None:
    path = Path(file_path)

    if path.exists():
        path.unlink()
        print(f"Deleted temp file: {file_path}")