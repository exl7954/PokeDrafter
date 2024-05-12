'''
Unit tests for the room functionalities.
'''
#pylint: disable=line-too-long
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
async def test_update_room_no_permissions(client):
    '''
    Test updating a room without permissions.
    '''
    await pokedrafter_db.users.delete_one({"username": "pytestroomuser"})

    user_response = await client.post("/users/create", json={
        "username": "pytestroomuser",
        "password": "testpassword"
    })
    user_dict["pytestroomuser"] = user_response.json()["id"]
    token_response = await client.post("/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"username": "pytestroomuser", "password": "testpassword"})
    token_dict["pytestroomuser"] = token_response.json()["access_token"]

    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomuser']}"},
        json={
            "description": "Test description",
            "max_participants": 6,
            "invite_policy": "approval_required"
        })
    print(response.json())
    assert response.status_code == 403
    assert response.json()["detail"] == "User not a moderator."

@pytest.mark.anyio
async def test_request_join_room(client):
    '''
    Test joining an open room.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/join",
        headers={"Authorization": f"Bearer {token_dict['pytestroomuser']}"})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] in response.json()["incoming_requests"]

@pytest.mark.anyio
async def test_accept_join_request(client):
    '''
    Test accepting a join request.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/accept/{user_dict['pytestroomuser']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] in response.json()["participants"]

@pytest.mark.anyio
async def test_remove_user(client):
    '''
    Test removing a user from a room.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/remove",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={"participants": [user_dict["pytestroomuser"]]})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] not in response.json()["participants"]

@pytest.mark.anyio
async def test_invite_user(client):
    '''
    Test inviting a user to a room.
    '''
    # update room to invite only
    await client.put(f"/rooms/update/{room_dict['pytestroom']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={"invite_policy": "invite_only"})

    response = await client.put(
        f"/rooms/update/{room_dict['pytestroom']}/participants/invite/{user_dict['pytestroomuser']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"}
    )

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] in response.json()["outgoing_invites"]

@pytest.mark.anyio
async def test_reject_invite(client):
    '''
    Test rejecting an invite.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/reject/{user_dict['pytestroomuser']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomuser']}"})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] not in response.json()["outgoing_invites"]

@pytest.mark.anyio
async def test_leave_room(client):
    '''
    Test leaving a room.
    '''
    # change policy to open
    await client.put(f"/rooms/update/{room_dict['pytestroom']}",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={"invite_policy": "open"})

    # add user to room
    await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/join",
        headers={"Authorization": f"Bearer {token_dict['pytestroomuser']}"})

    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/participants/leave",
        headers={"Authorization": f"Bearer {token_dict['pytestroomuser']}"})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] not in response.json()["participants"]

@pytest.mark.anyio
async def test_add_moderator(client):
    '''
    Test adding a moderator to a room.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/moderators",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={"moderators": [user_dict["pytestroomuser"], user_dict["pytestroomowner"]]})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] in response.json()["moderators"]
    assert user_dict["pytestroomowner"] in response.json()["moderators"]

@pytest.mark.anyio
async def test_remove_moderator(client):
    '''
    Test removing a moderator from a room.
    '''
    response = await client.put(f"/rooms/update/{room_dict['pytestroom']}/moderators",
        headers={"Authorization": f"Bearer {token_dict['pytestroomowner']}"},
        json={"moderators": [user_dict["pytestroomowner"]]})

    assert response.status_code == 200
    assert user_dict["pytestroomuser"] not in response.json()["moderators"]
    assert user_dict["pytestroomowner"] in response.json()["moderators"]

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
