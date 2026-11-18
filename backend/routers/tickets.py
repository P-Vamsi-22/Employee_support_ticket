from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
from models import User, Ticket
from schemas import TicketCreate, TicketUpdate, TicketOut
from dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=List[TicketOut])
def list_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Employees see only their own tickets.
    Support staff see all tickets.
    """
    if current_user.role == "support_staff":
        return db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    return (
        db.query(Ticket)
        .filter(Ticket.created_by == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        status="Open",
        created_by=current_user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = _get_accessible_ticket(ticket_id, current_user, db)
    return ticket


@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = _get_accessible_ticket(ticket_id, current_user, db)

    # BR-04: Closed tickets cannot be edited at all.
    if ticket.status == "Closed":
        raise HTTPException(status_code=400, detail="Closed tickets cannot be edited")

    # BR-01: Only support staff can change status.
    if payload.status is not None and current_user.role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only support staff can change ticket status",
        )

    # BR-05: Employee can only edit fields while status is Open.
    if current_user.role == "employee" and ticket.status != "Open":
        field_changes = {
            k: v
            for k, v in payload.model_dump(exclude_none=True).items()
            if k != "status"
        }
        if field_changes:
            raise HTTPException(
                status_code=400,
                detail="You can only edit your ticket while its status is Open",
            )

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    ticket.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ticket)
    return ticket


def _get_accessible_ticket(ticket_id: int, user: User, db: Session) -> Ticket:
    """Return ticket if it exists and the user is allowed to access it."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if user.role == "employee" and ticket.created_by != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket
