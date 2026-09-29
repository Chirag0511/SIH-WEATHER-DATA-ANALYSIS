from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from backend.auth import USERS_DB, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    email: str
    name: str
    role: str
    department: str

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    user = USERS_DB.get(creds.email.lower().strip())
    if not user or user["password"] != creds.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your administrative email and password."
        )
    
    token = create_access_token(
        email=creds.email.lower().strip(),
        role=user["role"],
        name=user["name"]
    )
    
    return {
        "token": token,
        "email": creds.email.lower().strip(),
        "name": user["name"],
        "role": user["role"],
        "department": user["department"]
    }

@router.get("/me")
def get_current_session(user: dict = Depends(get_current_user)):
    return {
        "status": "authenticated",
        "user": user
    }
