from fastapi import APIRouter
from typing import Dict, Any
from app.data_store import data_store

router = APIRouter(prefix="/api/v1/analytics/yard", tags=["Yard Analytics"])

@router.get("/summary")
async def get_yard_summary() -> Dict[str, Any]:
    """Returns terminal yard block occupancy, tonnages, and equipment fleet summary."""
    return data_store.get_yard_summary()

@router.get("/heatmap")
async def get_yard_heatmap() -> Dict[str, Any]:
    """Returns block-by-block slot distribution heatmap data for terminal layout visualizer."""
    summary = data_store.get_yard_summary()
    blocks = summary["blocks"]
    
    # Generate tier and bay density matrix for each block
    matrix = []
    for b in blocks:
        density = round((b["occupiedSlots"] / b["totalSlots"]) * 100, 1) if b["totalSlots"] > 0 else 0
        matrix.append({
            "blockCode": b["blockCode"],
            "name": b["name"],
            "density": density,
            "colorCode": "red" if density > 80 else ("yellow" if density > 60 else "green"),
            "baysCount": max(1, b["totalSlots"] // 20),
            "tiers": 4
        })
        
    return {
        "status": "SUCCESS",
        "blocksHeatmap": matrix,
        "overallOccupancy": summary["occupancyPercentage"]
    }

@router.get("/equipments")
async def get_equipment_utilization() -> Dict[str, Any]:
    """Returns crane, reach stacker, and forklift utilization stats."""
    summary = data_store.get_yard_summary()
    return {
        "equipments": summary["equipments"]
    }

