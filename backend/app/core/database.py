from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.core.config import settings
from app.models import DOCUMENT_MODELS

_client: AsyncMongoClient | None = None


async def connect_db() -> None:
    global _client
    _client = AsyncMongoClient(settings.mongodb_uri, tz_aware=True)
    await init_beanie(database=_client[settings.mongodb_db], document_models=DOCUMENT_MODELS)


async def close_db() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
