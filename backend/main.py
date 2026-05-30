"""
PetBuddy API — Main Application Entry Point

All routes are organized in the routes/ package.
This file handles app initialization, middleware, and table creation.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import inspect, text

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


def ensure_schema_compatibility():
    """
    Apply small additive compatibility fixes for deployed prototype databases.
    This keeps existing Railway/Supabase tables aligned until Alembic exists.
    """
    try:
        inspector = inspect(engine)
        if "pets" not in inspector.get_table_names():
            return

        pet_columns = {column["name"] for column in inspector.get_columns("pets")}
        if "external_url" not in pet_columns:
            print("[PetBuddy] Adding missing pets.external_url column...")
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE pets ADD COLUMN external_url VARCHAR"))
            print("[PetBuddy] pets.external_url column ready.")
            
        if "adoption_applications" in inspector.get_table_names():
            app_columns = {column["name"] for column in inspector.get_columns("adoption_applications")}
            
            missing_cols = []
            if "applicant_id" not in app_columns:
                missing_cols.append("ADD COLUMN applicant_id UUID REFERENCES app_users(id)")
            if "full_name" not in app_columns:
                missing_cols.append("ADD COLUMN full_name VARCHAR")
            if "email" not in app_columns:
                missing_cols.append("ADD COLUMN email VARCHAR")
            if "phone" not in app_columns:
                missing_cols.append("ADD COLUMN phone VARCHAR")
            if "address" not in app_columns:
                missing_cols.append("ADD COLUMN address TEXT")
            if "experience" not in app_columns:
                missing_cols.append("ADD COLUMN experience TEXT")
            if "has_other_pets" not in app_columns:
                missing_cols.append("ADD COLUMN has_other_pets BOOLEAN DEFAULT FALSE")
            if "other_pets_details" not in app_columns:
                missing_cols.append("ADD COLUMN other_pets_details TEXT")
            if "housing_type" not in app_columns:
                missing_cols.append("ADD COLUMN housing_type VARCHAR")
            if "agreed_to_terms" not in app_columns:
                missing_cols.append("ADD COLUMN agreed_to_terms BOOLEAN DEFAULT FALSE")
            if "pet_name" not in app_columns:
                missing_cols.append("ADD COLUMN pet_name VARCHAR")
            if "pet_source" not in app_columns:
                missing_cols.append("ADD COLUMN pet_source VARCHAR DEFAULT 'internal'")
            if "external_url" not in app_columns:
                missing_cols.append("ADD COLUMN external_url VARCHAR")
            if "created_at" not in app_columns:
                missing_cols.append("ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
            if "updated_at" not in app_columns:
                missing_cols.append("ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
                
            if missing_cols:
                print(f"[PetBuddy] Adding {len(missing_cols)} missing columns to adoption_applications...")
                with engine.begin() as connection:
                    for col_sql in missing_cols:
                        connection.execute(text(f"ALTER TABLE adoption_applications {col_sql}"))
                        
            # Drop NOT NULL constraints on legacy columns that we no longer use but still exist in production DB
            with engine.begin() as connection:
                if "applicant_name" in app_columns:
                    connection.execute(text("ALTER TABLE adoption_applications ALTER COLUMN applicant_name DROP NOT NULL"))
                if "applicant_email" in app_columns:
                    connection.execute(text("ALTER TABLE adoption_applications ALTER COLUMN applicant_email DROP NOT NULL"))
                
            print("[PetBuddy] adoption_applications columns ready.")
    except Exception as e:
        print(f"[PetBuddy] Schema compatibility check skipped: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Create database tables on startup if they don't exist.
    In production, use Alembic migrations instead.
    """
    print("[PetBuddy] Creating database tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()
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
