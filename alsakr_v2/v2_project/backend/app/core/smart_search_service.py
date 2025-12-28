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
        Advanced re-scoring:
        1. Exact Part Number: 0.99 (Immediate win)
        2. Technical Tokens: Boost (24V, PNP, M12, etc.)
        3. Strict Mismatch: Penalty (if conflict found)
        """
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        # Technical keywords that carry high weight
        tech_tokens = {"24v", "pnp", "npn", "m12", "m8", "ip67", "ip65", "analog", "digital", "io-link"}
        found_tech_tokens = query_words.intersection(tech_tokens)

        for result in results:
            boost = 0
            penalty = 0
            part_number = result.get('part_number', '').lower()
            name = result.get('name', '').lower()
            specifications = result.get('specifications', {})
            
            # 1. Exact Part Number Match
            if query_lower == part_number or query_lower.replace('-', '') == part_number.replace('-', ''):
                result['combined_score'] = 0.99
                continue

            # 2. Part Number partial match
            if query_lower in part_number:
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
