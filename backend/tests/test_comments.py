from tests.conftest import auth
from models import Comment


class TestComments:
    def test_employee_can_comment_on_own_ticket(self, client, employee, open_ticket):
        response = client.post(f"/tickets/{open_ticket.id}/comments",
                               json={"body": "My comment"},
                               headers=auth(employee.id))
        assert response.status_code == 201
        assert response.json()["body"] == "My comment"
        assert response.json()["author_id"] == employee.id

    def test_employee_cannot_comment_on_other_ticket(self, client, employee2, open_ticket):
        response = client.post(f"/tickets/{open_ticket.id}/comments",
                               json={"body": "Sneaky"},
                               headers=auth(employee2.id))
        assert response.status_code == 403

    def test_staff_can_comment_on_any_ticket(self, client, staff, open_ticket):
        response = client.post(f"/tickets/{open_ticket.id}/comments",
                               json={"body": "Support note"},
                               headers=auth(staff.id))
        assert response.status_code == 201

    def test_comment_on_closed_ticket_is_allowed(self, client, employee, closed_ticket):
        """BR-04: comments remain allowed even on Closed tickets."""
        response = client.post(f"/tickets/{closed_ticket.id}/comments",
                               json={"body": "Late comment"},
                               headers=auth(employee.id))
        assert response.status_code == 201

    def test_empty_comment_rejected(self, client, employee, open_ticket):
        response = client.post(f"/tickets/{open_ticket.id}/comments",
                               json={"body": "   "},
                               headers=auth(employee.id))
        assert response.status_code == 422

    def test_list_comments_returns_oldest_first(self, client, employee, open_ticket, db):
        db.add(Comment(ticket_id=open_ticket.id, author_id=employee.id, body="First"))
        db.add(Comment(ticket_id=open_ticket.id, author_id=employee.id, body="Second"))
        db.commit()

        response = client.get(f"/tickets/{open_ticket.id}/comments",
                              headers=auth(employee.id))
        assert response.status_code == 200
        bodies = [c["body"] for c in response.json()]
        assert bodies == ["First", "Second"]

    def test_employee_cannot_list_other_tickets_comments(self, client, employee2, open_ticket, db):
        db.add(Comment(ticket_id=open_ticket.id, author_id=employee2.id, body="hidden"))
        db.commit()

        response = client.get(f"/tickets/{open_ticket.id}/comments",
                              headers=auth(employee2.id))
        assert response.status_code == 403
