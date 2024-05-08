'''
Configures the MongoDB connection.
'''
#pylint: disable=global-statement
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
pokedrafter_db = client.pokedrafter
user_collection = pokedrafter_db.get_collection("users")
room_collection = pokedrafter_db.get_collection("rooms")
