from fastapi import APIRouter, Response
from typing import Dict, Any
from app.data_store import data_store
import pandas as pd
import io

router = APIRouter(prefix="/api/v1/analytics/reports", tags=["Export Reports"])

@router.get("/shift-summary")
async def get_shift_summary() -> Dict[str, Any]:
    """Generates an operational terminal shift summary report."""
    yard = data_store.get_yard_summary()
    transport = data_store.get_transport_kpis()
    commercial = data_store.get_commercial_kpis()

    return {
        "reportId": "RPT-SHIFT-2026-A",
        "terminalName": "Smart Goods Terminal (SGT) Multi-Modal Hub",
        "shift": "Day Shift 06:00 - 18:00",
        "generatedAt": "2026-11-10T12:00:00Z",
        "summary": {
            "totalTonnageHandledMT": commercial["handledTonnageMT"],
            "yardOccupancyPercentage": yard["occupancyPercentage"],
            "averageRakeTatHours": transport["averageRakeTatHours"],
            "averageTruckTatMinutes": transport["averageTruckTatMinutes"],
            "totalRevenueInr": commercial["totalRevenueInr"],
            "totalDemurragePenaltiesInr": commercial["totalDemurrageBilledInr"],
        },
        "equipmentsActiveCount": sum(1 for e in yard["equipments"] if e["status"] == "ACTIVE"),
        "rakesHandled": transport["rakesHandledToday"],
        "truckGatePasses": transport["truckGatePassesIssuedToday"],
    }

@router.get("/export/rake-tat-csv")
async def export_rake_tat_csv():
    """Generates a downloadable CSV of rail rake turnaround times and detention metrics."""
    transport = data_store.get_transport_kpis()
    rakes = transport["rakes"]

    df = pd.DataFrame(rakes)
    output = io.StringIO()
    df.to_csv(output, index=False)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sgt_rake_tat_report.csv"}
    )

@router.get("/export/commercial-ledger-csv")
async def export_commercial_ledger_csv():
    """Generates a downloadable CSV of customer throughput and demurrage accruals."""
    commercial = data_store.get_commercial_kpis()
    breakdown = commercial["customerBreakdown"]

    df = pd.DataFrame(breakdown)
    output = io.StringIO()
    df.to_csv(output, index=False)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sgt_customer_ledger.csv"}
    )

