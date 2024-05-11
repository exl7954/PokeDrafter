'''
Unit tests for the user functionalities.
'''
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)
user_dict = {}
token_dict = {}


def test_login():
    '''
    Test logging in a user.
    '''
    username = "testuser"
    password = "testpass"
    response = client.post("/token",
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            data={"username": username, "password": password})
    token_dict[username] = response.json()["access_token"]
    assert response.status_code == 200
    assert response.json()["access_token"]

def test_create_user():
    '''
    Test creating a user.
    '''
    response = client.post("/users/create", json={
        "username": "pytestuser",
        "email": "pytest@test.com",
        "password": "testpassword"
    })
    user_dict["pytestuser"] = response.json()["id"]
    assert response.status_code == 201
    assert response.json()["username"] == "pytestuser"

# def test_delete_user():
#     '''
#     Test deleting a user.
#     '''
#     response = client.delete("/users/delete", headers={"Authorization": f"Bearer {token_dict['pytestuser']}"})
#     assert response.status_code == 200
#     assert response.json()["message"] == "User deleted."
