from app.ai.rag import RAGService
from app.scrapers.base import BaseScraper
from app.rfq.negotiator import NegotiatorAgent

class AlsakrBrain:
    """
    The Central Nervous System of Alsakr Online.
    Coordinates between Perception (Scrapers), Cognition (RAG/AI), and Action (Negotiator).
    """
    def __init__(self):
        self.rag = RAGService()
        self.negotiator = NegotiatorAgent()
        # Initialize other agents lazily

    async def process_user_intent(self, user_input: str, input_type: str = "text"):
        """
        Decides whether to Search, Create RFQ, or Chat.
        """
        if "quote" in user_input.lower() or "price" in user_input.lower():
            # Delegate to Negotiator Flow
            return await self.negotiator.process_rfq(user_input)
        else:
            # Delegate to RAG Knowledge Base
            return await self.rag.answer_query(user_input)
