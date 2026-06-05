import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.leads import router as leads_router
from app.api.prospects import router as prospects_router
from app.core.database import create_db_and_tables
from app.core.llm import test_groq
from app.models import Campaign, Lead  # noqa: F401 — registra modelos no SQLModel metadata

logger = logging.getLogger(__name__)

app = FastAPI(title="B2B f.AInder API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Criando tabelas no banco...")
    create_db_and_tables()
    logger.info("Tabelas prontas.")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/test-llm")
async def test_llm() -> dict:
    return {"result": test_groq()}


app.include_router(leads_router, prefix="/leads", tags=["leads"])
app.include_router(prospects_router, prefix="/prospects", tags=["prospects"])
