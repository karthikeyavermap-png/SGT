from fastapi import APIRouter
from typing import Dict, Any
from app.data_store import data_store

router = APIRouter(prefix="/api/v1/analytics/transport", tags=["Transport KPIs"])

@router.get("/summary")
async def get_transport_summary() -> Dict[str, Any]:
    """Returns turnaround time KPIs for rail rakes and road trucks."""
    return data_store.get_transport_kpis()

@router.get("/rake-tat")
async def get_rake_tat() -> Dict[str, Any]:
    """Returns detailed rail rake turnaround time breakdown and detention alerts."""
    kpis = data_store.get_transport_kpis()
    return {
        "averageTatHours": kpis["averageRakeTatHours"],
        "targetTatHours": kpis["targetRakeTatHours"],
        "rakes": kpis["rakes"],
        "detainedCount": kpis["rakesDetained"],
    }

@router.get("/truck-tat")
async def get_truck_tat() -> Dict[str, Any]:
    """Returns truck turnaround time through weighbridges and terminal gates."""
    kpis = data_store.get_transport_kpis()
    return {
        "averageTatMinutes": kpis["averageTruckTatMinutes"],
        "targetTatMinutes": kpis["targetTruckTatMinutes"],
        "truckGatePassesIssuedToday": kpis["truckGatePassesIssuedToday"],
        "trucks": kpis["trucks"]
    }

