'''
Schemas for room related operations.
'''
from datetime import datetime
from typing import Annotated, List, Optional
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class RoomCreate(BaseModel):
    '''
    Schema for creating a room.
    '''
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None

class RoomUpdateMeta(BaseModel):
    '''
    Schema for updating a room.
    '''
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None
