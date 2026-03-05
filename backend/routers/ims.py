from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import ImsAction, AuditLog
from pydantic import BaseModel

router = APIRouter()

class ImsActionRequest(BaseModel):
    irn: str
    buyer_gstin: str
    action: str
    reason: str = None

@router.post("/ims/action")
def record_ims_action(
    payload: ImsActionRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Validate action is one of the 3 allowed values
    if payload.action not in ["accept", "reject", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    # Check if buyer already acted on this invoice
    existing = db.query(ImsAction).filter(
        ImsAction.irn == payload.irn,
        ImsAction.buyer_gstin == payload.buyer_gstin
    ).first()

    if existing:
        # Update existing action
        existing.action = payload.action
    else:
        # Create new action record
        new_action = ImsAction(
            irn=payload.irn,
            buyer_gstin=payload.buyer_gstin,
            action=payload.action
        )
        db.add(new_action)

    # Write legally required audit log
    log = AuditLog(
        action_type=f"IMS_{payload.action.upper()}",
        entity_id=payload.irn,
        details={"buyer_gstin": payload.buyer_gstin, "reason": payload.reason},
        ip_address=request.client.host
    )
    db.add(log)
    db.commit()

    return {
        "message": f"Invoice {payload.action}ed successfully",
        "irn": payload.irn
    }

@router.get("/ims/invoices/{buyer_gstin}")
def get_buyer_invoices(buyer_gstin: str, db: Session = Depends(get_db)):
    actions = db.query(ImsAction).filter(
        ImsAction.buyer_gstin == buyer_gstin
    ).all()
    return actions