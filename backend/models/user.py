'''
Define the User model and supporting models for the User model.
'''
# pylint: disable=too-few-public-methods, duplicate-code
from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserModel(BaseModel):
    '''
    Container for a single user.
    '''
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    username: str = Field(..., min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]*$')
    email: Optional[EmailStr] = None
    password: str
    created_rooms: List[PyObjectId] = []
    joined_rooms: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class UpdateUserModel(BaseModel):
    '''
    Optional fields for updating a user.
    '''
    username: Optional[str] = Field(None, min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
    )

class UserCollection(BaseModel):
    '''
    Container for multiple users.
    '''
    users: List[UserModel]
