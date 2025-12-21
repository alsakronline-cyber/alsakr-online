from app.config import settings
import requests

class EmailParser:
    def parse_quote(self, email_text: str):
        prompt = f"""
        Extract the following as JSON: price_per_unit, currency, lead_time_days
        Email: {email_text}
        """
        response = requests.post(f"{settings.OLLAMA_HOST}/api/generate", json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "format": "json"
        })
        return response.json()
