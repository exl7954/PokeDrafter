'''
Define the Room model and supporting models for the Room model.
'''
# pylint: disable=too-few-public-methods
from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class RoomModel(BaseModel):
    '''
    Container for a single room.
    '''
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    participants: List[PyObjectId] = []
    moderators: List[PyObjectId] = []
    creator: PyObjectId
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
    updated_at: datetime = Field(default_factory=datetime.now)

class RoomCollection(BaseModel):
    '''
    Container for multiple rooms.
    '''
    rooms: List[RoomModel]
