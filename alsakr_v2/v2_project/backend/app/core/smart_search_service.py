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

    def re_score_results(self, query: str, results: List[Dict]) -> List[Dict]:
        """
        Adjust scores based on how well technical keywords in the query 
        match the product's specifications or name.
        """
        query_words = set(query.lower().split())
        
        for result in results:
            boost = 0
            specifications = result.get('specifications', {})
            name = result.get('name', '').lower()
            
            # 1. Name match boost
            for word in query_words:
                if word in name:
                    boost += 0.05
            
            # 2. Technical Specs Match Boost
            if isinstance(specifications, dict):
                for val in specifications.values():
                    str_val = str(val).lower()
                    if any(word in str_val for word in query_words if len(word) > 2):
                        boost += 0.10
            
            # Apply boost and cap at 1.0 (100%)
            current_score = result.get('combined_score', 0)
            result['combined_score'] = min(0.99, current_score + boost)
            
        # Re-sort after boosting
        return sorted(results, key=lambda x: x.get('combined_score', 0), reverse=True)

    def smart_search(self, query: str, context: List[Dict] = None) -> Dict:
        """
        Orchestrate the smart search flow.
        """
        # 1. Analyze Query with Context
        analysis = self.analyze_query(query)
        
        if analysis.get('is_ambiguous') and not context: # Only ask if no context (follow-up usually clarifies)
            return {
                "type": "clarification",
                "question": analysis.get('clarifying_question', "Could you be more specific?"),
                "original_query": query
            }
            
        # 2. Perform Hybrid Search
        search_query = query
        if context:
            last_msg = context[-1].get('content', '') if context else ''
            if len(query.split()) < 3 and last_msg:
                 search_query = f"{last_msg} {query}"

        raw_results = self.search_service.hybrid_search(search_query, size=30)
        
        # 3. Contextual Re-scoring (Boost based on specific technical keywords)
        ranked_results = self.re_score_results(query, raw_results)
        
        matches = []
        alternatives = []
        
        for result in ranked_results:
            score = result.get('combined_score', 0)
            if score >= self.MATCH_THRESHOLD:
                matches.append(result)
            elif score >= self.ALTERNATIVE_THRESHOLD:
                alternatives.append(result)
                
        if not matches and alternatives:
            matches = alternatives[:3]
            alternatives = alternatives[3:]

        # 4. Decision Logic
        if len(matches) > 5:
            return {
                "type": "clarification", 
                "question": f"I found {len(matches)} matches. Showing the top results. Could you specify the series or voltage?",
                "original_query": query,
                "matches": matches[:5],
                "alternatives": []
            }

        return {
            "type": "results",
            "matches": matches,      
            "alternatives": alternatives[:5]
        }
