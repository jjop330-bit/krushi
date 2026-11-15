from fastapi import APIRouter
from app.api.v1.endpoints import health, pest, treatments, assistant, intelligence

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(pest.router, prefix="/pest", tags=["Pest Diagnosis"])
api_router.include_router(treatments.router, prefix="/treatments", tags=["Treatments"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["Assistant"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])
