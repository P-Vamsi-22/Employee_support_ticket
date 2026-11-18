# Software Specification — Employee Support Ticket Management System

**Version:** 1.0  
**Status:** Draft — Awaiting Approval  
**Date:** 2026-11-18  
**Stack:** React + Vite · FastAPI · SQLite · Bootstrap 5 · Google OAuth 2.0

---

## 1. Problem Statement

Employees have no centralized place to report IT issues, track progress, or communicate with
support staff. Support staff have no unified dashboard to view, triage, and manage incoming
requests. This application solves both problems in a single, role-aware web app.

---

## 2. User Roles

### 2.1 Employee
Any Google-authenticated user whose email is **not** listed in `SUPPORT_STAFF_EMAILS`.

**Permissions:**
- Submit a new support ticket.
- View only their own tickets.
- Edit Title, Description, Category and Priority of a ticket they own — **only while status is `Open`**.
- Add comments to any of their own tickets (including `Closed` ones).
- Track status changes on their tickets.

### 2.2 Support Staff
Any Google-authenticated user whose email **is** listed in `SUPPORT_STAFF_EMAILS` in the `.env` file.

**Permissions:**
- Do everything an Employee can (submit their own tickets, comment, etc.).
- View **all** tickets from all employees.
- Change the status of any ticket.
- Change the priority of any ticket.
- Add comments to any ticket.

---

## 3. Authentication

- Authentication is handled via **Google OAuth 2.0**.
- On first login, the backend checks the user's Google email against `SUPPORT_STAFF_EMAILS`.
- A user record is created automatically with the appropriate role (`employee` or `support_staff`).
- The backend issues a **JWT** (signed with `SECRET_KEY`) on successful login.
- All API routes require a valid JWT except `/auth/login` and `/auth/callback`.
- Credentials and secrets are stored in a `.env` file — never hardcoded.

### 3.1 `.env` Variables Required

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
SECRET_KEY=
SUPPORT_STAFF_EMAILS=alice@example.com,bob@example.com
```

---

## 4. Data Model

### 4.1 Users

| Field | Type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| google_id | TEXT | Unique, from Google profile |
| name | TEXT | From Google profile |
| email | TEXT | Unique, from Google profile |
| role | TEXT | `employee` or `support_staff` |
| created_at | DATETIME | Auto-set on creation |

### 4.2 Tickets

| Field | Type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| title | TEXT | Required, max 100 characters |
| description | TEXT | Required, non-empty |
| category | TEXT | One of: Hardware, Software, Network, Access, Other |
| priority | TEXT | One of: Low, Medium, High |
| status | TEXT | One of: Open, In Progress, Resolved, Closed |
| created_by | INTEGER | FK → Users.id |
| created_at | DATETIME | Auto-set on creation |
| updated_at | DATETIME | Auto-updated on every change |

### 4.3 Comments

| Field | Type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| ticket_id | INTEGER | FK → Tickets.id |
| author_id | INTEGER | FK → Users.id |
| body | TEXT | Required, non-empty |
| created_at | DATETIME | Auto-set on creation |

### 4.4 Entity Relationships

```
Users ──< Tickets    (one user creates many tickets)
Tickets ──< Comments (one ticket has many comments)
Users ──< Comments   (one user writes many comments)
```

---

## 5. Features

### F-01 — Google Login / Logout
- User clicks "Sign in with Google".
- Backend exchanges the authorization code for a Google profile.
- User record is created or retrieved; JWT is returned to the frontend.
- Logout clears the JWT from the client.

### F-02 — Submit a Ticket
- Authenticated user fills in: Title, Description, Category, Priority.
- Status defaults to `Open`; Created By and Created Date are auto-filled.
- Validation: Title required (max 100 chars), Description required.
- Both roles may submit tickets.

### F-03 — Employee Dashboard
- Lists all tickets belonging to the logged-in employee.
- Columns: Title, Category, Priority, Status, Created Date.
- Filter by Status and by Category (client-side dropdowns).
- Each row links to the Ticket Detail page.

### F-04 — Support Staff Dashboard
- Lists all tickets from all employees.
- Same columns and filters as Employee Dashboard.
- Each row links to the Ticket Detail page.

### F-05 — Ticket Detail View
- Displays all ticket fields.
- Shows the comment thread (oldest first).
- Shows who created the ticket and when.

### F-06 — Ticket Editing (Employee)
- Employee may edit Title, Description, Category and Priority.
- Editing is only allowed while status is `Open`.
- Form fields are disabled (read-only) at any other status.
- Backend enforces this rule independently of the UI.

### F-07 — Status Management (Support Staff Only)
- Support staff sees a status dropdown on the Ticket Detail page.
- Status flow: Open → In Progress → Resolved → Closed.
- Any status transition is allowed (staff may skip steps).
- Employees do not see the status control; API rejects employee status-change requests.

### F-08 — Priority Management (Support Staff)
- Support staff may change Priority on any ticket at any time.
- Employees may set Priority only at creation (F-02) while status is Open (F-06).

### F-09 — Comments
- Any authenticated user who can view a ticket may add a comment.
- Comment body is required and non-empty.
- Comments are immutable once posted — no edit or delete.
- Comments on `Closed` tickets are allowed.

### F-10 — Sample Data
On first run the database is seeded with:

**Fictional Users**

| Name | Email | Role |
|---|---|---|
| Alice Johnson | alice@example.com | support_staff |
| Bob Smith | bob@example.com | employee |
| Carol White | carol@example.com | employee |

**Five Sample Tickets** (created by employees above)

| # | Title | Category | Priority | Status | Owner |
|---|---|---|---|---|---|
| 1 | Laptop not charging | Hardware | High | Open | Bob |
| 2 | Cannot log in to VPN | Network | High | In Progress | Carol |
| 3 | Need access to shared project folder | Access | Medium | Open | Bob |
| 4 | Excel keeps crashing on startup | Software | Medium | Resolved | Carol |
| 5 | Request a second monitor | Hardware | Low | Closed | Bob |

---

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Only support staff may change a ticket's `status`. |
| BR-02 | Employees may view only their own tickets. |
| BR-03 | Support staff may view all tickets. |
| BR-04 | A ticket with status `Closed` is read-only. No field (title, description, category, priority, status) may be changed. Comments may still be added. |
| BR-05 | An employee may edit their own ticket's editable fields only while status is `Open`. |
| BR-06 | `Title` must not be empty and must not exceed 100 characters. |
| BR-07 | `Description` must not be empty. |
| BR-08 | `Comment body` must not be empty. |
| BR-09 | `Created By` and `Created Date` are set by the server and cannot be changed by any user. |
| BR-10 | `updated_at` is refreshed automatically on every ticket change. |
| BR-11 | Comments are immutable once posted. |
| BR-12 | Role is determined at first login by email match against `SUPPORT_STAFF_EMAILS`. |
| BR-13 | All authorization is enforced server-side regardless of UI state. |

---

## 7. API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| GET | `/auth/login` | Redirect to Google OAuth consent |
| GET | `/auth/callback` | Handle OAuth callback; return JWT |
| GET | `/auth/me` | Return current user profile |

### Tickets
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tickets` | Any | Employee: own tickets. Staff: all tickets. |
| POST | `/tickets` | Any | Create a new ticket. |
| GET | `/tickets/{id}` | Any | Get ticket detail (access-controlled). |
| PATCH | `/tickets/{id}` | Any | Update ticket fields (rules apply). |

### Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tickets/{id}/comments` | Any | List comments on a ticket. |
| POST | `/tickets/{id}/comments` | Any | Add a comment to a ticket. |

---

## 8. Validation Rules

| Field | Rule |
|---|---|
| `title` | Required. String. Max 100 characters. |
| `description` | Required. String. Non-empty after strip. |
| `category` | Required. Must be one of: Hardware, Software, Network, Access, Other. |
| `priority` | Required. Must be one of: Low, Medium, High. |
| `status` | Must be one of: Open, In Progress, Resolved, Closed. Only support_staff may set it. |
| `comment.body` | Required. String. Non-empty after strip. |

---

## 9. Authorization Matrix

| Action | Employee (own) | Employee (other) | Support Staff |
|---|---|---|---|
| View ticket | ✅ | ❌ 403 | ✅ |
| Create ticket | ✅ | — | ✅ |
| Edit title/desc/cat/pri (Open) | ✅ | ❌ 403 | ✅ |
| Edit title/desc/cat/pri (non-Open) | ❌ 400 | ❌ 403 | ✅ |
| Change status | ❌ 403 | ❌ 403 | ✅ |
| Add comment | ✅ | ❌ 403 | ✅ |
| View comments | ✅ | ❌ 403 | ✅ |

---

## 10. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | No secrets hardcoded; all credentials in `.env` (never committed). |
| NFR-02 | Backend routes, services, models and schemas in separate files. |
| NFR-03 | Frontend split into reusable components (TicketCard, CommentThread, etc.). |
| NFR-04 | Every important business rule has at least one Pytest test. |
| NFR-05 | App runs locally with `sqlite` only — no external database required. |
| NFR-06 | No features outside the defined scope (no email notifications, attachments, etc.). |

---

## 11. Out of Scope

- Email notifications
- File attachments
- Pagination (demo dataset is small)
- Ticket re-opening (Closed is a terminal state)
- Admin role / user management UI
- Multi-tenancy / department isolation
- Real employee data or credentials

---

## 12. Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-01 | An employee can sign in with Google and is shown only their own tickets. |
| AC-02 | A support staff member can sign in with Google and sees all tickets. |
| AC-03 | An employee cannot change ticket status — UI hides the control; API returns 403. |
| AC-04 | An employee cannot view or modify another employee's ticket — API returns 403. |
| AC-05 | A `Closed` ticket's editable fields are disabled in the UI and rejected by the API. |
| AC-06 | Comments can be added to `Closed` tickets. |
| AC-07 | Title > 100 characters is rejected with a validation error. |
| AC-08 | Empty title or description is rejected with a validation error. |
| AC-09 | All 5 sample tickets appear on the support staff dashboard on first run. |
| AC-10 | Logout clears the session; protected pages redirect to login. |
| AC-11 | Support staff can change a ticket's status and the change is reflected immediately. |
| AC-12 | A new user signing in with Google is auto-registered with the correct role. |

---

*End of Specification v1.0*
