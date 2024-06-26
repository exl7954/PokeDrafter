'''
Define routes for room related operations.
'''
# pylint: disable=line-too-long
from fastapi import APIRouter, Body, HTTPException, status, Depends
from bson import ObjectId
from backend.models.room import RoomModel, UpdateRoomModel, RoomCollection
from backend.models.user import UserModel
from backend.api.schemas.room import RoomCreate, RoomUpdateMeta, RoomUpdateParticipants, RoomUpdateModerators
from backend.db.mongo import pokedrafter_db
from backend.api.auth import get_current_user

router = APIRouter()

##### CREATE #####
@router.post("/rooms/create",
             tags=["rooms"],
             response_description="Create a room.",
             response_model=RoomModel,
             status_code=status.HTTP_201_CREATED,
             response_model_by_alias=False
)
async def create_room(room: RoomCreate = Body(...), current_user: dict = Depends(get_current_user)):
    '''
    Create a room.
    A unique `id` will be created and provided in the response.
    '''
    db = pokedrafter_db
    existing_room = await db.rooms.find_one({"name": room.name})
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room with that name already exists."
        )

    room_model = RoomModel(**room.model_dump())
    room_model.creator = current_user.id
    room_model.participants = [current_user.id]
    room_model.moderators = [current_user.id]
    new_room = await db.rooms.insert_one(room_model.model_dump(by_alias=True, exclude=["id"]))
    if new_id := new_room.inserted_id:
        created_room = await db.rooms.find_one({"_id": ObjectId(new_id)})
        return created_room

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room not created.")

##### READ #####
@router.get("/rooms",
            tags=["rooms"],
            response_description="Get all rooms.",
            response_model=RoomCollection,
            response_model_by_alias=False
)
async def get_rooms():
    '''
    Get all rooms.
    '''
    db = pokedrafter_db
    return RoomCollection(rooms=await db.rooms.find().to_list(None))

