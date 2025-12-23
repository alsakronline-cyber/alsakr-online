import io
import aiohttp
from pypdf import PdfReader

class PDFExtractor:
    @staticmethod
    async def extract_text_from_url(url: str) -> str:
        """Downloads a PDF from a URL and extracts text."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        return f"Error: Failed to download PDF (Status {response.status})"
                    
                    data = await response.read()
                    return PDFExtractor.extract_text_from_bytes(data)
        except Exception as e:
            return f"Error downloading PDF: {str(e)}"

    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """Extracts text from PDF bytes."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            return f"Error parsing PDF: {str(e)}"
