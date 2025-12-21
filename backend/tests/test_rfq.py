from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_rfq():
    response = client.post("/api/rfq/", json={
        "part_number": "SICK-123",
        "quantity": 5
    })
    assert response.status_code == 200
    assert "id" in response.json()
