'''
Models for drafting
'''
#pylint: disable=duplicate-code
from datetime import datetime
from typing import List, Optional, Annotated, Dict
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict

PyObjectId = Annotated[str, BeforeValidator(str)]

class DraftTemplate(BaseModel):
    '''
    Container for a template draft board.
    '''
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    creator: PyObjectId
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    rules: List[str] = Field(default_factory=list)
    bans: List[str] = Field(default_factory=list)

    tera_bans: List[str] = Field(default_factory=list)
    tera_captains: Dict[PyObjectId, List[str]] = Field(default_factory=dict)

    draft_board: List[List[str]] = Field(default_factory=list)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
    )

class DraftModel(DraftTemplate):
    '''
    Container for a draft with picks.
    '''
    picks: Dict[PyObjectId, List[str]] = Field(default_factory=dict)
    pick_order: List[PyObjectId] = Field(default_factory=list)

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

    rules: Optional[List[str]] = None
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
