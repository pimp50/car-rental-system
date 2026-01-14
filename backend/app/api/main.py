from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, plates, renters, leases, cars, rentals
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(plates.router)
api_router.include_router(renters.router)
api_router.include_router(leases.router)
api_router.include_router(cars.router)
api_router.include_router(rentals.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
