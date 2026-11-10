import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.kafka_consumer import kafka_consumer
from app.routers import yard_analytics, transport_kpis, commercial_kpis, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sgt.analytics")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SGT Analytics & Report Engine...")
    await kafka_consumer.start()
    yield
    logger.info("Shutting down SGT Analytics & Report Engine...")
    await kafka_consumer.stop()

app = FastAPI(
    title="Smart Goods Terminal (SGT) - Analytics & Report Engine",
    description="Calculates yard occupancy heatmaps, rail rake turnaround times (TAT), and commercial demurrage KPIs.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(yard_analytics.router)
app.include_router(transport_kpis.router)
app.include_router(commercial_kpis.router)
app.include_router(reports.router)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "UP",
        "service": "analytics-report-engine",
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "terminal": "Smart Goods Terminal (SGT)",
        "service": "Analytics & Report Engine",
        "docsUrl": "/docs"
    }

