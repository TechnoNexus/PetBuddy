# Instructions for AI Agents

Welcome, AI Agent! If you are working on the PetBuddy repository, please adhere to the following rules, structures, and architectural standards.

## 1. Repository Knowledge
- This is a Monorepo. Do not create new top-level applications unless specified.
- The root `package.json` uses `concurrently` to run the stack.
- The `frontend` uses React + Vite + MUI.
- The `backend` uses Python + FastAPI + Uvicorn.
- The backend's python virtual environment is typically located at `backend/petbuddy-env`. 

## 2. UI/UX Standards (CRITICAL)
- **Do not use generic, default styling.** The app utilizes a premium, glassmorphic design system defined in `frontend/src/index.css` and `frontend/src/theme.js`.
- Always prefer rounded borders (`borderRadius: 16px` or `24px`), soft shadows, and gradients over flat colors.
- Ensure new components utilize the `Outfit` font and the color variables defined in `index.css`.
- Micro-animations (like hover-lifts) should be applied to interactive elements (Cards, Buttons).

## 3. Backend Rules
- Do not add strict version pinning in `backend/requirements.txt` unless absolutely necessary, as it has caused compilation issues with newer Python releases (e.g., Python 3.14).
- Use `Pydantic` for request validation before processing logic.
- All new API routes should be prefixed with `/api/` (except for WebSockets or OAuth callbacks).

## 4. Execution Rules
- Never use `cat` to create files via shell commands. Use your native `write_to_file` tools.
- If you need to install a new npm package, do it specifically inside the `/frontend/` directory.
- If you need to install a new pip package, do it specifically inside the `/backend/` directory using the activated environment.
