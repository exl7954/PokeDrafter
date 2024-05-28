'''
Models for drafting
'''
#pylint: disable=duplicate-code
from datetime import datetime
from typing import Any, List, Optional, Annotated, Dict
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class DraftTemplate(BaseModel):
    '''
    Container for a template draft board.
    '''
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    creator: PyObjectId = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    point_limit: int = 115
    pokemon_limit: int = 12
    
    rules: str = Field(default='')
    draft_board: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftModel(DraftTemplate):
    '''
    Container for a draft with picks.
    '''
    room: PyObjectId = None
    player_scores: Dict[PyObjectId, int] = Field(default_factory=dict)
    picks: Dict[PyObjectId, List[str]] = Field(default_factory=dict)
    pick_order: List[PyObjectId] = Field(default_factory=list)
    current_pick: Optional[PyObjectId] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class UpdateDraftModel(BaseModel):
    '''
    Optional fields for updating a draft, not for updating picks.
    '''
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None

    bans: Optional[List[str]] = None

    tera_bans: Optional[List[str]] = None
    tera_captains: Optional[Dict[PyObjectId, List[str]]] = None

    pick_order: Optional[List[PyObjectId]] = None

    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftTemplateCollection(BaseModel):
    '''
    Container for multiple draft templates.
    '''
    drafts: List[DraftTemplate]

class DraftCollection(BaseModel):
    '''
    Container for multiple drafts.
    '''
    drafts: List[DraftModel]
