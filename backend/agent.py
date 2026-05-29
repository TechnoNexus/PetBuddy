import os
import json
import traceback
from dotenv import load_dotenv
from ddgs import DDGS
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
print(f"[Agent] Loaded GEMINI_API_KEY: {'SET' if GEMINI_API_KEY else 'MISSING!'}")
client = genai.Client(api_key=GEMINI_API_KEY)


def build_adoption_query(user_query: str) -> str:
    """Append adoption-focused keywords so we skip pet shops."""
    adoption_keywords = ["adopt", "rescue", "rehome", "shelter", "adoption"]
    lower = user_query.lower()
    # Only add keywords if none are already present
    if not any(kw in lower for kw in adoption_keywords):
        return f"{user_query} adopt rescue shelter"
    return user_query


def scavenge_pets(query: str):
    """
    Scavenges for individual adoptable PETS (not shops/websites).
    Returns a list of individual pet profiles.
    """
    adoption_query = build_adoption_query(query)
    print(f"[Agent] ===== Pet Adoption Scavenge =====")
    print(f"[Agent] Original: '{query}' → Enhanced: '{adoption_query}'")

    # Step 1: Text search
    try:
        raw_results = list(DDGS().text(adoption_query, max_results=20))
        print(f"[Agent] DDG text returned {len(raw_results)} results")
        if not raw_results:
            return []
    except Exception as e:
        print(f"[Agent] DDG Text FAILED: {e}")
        traceback.print_exc()
        return []

    # Step 2: One bulk image search keeps the endpoint fast enough for mobile.
    image_urls = []
    try:
        breed_img_query = f"{query} dog cat pet adoption photo shelter"
        print(f"[Agent] Image search query: '{breed_img_query}'")
        img_results = list(
            DDGS().images(
                breed_img_query,
                max_results=12,
                safesearch='moderate',
                type_image='photo',
            )
        )
        image_urls = [
            r.get('image') for r in img_results
            if r.get('image') and not any(
                skip in r.get('image', '').lower()
                for skip in ['logo', 'icon', 'banner', 'ad', 'food', 'ice']
            )
        ]
        print(f"[Agent] DDG images returned {len(image_urls)} filtered results")
    except Exception as e:
        print(f"[Agent] DDG Image search failed (non-fatal): {e}")

    context = ""
    for r in raw_results:
        context += f"Title: {r.get('title')}\nURL: {r.get('href')}\nSnippet: {r.get('body')}\n\n"

    # Step 3: Gemini extracts INDIVIDUAL PET PROFILES
    system_prompt = f"""
You are an expert pet adoption assistant. Analyze these web search results about adoptable pets.

User is searching for: "{query}"

Your ONLY job is to extract INDIVIDUAL ADOPTABLE PETS from these results.
DO NOT include pet shops, breeders selling pets for profit, or unrelated websites.
Focus on: animal shelters, rescue organizations, rehoming posts, classified adoption ads.

IMPORTANT RULES:
- Each JSON object = ONE individual pet, NOT a website
- The "name" field = the PET's name, not the shelter's name
- The "description" field = describe THIS PET's personality, story, appearance — NOT the website
- The "details" field = adoption requirements, health status, what this specific pet needs — NOT generic website info
- If the snippet mentions a specific pet (e.g. "Max, a 2-year-old husky, needs a loving home"), extract it
- If no specific pets are named, create entries for shelters that likely have this breed, but set name = "Contact for Available Pets"

Respond ONLY with a valid JSON array. No markdown. Just raw JSON.

Each object must have:
- "id": unique short string
- "name": the PET's name (e.g. "Max", "Bella", or "Contact for Available Pets")
- "breed": specific breed (e.g. "Siberian Husky", "Husky Mix")
- "species": "Dog", "Cat", "Rabbit", etc.
- "age": age string (e.g. "2 years", "8 weeks") or "Unknown"
- "gender": "Male", "Female", or "Unknown"
- "color": coat color if mentioned, else "Unknown"
- "vaccinated": true, false, or null
- "neutered": true, false, or null
- "description": 2-3 sentences about THIS PET's personality and story (not the website)
- "details": adoption process details, requirements, health notes for this pet
- "shelter": shelter or rescue organization name
- "location": city/province or address
- "contact": phone or email if mentioned, else null
- "url": direct URL to the listing or shelter
- "fee": adoption fee (e.g. "$150", "Free") or null
- "image": null

Raw Search Results:
{context}
"""

    print(f"[Agent] Calling Gemini for pet profile extraction...")
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        raw_text = response.text
        print(f"[Agent] Gemini response (first 400 chars): {raw_text[:400]}")
        data = json.loads(raw_text)
        print(f"[Agent] Extracted {len(data)} individual pet profiles")

        # Assign images without per-result network calls; those made mobile searches time out.
        fallback_images = [
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
            'https://images.unsplash.com/photo-1574158622564-3d6afb141703?w=600&q=80',
            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
            'https://images.unsplash.com/photo-1537151608804-ea6f272a728b?w=600&q=80',
            'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&q=80',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
        ]
        for i, pet in enumerate(data):
            if image_urls and i < len(image_urls):
                pet['image'] = image_urls[i]
            else:
                pet['image'] = fallback_images[i % len(fallback_images)]

        return data
    except json.JSONDecodeError as e:
        print(f"[Agent] JSON parse FAILED: {e}")
        return []
    except Exception as e:
        print(f"[Agent] Gemini FAILED: {e}")
        traceback.print_exc()
        return []


def scavenge_services(query: str):
    """
    Scavenges for local pet services (groomers, vets, walkers, etc.)
    """
    print(f"[Agent] ===== Pet Services Scavenge =====")
    print(f"[Agent] Query: '{query}'")

    try:
        raw_results = list(DDGS().text(query, max_results=15))
        print(f"[Agent] DDG returned {len(raw_results)} results")
        if not raw_results:
            return []
    except Exception as e:
        print(f"[Agent] DDG FAILED: {e}")
        return []

    image_urls = []
    try:
        img_results = list(DDGS().images(query, max_results=15))
        image_urls = [r.get('image') for r in img_results if r.get('image')]
    except Exception:
        pass

    context = ""
    for r in raw_results:
        context += f"Title: {r.get('title')}\nURL: {r.get('href')}\nSnippet: {r.get('body')}\n\n"

    system_prompt = f"""
You are a pet services assistant. Extract real local pet service businesses from these results.

Query: "{query}"

Respond ONLY with a valid JSON array. No markdown.

Each object is one business:
- "id": unique string
- "name": business name
- "description": 1-2 sentences about the service
- "details": longer description with services offered, hours, any notable info
- "url": website URL
- "phone": phone number if available, else null
- "location": address or city
- "image": set to null

Raw Results:
{context}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(response.text)
        fallbacks = [
            'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&q=80',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
        ]
        for i, item in enumerate(data):
            item['image'] = image_urls[i] if i < len(image_urls) else fallbacks[i % len(fallbacks)]
        print(f"[Agent] Extracted {len(data)} services")
        return data
    except Exception as e:
        print(f"[Agent] Services Gemini FAILED: {e}")
        traceback.print_exc()
        return []


def scavenge_internet(query: str, search_type: str = 'pets'):
    """Main dispatcher."""
    if search_type == 'pets':
        return scavenge_pets(query)
    else:
        return scavenge_services(query)
