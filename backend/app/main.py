from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, accounts, emails

settings = get_settings()

app = FastAPI(
    title="Trackmail API",
    description="AI-powered email priority management",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(emails.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Trackmail API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
