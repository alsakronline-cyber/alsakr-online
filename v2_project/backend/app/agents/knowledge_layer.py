import json
from typing import Dict, Any, List
from .base import BaseAgent
from ..core.es_client import es_client

# AGENT 4: InventoryVoice
class InventoryVoiceAgent(BaseAgent):
    def __init__(self):
        system_prompt = """
        You are the 'InventoryVoice' clerk for Al Sakr Online.
        Your job is to parse voice transcripts into inventory actions.
        
        ACTIONS:
        - QUERY: "How many [Part] do we have?"
        - UPDATE: "We just used 5 [Part]" or "Restocked 20 [Part]".
        
        JSON OUTPUT:
        {
            "action": "QUERY/UPDATE",
            "target": "Part Name/SKU",
            "quantity": 0,
            "response_text": "Friendly confirmation"
        }
        """
        super().__init__(name="InventoryVoice", system_prompt=system_prompt)

    async def parse_voice_command(self, transcript: str) -> Dict[str, Any]:
        """Parses speech text and queries ES."""
        response_text = await self.run(transcript)
        try:
            parsed = json.loads(response_text)
            # If action is QUERY, perform ES lookup
            if parsed["action"] == "QUERY":
                # Logic to query 'inventory' index
                pass
            return parsed
        except:
            return {"raw_response": response_text}

# AGENT 5: Assembly Completer
class AssemblyCompleterAgent(BaseAgent):
    def __init__(self):
        system_prompt = """
        You are the 'Assembly Completer' (The Engineeer's Assistant).
        When a user selects a part, you check the machine's Bill of Materials (BOM).
        
        GOAL:
        - Identify missing accessories (e.g. if ordering a Motor, suggest the Coupling).
        - Prevent downtime caused by missing small parts.
        
        JSON OUTPUT:
        {
            "main_part": "...",
            "suggested_additions": [
                {"sku": "...", "name": "...", "reason": "..."}
            ],
            "engineering_note": "..."
        }
        """
        super().__init__(name="AssemblyCompleter", system_prompt=system_prompt)

    async def check_bom_for_completion(self, main_sku: str, machine_id: str = None) -> Dict[str, Any]:
        """
        1. Look up 'Digital Twin' (BOM) in Qdrant/ES.
        2. Identify related parts.
        """
        prompt = f"Main Part: {main_sku}. Machine context: {machine_id}. What else is needed?"
        response_text = await self.run(prompt)
        try:
            return json.loads(response_text)
        except:
            return {"raw_response": response_text}
