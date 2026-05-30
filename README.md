# PetBuddy

**PetBuddy is an all-in-one, community-driven platform designed to seamlessly connect people with their perfect animal companions while providing everything they need to care for them.**

## The Problem It Solves
Typically, the journey of bringing a pet home and caring for them is fragmented. A user has to visit one website to find a shelter or adopt a pet, another e-commerce site to buy pet food and supplies, and yet another platform to communicate with adoption counselors or vets. This creates a disjointed and frustrating experience for new pet parents.

## What PetBuddy Does
PetBuddy unifies the entire pet ownership journey into a single, cohesive ecosystem. With PetBuddy, users can:
1. **Discover and Adopt:** Browse a comprehensive directory of pets needing homes. View detailed profiles and photos to find the perfect match.
2. **Shop for Essentials:** Access a built-in Pet Store with a fully functional checkout system. New pet parents can immediately purchase the food, toys, and supplies they need.
3. **Connect in Real-Time:** Features an integrated, real-time Chat system (powered by WebSockets) allowing potential adopters to instantly message adoption staff or ask questions.
4. **Manage Profiles & Preferences:** Users have personalized Profiles where they can track their preferences and manage their adoption status.
5. **Streamlined Administration:** An Admin Dashboard ensures staff can easily manage pet listings, track adoptions, and oversee the community from a centralized hub.
6. **AI Scavenger:** Features an intelligent agent to discover and sync pet listings from external shelter sites directly into the platform.

---

## Local Setup Instructions

### Backend Setup
```bash
python -m pip install --upgrade pip
python -m venv petbuddy-env
source petbuddy-env/bin/activate
cd backend
pip install "python-jose[cryptography]" "passlib[bcrypt]" fastapi uvicorn sqlalchemy psycopg2-binary python-multipart email-validator
# or run: pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
```
