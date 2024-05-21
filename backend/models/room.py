'''
Define the Room model and supporting models for the Room model.
'''
# pylint: disable=too-few-public-methods, duplicate-code
from datetime import datetime
from enum import Enum
from typing import List, Optional, Annotated
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class RoomInvitePolicy(str, Enum):
    '''
    Enum for room invite policy.
    '''
    OPEN = 'open'
    INVITE_ONLY = 'invite_only'
    APPROVAL_REQUIRED = 'approval_required'

class RoomStatus(str, Enum):
    '''
    Enum for room status.
    '''
    RECRUITING = 'recruiting'
    DRAFTING = 'drafting'
    FREEAGENT = 'freeagent'
    INPROGRESS = 'inprogress'
    COMPLETED = 'completed'

class RoomModel(BaseModel):
    '''
    Container for a single room.
    '''
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    room_status: RoomStatus = RoomStatus.RECRUITING

    max_participants: int = Field(12, ge=4, le=20)
    participants: List[PyObjectId] = Field(default_factory=list)

    outgoing_invites: List[PyObjectId] = Field(default_factory=list)
    incoming_requests: List[PyObjectId] = Field(default_factory=list)
    invite_policy: RoomInvitePolicy = RoomInvitePolicy.OPEN

    draft: Optional[PyObjectId] = None
    rules: Optional[str] = None

    moderators: List[PyObjectId] = []
    creator: PyObjectId= None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class UpdateRoomModel(BaseModel):
    '''
    Optional fields for updating a room.
    '''
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None

    max_participants: Optional[int] = Field(None, ge=4, le=20)
    participants: Optional[List[PyObjectId]] = None

    outgoing_invites: Optional[List[PyObjectId]] = None
    incoming_requests: Optional[List[PyObjectId]] = None
    invite_policy: Optional[RoomInvitePolicy] = None

    draft: Optional[PyObjectId] = None
    rules: Optional[str] = None

    moderators: Optional[List[PyObjectId]] = None

    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class RoomCollection(BaseModel):
    '''
    Container for multiple rooms.
    '''
    rooms: List[RoomModel]
