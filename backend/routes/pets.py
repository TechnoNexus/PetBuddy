"""
Pet CRUD routes — /api/pets/*
"""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from database import get_db
from storage import upload_pet_photo
from models import Pet, PetPhoto, User
from schemas import PetResponse, PetListResponse, PetCreate, PetUpdate
from routes.auth import get_current_user, get_current_user_optional, require_shelter_or_admin

router = APIRouter(prefix="/api/pets", tags=["pets"])


@router.get("/", response_model=PetListResponse)
async def list_pets(
    species: Optional[str] = Query(None, description="Filter by species (Dog, Cat, etc.)"),
    breed: Optional[str] = Query(None, description="Filter by breed"),
    age_min: Optional[int] = Query(None, ge=0, description="Minimum age"),
    age_max: Optional[int] = Query(None, ge=0, description="Maximum age"),
    status_filter: Optional[str] = Query("available", alias="status", description="Filter by status"),
    location: Optional[str] = Query(None, description="Filter by location"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List pets with optional filters. Public endpoint."""
    query = db.query(Pet)

    if species:
        query = query.filter(Pet.species.ilike(f"%{species}%"))
    if breed:
        query = query.filter(Pet.breed.ilike(f"%{breed}%"))
    if age_min is not None:
        query = query.filter(Pet.age >= age_min)
    if age_max is not None:
        query = query.filter(Pet.age <= age_max)
    if status_filter:
        query = query.filter(Pet.status == status_filter)
    if location:
        query = query.filter(Pet.location.ilike(f"%{location}%"))

    total = query.count()
    pets = query.order_by(Pet.created_at.desc()).offset(offset).limit(limit).all()

    return PetListResponse(pets=pets, total=total)


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: UUID, db: Session = Depends(get_db)):
    """Get a single pet by ID. Public endpoint."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.post("/", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
async def create_pet(
    name: str = Form(...),
    species: str = Form(...),
    breed: str = Form(None),
    age: int = Form(None),
    gender: str = Form(None),
    weight: float = Form(None),
    color: str = Form(None),
    description: str = Form(None),
    health_info: str = Form(None),
    vaccinated: bool = Form(False),
    neutered: bool = Form(False),
    trained: bool = Form(False),
    adoption_fee: float = Form(None),
    location: str = Form(None),
    photos: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new pet listing.
    Photos are accepted as multipart uploads.
    """
    pet = Pet(
        name=name,
        species=species,
        breed=breed,
        age=age,
        gender=gender,
        weight=weight,
        color=color,
        description=description,
        health_info=health_info,
        vaccinated=vaccinated,
        neutered=neutered,
        trained=trained,
        adoption_fee=adoption_fee,
        location=location,
        owner_id=current_user.id,
    )
    db.add(pet)
    db.flush()  # Get pet.id before creating photos

    # Handle photo uploads
    if photos:
        for i, photo in enumerate(photos):
            if not photo.filename:
                continue
            try:
                result = await upload_pet_photo(photo, str(pet.id))
                pet_photo = PetPhoto(
                    pet_id=pet.id,
                    url=result["url"],
                    is_primary=(i == 0),
                )
                db.add(pet_photo)
            except Exception as e:
                print(f"[PetBuddy] Failed to upload pet photo {photo.filename}: {e}")

    db.commit()
    db.refresh(pet)
    return pet


@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: UUID,
    updates: PetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a pet listing. Only the owner or admin can update."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Authorization: owner or admin
    if pet.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this pet")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)

    db.commit()
    db.refresh(pet)
    return pet


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a pet listing. Only the owner or admin can delete."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if pet.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this pet")

    db.delete(pet)
    db.commit()
