from app.ai.qdrant_client import QdrantManager
from app.ai.embeddings import EmbeddingService

class TextSearchEngine:
    def __init__(self):
        self.qdrant = QdrantManager()
        self.embedder = EmbeddingService()

    async def search_by_description(self, query: str):
        vector = self.embedder.generate_text_embedding(query)
        results = self.qdrant.search_by_vector(vector, collection_type="text")
        return results
