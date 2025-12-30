import os
import json
import base64
from typing import Dict, Any, List
from .base import BaseAgent
from ..core.es_client import es_client
import requests
from ..core.config import settings

class VisualMatchAgent(BaseAgent):
    def __init__(self):
        system_prompt = """
        You are the 'VisualMatch' agent.
        Identify industrial parts from images.
        """
        super().__init__(name="VisualMatch", system_prompt=system_prompt)
        self.ollama_url = settings.OLLAMA_HOST
        self.vision_model = "llava" # or llama3.2-vision

    async def identify_and_match(self, image_data: str, mode: str = "path") -> Dict[str, Any]:
        """
        Identify part from image using Ollama Vision.
        mode: 'path' (local file path) or 'base64' (raw data)
        """
        
        # Prepare image for Ollama
        b64_image = ""
        if mode == "path":
            try:
                with open(image_data, "rb") as f:
                    b64_image = base64.b64encode(f.read()).decode("utf-8")
            except Exception as e:
                return {"error": f"Failed to read image: {str(e)}"}
        else:
            b64_image = image_data

        prompt = "Identify this industrial part. Return JSON with: brand, series, part_number (if visible), and description."

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.vision_model,
                    "prompt": prompt,
                    "images": [b64_image],
                    "stream": False,
                    "format": "json"
                },
                timeout=60
            )
            
            if response.status_code != 200:
                return {"error": f"Ollama Error: {response.text}"}
                
            result = response.json().get("response", "{}")
            vision_data = json.loads(result)
            
            # Enhancer: Cross-reference with ES if brand/part detected
            matches = []
            if vision_data.get("part_number"):
                from ..core.search_service import SearchService
                ss = SearchService()
                matches = ss.text_search(vision_data["part_number"], size=3)
                
                if not matches and vision_data.get("description"):
                    matches = ss.semantic_search(vision_data["description"], limit=3)

            return {
                "identification": vision_data,
                "matches": matches,
                "raw_analysis": result
            }

        except Exception as e:
            return {"error": f"Vision processing failed: {str(e)}"}
