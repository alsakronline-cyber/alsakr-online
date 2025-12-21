from app.ai.qdrant_client import QdrantManager
from sentence_transformers import SentenceTransformer

class SearchEngine:
    def __init__(self):
        self.qdrant = QdrantManager()
        self.text_model = SentenceTransformer('intfloat/multilingual-e5-large')

    async def search(self, query: str, type: str = "text"):
        if type == "text":
            vector = self.text_model.encode(query).tolist()
            results = await self.qdrant.search_text(vector)
            return results
        # Add filtering logic here
        return []
