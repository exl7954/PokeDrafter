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
@router.get("/rooms/",
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

@router.put("/rooms/update/{room_id}/participants",
            tags=["rooms"],
            response_description="Update room participants.",
            response_model=RoomModel,
            response_model_by_alias=False
)
async def update_room_participants(room_id: str,
                                   update_body: RoomUpdateParticipants = Body(...),
                                   current_user: UserModel = Depends(get_current_user)):
    '''
    Update room participants.
    If room is open, replaces existing participants with supplied participants.
    If room is invite only, participants will be added to outgoing invites.
    If room is approval required, participants will be added to incoming requests.
    '''
    db = pokedrafter_db

    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if room:
        if current_user.id in room["moderators"]:
            # check if users exist
            users = await db.users.find({"_id": {"$in": [ObjectId(participant) for participant in update_body.participants]}}).to_list(None)
            if len(users) != len(update_body.participants):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail="One or more users not found.")

            # ensure length is within max_participants if room open
            if len(update_body.participants) > room["max_participants"] and room["invite_policy"] == "open":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Too many participants.")

            # change body based on invite policy
            if room["invite_policy"] == "open":
                update_model = UpdateRoomModel(participants=update_body.participants)
            elif room["invite_policy"] == "invite_only":
                update_model = UpdateRoomModel(outgoing_invites=[id for id in update_body.participants if id not in room["participants"]])
            elif room["invite_policy"] == "approval_required":
                update_model = UpdateRoomModel(incoming_requests=[id for id in update_body.participants if id not in room["participants"]])

            # drop empty fields
            update_model = {
                k: v for k, v in update_model.model_dump(by_alias=True).items() if v is not None
            }
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$set": update_model})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to change participants for this room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")

@router.put("/rooms/update/{room_id}/participants/accept",
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

@router.put("/rooms/update/{room_id}/participants/reject",
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

@router.delete("/rooms/update/{room_id}/participants/remove",
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
        if current_user.id in room["moderators"]:
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$pull": {"participants": {"$in": [ObjectId(participant) for participant in participants.participants]}}})
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
            print("here")
            print(update_model)
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$set": update_model})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to change moderators for this room.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Room not found.")
