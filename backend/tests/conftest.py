import sys
import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend/ to path so imports work from tests/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, get_db
from models import User, Ticket, Comment
from auth import create_access_token

TEST_DATABASE_URL = "sqlite://"  # in-memory SQLite

test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def reset_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    from main import app
    app.dependency_overrides[get_db] = override_get_db

    # Patch seed so it doesn't touch the production DB during tests.
    with patch("main.seed"):
        with TestClient(app) as c:
            yield c

    app.dependency_overrides.clear()


def make_token(user_id: int) -> str:
    return create_access_token({"sub": str(user_id)})


def auth(user_id: int) -> dict:
    return {"Authorization": f"Bearer {make_token(user_id)}"}


# ── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def employee(db):
    user = User(name="Bob Smith", email="bob@test.com", role="employee", google_id="g-bob")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def employee2(db):
    user = User(name="Carol White", email="carol@test.com", role="employee", google_id="g-carol")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def staff(db):
    user = User(name="Alice Johnson", email="alice@test.com", role="support_staff", google_id="g-alice")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def open_ticket(db, employee):
    ticket = Ticket(
        title="Open ticket",
        description="Some issue",
        category="Hardware",
        priority="High",
        status="Open",
        created_by=employee.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@pytest.fixture
def inprogress_ticket(db, employee):
    ticket = Ticket(
        title="In progress ticket",
        description="Working on it",
        category="Network",
        priority="Medium",
        status="In Progress",
        created_by=employee.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@pytest.fixture
def closed_ticket(db, employee):
    ticket = Ticket(
        title="Closed ticket",
        description="Done",
        category="Software",
        priority="Low",
        status="Closed",
        created_by=employee.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
