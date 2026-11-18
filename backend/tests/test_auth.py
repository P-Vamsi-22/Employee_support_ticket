from tests.conftest import auth


def test_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 403


def test_me_returns_current_user(client, employee):
    response = client.get("/auth/me", headers=auth(employee.id))
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "bob@test.com"
    assert data["role"] == "employee"


def test_me_with_invalid_token_returns_401(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert response.status_code == 401
