from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DraftInvoice, AuditLog
from pydantic import BaseModel
from datetime import date
from typing import Optional
import json
import secrets

router = APIRouter()

class InvoiceCreate(BaseModel):
    invoice_number: str
    seller_gstin: str
    buyer_gstin: str
    buyer_phone: Optional[str] = None
    invoice_date: date
    total_amount: float
    cgst: Optional[float] = 0.0
    sgst: Optional[float] = 0.0
    igst: Optional[float] = 0.0

@router.post("/invoices/draft")
def create_draft_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(DraftInvoice).filter(
        DraftInvoice.invoice_number == invoice.invoice_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Invoice '{invoice.invoice_number}' already exists!"
        )

    try:
        # Generate unique share token
        share_token = secrets.token_urlsafe(16)

        db_invoice = DraftInvoice(
            invoice_number=invoice.invoice_number,
            seller_gstin=invoice.seller_gstin,
            buyer_gstin=invoice.buyer_gstin,
            invoice_date=invoice.invoice_date,
            total_amount=invoice.total_amount,
            cgst=invoice.cgst,
            sgst=invoice.sgst,
            igst=invoice.igst,
            status='draft',
            hsn_data=json.dumps({
                "share_token": share_token,
                "buyer_phone": invoice.buyer_phone or ""
            })
        )
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)

        # Write audit log
        log = AuditLog(
            action_type="INVOICE_CREATED",
            entity_type="invoice",
            entity_id=invoice.invoice_number,
            details=json.dumps({
                "seller": invoice.seller_gstin,
                "buyer": invoice.buyer_gstin,
                "amount": str(invoice.total_amount),
                "phone": invoice.buyer_phone or "not provided"
            }),
            ip_address="localhost"
        )
        db.add(log)
        db.commit()

        # Generate share link
        share_link = (
            f"http://localhost:3000/invoice/{share_token}"
        )

        # WhatsApp message
        whatsapp_message = (
            f"Hello! 👋\n\n"
            f"You have received a new GST Invoice.\n\n"
            f"📄 Invoice No: {invoice.invoice_number}\n"
            f"🏪 From: {invoice.seller_gstin}\n"
            f"💰 Amount: ₹{invoice.total_amount}\n"
            f"📅 Date: {invoice.invoice_date}\n\n"
            f"👆 Click the link below to view full details "
            f"and Accept or Reject:\n\n"
            f"{share_link}\n\n"
            f"Powered by CleariFy GST Platform ✅"
        )

        # Build WhatsApp link
        import urllib.parse
        encoded_msg = urllib.parse.quote(whatsapp_message)

        if invoice.buyer_phone:
            # Send to specific phone number
            phone = invoice.buyer_phone.replace(
                '+', ''
            ).replace(' ', '').replace('-', '')
            whatsapp_link = (
                f"https://wa.me/{phone}?text={encoded_msg}"
            )
        else:
            # Generic WhatsApp share
            whatsapp_link = (
                f"https://wa.me/?text={encoded_msg}"
            )

        return {
            "message": "Invoice saved ✅",
            "id": db_invoice.id,
            "invoice_number": db_invoice.invoice_number,
            "share_token": share_token,
            "share_link": share_link,
            "whatsapp_link": whatsapp_link,
            "whatsapp_message": whatsapp_message
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )

@router.get("/invoices/drafts/{seller_gstin}")
def get_drafts(
    seller_gstin: str,
    db: Session = Depends(get_db)
):
    try:
        invoices = db.query(DraftInvoice).filter(
            DraftInvoice.seller_gstin == seller_gstin
        ).all()
        return invoices
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/invoices/view/{share_token}")
def view_invoice_by_token(
    share_token: str,
    db: Session = Depends(get_db)
):
    invoices = db.query(DraftInvoice).all()
    found = None

    for inv in invoices:
        try:
            if inv.hsn_data:
                data = json.loads(inv.hsn_data)
                if data.get("share_token") == share_token:
                    found = inv
                    break
        except:
            continue

    if not found:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found or link expired"
        )

    return {
        "id": found.id,
        "invoice_number": found.invoice_number,
        "seller_gstin": found.seller_gstin,
        "buyer_gstin": found.buyer_gstin,
        "invoice_date": str(found.invoice_date),
        "total_amount": found.total_amount,
        "cgst": found.cgst,
        "sgst": found.sgst,
        "igst": found.igst,
        "status": found.status,
        "share_token": share_token
    }
