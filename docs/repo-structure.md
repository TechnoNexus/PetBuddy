# Repository Structure

The project follows a simplified Monorepo structure, holding both frontend and backend codebases together under one roof, managed by a root `package.json`.

```text
PetBuddy-main/
│
├── docs/                   # Project documentation, guides, and plans
│
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, PetCard, ChatBox)
│   │   ├── pages/          # Full page views (Home, Pets, Profile)
│   │   ├── context/        # React context providers (Auth)
│   │   ├── services/       # API and WebSocket service wrappers
│   │   ├── theme.js        # Material-UI custom design tokens
│   │   ├── App.jsx         # Main router and theme provider
│   │   └── index.css       # Global design system variables and glassmorphism
│   ├── package.json        # Frontend specific dependencies
│   └── vite.config.js      # Vite build configuration
│
├── mobile/                 # React Native / Expo Mobile App
│   ├── app/                # Expo Router files
│   ├── components/         # Mobile UI components
│   ├── supabaseClient.js   # Supabase client instance
│   └── package.json        # Mobile specific dependencies
│
├── backend/                # FastAPI Python Backend
│   ├── main.py             # Main application entrypoint & routing
│   ├── models.py           # Database models (SQLAlchemy)
│   ├── schemas.py          # Pydantic validation schemas
│   ├── database.py         # Database connection logic
│   ├── admin.py            # Admin-specific routes
│   ├── requirements.txt    # Python dependencies
│   └── petbuddy-env/       # Python Virtual Environment (gitignored)
│
├── package.json            # Root configuration for concurrently script
└── README.md               # Quick overview and pitch
```

## Management
- The root `package.json` contains a `dev` script that relies on `concurrently`. 
- By running `npm run dev` at the root, the application automatically handles `cd`-ing into the respective directories and starting both `uvicorn` and `vite`.
