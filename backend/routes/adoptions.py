"""
Adoption application routes — /api/adoptions/*
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import AdoptionApplication, Pet, User
from schemas import (
    AdoptionApplicationCreate,
    AdoptionApplicationResponse,
    AdoptionStatusUpdate,
)
from routes.auth import get_current_user, get_current_user_optional, require_admin

router = APIRouter(prefix="/api/adoptions", tags=["adoptions"])


@router.post("/", response_model=AdoptionApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    application: AdoptionApplicationCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Submit an adoption application.
    Works for both internal pets (in our DB) and external pets (from AI scavenger).
    Authentication is optional — guests can apply but won't have an applicant_id link.
    """
    # Validate internal pet exists
    if application.pet_source == "internal" and application.pet_id:
        pet = db.query(Pet).filter(Pet.id == application.pet_id).first()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        if pet.status != "available":
            raise HTTPException(status_code=400, detail="Pet is no longer available for adoption")

    db_application = AdoptionApplication(
        pet_id=application.pet_id,
        applicant_id=current_user.id if current_user else None,
        full_name=application.full_name,
        email=application.email,
        phone=application.phone,
        address=application.address,
        experience=application.experience,
        has_other_pets=application.has_other_pets,
        other_pets_details=application.other_pets_details,
        housing_type=application.housing_type,
        agreed_to_terms=application.agreed_to_terms,
        pet_name=application.pet_name,
        pet_source=application.pet_source,
        external_url=application.external_url,
    )

    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/", response_model=list[AdoptionApplicationResponse])
async def list_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's own adoption applications."""
    applications = (
        db.query(AdoptionApplication)
        .filter(AdoptionApplication.applicant_id == current_user.id)
        .order_by(AdoptionApplication.created_at.desc())
        .all()
    )
    return applications


@router.get("/all", response_model=list[AdoptionApplicationResponse])
async def list_all_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: list all adoption applications with optional status filter."""
    query = db.query(AdoptionApplication)
    if status_filter:
        query = query.filter(AdoptionApplication.status == status_filter)
    return query.order_by(AdoptionApplication.created_at.desc()).all()


@router.get("/{application_id}", response_model=AdoptionApplicationResponse)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single application. Users can see their own; admins can see any."""
    app = db.query(AdoptionApplication).filter(
        AdoptionApplication.id == application_id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Authorization: own application or admin
    if app.applicant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return app


@router.put("/{application_id}/status", response_model=AdoptionApplicationResponse)
async def update_application_status(
    application_id: UUID,
    status_update: AdoptionStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: update the status of an adoption application."""
    app = db.query(AdoptionApplication).filter(
        AdoptionApplication.id == application_id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = status_update.status

    # If approved, mark the pet as adopted
    if status_update.status == "approved" and app.pet_id:
        pet = db.query(Pet).filter(Pet.id == app.pet_id).first()
        if pet:
            pet.status = "adopted"

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: delete an adoption application."""
    app = db.query(AdoptionApplication).filter(
        AdoptionApplication.id == application_id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
