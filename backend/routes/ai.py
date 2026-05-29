"""
AI Scavenger routes — /api/ai/*
Delegates to agent.py for DuckDuckGo + Gemini pet/service search.
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException

from database import SessionLocal
from models import Pet, PetPhoto
from schemas import ScavengeRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


def save_scavenged_pets(results: list[dict]):
    """
    Best-effort persistence for AI-found pets.
    Search results must still return even if the database schema is behind.
    """
    db = SessionLocal()
    try:
        for pet_data in results:
            ext_url = pet_data.get("url")
            if not ext_url or ext_url == "Unknown":
                continue

            existing = db.query(Pet).filter(Pet.external_url == ext_url).first()
            if existing:
                continue

            try:
                age_str = str(pet_data.get("age", ""))
                age_int = int(age_str.split()[0]) if age_str.split() else None
            except (TypeError, ValueError):
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
                status="available",
            )
            db.add(new_pet)
            db.flush()

            img_url = pet_data.get("image")
            if img_url:
                db.add(
                    PetPhoto(
                        pet_id=new_pet.id,
                        url=img_url,
                        is_primary=True,
                    )
                )

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[AI] Skipping scavenged pet persistence: {e}")
    finally:
        db.close()


@router.post("/scavenge")
async def scavenge(req: ScavengeRequest, background_tasks: BackgroundTasks):
    """
    Search the internet for adoptable pets or pet services
    using DuckDuckGo + Google Gemini.
    Saves external pets in the background so mobile search is not blocked.
    """
    try:
        from agent import scavenge_internet
        results = scavenge_internet(req.query, req.search_type)
        if req.search_type == "pets" and results:
            background_tasks.add_task(save_scavenged_pets, results)

        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
