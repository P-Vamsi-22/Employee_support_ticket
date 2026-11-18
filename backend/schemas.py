from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

CATEGORIES = ["Hardware", "Software", "Network", "Access", "Other"]
PRIORITIES = ["Low", "Medium", "High"]
STATUSES = ["Open", "In Progress", "Resolved", "Closed"]


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) > 100:
            raise ValueError("Title cannot exceed 100 characters")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(CATEGORIES)}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(PRIORITIES)}")
        return v


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Title cannot be empty")
            if len(v) > 100:
                raise ValueError("Title cannot exceed 100 characters")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Description cannot be empty")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(CATEGORIES)}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(PRIORITIES)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(STATUSES)}")
        return v


class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    created_by: int
    creator: UserOut
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def validate_body(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Comment body cannot be empty")
        return v


class CommentOut(BaseModel):
    id: int
    ticket_id: int
    author_id: int
    author: UserOut
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}
