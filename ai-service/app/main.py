from fastapi import FastAPI

from app.routes.health import router as health_router
from app.routes.ingest import router as ingest_router
from app.routes.query import router as query_router
from app.routes.documents import router as documents_router


app = FastAPI(
    title="AI Enterprise Knowledge Assistant",
    version="1.0.0",
)

app.include_router(health_router)
app.include_router(ingest_router)
app.include_router(query_router)
app.include_router(documents_router)