# API Documentation

Base URLs:

- Auth service: `http://localhost:4001`
- Resource service: `http://localhost:4002`
- Booking service: `http://localhost:4003`

All protected routes require header:

`Authorization: Bearer <token>`

## Auth Service

### `POST /auth/signup`
Create a new user.

Body:
```json
{
  "name": "Manasa",
  "email": "manasa@example.com",
  "password": "secret123",
  "role": "student"
}
```

### `POST /auth/login`
Login existing user.

Body:
```json
{
  "email": "manasa@example.com",
  "password": "secret123"
}
```

### `GET /auth/me`
Return current user profile.

## Resource Service

### `GET /resources?category=&availableOnly=true&q=`
Get all resources with optional filters.

### `POST /resources` (admin)
Create a new resource.

### `PUT /resources/:id` (admin)
Update resource fields.

### `DELETE /resources/:id` (admin)
Delete resource.

## Booking Service

### `GET /bookings`
Get bookings.
- student: only own bookings
- faculty/admin: all bookings

### `POST /bookings` (student)
Create a booking request.

Body:
```json
{
  "resourceId": "66ef...",
  "resourceName": "DSLR Camera",
  "startTime": "2026-05-01T09:00:00.000Z",
  "endTime": "2026-05-01T11:00:00.000Z",
  "purpose": "Media club event recording"
}
```

### `PATCH /bookings/:id/decision` (faculty/admin)
Approve or reject pending request.

Body:
```json
{
  "decision": "approved"
}
```

### `PATCH /bookings/:id/return` (faculty/admin)
Mark approved booking as returned.
