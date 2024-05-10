'''
Define WebSocket operations for drafting.
'''
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, WebSocketException, HTTPException, status
from bson import ObjectId
from backend.api.auth import get_current_user
from backend.db.mongo import pokedrafter_db
from backend.models.room import RoomModel
from backend.models.user import UserModel
from backend.models.draft import DraftModel, DraftCollection, UpdateDraftModel
from backend.api.schemas.draft import DraftCreate, DraftUpdateSchema, DraftPickSchema, DraftTemplateCreate

router = APIRouter()

class ConnectionManager:
    '''
    Manage WebSocket connections.
    '''
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.db = pokedrafter_db

    async def connect(self, websocket: WebSocket, room_id: str):
        '''
        Connect a WebSocket to a room.
        '''
        await websocket.accept()
        existing_room = await self.db.rooms.find_one({"_id": room_id})
        if not existing_room:
            raise WebSocketException(code=status.HTTP_404_NOT_FOUND,
                                     reason="Room not found.")
        if existing_room.room_status != "drafting":
            raise WebSocketException(code=status.HTTP_400_BAD_REQUEST,
                                     reason="Room is not drafting.")
        if existing_room.id not in self.active_connections:
            self.active_connections[existing_room.id] = []
        self.active_connections[existing_room.id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        '''
        Disconnect a WebSocket from a room.
        '''
        try:
            self.active_connections[room_id].remove(websocket)
        except ValueError:
            print("Connection not found.")
        if not self.active_connections[room_id]:
            del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        '''
        Broadcast an update to all connected WebSockets in a room.
        '''
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/draft/{room_id}")
async def websocket_endpoint(websocket: WebSocket,
                             room_id: str):
    '''
    WebSocket endpoint for draft operations.
    '''
    # if current_user is None:
    #     raise WebSocketException(code=status.HTTP_401_UNAUTHORIZED,
    #                              reason="Unauthorized")

    await manager.connect(websocket, room_id)

    try:
        # TODO: Implement draft operations
        while True:
            data = await websocket.receive_json()
            await websocket.send_json({"message": f"Message text was: {data}"})
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_id)

##### CREATE #####
@router.post("/draft/{room_id}/create",
             tags=["draft"],
             response_description="Create a draft.",
             response_model=DraftModel,
             response_model_by_alias=False,
)
async def create_draft(room_id: str,
                       draft_template: DraftTemplateCreate,
                       current_user: UserModel = Depends(get_current_user)):
    '''
    Create a draft.
    '''
    db = pokedrafter_db
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Room not found.")
    if room["creator"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Unauthorized.")
    if room["draft"] is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Draft already exists.")
    draft = DraftModel(**draft_template.model_dump())
    draft.room = room_id
    draft.creator = current_user.id

    new_draft = await db.drafts.insert_one(draft.model_dump(by_alias=True, exclude=["id"]))
    if new_id := new_draft.inserted_id:
        created_draft = await db.drafts.find_one({"_id": ObjectId(new_id)})
        return created_draft

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Draft not created.")

##### READ #####
@router.get("/draft",
            tags=["draft"],
            response_description="Get all drafts.",
            response_model=DraftCollection,
            response_model_by_alias=False,
)
async def get_drafts():
    '''
    Get all drafts.
    '''
    db = pokedrafter_db
    return DraftCollection(drafts=await db.drafts.find().to_list(None))

@router.get("/draft/id/{draft_id}",
            tags=["draft"],
            response_description="Get a specific draft.",
            response_model=DraftModel,
            response_model_by_alias=False,
)
async def get_draft(draft_id: str):
    '''
    Get a specific draft.
    '''
    db = pokedrafter_db
    draft = await db.drafts.find_one({"_id": ObjectId(draft_id)})
    if draft:
        return DraftModel(**draft)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found.")

##### UPDATE #####
@router.put("/draft/{draft_id}/update",
            tags=["draft"],
            response_description="Update a draft. Not for updating picks",
            response_model=DraftModel,
            response_model_by_alias=False,
)
async def update_draft(draft_id: str,
                       update_body: DraftUpdateSchema,
                       current_user: UserModel = Depends(get_current_user)):
    '''
    Update a draft. Not for updating picks.
    '''
    db = pokedrafter_db
    draft = await db.drafts.find_one({"_id": ObjectId(draft_id)})
    room = await db.rooms.find_one({"_id": ObjectId(draft["room"])})

    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Draft not found.")
    if current_user.id not in room["moderators"] and room["creator"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Unauthorized.")

    update_model = UpdateDraftModel(**update_body.model_dump())
    update_model = {
        k: v for k, v in update_model.model_dump(by_alias=True).items() if v is not None
    }

    updated_draft = await db.drafts.update_one({"_id": ObjectId(draft_id)},
                                               {"$set": update_model})
    if updated_draft:
        new_draft = await db.drafts.find_one({"_id": ObjectId(draft_id)})
        return DraftModel(**new_draft)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Draft not updated.")
