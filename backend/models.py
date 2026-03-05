from sqlalchemy import (
    Column, Integer, String, Float,
    Date, DateTime, Text, BigInteger,
    Enum, UniqueConstraint
)
from sqlalchemy.sql import func
from database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    gstin = Column(String(15), unique=True, nullable=False)
    legal_name = Column(String(255), nullable=False)
    trade_name = Column(String(255))
    gstin_status = Column(
        Enum('Active', 'Inactive', 'Cancelled'),
        default='Active'
    )
    created_at = Column(DateTime, default=func.now())

class DraftInvoice(Base):
    __tablename__ = "draft_invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(
        String(50), unique=True, nullable=False
    )
    seller_gstin = Column(String(15), nullable=False)
    buyer_gstin = Column(String(15), nullable=False)
    invoice_date = Column(Date, nullable=False)
    total_amount = Column(Float)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    hsn_data = Column(Text)
    status = Column(
        Enum('draft', 'pending_irn', 'irn_failed'),
        default='draft'
    )
    created_at = Column(DateTime, default=func.now())

class ReportedInvoice(Base):
    __tablename__ = "reported_invoices"
    id = Column(Integer, primary_key=True, index=True)
    draft_invoice_id = Column(Integer)
    irn = Column(String(64), unique=True, nullable=False)
    ack_no = Column(String(20))
    ack_date = Column(DateTime)
    signed_qr = Column(Text)
    signed_invoice = Column(Text)
    irp_status = Column(
        Enum('active', 'cancelled'), default='active'
    )
    reported_at = Column(DateTime, default=func.now())

class ImsAction(Base):
    __tablename__ = "ims_actions"
    id = Column(Integer, primary_key=True, index=True)
    irn = Column(String(64), nullable=False)
    buyer_gstin = Column(String(15), nullable=False)
    action = Column(
        Enum('accept', 'reject', 'pending'),
        nullable=False
    )
    action_reason = Column(Text)
    action_at = Column(DateTime, default=func.now())
    __table_args__ = (
        UniqueConstraint(
            'irn', 'buyer_gstin',
            name='uq_irn_buyer'
        ),
    )

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(BigInteger, primary_key=True, index=True)
    user_email = Column(String(255))
    action_type = Column(String(100))
    entity_type = Column(String(50))
    entity_id = Column(String(100))
    details = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=func.now())