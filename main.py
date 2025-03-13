from fastapi import FastAPI, UploadFile, File, Form, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv
import uuid
import re
import secrets
import os
from admin import router as admin_router





# Initialize FastAPI app
app = FastAPI(title="PetBuddy API")
app.include_router(admin_router)


# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# Database storage
users_db = {}
pets_db = []

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class UserCreate(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str

class UserProfile(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str = None
    address: str = None
    bio: str = None
    petPreferences: str = None

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


# Helper functions
def validate_password(password: str) -> bool:
    pattern = r"^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    return bool(re.match(pattern, password))


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(username: str, password: str):
    if username not in users_db:
        return None
    user = users_db[username]
    if not pwd_context.verify(password, user["hashed_password"]):
        return None
    return user


# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to PetBuddy API"}


@app.post("/api/auth/signup")
async def signup(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    try:
        validate_email(user.email)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    if not validate_password(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters and contain uppercase, number, and special character"
        )

    verification_token = secrets.token_urlsafe(32)
    hashed_password = pwd_context.hash(user.password)

    users_db[user.email] = {
        "email": user.email,
        "hashed_password": hashed_password,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "verified": False,
        "verification_token": verification_token
    }

    return {"message": "User registered successfully"}


@app.post("/api/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/pets/")
async def get_pets():
    return {"pets": pets_db}


@app.post("/api/pets/")
async def create_pet(
        name: str = Form(...),
        species: str = Form(...),
        breed: str = Form(...),
        age: int = Form(...),
        description: str = Form(...),
        photos: List[UploadFile] = File(None)
):
    pet_id = str(uuid.uuid4())
    pet_data = {
        "id": pet_id,
        "name": name,
        "species": species,
        "breed": breed,
        "age": age,
        "description": description,
        "photos": [photo.filename for photo in photos] if photos else []
    }
    pets_db.append(pet_data)
    return {"id": pet_id, "data": pet_data}


@app.get("/api/pets/{pet_id}")
async def get_pet(pet_id: str):
    pet = next((pet for pet in pets_db if pet["id"] == pet_id), None)
    if pet:
        return pet
    raise HTTPException(status_code=404, detail="Pet not found")


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client left the chat")


@app.get("/auth/google")
async def google_auth():
    return {"url": "Google OAuth URL"}


@app.get("/auth/facebook")
async def facebook_auth():
    return {"url": "Facebook OAuth URL"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        if email not in users_db:
            raise credentials_exception
        return users_db[email]
    except JWTError:
        raise credentials_exception


@app.put("/api/users/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    users_db[current_user["email"]].update({
        "firstName": profile.firstName,
        "lastName": profile.lastName,
        "phone": profile.phone,
        "address": profile.address,
        "bio": profile.bio,
        "petPreferences": profile.petPreferences
    })
    return {"message": "Profile updated successfully"}
