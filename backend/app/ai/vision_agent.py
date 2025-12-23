from app.ai.qdrant_client import QdrantManager
from app.ai.embeddings import EmbeddingService

class VisionAgent:
    def __init__(self):
        self.qdrant = QdrantManager()
        self.embedder = EmbeddingService()

    async def identify_part_from_image(self, image_path: str):
        # 1. Generate embedding & Search Qdrant
        vector = self.embedder.generate_image_embedding(image_path)
        similar_parts = self.qdrant.search_by_vector(vector, collection_type="image")
        
        # 2. Extract Text (OCR)
        ocr_text = await self.extract_text(image_path)
        
        # 3. Vision LLM Analysis (Llama 3.2)
        llm_analysis = await self.analyze_with_vision_llm(image_path, ocr_text)
        
        return {
            "similar_parts": similar_parts,
            "ocr_text": ocr_text,
            "llm_analysis": llm_analysis
        }

    async def extract_text(self, image_path: str):
        import easyocr
        reader = easyocr.Reader(['en', 'ar'], gpu=False) # GPU=False for VPS compatibility
        result = reader.readtext(image_path, detail=0)
        return " ".join(result)

    async def analyze_with_vision_llm(self, image_path: str, ocr_text: str):
        import requests
        import base64
        import json
        from app.config import settings

        with open(image_path, "rb") as img_file:
            base64_image = base64.b64encode(img_file.read()).decode('utf-8')

        prompt = f"""
        Identify this industrial part. Use the OCR text '{ocr_text}' to help.
        Return a JSON object with: part_name, manufacturer, technical_specifications.
        """
        
        try:
            response = requests.post(
                f"{settings.OLLAMA_HOST}/api/generate",
                json={
                    "model": "llama3.2-vision",
                    "prompt": prompt,
                    "images": [base64_image],
                    "stream": False,
                    "format": "json"
                },
                timeout=30
            )
            
            response_data = response.json()
            llm_response_str = response_data.get("response", "{}")
            
            # Parse the stringified JSON returned by Ollama
            try:
                return json.loads(llm_response_str)
            except json.JSONDecodeError:
                print(f"Failed to parse LLM response: {llm_response_str}")
                return {}
                
        except Exception as e:
            return {"error": f"Vision LLM failed: {str(e)}"}
