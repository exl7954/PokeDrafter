'''
Unit tests for the user functionalities.
'''
import pytest
from fastapi.testclient import TestClient
from backend.app import app

user_dict = {}
token_dict = {}

@pytest.mark.anyio
async def test_create_user(client):
    '''
    Test creating a user.
    '''
    response = await client.post("/users/create", json={
        "username": "pytestuser",
        "email": "pytest@test.com",
        "password": "testpassword"
    })
    user_dict["pytestuser"] = response.json()["id"]
    assert response.status_code == 201
    assert response.json()["username"] == "pytestuser"

@pytest.mark.anyio
async def test_login(client):
    '''
    Test logging in a user.
    '''
    username = "pytestuser"
    password = "testpassword"
    response = await client.post("/token",
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            data={"username": username, "password": password})
    token_dict[username] = response.json()["access_token"]
    assert response.status_code == 200
    assert response.json()["access_token"]

@pytest.mark.anyio
async def test_delete_user(client):
    '''
    Test deleting a user.
    '''
    response = await client.delete("/users/delete", headers={"Authorization": f"Bearer {token_dict['pytestuser']}"})
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted."
