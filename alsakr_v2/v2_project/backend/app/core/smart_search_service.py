"""
Smart Search Service
Adds intelligence layer over the basic SearchService using LLM for intent analysis
and score-based result categorization.
"""
import json
import requests
from typing import Dict, List, Union, Optional
from .config import settings
from .search_service import SearchService

class SmartSearchService:
    def __init__(self):
        self.search_service = SearchService()
        self.ollama_url = settings.OLLAMA_HOST
        self.model = "llama3.2"  # Use the specialized model for logic
        
        # Thresholds
        self.MATCH_THRESHOLD = 0.80
        self.ALTERNATIVE_THRESHOLD = 0.50

    def analyze_query(self, query: str) -> Dict:
        """
        Ask LLM if the query is specific or ambiguous.
        """
        system_prompt = (
            "You are a search assistant for an industrial automation parts catalog (SICK AG products). "
            "Determine if the user's query is specific enough to find a part, or if it is too vague. "
            "Specific examples: 'WL12 photo sensor', 'M12 inductive sensor', 'safety relay 24V', 'WSE4-3P2130'. "
            "Ambiguous examples: 'sensor', 'switch', 'cable', 'reflector', 'detect object'. "
            "Return ONLY a JSON object with: "
            "{'is_ambiguous': bool, 'clarifying_question': str|null}"
        )
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": f"Query: '{query}'\nJSON Response:",
                    "system": system_prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                body = response.json()
                content = body.get('response', '{}')
                return json.loads(content)
                
        except Exception as e:
            print(f"LLM Analysis failed: {e}")
            # Fallback to assuming it's NOT ambiguous to prevent blocking
            return {"is_ambiguous": False, "clarifying_question": None}
            
        return {"is_ambiguous": False, "clarifying_question": None}

    def smart_search(self, query: str, context: List[Dict] = None) -> Dict:
        """
        Orchestrate the smart search flow.
        """
        # 1. Analyze Query with Context
        # TODO: Pass context to analyze_query for better ambiguity detection
        analysis = self.analyze_query(query)
        
        if analysis.get('is_ambiguous'):
            return {
                "type": "clarification",
                "question": analysis.get('clarifying_question', "Could you be more specific?"),
                "original_query": query
            }
            
        # 2. Perform Hybrid Search
        # Simple Context Merging (if context exists, append to query for better semantic match)
        search_query = query
        if context:
            # Take the last user message from context as previous subject if query is short
            last_msg = context[-1].get('content', '') if context else ''
            if len(query.split()) < 3 and last_msg:
                 search_query = f"{last_msg} {query}"

        # Request more results than usual to allow for filtering
        raw_results = self.search_service.hybrid_search(search_query, size=30)
        
        matches = []
        alternatives = []
        
        for result in raw_results:
            score = result.get('combined_score', 0)
            
            # Categorize
            if score >= self.MATCH_THRESHOLD:
                matches.append(result)
            elif score >= self.ALTERNATIVE_THRESHOLD:
                alternatives.append(result)
                
        # If we have no matches but high scoring alternatives, promote top alternatives to matches
        if not matches and alternatives:
            # Take top 3 alternatives as functionality matches
            matches = alternatives[:3]
            alternatives = alternatives[3:]

        # If we have too many matches, force clarification to narrow it down
        if len(matches) > 5:
            return {
                "type": "clarification",
                "question": f"I found {len(matches)} relevant items. Could you specify the series, voltage, or mounting type to help me narrow it down?",
                "original_query": query
            }

        return {
            "type": "results",
            "matches": matches,      
            "alternatives": alternatives[:5]  # Limit alternatives context
        }
