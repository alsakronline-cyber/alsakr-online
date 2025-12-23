from qdrant_client import QdrantClient
from qdrant_client.http import models

class QdrantManager:
    def __init__(self):
        import os
        # Use simple host/port configuration to avoid URL parsing issues
        host = os.getenv("QDRANT_HOST", "localhost").replace("http://", "").replace("https://", "").split(":")[0]
        port = 6333
        self.client = QdrantClient(host=host, port=port)
        self.text_collection = "parts_text"
        self.image_collection = "parts_images"

    def initialize_collections(self):
        # Create text collection (1024 dim for e5-large)
        self.client.recreate_collection(
            collection_name=self.text_collection,
            vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
        )
        # Create image collection (512 dim for CLIP)
        self.client.recreate_collection(
            collection_name=self.image_collection,
            vectors_config=models.VectorParams(size=512, distance=models.Distance.COSINE),
        )

    def upsert_part_embedding(self, part_id: str, vector: list, metadata: dict, collection_type: str = "text"):
        collection = self.text_collection if collection_type == "text" else self.image_collection
        self.client.upsert(
            collection_name=collection,
            points=[
                models.PointStruct(
                    id=part_id, # UUID should be supported or hashed to int
                    vector=vector,
                    payload=metadata
                )
            ]
        )

    def search_by_vector(self, vector: list, top_k: int = 10, collection_type: str = "text"):
        collection = self.text_collection if collection_type == "text" else self.image_collection
        return self.client.search(
            collection_name=collection,
            query_vector=vector,
            limit=top_k
        )
