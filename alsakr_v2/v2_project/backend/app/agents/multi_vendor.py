import json
from typing import Dict, Any, List
from .base import BaseAgent, AgentState
from ..core.es_client import es_client
from langchain_core.messages import HumanMessage

class MultiVendorAgent(BaseAgent):
    def __init__(self):
        system_prompt = """
        You are the 'MultiVendor Aggregator' for Al Sakr Online.
        Your goal is to find the best local suppliers for a part.
        
        PRIORITY LOGIC:
        1. Always search the 'Internal Registered Vendors' first.
        2. Filter strictly by Brand (e.g. 'SKF Only') if specified.
        3. Filter by Origin (e.g. 'Germany', 'USA') if specified.
        4. If < 3 internal results found, suggest 'Outsourcing' (External Web Search).
        
        OUTPUT FORMAT (JSON):
        {
            "found_internally": true/false,
            "vendors": [
                {"name": "...", "price_estimate": "...", "stock_status": "...", "whatsapp": "..."}
            ],
            "outsource_required": true/false,
            "reasoning": "..."
        }
        """
        super().__init__(name="MultiVendor", system_prompt=system_prompt)

    async def find_suppliers(self, 
                               part_id: str, 
                               brand: str = None, 
                               origin: str = None,
                               strict_brand: bool = True) -> Dict[str, Any]:
        """
        Sourcing Workflow:
        1. Query ES for Vendors selling this brand/part.
        2. Apply filters.
        3. Check stock status.
        """
        
        # 1. Elasticsearch Filtered Search
        search_query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"brands": brand}} if brand else {"match_all": {}}
                    ],
                    "filter": []
                }
            }
        }
        
        # Add Origin Filter if exists
        if origin:
            search_query["query"]["bool"]["filter"].append({"term": {"origin": origin.lower()}})

        internal_vendors = []
        try:
            resp = await es_client.client.search(
                index="suppliers",
                body=search_query
            )
            internal_vendors = [hit["_source"] for hit in resp["hits"]["hits"]]
        except Exception as e:
            print(f"Vendor Search Error: {e}")

        # 2. LLM Orchestration (Deciding if outsourcing is needed)
        prompt = f"""
        Part Request: {part_id}
        Requested Brand: {brand} (Strict: {strict_brand})
        Requested Origin: {origin}
        
        Internal Results: {json.dumps(internal_vendors)}
        
        Decide if these vendors are sufficient or if we need to search outside.
        """
        
        response_text = await self.run(prompt)
        
        try:
            return json.loads(response_text)
        except:
            return {"raw_response": response_text, "internal_count": len(internal_vendors)}

    async def trigger_rfq_workflow(self, vendor_id: str, items: List[Dict]):
        """
        This tool will be called to fire n8n webhooks.
        """
        # Placeholder for n8n/WhatsApp trigger
        print(f"🚀 Triggering RFQ via n8n for Vendor {vendor_id}")
        return {"status": "sent"}
