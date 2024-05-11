'''
Unit tests for the room functionalities.
'''
import pytest
from backend.db.mongo import pokedrafter_db

user_dict = {}
token_dict = {}
room_dict = {}

@pytest.mark.anyio
async def test_create_room(client):
    '''
    Test creating a room.
    '''
    await pokedrafter_db.users.delete_one({"username": "pytestroomowner"})
    await pokedrafter_db.rooms.delete_one({"name": "pytestroom"})

    user_response = await client.post("/users/create", json={
        "username": "pytestroomowner",
        "password": "testpassword"
    })

    user_dict["pytestroomowner"] = user_response.json()["id"]
    token_response = await client.post("/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"username": "pytestroomowner", "password": "testpassword"})
    token_dict["pytestroomowner"] = token_response.json()["access_token"]

    response = await client.post("/rooms/create",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={
        "name": "pytestroom",
        "max_participants": 4,
    })

    room_dict["pytestroom"] = response.json()["id"]
    assert response.status_code == 201
    assert response.json()["name"] == "pytestroom"

@pytest.mark.anyio
async def test_create_room_bad_params(client):
    '''
    Test creating a room with bad parameters.
    '''
    response = await client.post("/rooms/create",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={
        "name": "pytestinvalidroom",
        "max_participants": 3,
    })
    assert response.status_code == 422

@pytest.mark.anyio
async def test_create_duplicate_room(client):
    '''
    Test creating a room with a duplicate name.
    '''
    response = await client.post("/rooms/create",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={
            "name": "pytestroom"
        })

    assert response.status_code == 400
    assert response.json()["detail"] == "Room with that name already exists."

@pytest.mark.anyio
async def test_get_all_rooms(client):
    '''
    Test getting all rooms.
    '''
    response = await client.get("/rooms")
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.anyio
async def test_get_specific_room(client):
    '''
    Test getting a specific room.
    '''
    response = await client.get(f"/rooms/id/{room_dict['pytestroom']}")
    assert response.status_code == 200
    assert response.json()["name"] == "pytestroom"

@pytest.mark.anyio
async def test_update_room(client):
    '''
    Test updating a room.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={
            "description": "Test description",
            "max_participants": 6,
            "invite_policy": "approval_required"
        })
    print(response.json())
    assert response.status_code == 200
    assert response.json()["description"] == "Test description"
    assert response.json()["max_participants"] == 6
    assert response.json()["invite_policy"] == "approval_required"

@pytest.mark.anyio
async def test_delete_room(client):
    '''
    Test deleting a room.
    '''
    response = await client.delete(f"/rooms/delete/{room_dict['pytestroom']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"})
    pokedrafter_db.users.delete_one({"username": "pytestroomowner"})

    assert response.status_code == 200
    assert response.json()["message"] == "Room deleted."
