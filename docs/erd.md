# Data Model (ERD Style)

## Collections

### `users`
- `_id` (ObjectId, PK)
- `name` (String)
- `email` (String, unique)
- `passwordHash` (String)
- `role` (Enum: `student`, `faculty`, `admin`)
- `createdAt`, `updatedAt`

### `resources`
- `_id` (ObjectId, PK)
- `name` (String)
- `category` (String)
- `description` (String)
- `quantity` (Number)
- `availableCount` (Number)
- `condition` (String)
- `createdAt`, `updatedAt`

### `bookings`
- `_id` (ObjectId, PK)
- `resourceId` (String, reference-like field)
- `resourceName` (String)
- `requestedBy` (String, user id)
- `requestedByEmail` (String)
- `startTime` (Date)
- `endTime` (Date)
- `purpose` (String)
- `status` (Enum: `pending`, `approved`, `rejected`, `returned`)
- `reviewedBy` (String)
- `createdAt`, `updatedAt`

## Relationships

- One `user` (student) -> many `bookings`
- One `resource` -> many `bookings`
- One `faculty/admin` can review many `bookings`

## Validation Rules

- `startTime < endTime`
- No overlap allowed for approved bookings of same `resourceId`
- Role-based write permissions enforced at API layer
