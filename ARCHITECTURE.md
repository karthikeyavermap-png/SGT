# Smart Goods Terminal (SGT) - Microservices Architecture

## 1. System Topology Overview

```text
+-------------------------------------------------------------+
|                      API Gateway (Nginx)                    |
|                         Port: 8080                          |
|                             &                               |
|              React Frontend UI (Next.js 14)                 |
|                         Port: 3000                          |
+-------------------------------------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+------------------+   +-------------------+   +--------------------+
|   Yard Service   |   | Transport Service |   | Commercial Service |
|  (Spring Boot)   |   |   (Spring Boot)   |   |   (Spring Boot)    |
|    Port: 8081    |   |    Port: 8082     |   |    Port: 8083      |
+------------------+   +-------------------+   +--------------------+
        |                      |                      |
        +----------------------+----------------------+
                               |
                               v
                +-----------------------------+
                | Event Broker (Apache Kafka) |
                |      KRaft Cluster: 9092    |
                +-----------------------------+
                               |
                               v
                +-----------------------------+
                |  Analytics & Report Engine  |
                |       (Python / FastAPI)    |
                |          Port: 8000         |
                +-----------------------------+
```

---

## 2. Microservice Directory & Port Mapping

| Service | Technology | Internal Port | External Port | Database / Broker |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | Nginx Alpine | `80` | `8080` | Reverse Proxy Routing |
| **Yard Service** | Java 21 / Spring Boot 3.3.5 | `8081` | `8081` | PostgreSQL (`yard_db`) + Kafka |
| **Transport Service**| Java 21 / Spring Boot 3.3.5 | `8082` | `8082` | PostgreSQL (`transport_db`) + Kafka |
| **Commercial Service**| Java 21 / Spring Boot 3.3.5 | `8083` | `8083` | PostgreSQL (`commercial_db`) + Kafka |
| **Analytics Engine**| Python 3.12 / FastAPI | `8000` | `8000` | Kafka Consumer (`sgt.*.events`) |
| **Ticketing API** | Node.js / Fastify / Prisma | `4000` | `4000` | SQLite / PostgreSQL |
| **Web Frontend UI** | Next.js 14 App Router / Tailwind | `3000` | `3000` | Gateway & Fastify API |
| **Mobile App** | Expo / React Native | `8081` (Metro) | `8081` | Mobile SecureStore & REST |

---

## 3. Kafka Event Topics & Schemas

### `sgt.yard.events`
- `CONTAINER_PLACED`: Published when a container is assigned or restacked in a yard bay/tier slot.
  ```json
  {
    "eventType": "CONTAINER_PLACED",
    "service": "yard-service",
    "blockCode": "BLOCK-A",
    "containerNumber": "MSCU-892104",
    "bay": 2,
    "rowNumber": 1,
    "tier": 2,
    "timestamp": 1731238491000
  }
  ```

### `sgt.transport.events`
- `RAKE_STATUS_CHANGED`: Published when a freight rake arrives, begins discharge/loading, or departs.
- `TRUCK_GATE_PASS_ISSUED`: Published upon weighbridge tare/gross verification.
  ```json
  {
    "eventType": "TRUCK_GATE_PASS_ISSUED",
    "service": "transport-service",
    "truckNumber": "MH-12-QZ-4921",
    "stage": "GATE_OUT",
    "netCargoTons": 28.6,
    "tatMinutes": 47,
    "timestamp": 1731238491000
  }
  ```

### `sgt.commercial.events`
- `ORDER_CREATED`: Ingested by analytics to track customer demand volume and revenue forecasts.
- `INVOICE_GENERATED`: Tracks customer billing with 18% GST calculation.
- `DEMURRAGE_ACCRUED`: Triggered when rakes or road vehicles exceed free detention thresholds (e.g. > 8.0 hours).
  ```json
  {
    "eventType": "DEMURRAGE_ACCRUED",
    "service": "commercial-service",
    "referenceId": "RK-2026-ER-01",
    "referenceType": "RAKE",
    "customerCode": "CUST-TATA",
    "billableHours": 9.0,
    "demurrageAmount": 6750.0,
    "timestamp": 1731238491000
  }
  ```

---

## 4. REST API Endpoint Catalog

### A. Yard Service (`:8081`)
- `GET /api/v1/yard/health`: Service health status.
- `GET /api/v1/yard/blocks`: List all terminal storage blocks (`BLOCK-A`, `BLOCK-B`, `BLOCK-C`, `BLOCK-D`).
- `GET /api/v1/yard/slots`: Retrieve slots filtered by block code.
- `POST /api/v1/yard/containers/assign-slot`: Assign container to slot and emit Kafka event.
- `GET /api/v1/yard/movements`: View container restacking audit logs.

### B. Transport Service (`:8082`)
- `GET /api/v1/transport/health`: Service health check.
- `GET /api/v1/transport/rakes`: Timetable of freight rakes, wagons, and detention hours.
- `GET /api/v1/transport/rakes/{rakeNumber}/wagons`: Wagon manifest breakdown.
- `POST /api/v1/transport/trucks/gate-in`: Road vehicle registration and gross weighment.
- `POST /api/v1/transport/trucks/gate-out`: Tare weighment, cargo reconciliation, and gate pass release.

### C. Commercial Service (`:8083`)
- `GET /api/v1/commercial/health`: Service health check.
- `GET /api/v1/commercial/orders`: Active client contracts and commodities.
- `POST /api/v1/commercial/orders`: Register new volume contract.
- `GET /api/v1/commercial/invoices`: Tax invoices and payment status.
- `POST /api/v1/commercial/invoices/generate`: Compute handling, storage, demurrage, and 18% GST.
- `GET /api/v1/commercial/demurrage`: Real-time detention penalty ledger.
- `POST /api/v1/commercial/demurrage/calculate`: Calculate billable penalty hours.

