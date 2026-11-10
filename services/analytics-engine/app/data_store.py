from datetime import datetime, timezone
from typing import List, Dict, Any
import threading

class AnalyticsDataStore:
    def __init__(self):
        self._lock = threading.Lock()
        self.events: List[Dict[str, Any]] = []

        # Baseline Yard Metrics
        self.yard_blocks = [
            {"blockCode": "BLOCK-A", "name": "Heavy Steel & Coils Yard", "totalSlots": 120, "occupiedSlots": 94, "capacityTons": 25000, "currentTons": 19200},
            {"blockCode": "BLOCK-B", "name": "Bulk Mineral & Pellets", "totalSlots": 160, "occupiedSlots": 118, "capacityTons": 35000, "currentTons": 25800},
            {"blockCode": "BLOCK-C", "name": "Cement & Dry Bulk Clinker", "totalSlots": 80, "occupiedSlots": 41, "capacityTons": 15000, "currentTons": 7900},
            {"blockCode": "BLOCK-D", "name": "Empty Container Staging", "totalSlots": 100, "occupiedSlots": 32, "capacityTons": 10000, "currentTons": 3200},
        ]

        # Equipment fleet status
        self.equipments = [
            {"equipmentCode": "RMG-01", "type": "RAIL_MOUNTED_GANTRY", "status": "ACTIVE", "utilizationRate": 84.5, "hoursLoggedToday": 14.2},
            {"equipmentCode": "RMG-02", "type": "RAIL_MOUNTED_GANTRY", "status": "ACTIVE", "utilizationRate": 79.0, "hoursLoggedToday": 13.1},
            {"equipmentCode": "RS-01", "type": "REACH_STACKER", "status": "ACTIVE", "utilizationRate": 68.2, "hoursLoggedToday": 11.5},
            {"equipmentCode": "RS-02", "type": "REACH_STACKER", "status": "MAINTENANCE", "utilizationRate": 32.0, "hoursLoggedToday": 4.0},
            {"equipmentCode": "FL-01", "type": "HEAVY_FORKLIFT", "status": "ACTIVE", "utilizationRate": 72.8, "hoursLoggedToday": 12.0},
        ]

        # Historical Rake Turnaround Metrics (in hours)
        self.rake_tat_history = [
            {"rakeNumber": "RK-2026-ER-01", "arrival": "2026-11-09T08:00:00", "departure": "2026-11-09T15:30:00", "tatHours": 7.5, "freeHours": 8.0, "demurrageHours": 0.0, "status": "COMPLETED"},
            {"rakeNumber": "RK-2026-SER-14", "arrival": "2026-11-09T14:15:00", "departure": "2026-11-10T01:45:00", "tatHours": 11.5, "freeHours": 8.0, "demurrageHours": 3.5, "status": "COMPLETED"},
            {"rakeNumber": "RK-2026-WR-09", "arrival": "2026-11-10T04:30:00", "departure": None, "tatHours": 6.2, "freeHours": 8.0, "demurrageHours": 0.0, "status": "UNLOADING_IN_PROGRESS"},
            {"rakeNumber": "RK-2026-CR-03", "arrival": "2026-11-10T09:00:00", "departure": None, "tatHours": 2.5, "freeHours": 6.0, "demurrageHours": 0.0, "status": "INSPECTION_PENDING"}
        ]

        # Truck turnaround times (in minutes)
        self.truck_tat_history = [
            {"truckNumber": "MH-12-QZ-4921", "gateIn": "10:15", "gateOut": "11:02", "tatMinutes": 47, "grossWeightTons": 44.2, "netCargoTons": 28.6},
            {"truckNumber": "KA-04-AK-8119", "gateIn": "10:30", "gateOut": "11:12", "tatMinutes": 42, "grossWeightTons": 48.0, "netCargoTons": 31.4},
            {"truckNumber": "OD-05-BX-2204", "gateIn": "11:00", "gateOut": "11:58", "tatMinutes": 58, "grossWeightTons": 42.5, "netCargoTons": 26.8},
            {"truckNumber": "TS-09-EA-3341", "gateIn": "11:45", "gateOut": "12:25", "tatMinutes": 40, "grossWeightTons": 45.1, "netCargoTons": 29.3},
        ]

        # Commercial totals
        self.commercial_stats = {
            "totalRevenueInr": 28450000.0,
            "handledTonnageMT": 148500.0,
            "totalDemurrageBilledInr": 384000.0,
            "customerBreakdown": [
                {"customerCode": "CUST-TATA", "customerName": "Tata Steel Ltd.", "revenueInr": 12400000.0, "tonnageMT": 62000.0, "demurrageInr": 182000.0},
                {"customerCode": "CUST-JSW", "customerName": "JSW Infrastructure", "revenueInr": 9650000.0, "tonnageMT": 51000.0, "demurrageInr": 126000.0},
                {"customerCode": "CUST-ULTRA", "customerName": "UltraTech Cement Ltd.", "revenueInr": 6400000.0, "tonnageMT": 35500.0, "demurrageInr": 76000.0},
            ]
        }

    def record_event(self, topic: str, event_data: Dict[str, Any]):
        with self._lock:
            event_entry = {
                "topic": topic,
                "data": event_data,
                "receivedAt": datetime.now(timezone.utc).isoformat()
            }
            self.events.append(event_entry)

            # Keep only last 1000 events
            if len(self.events) > 1000:
                self.events.pop(0)

            # React to specific event types
            event_type = event_data.get("eventType")
            if event_type == "CONTAINER_PLACED":
                block_code = event_data.get("blockCode")
                for b in self.yard_blocks:
                    if b["blockCode"] == block_code and b["occupiedSlots"] < b["totalSlots"]:
                        b["occupiedSlots"] += 1
                        b["currentTons"] += 28.0
                        break

            elif event_type == "ORDER_CREATED":
                total_val = float(event_data.get("totalValue", 0))
                qty = float(event_data.get("quantityTons", 0))
                self.commercial_stats["totalRevenueInr"] += total_val
                self.commercial_stats["handledTonnageMT"] += qty

            elif event_type == "DEMURRAGE_ACCRUED":
                amt = float(event_data.get("demurrageAmount", 0))
                self.commercial_stats["totalDemurrageBilledInr"] += amt

    def get_yard_summary(self) -> Dict[str, Any]:
        with self._lock:
            total_slots = sum(b["totalSlots"] for b in self.yard_blocks)
            occupied_slots = sum(b["occupiedSlots"] for b in self.yard_blocks)
            total_capacity_tons = sum(b["capacityTons"] for b in self.yard_blocks)
            current_tons = sum(b["currentTons"] for b in self.yard_blocks)

            occupancy_rate = round((occupied_slots / total_slots * 100), 2) if total_slots else 0
            tonnage_utilization = round((current_tons / total_capacity_tons * 100), 2) if total_capacity_tons else 0

            return {
                "totalSlots": total_slots,
                "occupiedSlots": occupied_slots,
                "availableSlots": total_slots - occupied_slots,
                "occupancyPercentage": occupancy_rate,
                "totalCapacityTons": total_capacity_tons,
                "currentTons": current_tons,
                "tonnageUtilizationPercentage": tonnage_utilization,
                "blocks": list(self.yard_blocks),
                "equipments": list(self.equipments),
            }

    def get_transport_kpis(self) -> Dict[str, Any]:
        with self._lock:
            completed_rakes = [r for r in self.rake_tat_history if r.get("tatHours") is not None]
            avg_rake_tat = round(sum(r["tatHours"] for r in completed_rakes) / len(completed_rakes), 2) if completed_rakes else 0.0
            total_demurrage_rakes = sum(1 for r in self.rake_tat_history if r.get("demurrageHours", 0) > 0)

            avg_truck_tat = round(sum(t["tatMinutes"] for t in self.truck_tat_history) / len(self.truck_tat_history), 1) if self.truck_tat_history else 0.0

            return {
                "averageRakeTatHours": avg_rake_tat,
                "targetRakeTatHours": 8.0,
                "rakesHandledToday": len(self.rake_tat_history),
                "rakesDetained": total_demurrage_rakes,
                "averageTruckTatMinutes": avg_truck_tat,
                "targetTruckTatMinutes": 45.0,
                "truckGatePassesIssuedToday": 142,
                "rakes": list(self.rake_tat_history),
                "trucks": list(self.truck_tat_history),
            }

    def get_commercial_kpis(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "totalRevenueInr": self.commercial_stats["totalRevenueInr"],
                "handledTonnageMT": self.commercial_stats["handledTonnageMT"],
                "totalDemurrageBilledInr": self.commercial_stats["totalDemurrageBilledInr"],
                "customerBreakdown": list(self.commercial_stats["customerBreakdown"]),
                "recentEventsCount": len(self.events)
            }


# Singleton instance
data_store = AnalyticsDataStore()

