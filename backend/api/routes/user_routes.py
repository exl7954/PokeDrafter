'''
Define routes for user related operations.
'''
import bcrypt
from fastapi import APIRouter, Body, HTTPException, status
from backend.models.user import UserModel, UserCollection
from backend.db.mongo import pokedrafter_db

router = APIRouter()

##### CREATE #####
@router.post("/users/create",
              tags=["users"],
              response_description="Create a user.",
              response_model=UserModel,
              status_code=status.HTTP_201_CREATED,
              response_model_by_alias=False
)
async def create_user(user: UserModel = Body(...)):
    '''
    Create a user.
    A unique `id` will be created and provided in the response.
    '''
    db = pokedrafter_db

    # Check for existing user
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken."
        )

    user.password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    new_user = await db.users.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    if new_id := new_user.inserted_id:
        created_user = await db.users.find_one({"_id": new_id})
        return created_user

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not created.")

##### READ #####
@router.get("/users/",
            tags=["users"],
            response_description="Get all users.",
            response_model=UserCollection,
            status_code=status.HTTP_200_OK
)
async def get_users():
    '''
    Get all users.
    '''
    db = pokedrafter_db
    return UserCollection(users=await db.users.find().to_list(None))
