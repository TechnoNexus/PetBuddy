"""
PetBuddy API — Main Application Entry Point

All routes are organized in the routes/ package.
This file handles app initialization, middleware, and table creation.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base

# Import all models so Base.metadata knows about them
import models  # noqa: F401

# Import routers
from routes.pets import router as pets_router
from routes.users import router as users_router
from routes.adoptions import router as adoptions_router
from routes.store import router as store_router
from routes.ai import router as ai_router
from routes.chat import router as chat_router
from admin import router as admin_router


# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Create database tables on startup if they don't exist.
    In production, use Alembic migrations instead.
    """
    print("[PetBuddy] Creating database tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("[PetBuddy] Database tables ready.")
    yield
    print("[PetBuddy] Shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="PetBuddy API",
    description="Pet adoption platform API — powered by Supabase, FastAPI, and AI",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pets_router)
app.include_router(users_router)
app.include_router(adoptions_router)
app.include_router(store_router)
app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(admin_router)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to PetBuddy API",
        "version": "2.0.0",
        "docs": "/docs",
    }
