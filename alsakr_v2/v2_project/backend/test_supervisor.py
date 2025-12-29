
import asyncio
import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from app.agents.orchestrator import Orchestrator

async def test_supervisor():
    print("Initializing Orchestrator...")
    orchestrator = Orchestrator()
    
    test_cases = [
        "Find me a supplier for SKF bearings",
        "ابحث عن موردين لمحركات سيمنز",
        "Hello, how are you?",
        "مرحباً، كيف حالك؟"
    ]
    
    for query in test_cases:
        print(f"\nTesting Query: {query}")
        result = await orchestrator.route_request(query)
        print(f"Result: {result}")
        
        # Simple Validation
        if "action" not in result:
            print("FAILED: No 'action' key found.")
        else:
            print(f"Action: {result['action']}")
            if result['action'] == 'route':
                print(f"Target Agent: {result.get('agent')}")
            elif result['action'] == 'chat':
                print(f"Response: {result.get('response')}")

if __name__ == "__main__":
    asyncio.run(test_supervisor())
