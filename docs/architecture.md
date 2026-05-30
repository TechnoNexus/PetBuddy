# Architecture

PetBuddy utilizes a modern, decoupled architecture allowing for rapid UI iterations and high-performance backend processing.

## Frontend Architecture
- **Framework**: React 19 built with Vite.
- **Routing**: `react-router-dom` for client-side navigation.
- **Styling / UI**: Material-UI (MUI) v7 as the component library, extended heavily with custom CSS (`theme.js` and `index.css`) to enforce a glassmorphic, premium design system.
- **State Management**: React Context API (`AuthContext`) for global state, combined with local component state.
- **Real-time**: WebSockets are used natively for the chat system.

## Mobile Architecture
- **Framework**: React Native managed by Expo.
- **Routing**: Expo Router for native navigation.
- **Styling**: React Native stylesheets mirroring the web's premium design system.
- **State Management**: React Context API (`AuthContext`).

## Backend Architecture
- **Framework**: FastAPI (Python). Highly performant, async-native framework.
- **Authentication**: Supabase Auth (OAuth with Google/Facebook, Email/Password).
- **Database**: PostgreSQL (hosted on Supabase), accessed via SQLAlchemy ORM.
- **WebSockets**: Integrated directly into FastAPI (`@app.websocket`) using a custom `ConnectionManager` to broadcast messages.

## Data Flow
1. **REST API**: The frontend uses `fetch`/`axios` to hit the `/api/*` endpoints on the live FastAPI backend (hosted on Railway).
2. **Real-time Chat**: The frontend establishes a persistent connection to the live WebSocket server. Messages are piped through the FastAPI `ConnectionManager` and broadcast back to connected clients.
3. **Mobile App**: Connects directly to the live Railway backend using environment variables (`EXPO_PUBLIC_BACKEND_URL`).
