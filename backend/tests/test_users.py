'''
Unit tests for the user functionalities.
'''
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_create_user():
    '''
    Test creating a user.
    '''
    response = client.post("/users/create", json={
        "username": "testuser",
        "email": "test@test.com",
        "password": "testpassword"
    })
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"
