'''
Schemas for room related operations.
'''
from typing import Annotated, List, Optional
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict
from backend.models.room import RoomInvitePolicy, RoomStatus

PyObjectId = Annotated[str, BeforeValidator(str)]

class RoomCreate(BaseModel):
    '''
    Schema for creating a room.
    '''
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    max_participants: int = Field(12, ge=4, le=20)
    invite_policy: RoomInvitePolicy = RoomInvitePolicy.OPEN

class RoomUpdateMeta(BaseModel):
    '''
    Schema for updating a room.
    '''
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None
    room_status: Optional[RoomStatus] = None
    max_participants: Optional[int] = Field(None, ge=4, le=20)
    invite_policy: Optional[RoomInvitePolicy] = None

class RoomUpdateParticipants(BaseModel):
    '''
    Schema for updating participants in a room.
    Supplied participants will replace existing participants.

    If room is invite only, participants will be added to incoming requests.
    If room is approval required, participants will be added to outgoing invites.
    '''
    participants: List[PyObjectId]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "participants": ["60f5f7e8e7e8f8f8f8f8f8f8", "60f5f7e8e7e8f8f8f8f8f8f9"]
            }
        }
    )

class RoomUpdateModerators(BaseModel):
    '''
    Schema for updating moderators in a room.
    Supplied moderators will replace existing moderators.
    '''
    moderators: List[PyObjectId]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "moderators": ["60f5f7e8e7e8f8f8f8f8f8f8", "60f5f7e8e7e8f8f8f8f8f8f9"]
            }
        }
    )
