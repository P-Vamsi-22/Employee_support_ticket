from database import SessionLocal, engine, Base
from models import User, Ticket, Comment


SAMPLE_USERS = [
    {"name": "Alice Johnson", "email": "alice@example.com", "role": "support_staff"},
    {"name": "Bob Smith",     "email": "bob@example.com",   "role": "employee"},
    {"name": "Carol White",   "email": "carol@example.com", "role": "employee"},
]

SAMPLE_TICKETS = [
    {
        "title": "Laptop not charging",
        "description": "My laptop stopped charging overnight. The battery icon shows no power source connected.",
        "category": "Hardware",
        "priority": "High",
        "status": "Open",
        "owner_email": "bob@example.com",
    },
    {
        "title": "Cannot log in to VPN",
        "description": "Getting an authentication error every time I try to connect to the company VPN from home.",
        "category": "Network",
        "priority": "High",
        "status": "In Progress",
        "owner_email": "carol@example.com",
    },
    {
        "title": "Need access to shared project folder",
        "description": "I need read and write access to the Q4 Marketing shared folder on the network drive.",
        "category": "Access",
        "priority": "Medium",
        "status": "Open",
        "owner_email": "bob@example.com",
    },
    {
        "title": "Excel keeps crashing on startup",
        "description": "Microsoft Excel crashes immediately when I open it. I have already tried restarting my machine.",
        "category": "Software",
        "priority": "Medium",
        "status": "Resolved",
        "owner_email": "carol@example.com",
    },
    {
        "title": "Request a second monitor",
        "description": "I would like a second monitor to improve my productivity. My desk has space for a dual-screen setup.",
        "category": "Hardware",
        "priority": "Low",
        "status": "Closed",
        "owner_email": "bob@example.com",
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # already seeded

        users = {}
        for u in SAMPLE_USERS:
            user = User(google_id=None, name=u["name"], email=u["email"], role=u["role"])
            db.add(user)
            db.flush()
            users[u["email"]] = user

        for t in SAMPLE_TICKETS:
            owner = users[t["owner_email"]]
            ticket = Ticket(
                title=t["title"],
                description=t["description"],
                category=t["category"],
                priority=t["priority"],
                status=t["status"],
                created_by=owner.id,
            )
            db.add(ticket)

        db.commit()
        print("Database seeded with sample data.")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
    finally:
        db.close()
