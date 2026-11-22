from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, pest, treatments, assistant, intelligence, voice, crops,
    store, sellers, experts, support, payments, admin, notifications
)

api_router = APIRouter()

# Preserved Core Diagnostic & Intelligence Routes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crop Registry"])
api_router.include_router(pest.router, prefix="/pest", tags=["Pest Diagnosis"])
api_router.include_router(treatments.router, prefix="/treatments", tags=["Treatments"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["Assistant"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice"])

# New Production Modules: Krushi Store Marketplace & Expert Support
api_router.include_router(store.router, prefix="/store", tags=["Krushi Store Marketplace"])
api_router.include_router(sellers.router, prefix="/sellers", tags=["Seller Management"])
api_router.include_router(experts.router, prefix="/experts", tags=["Agricultural Experts"])
api_router.include_router(support.router, prefix="/support", tags=["Expert Consultations & Support"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payment Gateway"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administrative Governance"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["In-App Notifications"])
