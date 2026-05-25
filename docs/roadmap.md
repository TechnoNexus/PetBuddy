# Project Roadmap

This document outlines the strategic plan for PetBuddy's evolution from a prototype into a production-ready platform.

## Phase 1: Foundation & UI Overhaul (Completed)
- [x] Establish a simple Monorepo structure using `concurrently`.
- [x] Design a premium UI/UX utilizing modern color palettes, glassmorphism, and micro-animations.
- [x] Implement standard authentication flows and JWT logic.
- [x] Setup real-time WebSocket infrastructure for the chat feature.

## Phase 2: Database Migration & Persistence (Current)
- [x] **Supabase Integration**: Connected the frontend and mobile apps to Supabase for authentication (OAuth + Email).
- [ ] **SQLAlchemy Models**: Finalize `models.py` and `schemas.py` to map strictly to the Supabase tables.
- [ ] **Image Storage**: Implement Supabase Storage buckets to replace placeholder URLs with real user-uploaded pet photos.

## Phase 3: Advanced Features & Mobile App
- [x] **Mobile Application**: Created a React Native Android application using Expo.
- [ ] **Payments & Store**: Integrate Stripe API for the `PetStore` checkout process.
- [ ] **Adoption Workflow**: Add a formal application submission system with status tracking (Pending, Approved, Denied).
- [ ] **Shelter Accounts**: Create RBAC (Role-Based Access Control) to differentiate between regular Adopters and Shelter Admins.

## Phase 4: DevOps & Production (Completed)
- [x] **Containerization**: Created a `Procfile` and `requirements.txt` specifically optimized for Railway.
- [x] **Deployment**: Deployed the frontend to Cloudflare Pages, and the FastAPI backend to Railway.
- [x] **Mobile Release**: Generated a production `.aab` Android build for the Google Play Store using Expo and Gradle.

## Phase 5: On-Device AI (Future)
- [ ] **Custom Expo Module**: Create a native Kotlin bridge connecting React Native to Android's native OS capabilities.
- [ ] **MediaPipe SDK**: Integrate the Google MediaPipe LLM Inference API to download and run the Gemma model directly on the phone's GPU.
- [ ] **AICore Integration**: Add support for Android 14+ AICore to natively tap into Gemini Nano on supported devices (e.g., Pixel 8 Pro, Galaxy S24) for zero-cost, offline AI features.
