'''
Schemas for user related operations.
'''
from datetime import datetime
from typing import Annotated, List, Optional
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserCreate(BaseModel):
    '''
    Schema for creating a user.
    '''
    username: str = Field(..., min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]*$')
    email: Optional[EmailStr] = None
    password: str

class UserRead(BaseModel):
    '''
    Schema for reading a user.
    '''
    id: PyObjectId = Field(alias='_id')
    username: str
    created_rooms: List[PyObjectId] = []
    joined_rooms: List[PyObjectId] = []
    created_at: datetime
    updated_at: datetime

class UserReadCollection(BaseModel):
    '''
    Schema for reading multiple users.
    '''
    users: List[UserRead]

class UserUpdate(BaseModel):
    '''
    Schema for updating a user.
    '''
    email: Optional[EmailStr] = None
    password: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "jdoe@example.com",
                "password": "password123"
            }
        }
    )
