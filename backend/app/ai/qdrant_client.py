from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings

class QdrantManager:
    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_HOST)
        self.collection_text = "parts_text"
        self.collection_image = "parts_images"

    async def initialize_collections(self):
        # Create Text Collection
        if not self.client.collection_exists(self.collection_text):
            self.client.create_collection(
                collection_name=self.collection_text,
                vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE)
            )
        
        # Create Image Collection
        if not self.client.collection_exists(self.collection_image):
            self.client.create_collection(
                collection_name=self.collection_image,
                vectors_config=models.VectorParams(size=512, distance=models.Distance.COSINE)
            )

    async def upsert_text_embedding(self, part_id: str, vector: list, payload: dict):
        self.client.upsert(
            collection_name=self.collection_text,
            points=[models.PointStruct(id=part_id, vector=vector, payload=payload)]
        )

    async def search_text(self, vector: list, limit: int = 10):
        return self.client.search(
            collection_name=self.collection_text,
            query_vector=vector,
            limit=limit
        )
