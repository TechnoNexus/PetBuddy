"""
Supabase Storage helper — handles file uploads to Supabase Storage buckets.
Buckets: 'pet-photos' (public), 'avatars' (public).
"""
import os
import uuid
from typing import Optional

from fastapi import UploadFile
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize Supabase client (service role for storage operations)
_supabase: Optional[Client] = None


def get_supabase_client() -> Client:
    """Lazy-initialize the Supabase client."""
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


# Allowed MIME types for uploads
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def upload_pet_photo(file: UploadFile, pet_id: str) -> dict:
    """
    Upload a pet photo to Supabase Storage.

    Returns:
        dict with 'url' (public URL) and 'storage_path' (bucket path)
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            f"Invalid file type: {file.content_type}. "
            f"Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB")

    # Generate unique filename
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    storage_path = f"pets/{pet_id}/{uuid.uuid4().hex}.{ext}"

    # Upload to Supabase Storage
    client = get_supabase_client()
    client.storage.from_("pet-photos").upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type},
    )

    # Get public URL
    public_url = client.storage.from_("pet-photos").get_public_url(storage_path)

    return {
        "url": public_url,
        "storage_path": storage_path,
    }


async def upload_avatar(file: UploadFile, user_id: str) -> dict:
    """
    Upload a user avatar to Supabase Storage.

    Returns:
        dict with 'url' (public URL) and 'storage_path' (bucket path)
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Invalid file type: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB")

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    storage_path = f"users/{user_id}/avatar.{ext}"

    client = get_supabase_client()

    # Delete old avatar if exists (overwrite)
    try:
        client.storage.from_("avatars").remove([storage_path])
    except Exception:
        pass  # File might not exist yet

    client.storage.from_("avatars").upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type},
    )

    public_url = client.storage.from_("avatars").get_public_url(storage_path)

    return {
        "url": public_url,
        "storage_path": storage_path,
    }


def delete_file(bucket: str, storage_path: str) -> bool:
    """Delete a file from Supabase Storage."""
    try:
        client = get_supabase_client()
        client.storage.from_(bucket).remove([storage_path])
        return True
    except Exception:
        return False
