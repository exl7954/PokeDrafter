'''
Unit tests for the user functionalities.
'''
import pytest
from backend.db.mongo import pokedrafter_db

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
async def test_create_user_duplicate(client):
    '''
    Test creating a duplicate user.
    '''
    response = await client.post("/users/create", json={
        "username": "pytestuser",
        "email": "pytest@test.com",
        "password": "badpassword"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken."

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
async def test_get_users(client):
    '''
    Test getting users.
    '''
    response = await client.get("/users/")
    assert response.status_code == 200
    assert response.json()["users"]

@pytest.mark.anyio
async def test_get_user(client):
    '''
    Test getting a user.
    '''
    response = await client.get(f"/users/id/{user_dict['pytestuser']}")
    assert response.status_code == 200
    assert response.json()["username"] == "pytestuser"
    assert "email" not in response.json()
    assert "password" not in response.json()

@pytest.mark.anyio
async def test_get_me(client):
    '''
    Test getting the current user.
    '''
    response = await client.get("/users/me",
                                headers={"Authorization": f"Bearer {token_dict['pytestuser']}"})
    assert response.status_code == 200
    assert response.json()["username"] == "pytestuser"

@pytest.mark.anyio
async def test_update_user(client):
    '''
    Test updating a user.
    '''
    response = await client.put("/users/update",
                                headers={"Authorization": f"Bearer {token_dict['pytestuser']}"},
                                json={"email": "pytest2@pytest.com", "password": "newpassword"})
    assert response.status_code == 200
    assert response.json()["email"] == "pytest2@pytest.com"

@pytest.mark.anyio
async def test_update_bad_email(client):
    '''
    Test updating a user with an already existing email.
    '''
    await client.post("/users/create", json={
        "username": "pytestemaildupe",
        "email": "pytestdupe@pytest.com",
        "password": "testpassword"
    })
    response = await client.put("/users/update",
                                headers={"Authorization": f"Bearer {token_dict['pytestuser']}"},
                                json={"email": "pytestdupe@pytest.com"})

    await pokedrafter_db.users.delete_one({"username": "pytestemaildupe"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already in use."

@pytest.mark.anyio
async def test_login_after_pw_change(client):
    '''
    Test logging in a user after changing the password.
    '''
    username = "pytestuser"
    password = "newpassword"
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
    response = await client.delete("/users/delete",
                                   headers={"Authorization": f"Bearer {token_dict['pytestuser']}"})
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted."
