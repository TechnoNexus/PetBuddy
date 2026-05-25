"""
Authentication dependency — verifies Supabase JWT tokens.

Flow:
1. Client sends Supabase JWT in Authorization: Bearer <token>
2. We validate it via Supabase SDK → get user's auth ID + email
3. Look up (or auto-create) the user in our app_users table
4. Return the User ORM object for use in route handlers
"""
import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from supabase import create_client, Client
from dotenv import load_dotenv

from database import get_db
from models import User

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")

# Server-side Supabase client (uses service_role key for admin operations)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# HTTP Bearer scheme for extracting tokens
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the Supabase JWT and return the corresponding app_users record.
    Auto-creates the user record on first API call after signup.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Validate token against Supabase Auth
        auth_response = supabase_admin.auth.get_user(token)
        supabase_user = auth_response.user
        if not supabase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "invalid" in error_msg.lower() or "expired" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication service error: {error_msg}",
        )

    auth_id = supabase_user.id
    email = supabase_user.email
    user_metadata = supabase_user.user_metadata or {}

    # Look up user in our database
    db_user = db.query(User).filter(User.supabase_auth_id == auth_id).first()

    if not db_user:
        # Auto-create user record on first authenticated API call
        db_user = User(
            supabase_auth_id=auth_id,
            email=email,
            first_name=user_metadata.get("first_name", user_metadata.get("full_name", "User")),
            last_name=user_metadata.get("last_name", ""),
            role="user",
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    return db_user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Same as get_current_user but returns None instead of raising
    if no token is provided. Useful for public endpoints that
    behave differently for authenticated users.
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency that requires the user to be an admin."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


async def require_shelter_or_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency that requires the user to be a shelter admin or app admin."""
    if user.role not in ("admin", "shelter"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shelter or admin access required",
        )
    return user
