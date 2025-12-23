from app.ai.qdrant_client import QdrantManager

def debug_qdrant():
    manager = QdrantManager()
    client = manager.client
    
    print("--- Qdrant Collections ---")
    collections = client.get_collections()
    for col in collections.collections:
        print(f"Collection: {col.name}")
        count = client.count(collection_name=col.name)
        print(f"  Count: {count.count}")
        
        # Peek at one item if exists
        if count.count > 0:
            res = client.scroll(collection_name=col.name, limit=1)
            if res[0]:
                print(f"  Sample Payload: {res[0][0].payload}")

if __name__ == "__main__":
    debug_qdrant()
