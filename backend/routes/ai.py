"""
AI Scavenger routes — /api/ai/*
Delegates to agent.py for DuckDuckGo + Gemini pet/service search.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Pet, PetPhoto
from schemas import ScavengeRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/scavenge")
async def scavenge(req: ScavengeRequest, db: Session = Depends(get_db)):
    """
    Search the internet for adoptable pets or pet services
    using DuckDuckGo + Google Gemini.
    Saves external pets to the database organically.
    """
    try:
        from agent import scavenge_internet
        results = scavenge_internet(req.query, req.search_type)
        
        # Save scavenged pets to database to grow the platform organically
        if req.search_type == "pets":
            for pet_data in results:
                ext_url = pet_data.get("url")
                if not ext_url or ext_url == "Unknown":
                    continue
                
                # Deduplicate: Check if a pet from this URL already exists
                existing = db.query(Pet).filter(Pet.external_url == ext_url).first()
                if not existing:
                    # Parse age
                    try:
                        age_str = str(pet_data.get("age", ""))
                        age_int = int(age_str.split()[0]) if age_str.split() else None
                    except:
                        age_int = None
                    
                    new_pet = Pet(
                        name=pet_data.get("name", "Unknown"),
                        species=pet_data.get("species", "Unknown"),
                        breed=pet_data.get("breed"),
                        age=age_int,
                        gender=pet_data.get("gender"),
                        color=pet_data.get("color"),
                        description=pet_data.get("description"),
                        health_info=pet_data.get("details"),
                        location=pet_data.get("location"),
                        external_url=ext_url,
                        status="available"
                    )
                    db.add(new_pet)
                    db.flush() # Get the new_pet.id
                    
                    # Save photo
                    img_url = pet_data.get("image")
                    if img_url:
                        new_photo = PetPhoto(
                            pet_id=new_pet.id,
                            url=img_url,
                            is_primary=True
                        )
                        db.add(new_photo)
            
            db.commit()

        return {"results": results}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
