from app.ai.search import SearchEngine
from app.config import settings
import requests

class RAGService:
    def __init__(self):
        self.search_engine = SearchEngine()

    async def answer_query(self, query: str):
        # 1. Retrieve Context
        search_results = await self.search_engine.search(query, type="text")
        
        context = "\n".join([
            f"Product: {item.payload['product_name']}, Desc: {item.payload['description']}"
            for item in search_results
        ])

        # 2. Generate Answer with Llama 3
        prompt = f"""
        Context:
        {context}

        User Question: {query}

        Answer the user's question based strictly on the context provided above.
        If the part is found, provide its details.
        """
        
        response = requests.post(f"{settings.OLLAMA_HOST}/api/generate", json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        })
        
        return {
            "answer": response.json().get("response"),
            "sources": search_results
        }
