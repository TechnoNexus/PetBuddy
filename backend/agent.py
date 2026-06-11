import os
import json
import traceback
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from dotenv import load_dotenv
from ddgs import DDGS
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
print(f"[Agent] Loaded GEMINI_API_KEY: {'SET' if GEMINI_API_KEY else 'MISSING!'}")
client = genai.Client(api_key=GEMINI_API_KEY)


COMMON_QUERY_FIXES = {
    "husly": "husky",
    "huskie": "husky",
    "huskies": "husky",
}

ADOPTION_RESULT_TERMS = (
    "adopt", "adoption", "rescue", "shelter", "rehoming", "rehome",
    "humane society", "spca", "petfinder", "adoptapet", "petango",
)

EXCLUDED_RESULT_TERMS = (
    "breeder", "puppies for sale", "puppy for sale", "for sale",
    "marketplace", "pet store", "shop", "stud service",
)

BAD_IMAGE_TERMS = (
    "logo", "icon", "banner", "avatar", "default", "placeholder",
    "sprite", "favicon", "social-share", "apple-touch",
)


def normalize_pet_query(user_query: str) -> str:
    """Fix common typos and add light location context for local searches."""
    normalized = user_query.strip()
    for typo, replacement in COMMON_QUERY_FIXES.items():
        normalized = re.sub(rf"\b{typo}\b", replacement, normalized, flags=re.IGNORECASE)

    # Fix "on" preposition before location (e.g. "bulldog on hamilton" -> "bulldog in hamilton")
    normalized = re.sub(r'\bon\s+(hamilton|toronto|ottawa|london)', r'in \1', normalized, flags=re.IGNORECASE)

    lower = normalized.lower()
    if "hamilton" in lower:
        # Only skip appending Ontario if there's a real province/country indicator.
        # Don't match the preposition "on" (e.g. "bulldog on hamilton").
        has_province = any(term in lower for term in ("ontario", "canada", "ont."))
        has_province = has_province or bool(re.search(r'hamilton\s*,?\s*\bon\b', lower))
        if not has_province:
            normalized = f"{normalized} Ontario Canada"

    return normalized


def build_adoption_query(user_query: str) -> str:
    """Append adoption-focused keywords so we skip pet shops."""
    normalized_query = normalize_pet_query(user_query)
    adoption_keywords = ["adopt", "rescue", "rehome", "shelter", "adoption"]
    lower = normalized_query.lower()
    # Only add keywords if none are already present
    if not any(kw in lower for kw in adoption_keywords):
        return f"{normalized_query} adopt rescue shelter petfinder adoptapet"
    return f"{normalized_query} petfinder adoptapet"


def result_text(result: dict) -> str:
    return " ".join(
        str(result.get(key) or "") for key in ("title", "body", "href")
    ).lower()


def is_adoption_result(result: dict) -> bool:
    text = result_text(result)
    if any(term in text for term in EXCLUDED_RESULT_TERMS):
        return False
    return any(term in text for term in ADOPTION_RESULT_TERMS)


def filter_adoption_results(results: list[dict]) -> list[dict]:
    filtered = [result for result in results if is_adoption_result(result)]
    return filtered or results


def ddg_text_with_retry(query: str, max_results: int = 20, retries: int = 3) -> list[dict]:
    """DDG text search with retry on failure or empty results."""
    for attempt in range(retries):
        try:
            results = list(DDGS().text(query, max_results=max_results))
            if results:
                return results
            print(f"[Agent] DDG returned 0 results on attempt {attempt + 1}")
        except Exception as e:
            print(f"[Agent] DDG attempt {attempt + 1}/{retries} failed: {e}")
        if attempt < retries - 1:
            time.sleep(1.5 * (attempt + 1))
    return []


def normalize_url(url: str) -> str:
    """Normalize URL for comparison."""
    if not url:
        return ""
    url = url.strip().rstrip("/").lower()
    url = re.sub(r'^(https?://)www\.', r'\1', url)
    return url


def is_bad_image_url(url: str) -> bool:
    lower = url.lower()
    return lower.endswith(".svg") or any(term in lower for term in BAD_IMAGE_TERMS)


def extract_meta_image(html: str, base_url: str) -> Optional[str]:
    patterns = [
        r'<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image)["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\'](?:og:image|twitter:image)["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE)
        if match:
            image_url = urljoin(base_url, match.group(1).replace("&amp;", "&"))
            if not is_bad_image_url(image_url):
                return image_url
    return None


def fetch_source_image(url: str, timeout: float = 2.5) -> Optional[str]:
    if not url or url == "Unknown":
        return None

    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("content-type", "")
            if "text/html" not in content_type:
                return None
            html = response.read(250_000).decode("utf-8", errors="ignore")
        return extract_meta_image(html, url)
    except Exception as e:
        print(f"[Agent] Source image fetch failed for {url}: {e}")
        return None


def fetch_source_images(urls: list[str]) -> dict[str, str]:
    unique_urls = [url for url in dict.fromkeys(urls) if url and url != "Unknown"]
    if not unique_urls:
        return {}

    images: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=min(6, len(unique_urls))) as executor:
        future_to_url = {executor.submit(fetch_source_image, url): url for url in unique_urls}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            image = future.result()
            if image:
                images[url] = image
    return images