### D. Analytics & Report Engine (`:8000`)
- `GET /api/v1/analytics/yard/summary`: Total container slots, tonnage utilization, and equipment metrics.
- `GET /api/v1/analytics/yard/heatmap`: Bay/tier density matrix for terminal layout visualization.
- `GET /api/v1/analytics/transport/rake-tat`: Average Rake Turnaround Time (TAT) and detention counts.
- `GET /api/v1/analytics/transport/truck-tat`: Average Truck Turnaround Time (TAT) gate-to-gate.
- `GET /api/v1/analytics/commercial/summary`: Handled tonnage (MT), revenue, and demurrage share.

---

## 5. Running with Docker Compose

To boot the complete distributed platform (Databases, Kafka KRaft broker, 3 Spring Boot microservices, Python Analytics Engine, Fastify API, Next.js Web UI, and Nginx Gateway):

```bash
docker compose up --build
```

### Direct Service URLs:
- **Unified Portal & Gateway:** `http://localhost:8080`
- **React Frontend UI:** `http://localhost:3000`
- **Yard Microservice:** `http://localhost:8081`
- **Transport Microservice:** `http://localhost:8082`
- **Commercial Microservice:** `http://localhost:8083`
- **Analytics & Report Engine Swagger:** `http://localhost:8000/docs`
- **Ticketing Management API:** `http://localhost:4000`



---

## 6. Organizational Hierarchy & Core Operational Modules (RBAC)

### A. Role Hierarchy Diagram
```mermaid
graph TD
    %% Global & System Level
    SA[Super Admin<br/><i>Global System Control</i>] --> RD[Regional Director<br/><i>Multi-Yard & Regional Oversight</i>]

    %% Branch & Operational Management
    RD --> YM[Yard Manager<br/><i>Yard Operations & Maintenance</i>]
    RD --> FD[Fleet Dispatcher<br/><i>Transport & Driver Logistics</i>]
    RD --> AE[Accounts Executive<br/><i>Office Finance & Billing</i>]
    RD --> AU[Auditor<br/><i>Compliance & Audit Review</i>]

    %% Field Level
    FD --> DR[Driver<br/><i>Trip Execution & Updates</i>]

    %% Module Access Mapping
    subgraph Core System Modules [Operational Modules]
        YM_Mod["Yard Maintenance Module<br/>(Allowances, Diagnostics, Oil Fills, Accounts)"]
        FD_Mod["Transport & Fleet Module<br/>(Vehicles, Drivers, Trip Details)"]
        AE_Mod["Office & Accounts Module<br/>(Invoices GST/Non-GST, Collections, Expenses, Purchases/Sales)"]
    end

    %% Mappings
    YM --> YM_Mod
    FD --> FD_Mod
    DR --> FD_Mod
    AE --> AE_Mod
    SA --> Core System Modules
    RD --> Core System Modules
    AU --> Core System Modules
```

### B. Module Breakdown & Scope

#### 1. Yard Maintenance Module (`YM_Mod`)
- **Allowances:** Overtime, hazard pay, night shifts, and daily per diem disbursements.
- **Diagnostics:** Fault telemetry (DTC fault codes, sensor metrics like pressure & temperature) across cranes and stackers.
- **Oil Fills:** Lubrication records (Hydraulic ISO 68, Engine 15W40, Gear SAE 90), hour-meter intervals, and costs.
- **Accounts:** Yard maintenance expenses, spare parts procurement, and statutory load certifications.

#### 2. Transport & Fleet Module (`FD_Mod`)
- **Vehicles:** Prime movers, multi-axle trailers, and internal transfer vehicles (ITVs) with fitness & insurance certificates.
- **Drivers:** Driver roster, heavy vehicle licenses, experience, and safety ratings.
- **Trip Details:** Trip manifests, live status updates (Planned, In-Transit, Delivered), and driver waybill sign-offs.

#### 3. Office & Accounts Module (`AE_Mod`)
- **Invoices (GST & Non-GST):** HSN 996511 cargo handling invoices, CGST/SGST 18% breakdowns, and payment statuses.
- **Collections:** Bank RTGS, NEFT, Cheque, and UPI reconciliations with TDS deductions.
- **Expenses:** High-tension electric utility bills, bulk diesel bunkering, and security vendor disbursements.
- **Purchases & Sales:** Procurement contracts for fuel and spare consumables vs client services sales orders.

### C. Demo Login Accounts

| Role | Email | Password | Allowed Operational Modules |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@sgt.com` | `Password123!` | All Modules (`YM_Mod`, `FD_Mod`, `AE_Mod`) |
| **Regional Director** | `regional@sgt.com` | `Password123!` | All Modules (`YM_Mod`, `FD_Mod`, `AE_Mod`) |
| **Auditor** | `auditor@sgt.com` | `Password123!` | All Modules (Compliance & Audit Review) |
| **Yard Manager** | `yardmgr@sgt.com` | `Password123!` | `YM_Mod` (Yard Maintenance) |
| **Fleet Dispatcher** | `dispatcher@sgt.com` | `Password123!` | `FD_Mod` (Transport & Fleet) |
| **Driver** | `driver@sgt.com` | `Password123!` | `FD_Mod` (Assigned Trips Execution) |
| **Accounts Executive**| `accounts@sgt.com` | `Password123!` | `AE_Mod` (Office & Accounts) |
