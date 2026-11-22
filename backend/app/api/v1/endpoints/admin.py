from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.marketplace_service import marketplace_service
from app.services.expert_service import expert_service
from app.models.marketplace import SellerProfile, SellerStatusEnum
from app.models.expert import ExpertProfile, ExpertStatusEnum

router = APIRouter()

@router.get("/metrics")
def get_admin_metrics() -> Dict[str, Any]:
    """
    Consolidated real-time operational metrics for Marketplace & Expert Advisory desk.
    Computed dynamically from persistent database state.
    """
    mkt = marketplace_service.get_admin_metrics()
    exp = expert_service.get_admin_metrics()
    return {
        "marketplace": mkt,
        "expert_support": exp
    }

@router.get("/sellers", response_model=List[SellerProfile])
def list_sellers(status: Optional[SellerStatusEnum] = None):
    return marketplace_service.list_sellers(status)

@router.patch("/sellers/{seller_id}/status", response_model=SellerProfile)
def update_seller_status(seller_id: str, status: SellerStatusEnum):
    seller = marketplace_service.update_seller_status(seller_id, status)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found.")
    return seller

@router.get("/experts", response_model=List[ExpertProfile])
def list_experts(status: Optional[ExpertStatusEnum] = None):
    return expert_service.list_experts(status=status)

@router.patch("/experts/{expert_id}/status", response_model=ExpertProfile)
def update_expert_status(expert_id: str, status: ExpertStatusEnum):
    expert = expert_service.update_expert_status(expert_id, status)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found.")
    return expert

@router.post("/commission")
def set_commission_rate(rate: float):
    try:
        marketplace_service.set_platform_commission(rate)
        return {"status": "SUCCESS", "commission_rate": rate}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
