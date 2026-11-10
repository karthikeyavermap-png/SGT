from fastapi import APIRouter
from typing import Dict, Any
from app.data_store import data_store

router = APIRouter(prefix="/api/v1/analytics/commercial", tags=["Commercial KPIs"])

@router.get("/summary")
async def get_commercial_summary() -> Dict[str, Any]:
    """Returns total billed revenue, throughput tonnage, and demurrage summaries."""
    return data_store.get_commercial_kpis()

@router.get("/revenue-by-customer")
async def get_revenue_by_customer() -> Dict[str, Any]:
    """Returns top customer revenue and handled tonnages."""
    kpis = data_store.get_commercial_kpis()
    return {
        "customerBreakdown": kpis["customerBreakdown"],
        "totalRevenueInr": kpis["totalRevenueInr"]
    }

@router.get("/demurrage-kpis")
async def get_demurrage_kpis() -> Dict[str, Any]:
    """Returns terminal detention leakage and accrued demurrage penalty analytics."""
    kpis = data_store.get_commercial_kpis()
    return {
        "totalDemurrageBilledInr": kpis["totalDemurrageBilledInr"],
        "demurrageSharePercentage": round((kpis["totalDemurrageBilledInr"] / kpis["totalRevenueInr"] * 100), 2) if kpis["totalRevenueInr"] else 0.0,
        "customers": [
            {
                "customerCode": c["customerCode"],
                "customerName": c["customerName"],
                "demurrageInr": c["demurrageInr"]
            }
            for c in kpis["customerBreakdown"]
        ]
    }

