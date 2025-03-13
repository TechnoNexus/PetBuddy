from pydantic import BaseModel

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    role: str = "user"
    status: str = "active"

class UserUpdate(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    role: str | None = None
    status: str | None = None
