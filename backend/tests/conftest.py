'''
Setup pytest for async tests.
'''
#pylint: disable=redefined-outer-name
import pytest
from httpx import AsyncClient
from backend.app import app

@pytest.fixture(scope="session")
def anyio_backend():
    '''
    Return the backend for anyio.
    '''
    return "asyncio"

@pytest.fixture(scope="session")
async def client():
    '''
    Yield an async client for testing.
    '''
    async with AsyncClient(app=app, base_url="http://test") as client:
        print("Client is ready")
        yield client
