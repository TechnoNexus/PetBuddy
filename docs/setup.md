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
