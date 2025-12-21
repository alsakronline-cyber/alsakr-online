from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_text():
    response = client.post("/api/search/text", params={"query": "sensor"})
    assert response.status_code == 200
    assert "results" in response.json()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
