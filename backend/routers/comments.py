from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Ticket, Comment
from schemas import CommentCreate, CommentOut
from dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/tickets", tags=["comments"])


@router.get("/{ticket_id}/comments", response_model=List[CommentOut])
def list_comments(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = _get_accessible_ticket(ticket_id, current_user, db)
    return (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket.id)
        .order_by(Comment.created_at.asc())
        .all()
    )


@router.post("/{ticket_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    ticket_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # BR-04: comments are allowed even on Closed tickets.
    ticket = _get_accessible_ticket(ticket_id, current_user, db)

    comment = Comment(
        ticket_id=ticket.id,
        author_id=current_user.id,
        body=payload.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def _get_accessible_ticket(ticket_id: int, user: User, db: Session) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if user.role == "employee" and ticket.created_by != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket
