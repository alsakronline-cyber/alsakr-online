from app.ai.qdrant_client import QdrantManager
from app.ai.embeddings import EmbeddingService

class VisionAgent:
    def __init__(self):
        self.qdrant = QdrantManager()
        self.embedder = EmbeddingService()

    async def identify_part_from_image(self, image_path: str):
        # 1. Generate embedding
        vector = self.embedder.generate_image_embedding(image_path)
        # 2. Search Qdrant
        results = self.qdrant.search_by_vector(vector, collection_type="image")
        return results

    async def extract_text(self, image_path: str):
        import easyocr
        reader = easyocr.Reader(['en', 'ar'], gpu=False) # GPU=False for VPS compatibility
        result = reader.readtext(image_path, detail=0)
        return " ".join(result)
