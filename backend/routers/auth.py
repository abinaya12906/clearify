from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import Company, AuditLog
from pydantic import BaseModel
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import re
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SECRET_KEY = os.getenv(
    "SECRET_KEY", "clearify_super_secret_key_2024"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class LoginRequest(BaseModel):
    gstin: str
    password: str
    role: str


class RegisterRequest(BaseModel):
    gstin: str
    legal_name: str
    trade_name: Optional[str] = None
    business_type: str
    state: str
    email: str
    phone: str
    address: str
    city: str
    pincode: str
    password: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str
    gstin: str
    role: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@router.post("/auth/login", response_model=Token)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    # Validate GSTIN format
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    if not re.match(pattern, request.gstin):
        raise HTTPException(
            status_code=400,
            detail="Invalid GSTIN format"
        )

    if len(request.password) < 4:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 4 characters"
        )

    # Create JWT token
    token = create_access_token({
        "gstin": request.gstin,
        "role": request.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "gstin": request.gstin,
        "role": request.role
    }


@router.post("/auth/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    # Validate GSTIN format
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    if not re.match(pattern, request.gstin):
        raise HTTPException(
            status_code=400,
            detail="Invalid GSTIN format"
        )

    # Check if GSTIN already registered
    existing = db.query(Company).filter(
        Company.gstin == request.gstin
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This GSTIN is already registered!"
        )

    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    try:
        # Save company to database
        company = Company(
            gstin=request.gstin,
            legal_name=request.legal_name,
            trade_name=(
                request.trade_name or request.legal_name
            ),
            gstin_status='Active'
        )
        db.add(company)
        db.commit()
        db.refresh(company)

        # Write audit log
        log = AuditLog(
            action_type="USER_REGISTERED",
            entity_type="company",
            entity_id=request.gstin,
            details=json.dumps({
                "legal_name": request.legal_name,
                "email": request.email,
                "phone": request.phone,
                "role": request.role,
                "state": request.state,
                "city": request.city
            }),
            ip_address="localhost"
        )
        db.add(log)
        db.commit()

        return {
            "message": "Registration successful! ✅",
            "gstin": request.gstin,
            "legal_name": request.legal_name,
            "role": request.role
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Registration error: {str(e)}"
        )


@router.get("/auth/verify")
def verify_auth(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    return {
        "valid": True,
        "gstin": payload.get("gstin"),
        "role": payload.get("role")
    }