'''
Handles the authentication of the user.
'''
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated
from dotenv import load_dotenv
import bcrypt
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from backend.db.mongo import pokedrafter_db
from backend.models.user import UserModel

load_dotenv()
AUTH_SECRET = os.getenv("AUTH_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
db = pokedrafter_db

router = APIRouter()

class Token(BaseModel):
    '''
    Token model.
    '''
    access_token: str
    token_type: str

class TokenData(BaseModel):
    '''
    Token data model.
    '''
    username: str = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    '''
    Verify the password.
    '''
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    '''
    Get the password hash.
    '''
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def get_user(username: str):
    '''
    Get the user.
    '''
    user = await db.get_collection("users").find_one({"username": username})
    if not user:
        return None
    return UserModel(**user)

async def authenticate_user(username: str, password: str):
    '''
    Authenticate the user.
    '''
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    '''
    Create the access token.
    '''
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, AUTH_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    '''
    Get the current user.
    '''
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, AUTH_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError as exc:
        raise credentials_exception from exc
    user = await get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    '''
    Get the access token.
    '''
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
