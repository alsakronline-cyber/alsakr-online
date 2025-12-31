"""
Smart Search Service
Analyzes user queries for ambiguity and technical specifications.
"""
import logging
import json
import httpx
from typing import List, Dict, Optional
from .config import settings
from .search_service import SearchService

logger = logging.getLogger(__name__)

class SmartSearchService:
    """Intelligent search layer with LLM analysis (Async)"""
    
    def __init__(self):
        self.search_service = SearchService()
        self.ollama_url = f"{settings.OLLAMA_HOST}/api/generate"
        self.model = settings.OLLAMA_CHAT_MODEL
    
    async def analyze_query(self, query: str, context: Optional[List[Dict]] = None) -> Dict:
        """
        Use LLM to detect ambiguity and extract technical constraints (Async)
        """
        # Unified prompt for extraction and ambiguity detection
        prompt = f"""
        Analyze this industrial procurement query: "{query}"
        
        Tasks:
        1. Determine if the query is specific (e.g., includes a part number or detailed spec) or ambiguous/broad.
        2. If specific, extract part numbers and requirements.
        3. If ambiguous, generate a single clear question to narrow down the search.
        
        Return JSON format:
        {{
            "status": "specific" | "ambiguous",
            "extracted_part_number": "string or null",
            "requirements": {{}},
            "clarification_question": "string or null"
        }}
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.ollama_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    },
                    timeout=30 # Increased timeout for slow VPS inference
                )
            
            if response.status_code == 200:
                result = response.json()
                return json.loads(result['response'])
            
            return {"status": "specific", "extracted_part_number": None, "requirements": {}}
            
        except Exception as e:
            if query_lower in part_number or query_lower in name:
                boost += 0.15

            # 3. Name & Category Boost
            if any(word in name for word in query_words if len(word) > 3):
                boost += 0.05

            # 4. Technical Specs Intelligence
            if isinstance(specifications, dict):
                spec_values_str = " ".join(str(v).lower() for v in specifications.values())
                
                # Check for Tech Token Matches
                for token in found_tech_tokens:
                    if token in spec_values_str:
                        boost += 0.20 # Significant boost for tech requirements
                    else:
                        # Logic to check for direct conflict (e.g. Query has PNP, result has NPN)
                        if token == "pnp" and "npn" in spec_values_str:
                            penalty += 0.40
                        elif token == "npn" and "pnp" in spec_values_str:
                            penalty += 0.40
                        elif "v" in token and any(v_spec in spec_values_str for v_spec in ["12v", "24v", "230v"] if v_spec != token):
                            penalty += 0.30

            # Apply final logic
            current_score = result.get('combined_score', 0)
            result['combined_score'] = max(0.1, min(0.99, current_score + boost - penalty))
            
        # Re-sort after re-scoring
        return sorted(results, key=lambda x: x.get('combined_score', 0), reverse=True)

    async def smart_search(self, query: str, context: List[Dict] = None) -> Dict:
        """
        Orchestrate the smart search flow (Async).
        """
        # 1. Analyze Query with Context
        analysis = await self.analyze_query(query)
        
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

        raw_results = await self.search_service.hybrid_search(search_query, size=30)
        
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
