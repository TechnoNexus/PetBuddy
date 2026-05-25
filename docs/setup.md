# Local Setup Instructions

PetBuddy uses a Monorepo architecture to manage both the Python backend and the React frontend simultaneously. 

## Prerequisites
- **Node.js**: v18+ (for frontend and concurrently)
- **Python**: 3.9 - 3.14 (for FastAPI backend)

## Initial Setup

1. **Clone the repository** and navigate to the root directory:
   ```bash
   cd PetBuddy-main
   ```

2. **Install Root Dependencies**:
   This installs `concurrently` which manages the dev servers.
   ```bash
   npm install
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Backend Setup (Virtual Environment)**:
   It's highly recommended to use a virtual environment.
   ```bash
   cd backend
   python -m venv petbuddy-env
   ```
   *Note: If you are on Windows, activate it using `.\petbuddy-env\Scripts\activate`. On Mac/Linux, use `source petbuddy-env/bin/activate`.*
   
   Once activated, install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   cd ..
   ```

5. **Mobile Setup**:
   ```bash
   cd mobile
   npm install --legacy-peer-deps
   cd ..
   ```

## Running the Application

To start both the frontend and the backend simultaneously:
```bash
npm run dev
```

This root command relies on `concurrently`. It will:
1. Start the FastAPI server on `http://localhost:8000`.
2. Start the Vite React server on `http://localhost:5173`.

To start the Mobile application (Expo):
Open a new terminal window, and run:
```bash
cd mobile
npx expo start
```

## Production Deployment

### Backend (Railway)
1. Add a `Procfile` to the root `backend` directory.
2. Deploy the `/backend` folder to Railway.
3. Make sure to set the `ACCESS_TOKEN_EXPIRE_MINUTES`, `JWT_ALGORITHM`, `SECRET_KEY`, and `GEMINI_API_KEY` environment variables in the Railway dashboard.

### Frontend (Cloudflare Pages)
1. Ensure the `_redirects` file is in the `frontend/public` directory to support React Router.
2. Set the `VITE_BACKEND_URL` environment variable to the Railway backend URL in the Cloudflare Pages settings.
3. Deploy the `/frontend` folder to Cloudflare Pages using `npm run build` and `dist` as the output directory.

### Mobile App (Google Play Store)
1. Update `EXPO_PUBLIC_BACKEND_URL` in `mobile/.env` to the Railway backend URL.
2. Ensure you have the `release.keystore` and the signing configuration in `android/app/build.gradle`.
3. To build the release `.aab` for the Play Store, run:
   ```bash
   cd mobile/android
   ./gradlew clean bundleRelease
   ```
