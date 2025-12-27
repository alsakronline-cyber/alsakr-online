from typing import Dict, Any, List
from .base import BaseAgent, AgentState
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

class Orchestrator:
    def __init__(self):
        self.system_prompt = """
        You are the 'Agent Supervisor'. 
        Route the user request to the correct specialist:
        - 'VisualMatch': If user has an image or part ID to identify.
        - 'MultiVendor': If user wants to find suppliers or prices.
        - 'QuoteCompare': If user has quotes to analyze.
        - 'InventoryVoice': For warehouse/stock questions.
        - 'TechDoc': For manual/BOM questions.
        - 'Compliance': For HS codes/regulations.
        - 'Service': For technicians/integrators.
        - 'Troubleshoot': For machine errors.
        - 'Profile': For registration/login issues.
        """
        
        self.llm = ChatOllama(model="llama3.2", base_url="http://ollama:11434")

    async def route_request(self, user_input: str) -> str:
        """Determines which agent should handle the request."""
        # Detect Intent using LLM
        # This is a simplified version of the Supervisor node in LangGraph
        response = await self.llm.ainvoke([
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=f"Route this: {user_input}")
        ])
        return response.content.strip()

# Main Entry Point for the Swarm
class AgentManager:
    def __init__(self):
        self.router = Orchestrator()
        # Initialize all agents
        from .vision_agent import VisualMatchAgent
        from .multi_vendor import MultiVendorAgent
        self.agents = {
            "VisualMatch": VisualMatchAgent(),
            "MultiVendor": MultiVendorAgent(),
            # ... initialize others
        }

    async def handle_request(self, user_input: str, context: Dict = {}):
        target_agent_name = await self.router.route_request(user_input)
        
        if target_agent_name in self.agents:
            return await self.agents[target_agent_name].run(user_input, context)
        else:
            return "I'm not sure which agent should handle this. Can you be more specific?"
