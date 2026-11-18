import pytest
from tests.conftest import auth
from models import Ticket


# ── Listing ──────────────────────────────────────────────────────────────────

class TestListing:
    def test_employee_sees_only_own_tickets(self, client, employee, employee2, db):
        # Ticket owned by employee2
        t = Ticket(title="Other", description="d", category="Hardware",
                   priority="Low", status="Open", created_by=employee2.id)
        db.add(t)
        db.commit()

        response = client.get("/tickets", headers=auth(employee.id))
        assert response.status_code == 200
        assert response.json() == []

    def test_staff_sees_all_tickets(self, client, employee, employee2, staff, db):
        for owner in (employee, employee2):
            db.add(Ticket(title="T", description="d", category="Hardware",
                          priority="Low", status="Open", created_by=owner.id))
        db.commit()

        response = client.get("/tickets", headers=auth(staff.id))
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_unauthenticated_returns_403(self, client):
        assert client.get("/tickets").status_code == 403


# ── Creation ──────────────────────────────────────────────────────────────────

class TestCreation:
    VALID = {"title": "My issue", "description": "Details", "category": "Hardware", "priority": "High"}

    def test_employee_can_create_ticket(self, client, employee):
        response = client.post("/tickets", json=self.VALID, headers=auth(employee.id))
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "Open"
        assert data["created_by"] == employee.id

    def test_staff_can_create_ticket(self, client, staff):
        response = client.post("/tickets", json=self.VALID, headers=auth(staff.id))
        assert response.status_code == 201

    def test_empty_title_rejected(self, client, employee):
        payload = {**self.VALID, "title": "   "}
        assert client.post("/tickets", json=payload, headers=auth(employee.id)).status_code == 422

    def test_title_over_100_chars_rejected(self, client, employee):
        payload = {**self.VALID, "title": "x" * 101}
        assert client.post("/tickets", json=payload, headers=auth(employee.id)).status_code == 422

    def test_empty_description_rejected(self, client, employee):
        payload = {**self.VALID, "description": ""}
        assert client.post("/tickets", json=payload, headers=auth(employee.id)).status_code == 422

    def test_invalid_category_rejected(self, client, employee):
        payload = {**self.VALID, "category": "Plumbing"}
        assert client.post("/tickets", json=payload, headers=auth(employee.id)).status_code == 422

    def test_invalid_priority_rejected(self, client, employee):
        payload = {**self.VALID, "priority": "Critical"}
        assert client.post("/tickets", json=payload, headers=auth(employee.id)).status_code == 422


# ── Access control ────────────────────────────────────────────────────────────

class TestAccess:
    def test_employee_cannot_view_other_employees_ticket(self, client, employee2, open_ticket):
        # open_ticket belongs to employee; employee2 tries to access it
        assert client.get(f"/tickets/{open_ticket.id}", headers=auth(employee2.id)).status_code == 403

    def test_staff_can_view_any_ticket(self, client, staff, open_ticket):
        assert client.get(f"/tickets/{open_ticket.id}", headers=auth(staff.id)).status_code == 200

    def test_nonexistent_ticket_returns_404(self, client, employee):
        assert client.get("/tickets/9999", headers=auth(employee.id)).status_code == 404


# ── Editing ───────────────────────────────────────────────────────────────────

class TestEditing:
    def test_employee_can_edit_open_ticket(self, client, employee, open_ticket):
        response = client.patch(f"/tickets/{open_ticket.id}",
                                json={"title": "Updated title"},
                                headers=auth(employee.id))
        assert response.status_code == 200
        assert response.json()["title"] == "Updated title"

    def test_employee_cannot_edit_inprogress_ticket(self, client, employee, inprogress_ticket):
        response = client.patch(f"/tickets/{inprogress_ticket.id}",
                                json={"title": "Should fail"},
                                headers=auth(employee.id))
        assert response.status_code == 400

    def test_employee_cannot_edit_closed_ticket(self, client, employee, closed_ticket):
        response = client.patch(f"/tickets/{closed_ticket.id}",
                                json={"title": "Should fail"},
                                headers=auth(employee.id))
        assert response.status_code == 400

    def test_employee_cannot_change_status(self, client, employee, open_ticket):
        response = client.patch(f"/tickets/{open_ticket.id}",
                                json={"status": "In Progress"},
                                headers=auth(employee.id))
        assert response.status_code == 403

    def test_staff_can_change_status(self, client, staff, open_ticket):
        response = client.patch(f"/tickets/{open_ticket.id}",
                                json={"status": "In Progress"},
                                headers=auth(staff.id))
        assert response.status_code == 200
        assert response.json()["status"] == "In Progress"

    def test_staff_cannot_edit_closed_ticket(self, client, staff, closed_ticket):
        response = client.patch(f"/tickets/{closed_ticket.id}",
                                json={"title": "Should fail"},
                                headers=auth(staff.id))
        assert response.status_code == 400

    def test_employee_cannot_edit_another_employees_ticket(self, client, employee2, open_ticket):
        response = client.patch(f"/tickets/{open_ticket.id}",
                                json={"title": "Hacked"},
                                headers=auth(employee2.id))
        assert response.status_code == 403

    def test_staff_can_edit_open_ticket_fields(self, client, staff, open_ticket):
        response = client.patch(f"/tickets/{open_ticket.id}",
                                json={"priority": "Low", "category": "Software"},
                                headers=auth(staff.id))
        assert response.status_code == 200
        data = response.json()
        assert data["priority"] == "Low"
        assert data["category"] == "Software"
