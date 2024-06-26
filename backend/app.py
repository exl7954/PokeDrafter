'''
Main FastAPI application.
'''
from fastapi import FastAPI
from .api.routes import user_routes, room_routes, draft_routes
from .api import auth

app = FastAPI()
app.include_router(user_routes.router)
app.include_router(room_routes.router)
app.include_router(draft_routes.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    '''
    Root route.
    '''
    return {"message": "Hello World"}