def scavenge_pets(query: str):
    """
    Scavenges for individual adoptable PETS (not shops/websites).
    Returns a list of individual pet profiles.
    """
    normalized_query = normalize_pet_query(query)
    adoption_query = build_adoption_query(query)
    print(f"[Agent] ===== Pet Adoption Scavenge =====")
    print(f"[Agent] Original: '{query}' -> Normalized: '{normalized_query}' -> Enhanced: '{adoption_query}'")

    # Step 1: Text search with retry
    raw_results = ddg_text_with_retry(adoption_query, max_results=20)
    print(f"[Agent] DDG text returned {len(raw_results)} results")
    if not raw_results:
        return []
    raw_results = filter_adoption_results(raw_results)[:12]
    print(f"[Agent] Using {len(raw_results)} adoption-focused results")

    context = ""
    for index, r in enumerate(raw_results, start=1):
        context += (
            f"Source #{index}\n"
            f"Title: {r.get('title')}\n"
            f"URL: {r.get('href')}\n"
            f"Snippet: {r.get('body')}\n\n"
        )

    # Step 3: Gemini extracts INDIVIDUAL PET PROFILES
    system_prompt = f"""
You are an expert pet adoption assistant. Analyze these web search results about adoptable pets.

User is searching for: "{normalized_query}"

Your ONLY job is to extract INDIVIDUAL ADOPTABLE PETS from these results.
DO NOT include pet shops, breeders selling pets for profit, or unrelated websites.
Focus on: animal shelters, rescue organizations, rehoming posts, classified adoption ads.

IMPORTANT RULES:
- Each JSON object = ONE individual pet, NOT a website
- The "name" field = the PET's name, not the shelter's name
- The "description" field must only contain facts supported by the snippets
- The "details" field must only contain adoption details, requirements, or health notes supported by the snippets
- Do not invent names, ages, genders, vaccination status, fees, colors, or personality traits
- If a source is a search/listing page and no individual pet is named, create one source-grounded object named "Available {normalized_query} listings" and set unknown fields to "Unknown" or null
- Prefer fewer accurate results over more guessed results
- Include "source_index" matching the Source # used for the object
- The "url" must be the exact URL from that source

Respond ONLY with a valid JSON array. No markdown. Just raw JSON.

Each object must have:
- "id": unique short string
- "source_index": integer Source # from the raw results
- "name": the PET's name, or "Available {normalized_query} listings" when only a listing page is supported
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
- "source_title": source page title

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
        if not isinstance(data, list):
            print("[Agent] Gemini response was not a list")
            return []
        print(f"[Agent] Extracted {len(data)} individual pet profiles")

        source_by_index = {index: result for index, result in enumerate(raw_results, start=1)}
        source_urls = {normalize_url(result.get('href')) for result in raw_results if result.get('href')}
        cleaned = []
        for i, pet in enumerate(data):
            if not isinstance(pet, dict):
                continue

            try:
                source_index = int(pet.get("source_index"))
            except (TypeError, ValueError):
                source_index = None
            source = source_by_index.get(source_index)
            if not pet.get("url") and source:
                pet["url"] = source.get("href")
            if not pet.get("source_title") and source:
                pet["source_title"] = source.get("title")

            if normalize_url(pet.get("url")) not in source_urls:
                print(f"[Agent] Skipping result with unsupported URL: {pet.get('url')}")
                continue

            pet.setdefault("id", f"pet_{i + 1}")
            if str(pet.get("name", "")).lower().startswith("available "):
                listing_label = pet.get("breed") or pet.get("species") or "Pet"
                pet["name"] = f"Available {listing_label} Listings"
            pet["image"] = None
            pet["image_source"] = "unavailable"
            cleaned.append(pet)

        source_images = fetch_source_images([pet.get("url") for pet in cleaned])
        for pet in cleaned:
            image = source_images.get(pet.get("url"))
            if image:
                pet["image"] = image
                pet["image_source"] = "listing"
            else:
                pet["image"] = None
                pet["image_source"] = "unavailable"

        return cleaned
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

    raw_results = ddg_text_with_retry(query, max_results=8)
    print(f"[Agent] DDG returned {len(raw_results)} results")
    if not raw_results:
        return []
    raw_results = raw_results[:8]

    context = ""
    for index, r in enumerate(raw_results, start=1):
        context += (
            f"Source #{index}\n"
            f"Title: {r.get('title')}\n"
            f"URL: {r.get('href')}\n"
            f"Snippet: {r.get('body')}\n\n"
        )

    system_prompt = f"""
You are a pet services assistant. Extract real local pet service businesses from these results.

Query: "{query}"

Respond ONLY with a valid JSON array. No markdown.
Use only facts supported by the supplied snippets. Do not invent hours, services, phone numbers, or addresses.
Return at most 8 businesses.

Each object is one business:
- "id": unique string
- "source_index": integer Source # from the raw results
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
        if not isinstance(data, list):
            print("[Agent] Services Gemini response was not a list")
            return []

        source_by_index = {index: result for index, result in enumerate(raw_results, start=1)}
        source_urls = {result.get('href') for result in raw_results if result.get('href')}
        cleaned = []
        for i, item in enumerate(data):
            if not isinstance(item, dict):
                continue

            try:
                source_index = int(item.get("source_index"))
            except (TypeError, ValueError):
                source_index = None
            source = source_by_index.get(source_index)
            if not item.get("url") and source:
                item["url"] = source.get("href")
            if normalize_url(item.get("url")) not in source_urls:
                continue

            item.setdefault("id", f"service_{i + 1}")
            item["image"] = None
            item["image_source"] = "unavailable"
            cleaned.append(item)

        cleaned = cleaned[:8]
        print(f"[Agent] Extracted {len(cleaned)} services")
        return cleaned
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
