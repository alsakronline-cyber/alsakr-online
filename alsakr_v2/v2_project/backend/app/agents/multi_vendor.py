import json
import os
from typing import Dict, Any, List
from .base import BaseAgent, AgentState
from ..core.es_client import es_client
from langchain_core.messages import HumanMessage

class MultiVendorAgent(BaseAgent):
    def __init__(self):
        system_prompt = """
        You are the 'MultiVendor Aggregator' for Al Sakr Online.
        Your goal is to find the best local suppliers for a part.
        """
        super().__init__(name="MultiVendor", system_prompt=system_prompt)

    async def run(self, user_input: str, context: Dict = {}) -> str:
        """Override run to intercept specific commands."""
        
        # Intercept "Find suppliers" command
        if "Find suppliers for inquiry" in user_input:
            # Extract info (simple parsing)
            try:
                # Expected format: "Find suppliers for inquiry {id} which contains {qty}x {part_number}..."
                # We will just focus on the part number for the search
                import re
                qty_match = re.search(r"(\d+)x", user_input)
                part_match = re.search(r"x\s([A-Za-z0-9-]+)", user_input)
                
                qty = int(qty_match.group(1)) if qty_match else 1
                part_number = part_match.group(1) if part_match else "UNKNOWN"
                
                return await self.find_suppliers_dummy(part_number, qty)
            except Exception as e:
                return f"Error processing supplier search: {e}"
        
        # Default LLM behavior
        return await super().run(user_input, context)

    async def find_suppliers_dummy(self, part_number: str, quantity: int) -> str:
        """Simulate finding suppliers using dummy data."""
        
        # Load Dummy Data
        try:
            data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "dummy_data.json")
            with open(data_path, "r") as f:
                data = json.load(f)
        except Exception as e:
            return "Error: Could not access supplier database (Dummy Data Missing)."

        vendors = data.get("vendors", [])
        products = data.get("products", [])
        
        # Find Product Price Reference
        ref_product = next((p for p in products if p["part_number"] == part_number), None)
        base_price = ref_product["price"] if ref_product else 100.00
        product_name = ref_product["name"] if ref_product else part_number

        # Simulate 3 Vendor Options
        import random
        selected_vendors = random.sample(vendors, min(3, len(vendors)))
        
        options = []
        for v in selected_vendors:
            # Simulate variance
            price_variance = random.uniform(0.9, 1.2)
            lead_time = random.choice(["2 Days", "5 Days", "10 Days", "In Stock"])
            price = round(base_price * price_variance * quantity, 2)
            
            options.append({
                "vendor": v["company_name"],
                "rating": v["rating"],
                "total_price": price,
                "lead_time": lead_time,
                "status": "Available" if lead_time == "In Stock" else "Backorder"
            })

        # Format as Markdown Matrix
        response = f"**Supplier Matrix for {quantity}x {product_name} ({part_number})**\n\n"
        response += "| Vendor | Rating | Total Price ($) | Lead Time | Status |\n"
        response += "|---|---|---|---|---|\n"
        
        for opt in options:
            status_icon = "🟢" if opt["status"] == "Available" else "Rx"
            response += f"| {opt['vendor']} | ⭐ {opt['rating']} | ${opt['total_price']} | {opt['lead_time']} | {status_icon} {opt['status']} |\n"
            
        response += "\n\n**AI Recommendation:**\n"
        best_opt = min(options, key=lambda x: x["total_price"])
        response += f"Suggest choosing **{best_opt['vendor']}** for best price of **${best_opt['total_price']}**."
        
        return response
