'''
Define routes for user related operations.
'''
import bcrypt
from fastapi import APIRouter, Body, HTTPException, status
from backend.models.user import UserModel, UserCollection, UpdateUserModel
from backend.api.schemas.user import UserCreate
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
async def create_user(user: UserCreate = Body(...)):
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
    user_model = UserModel(**user.model_dump())
    new_user = await db.users.insert_one(user_model.model_dump(by_alias=True, exclude=["id"]))
    if new_id := new_user.inserted_id:
        created_user = await db.users.find_one({"_id": new_id})
        return created_user

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not created.")

##### READ #####
@router.get("/users/",
            tags=["users"],
            response_description="Get all users.",
            response_model=UserCollection,
            response_model_by_alias=False,
)
async def get_users():
    '''
    Get all users.
    '''
    db = pokedrafter_db
    return UserCollection(users=await db.users.find().to_list(None))

@router.get("/users/{user_id}",
            tags=["users"],
            response_description="Get a specific user.",
            response_model=UserModel,
            response_model_by_alias=False,
)
async def get_user(user_id: str):
    '''
    Get a specific user.
    '''
    db = pokedrafter_db
    user = await db.users.find_one({"_id": user_id})
    if user:
        return user

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

##### UPDATE #####
# @router.put("/users/update/{user_id}",
#             tags=["users"],
#             response_description="Update a user.",
#             response_model=UserModel,
#             response_model_by_alias=False,
# )
# async def update_user(user_id: str, user: UpdateUserModel = Body(...)):
#     '''
#     Update a user.
#     '''
#     db = pokedrafter_db

#     # Check for existing user
#     existing_user = await db.users.find_one({"_id": user_id})
#     if not existing_user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found."
#         )

#     user.password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
#     updated_user = await db.users.update_one({"_id": user_id}, {"$set": user.model_dump(by_alias=True, exclude=["id"])})
#     if updated_user.modified_count:
#         return await db.users.find_one({"_id": user_id})

#     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not updated.")