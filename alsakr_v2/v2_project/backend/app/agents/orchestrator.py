from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

class Orchestrator:
    async def route_request(self, user_input: str) -> str:
        """Determines which agent should handle the request."""
        # Detect Intent using LLM
        # This is a simplified version of the Supervisor node in LangGraph
        response = await self.llm.ainvoke([
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=f"Route this request (Detect Language & Intent): {user_input}")
        ])
        return response.content.strip()

    def __init__(self):
        self.system_prompt = """
        You are the 'Alsakr AI Supervisor' (مدير الذكاء الاصطناعي للصقر).
        
        **Your Goal**: 
        1. Detect the user's language (Arabic or English).
        2. Route the request to the correct specialist agent.
        3. If no single agent fits, or if it's a general greeting, reply directly in the USER'S LANGUAGE.
        
        **Available Agents**:
        - 'VisualMatch': If user has an image, wants to identify a part (تعرف على صورة).
        - 'MultiVendor': Finding suppliers, prices, availability (بحث عن موردين).
        - 'QuoteCompare': Analyzing or comparing quotes (مقارنة العروض).
        - 'InventoryVoice': Warehouse stock, checking quantities (مخزون).
        - 'TechDoc': Manuals, datasheets, specs (كتالوجات).
        - 'Compliance': HS codes, customs (جمارك).
        - 'Troubleshoot': Machine errors, fixes (صيانة).
        
        **Response Format**:
        Return ONLY the Agent Name (e.g., 'VisualMatch') if routing is needed.
        If replying directly, just speak to the user in their language (e.g., "Welcome! How can I help you?" or "مرحباً! كيف يمكنني مساعدتك؟").
        """
        
        self.llm = ChatOllama(model="llama3.2", base_url="http://ollama:11434")

# Main Entry Point for the Swarm
class AgentManager:
    def __init__(self):
        self.router = Orchestrator()
        # Initialize all agents
        from .vision_agent import VisualMatchAgent
        from .multi_vendor import MultiVendorAgent
        from .quote_compare import QuoteCompareAgent
        from .knowledge_layer import InventoryVoiceAgent, TechDocAgent
        from .industry_logic_layer import ComplianceGuideAgent, LocalSourcerAgent, AutoReplenishAgent, TroubleshootAgent
        from .management_layer import SupplierHubAgent

        self.agents = {
            "VisualMatch": VisualMatchAgent(),
            "MultiVendor": MultiVendorAgent(),
            "QuoteCompare": QuoteCompareAgent(),
            "InventoryVoice": InventoryVoiceAgent(),
            "TechDoc": TechDocAgent(),
            "Compliance": ComplianceGuideAgent(),
            "Service": LocalSourcerAgent(),  # Agent 7: Local Services
            "Troubleshoot": TroubleshootAgent(), # Agent 9: Troubleshooter
            "Profile": SupplierHubAgent(),       # Agent 10: Profile Manager
        }

    async def handle_request(self, user_input: str, context: Dict = {}):
        target_agent_name = await self.router.route_request(user_input)
        
        if target_agent_name in self.agents:
            return await self.agents[target_agent_name].run(user_input, context)
        else:
            return "I'm not sure which agent should handle this. Can you be more specific?"
