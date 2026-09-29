import hmac
import hashlib
import time
import base64
import json
from typing import Optional, List
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "sih-2026-national-weather-intelligence-secret-key-do-not-expose"
security_bearer = HTTPBearer(auto_error=False)

# Seeded Role-based Accounts for SIH 2026 Demonstration
USERS_DB = {
    "admin@sih.gov.in": {
        "password": "Admin@2026",
        "role": "admin",
        "name": "Dr. S. K. Mohapatra (Chief Disaster Administrator)",
        "department": "National Weather Intelligence Centre",
    },
    "reviewer@sih.gov.in": {
        "password": "Reviewer@2026",
        "role": "reviewer",
        "name": "Ananya Sharma (Senior Meteorological Reviewer)",
        "department": "Regional Verification Command",
    },
}

def create_access_token(email: str, role: str, name: str, expires_in_sec: int = 86400) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": email,
        "role": role,
        "name": name,
        "exp": int(time.time()) + expires_in_sec,
        "iat": int(time.time()),
    }
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature_raw = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    signature_b64 = base64.urlsafe_b64encode(signature_raw).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        expected_sig_raw = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig = base64.urlsafe_b64encode(expected_sig_raw).decode().rstrip("=")
        
        if not hmac.compare_digest(signature_b64, expected_sig):
            return None
            
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for this administrative operation.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "public")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User role '{user_role}' lacks required permissions: {allowed_roles}."
            )
        return current_user
    return role_checker
