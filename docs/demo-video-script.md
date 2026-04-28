# Demo Video Script (5-7 Minutes)

## 1) Problem and Objective (30-45 sec)

- Introduce the problem: manual lab resource booking causes conflicts and weak tracking.
- State solution: full-stack role-based booking system with microservice backend.

## 2) Architecture Walkthrough (45-60 sec)

- Show project structure.
- Explain services:
  - auth-service
  - resource-service
  - booking-service
  - api-gateway
- Mention MongoDB for persistence.

## 3) API Documentation (30-45 sec)

- Open:
  - `http://localhost:4001/api-docs`
  - `http://localhost:4002/api-docs`
  - `http://localhost:4003/api-docs`
- Briefly show key endpoints and token usage.

## 4) Functional Demo by Roles (3-4 min)

1. Login as `admin`:
   - create/delete resource
2. Login as `student`:
   - view resources
   - create booking request
3. Login as `faculty`:
   - approve/reject pending request
   - mark approved request as returned
4. Show overlap prevention by trying conflicting booking.

## 5) AI Assistance Reflection (45-60 sec)

- Mention AI tools used (Cursor).
- Show one example prompt and modified output.
- Mention one issue from AI-generated code and how you fixed it.

## 6) Closing (15-20 sec)

- Highlight completed rubric components:
  - backend APIs + validation
  - frontend interactivity
  - integration
  - AI usage log and reflection
