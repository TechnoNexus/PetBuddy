"""
AI Scavenger routes — /api/ai/*
Delegates to agent.py for DuckDuckGo + Gemini pet/service search.
"""
from fastapi import APIRouter, HTTPException
from schemas import ScavengeRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/scavenge")
async def scavenge(req: ScavengeRequest):
    """
    Search the internet for adoptable pets or pet services
    using DuckDuckGo + Google Gemini.
    """
    try:
        from agent import scavenge_internet
        results = scavenge_internet(req.query, req.search_type)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
