from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings

class QdrantManager:
    def __init__(self):
        host = settings.QDRANT_HOST.replace("http://", "").replace("https://", "")
        if ":" in host:
            host = host.split(":")[0]
        self.client = QdrantClient(host=host, port=settings.QDRANT_PORT)
        self.text_collection = "parts_text"
        self.image_collection = "parts_images"

    def initialize_collections(self):
        try:
            # Fetch all existing collections
            existing_collections = self.client.get_collections().collections
            existing_names = [c.name for c in existing_collections]
            
            # Create text collection if not exists
            if self.text_collection not in existing_names:
                self.client.create_collection(
                    collection_name=self.text_collection,
                    vectors_config=models.VectorParams(size=512, distance=models.Distance.COSINE),
                )
                print(f"Created collection: {self.text_collection}")
            
            # Create image collection if not exists
            if self.image_collection not in existing_names:
                self.client.create_collection(
                    collection_name=self.image_collection,
                    vectors_config=models.VectorParams(size=512, distance=models.Distance.COSINE),
                )
                print(f"Created collection: {self.image_collection}")
                
        except Exception as e:
            print(f"Error initializing Qdrant collections: {e}")

    def upsert_part_embedding(self, part_id: str, vector: list, metadata: dict, collection_type: str = "text"):
        collection = self.text_collection if collection_type == "text" else self.image_collection
        self.client.upsert(
            collection_name=collection,
            points=[
                models.PointStruct(
                    id=part_id, 
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
