"""
Pydantic schemas for request validation and response serialization.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Used when auto-creating a user record from Supabase Auth."""
    supabase_auth_id: Optional[str] = None
    role: str = "user"


class UserUpdate(BaseModel):
    """Fields a user can update on their own profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    pet_preferences: Optional[str] = None
    avatar_url: Optional[str] = None


class AdminUserUpdate(BaseModel):
    """Fields an admin can update on any user."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str
    status: str
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    pet_preferences: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Pet Schemas
# ---------------------------------------------------------------------------

class PetPhotoResponse(BaseModel):
    id: UUID
    url: str
    is_primary: bool = False

    model_config = {"from_attributes": True}


class PetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1, max_length=50)
    breed: Optional[str] = None
    age: Optional[int] = Field(None, ge=0)
    gender: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    description: Optional[str] = None
    health_info: Optional[str] = None
    vaccinated: bool = False
    neutered: bool = False
    trained: bool = False
    adoption_fee: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None


class PetCreate(PetBase):
    """Create a new pet listing."""
    pass


class PetUpdate(BaseModel):
    """Update an existing pet listing. All fields optional."""
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = Field(None, ge=0)
    gender: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    description: Optional[str] = None
    health_info: Optional[str] = None
    vaccinated: Optional[bool] = None
    neutered: Optional[bool] = None
    trained: Optional[bool] = None
    adoption_fee: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    location: Optional[str] = None


class PetResponse(PetBase):
    id: UUID
    status: str
    owner_id: Optional[UUID] = None
    photos: List[PetPhotoResponse] = []
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PetListResponse(BaseModel):
    pets: List[PetResponse]
    total: int


# ---------------------------------------------------------------------------
# Adoption Application Schemas
# ---------------------------------------------------------------------------

class AdoptionApplicationCreate(BaseModel):
    pet_id: Optional[UUID] = None
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    experience: Optional[str] = None
    has_other_pets: bool = False
    other_pets_details: Optional[str] = None
    housing_type: Optional[str] = None
    agreed_to_terms: bool = False

    # For external (AI-found) pets
    pet_name: Optional[str] = None
    pet_source: str = "internal"
    external_url: Optional[str] = None


class AdoptionStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|contacted|approved|rejected)$")


class AdoptionApplicationResponse(BaseModel):
    id: UUID
    pet_id: Optional[UUID] = None
    applicant_id: Optional[UUID] = None
    status: str
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    experience: Optional[str] = None
    has_other_pets: bool
    other_pets_details: Optional[str] = None
    housing_type: Optional[str] = None
    agreed_to_terms: bool
    pet_name: Optional[str] = None
    pet_source: Optional[str] = None
    external_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Product Schemas
# ---------------------------------------------------------------------------

class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    rating: float
    stock: int

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int


# ---------------------------------------------------------------------------
# Order Schemas
# ---------------------------------------------------------------------------

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    status: str
    total: float
    shipping_address: Optional[str] = None
    items: List[OrderItemResponse] = []
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# AI Scavenge Schemas
# ---------------------------------------------------------------------------

class ScavengeRequest(BaseModel):
    query: str
    search_type: str = "pets"
