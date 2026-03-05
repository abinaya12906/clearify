from fastapi import APIRouter, HTTPException
import httpx, os, re
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

@router.get("/verify-gstin/{gstin}")
async def verify_gstin(gstin: str):
    # Step 1: Check GSTIN format is valid
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    if not re.match(pattern, gstin):
        raise HTTPException(status_code=400, detail="Invalid GSTIN format")

    # Step 2: Call GSP API to check if GSTIN is Active
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{os.getenv('GSP_BASE_URL')}/commonapi/v1.1/search",
                params={"gstin": gstin},
                headers={
                    "clientid": os.getenv("GSP_CLIENT_ID"),
                    "clientsecret": os.getenv("GSP_CLIENT_SECRET")
                }
            )
        data = response.json()
        status = data.get("data", {}).get("sts", "Unknown")
        legal_name = data.get("data", {}).get("lgnm", "")

        return {
            "gstin": gstin,
            "status": status,
            "legal_name": legal_name,
            "valid": status == "Active"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))