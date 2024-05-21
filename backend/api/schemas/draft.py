'''
Schemas for draft related operations.
'''
#pylint: disable=duplicate-code
from datetime import datetime
from typing import List, Optional, Annotated, Dict
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class DraftTemplateCreate(BaseModel):
    '''
    Schema for creating a draft template.
    '''
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None

    bans: List[str] = Field(default_factory=list)
    point_limit: int = 115
    pokemon_limit: int = 12

    tera_bans: List[str] = Field(default_factory=list)
    tera_captains: Dict[PyObjectId, List[str]] = Field(default_factory=dict)

    draft_board: List[List[str]] = Field(default_factory=list)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftCreate(DraftTemplateCreate):
    '''
    Schema for starting a draft in a room.
    '''
    room: PyObjectId

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftUpdateSchema(BaseModel):
    '''
    Optional fields for updating a draft, not for updating picks.
    '''
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None

    bans: Optional[List[str]] = None
    point_limit: Optional[int] = None
    pokemon_limit: Optional[int] = None

    tera_bans: Optional[List[str]] = None
    tera_captains: Optional[Dict[PyObjectId, List[str]]] = None

    draft_board: Optional[Dict[int, List[str]]] = None

    pick_order: Optional[List[PyObjectId]] = None

    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftBoardUpdateSchema(BaseModel):
    '''
    Schema for updating a draft board.
    '''
    draft_board: Optional[Dict[int, List[str]]] = None


class DraftPickSchema(BaseModel):
    '''
    Schema for updating picks in a draft.
    '''
    player_scores: Dict[PyObjectId, int] = Field(default_factory=dict)
    picks: Dict[PyObjectId, List[str]]
    pick_order: Optional[List[PyObjectId]] = None
    current_pick: Optional[PyObjectId] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "picks": {
                    "60f5f7e8e7e8f8f8f8f8f8f8": ["Charmander", "Bulbasaur"],
                    "60f5f7e8e7e8f8f8f8f8f8f9": ["Squirtle", "Pikachu"]
                }
            }
        }
    )
