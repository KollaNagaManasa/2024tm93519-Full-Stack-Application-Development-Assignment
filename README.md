# Lab Slot Booking and Asset Usage Tracker

Full-stack assignment project for SE ZG503 (FSAD).

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express (microservice-style)
- Database: MongoDB (Mongoose)
- Auth: JWT token-based auth with role-based access

## Services

- `auth-service` (port `4001`): signup/login/profile
- `resource-service` (port `4002`): CRUD for lab resources
- `booking-service` (port `4003`): request/approve/reject/return bookings
- `api-gateway` (port `4000`): single entry point and docs proxy

## Quick Start

1. Start MongoDB locally on `mongodb://127.0.0.1:27017`.
2. Copy environment files:
   - `services/auth-service/.env.example` -> `services/auth-service/.env`
   - `services/resource-service/.env.example` -> `services/resource-service/.env`
   - `services/booking-service/.env.example` -> `services/booking-service/.env`
   - `services/api-gateway/.env.example` -> `services/api-gateway/.env`
   - `frontend/.env.example` -> `frontend/.env`
3. Setup backend services:
   - `cd services/auth-service && npm install && npm run dev`
   - `cd services/resource-service && npm install && npm run dev`
   - `cd services/booking-service && npm install && npm run dev`
   - `cd services/api-gateway && npm install && npm run dev`
4. (Optional) Seed demo data:
   - `node scripts/seed.js`
5. Setup frontend:
   - `cd frontend && npm install && npm run dev`
6. Open frontend URL shown by Vite (default `http://localhost:5173`).

## Swagger API Docs

- Auth: `http://localhost:4001/api-docs`
- Resources: `http://localhost:4002/api-docs`
- Bookings: `http://localhost:4003/api-docs`
- Via gateway:
  - `http://localhost:4000/docs/auth`
  - `http://localhost:4000/docs/resources`
  - `http://localhost:4000/docs/bookings`

## Demo Credentials

Create users with signup endpoint or UI:
- `student`
- `faculty`
- `admin`

Admins can create resources. Students can create booking requests. Faculty/Admin can approve or reject.

## Submission Artifacts

- API docs: `docs/api-endpoints.md`
- Architecture: `docs/architecture.md`
- Data model: `docs/erd.md`
- AI usage log template: `docs/ai-usage-log-template.md`
- Reflection template: `docs/reflection-template.md`
- Demo video script: `docs/demo-video-script.md`
