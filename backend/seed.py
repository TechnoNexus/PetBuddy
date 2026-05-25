"""
Database seeder — populates the database with initial sample data.
Run this script once after creating tables to add the original 5 pets
and sample store products.

Usage:
    cd backend
    python seed.py
"""
import sys
import os

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import Pet, PetPhoto, Product

# Import all models so create_all works
import models  # noqa: F401


def seed_pets(db):
    """Seed the original 5 PetBuddy pets."""
    existing = db.query(Pet).count()
    if existing > 0:
        print(f"[Seed] Skipping pets — {existing} already exist.")
        return

    pets_data = [
        {
            "name": "Buddy",
            "species": "Dog",
            "breed": "Labrador Retriever",
            "age": 3,
            "gender": "Male",
            "color": "Golden",
            "description": "A very friendly and energetic dog who loves to play fetch and swim. Buddy is great with kids and other pets.",
            "vaccinated": True,
            "neutered": True,
            "trained": True,
            "adoption_fee": 150.0,
            "location": "New York, NY",
            "photos": ["https://images.unsplash.com/photo-1574158622564-3d6afb141703?w=800&q=80"],
        },
        {
            "name": "Mittens",
            "species": "Cat",
            "breed": "Maine Coon",
            "age": 2,
            "gender": "Female",
            "color": "Gray Tabby",
            "description": "A large, fluffy gentle giant. Very vocal and loves to cuddle. Mittens is perfect for a calm home.",
            "vaccinated": True,
            "neutered": True,
            "trained": False,
            "adoption_fee": 100.0,
            "location": "Los Angeles, CA",
            "photos": ["https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80"],
        },
        {
            "name": "Charlie",
            "species": "Dog",
            "breed": "Beagle",
            "age": 1,
            "gender": "Male",
            "color": "Tricolor",
            "description": "Curious and playful pup. Still needs some house training but very eager to learn. Loves sniffing adventures!",
            "vaccinated": True,
            "neutered": False,
            "trained": False,
            "adoption_fee": 125.0,
            "location": "Chicago, IL",
            "photos": ["https://images.unsplash.com/photo-1537151608804-ea6f272a728b?w=800&q=80"],
        },
        {
            "name": "Daisy",
            "species": "Cat",
            "breed": "British Shorthair",
            "age": 4,
            "gender": "Female",
            "color": "Blue-Gray",
            "description": "A calm and independent cat. Enjoys sunny spots and quiet afternoons. Daisy would do well as an only pet.",
            "vaccinated": True,
            "neutered": True,
            "trained": True,
            "adoption_fee": 100.0,
            "location": "Houston, TX",
            "photos": ["https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&q=80"],
        },
        {
            "name": "Leo",
            "species": "Dog",
            "breed": "French Bulldog",
            "age": 2,
            "gender": "Male",
            "color": "Fawn",
            "description": "A total clown! Loves attention and is great with kids and other pets. Leo is always ready for playtime.",
            "vaccinated": True,
            "neutered": True,
            "trained": True,
            "adoption_fee": 200.0,
            "location": "Miami, FL",
            "photos": ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80"],
        },
    ]

    for pet_data in pets_data:
        photo_urls = pet_data.pop("photos")
        pet = Pet(**pet_data)
        db.add(pet)
        db.flush()

        for i, url in enumerate(photo_urls):
            photo = PetPhoto(pet_id=pet.id, url=url, is_primary=(i == 0))
            db.add(photo)

    db.commit()
    print(f"[Seed] Added {len(pets_data)} pets with photos.")


def seed_products(db):
    """Seed sample store products."""
    existing = db.query(Product).count()
    if existing > 0:
        print(f"[Seed] Skipping products — {existing} already exist.")
        return

    products_data = [
        # Food & Treats
        {
            "name": "Organic Dog Kibble",
            "description": "Premium organic kibble made with real chicken and brown rice. No artificial preservatives.",
            "price": 45.99,
            "category": "Food & Treats",
            "image_url": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80",
            "rating": 4.8,
            "stock": 50,
        },
        {
            "name": "Gourmet Cat Treats",
            "description": "Irresistible salmon-flavored treats your cat will love. Made with real fish.",
            "price": 12.99,
            "category": "Food & Treats",
            "image_url": "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=600&q=80",
            "rating": 4.6,
            "stock": 100,
        },
        # Apparel
        {
            "name": "Cozy Winter Dog Jacket",
            "description": "Keep your pup warm with this stylish waterproof jacket. Available in multiple sizes.",
            "price": 34.99,
            "category": "Apparel",
            "image_url": "https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=600&q=80",
            "rating": 4.7,
            "stock": 30,
        },
        {
            "name": "Bandana Collar Set",
            "description": "Adorable bandana collar in a variety of patterns. Perfect for photos and outings.",
            "price": 15.99,
            "category": "Apparel",
            "image_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
            "rating": 4.5,
            "stock": 75,
        },
        # Accessories
        {
            "name": "Interactive Puzzle Feeder",
            "description": "Keep your pet mentally stimulated with this challenging puzzle feeder toy.",
            "price": 24.99,
            "category": "Accessories",
            "image_url": "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=600&q=80",
            "rating": 4.9,
            "stock": 40,
        },
        {
            "name": "Premium Leather Leash",
            "description": "Handcrafted genuine leather leash with comfortable grip. Built to last.",
            "price": 39.99,
            "category": "Accessories",
            "image_url": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
            "rating": 4.7,
            "stock": 25,
        },
    ]

    for product_data in products_data:
        product = Product(**product_data)
        db.add(product)

    db.commit()
    print(f"[Seed] Added {len(products_data)} products.")


def main():
    """Run all seeders."""
    print("[Seed] Starting database seed...")

    # Create tables first
    print("[Seed] Ensuring tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_pets(db)
        seed_products(db)
        print("[Seed] Done! Database is ready.")
    except Exception as e:
        print(f"[Seed] Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
