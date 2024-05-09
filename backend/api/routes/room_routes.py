'''
Define routes for room related operations.
'''
from fastapi import APIRouter, Body, HTTPException, status, Depends
from bson import ObjectId
from backend.models.room import RoomModel, UpdateRoomModel, RoomCollection
from backend.models.user import UserModel
from backend.api.schemas.room import RoomCreate, RoomUpdateMeta
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
            await db.rooms.update_one({"_id": ObjectId(room_id)},
                                      {"$set": update_model})
            updated_room = await db.rooms.find_one({"_id": ObjectId(room_id)})
            return RoomModel(**updated_room)

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not a moderator.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")
