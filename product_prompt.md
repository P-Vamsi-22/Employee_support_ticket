
Act as a senior product analyst.

I want to build an Employee Support Ticket Management System.

PROBLEM

Employees need a centralized application to report IT issues, track ticket progress and communicate with support staff. Support staff need a dashboard to view and manage all reported issues.

USERS

1. Employee
- Submit a support ticket.
- View their own tickets.
- Update their own requests when permitted.
- Add comments to their tickets.
- Track ticket status.

2. Support Staff
- View all tickets.
- Change ticket status.
- Add comments to tickets.
- Review ticket details.

TICKET INFORMATION

Every ticket must contain:

- Title: required, maximum 100 characters.
- Description: required.
- Category: Hardware, Software, Network, Access, Other.
- Priority: Low, Medium, High.
- Status: Open, In Progress, Resolved, Closed.
- Created by: filled automatically.
- Created date: filled automatically.
- Last updated date: updated whenever the ticket changes.

BUSINESS RULES

1. Only support staff can change ticket status.
2. Employees can see only their own tickets.
3. Support staff can see all tickets.
4. Closed tickets cannot be edited, but comments can still be added.
5. Title and description cannot be empty.

SAMPLE DATA

Create these five sample tickets:

1. Laptop not charging
   Category: Hardware
   Priority: High
   Status: Open

2. Cannot log in to VPN
   Category: Network
   Priority: High
   Status: In Progress

3. Need access to the shared project folder
   Category: Access
   Priority: Medium
   Status: Open

4. Excel keeps crashing on startup
   Category: Software
   Priority: Medium
   Status: Resolved

5. Request a second monitor
   Category: Hardware
   Priority: Low
   Status: Closed

SCOPE

Build a simple demonstration application with:
- Employee dashboard
- Support staff dashboard
- Ticket creation
- Ticket listing and details
- Ticket editing where permitted
- Ticket status management
- Ticket comments
- Sample data

LIMITATIONS

- Use fictional users and sample data.
- Do not use real employee information.
- Do not include real credentials or secrets.
- Do not add unrelated features.
- Keep the application suitable for a small demonstration.

YOUR TASK

Do not write code.

First:
1. Summarize the product.
2. Identify the users and their permissions.
3. List the core features.
4. Identify ambiguous requirements.
5. Ask questions where clarification is needed.
6. List assumptions separately.

Wait for my approval before creating the software specification.




Read these files first:

- AGENTS.md
- docs/SPECIFICATION.md

Act as a senior software architect.

Create an implementation plan for the approved specification.

Suggested architecture:

Frontend:
- React + Vite
- Bootstrap
- Separate employee and support staff dashboards
- Reusable ticket and comment components

Backend:
- FastAPI
- Separate API routes, services and database models
- Role-based authorization
- Input validation

Database:
- SQLite
- Users table
- Tickets table
- Comments table

Plan the implementation in small phases:

Phase 1: Project structure and setup
Phase 2: Database models and sample data
Phase 3: Authentication and roles
Phase 4: Ticket creation API
Phase 5: Ticket listing and access control
Phase 6: Ticket editing and status management
Phase 7: Comments functionality
Phase 8: Frontend dashboards
Phase 9: Validation and error handling
Phase 10: Automated tests
Phase 11: Documentation and final review

For every phase, include:

1. Objective
2. Requirements and acceptance criteria covered
3. Files to create or modify
4. Dependencies on previous phases
5. Tests required
6. Expected result

Constraints:

- Do not write code.
- Do not change the approved specification.
- Do not introduce unnecessary libraries.
- Every planned task must link to at least one acceptance criterion.
- Split large tasks into smaller tasks that can reasonably be completed within one working day.

Save the plan as:
docs/IMPLEMENTATION_PLAN.md

Wait for my approval.