@router.get("/rooms/id/{room_id}",
            tags=["rooms"],
            response_description="Get a room by id.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def get_room_by_id(room_id: str):
    '''
    Get a room by id.
    '''
    db = pokedrafter_db
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        return RoomModel(**room)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

##### UPDATE #####
@router.put("/rooms/update/{room_id}",
            tags=["rooms"],
            response_description="Update room metadata.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def update_room_meta(room_id: str,
                      update_body: RoomUpdateMeta = Body(...),
                      current_user: UserModel = Depends(get_current_user)):
    '''
    Update room metadata.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id in room["moderators"]:
            update_model = UpdateRoomModel(**update_body.model_dump())
            update_model = {
                k: v for k, v in update_model.model_dump(by_alias=True).items() if v is not None
            }
            # if room invite policy is changed, clear outgoing invites and incoming requests
            if "invite_policy" in update_model:
                update_model["outgoing_invites"] = []
                update_model["incoming_requests"] = []

            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$set": update_model})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not a moderator.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/join",
            tags=["rooms"],
            response_description="Join room if allowed.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def join_room(room_id: str, current_user: UserModel = Depends(get_current_user)):
    '''
    Join a room if not full.
    If room invite policy is open, user will be added to participants.
    If room invite policy is approval, user will be added to incoming requests.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id in room["participants"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="User already in room.")

        if len(room["participants"]) >= room["max_participants"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Room is full.")

        if room["invite_policy"] == "open":
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$push": {"participants": current_user.id}})
        elif room["invite_policy"] == "approval_required":
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$push": {"incoming_requests": current_user.id}})
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Room requires invite to join.")

        updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        return RoomModel(**updated_room)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/invite/{invitee_id}",
            tags=["rooms"],
            response_description="Invite user to room.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def invite_to_room(room_id: str, invitee_id: str, current_user: UserModel = Depends(get_current_user)):
    '''
    Invite user to room.
    Returns error if room is not invite only.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id not in room["moderators"] and current_user.id != room["creator"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Not authorized to invite to this room.")

        if invitee_id in room["participants"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="User already in room.")

        if room["invite_policy"] == "invite_only":
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$push": {"outgoing_invites": invitee_id}})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Room does not allow invites.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/accept/{participant_id}",
            tags=["rooms"],
            response_description="Accept incoming request or outgoing request.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def accept_participant(room_id: str,
                             participant_id: str,
                             current_user: UserModel = Depends(get_current_user)):
    '''
    Accept incoming request or outgoing request.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if participant_id in room["incoming_requests"]:
            if current_user.id in room["moderators"]:
                await db.rooms.update_one({"_id": ObjectId(room_id)},
                                          {"$pull": {"incoming_requests": participant_id},
                                           "$push": {"participants": participant_id}})
            else: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Not authorized to accept participants for this room.")
        elif participant_id in room["outgoing_invites"]:
            if current_user.id == participant_id:
                await db.rooms.update_one({"_id": ObjectId(room_id)},
                                            {"$pull": {"outgoing_invites": participant_id},
                                            "$push": {"participants": participant_id}})
            else: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Not authorized to accept invite.")
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Participant not found.")

        updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        return RoomModel(**updated_room)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/reject/{participant_id}",
            tags=["rooms"],
            response_description="Reject incoming request or outgoing request.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def reject_participant(room_id: str,
                             participant_id: str,
                             current_user: UserModel = Depends(get_current_user)):
    '''
    Reject incoming request or outgoing request.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if participant_id in room["incoming_requests"]:
            if current_user.id in room["moderators"]:
                await db.rooms.update_one({"_id": ObjectId(room_id)},
                                          {"$pull": {"incoming_requests": participant_id}})
            else: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Not authorized to reject participants for this room.")
        elif participant_id in room["outgoing_invites"]:
            if current_user.id == participant_id:
                await db.rooms.update_one({"_id": ObjectId(room_id)},
                                          {"$pull": {"outgoing_invites": participant_id}})
            else: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Not authorized to reject invite.")
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Participant not found.")

        updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        return RoomModel(**updated_room)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/leave",
            tags=["rooms"],
            response_description="Leave room.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def leave_room(room_id: str, current_user: UserModel = Depends(get_current_user)):
    '''
    Leave room.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id in room["participants"]:
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$pull": {"participants": current_user.id}})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="User not in room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/remove",
                tags=["rooms"],
                response_description="Remove participant from room.",
                response_model=RoomModel,
                response_model_by_alias=False
)
async def remove_participant(room_id: str,
                             participants: RoomUpdateParticipants = Body(...),
                             current_user: UserModel = Depends(get_current_user)):
    '''
    Remove participant from room.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        # check if users are in room
        if not all(participant in room["participants"] for participant in participants.participants):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="One or more participants not found in room.")
        # cannot remove creator is user is not creator
        if current_user.id != room["creator"]:
            if room["creator"] in participants.participants:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="Not authorized to remove creator from room.")

        if current_user.id in room["moderators"]:
            await db.rooms.update_one(
                {"_id": ObjectId(room_id)},
                {"$pull": {"participants": {"$in": list(participants.participants)}}}
            )
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to remove participants for this room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/moderators",
            tags=["rooms"],
            response_description="Update room moderators.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def update_room_moderators(room_id: str,
                                 update_body: RoomUpdateModerators = Body(...),
                                 current_user: UserModel = Depends(get_current_user)):
    '''
    Update room moderators.
    Replaces all moderators with new list.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id == room["creator"]:
            # check if users exist
            users = await db.users.find({"_id": {"$in": [ObjectId(moderator) for moderator in update_body.moderators]}}).to_list(None)
            if len(users) != len(update_body.moderators):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail="One or more users not found.")

            update_model = UpdateRoomModel(moderators=update_body.moderators)
            update_model = {
                k: v for k, v in update_model.model_dump(by_alias=True).items() if v is not None
            }
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$set": update_model})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to change moderators for this room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

##### DELETE #####
@router.delete("/rooms/delete/{room_id}",
               tags=["rooms"],
               response_description="Delete a room.",
               status_code=status.HTTP_200_OK,
)
async def delete_room(room_id: str, current_user: UserModel = Depends(get_current_user)):
    '''
    Delete a room.
    '''
    db = pokedrafter_db
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id == room["creator"]:
            await db.rooms.delete_one({"_id": ObjectId(room_id)})
            return {"message": "Room deleted.", "room_id": room_id}

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to delete this room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")
