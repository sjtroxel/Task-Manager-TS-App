---
paths:
  - "task-manager-ts/src/models/**/*.ts"
  - "task-manager-ts/src/config/**/*.ts"
---

# Database Rules

## ODM
- Mongoose 9.1.5 with MongoDB Atlas (cloud)
- Connection in `src/config/db.ts` using `MONGO_URI` environment variable
- No local MongoDB instance — always connects to Atlas

## Schemas

### User (`models/userModel.ts`)
- Fields: `name` (string), `email` (string, unique), `password` (string, bcrypt hashed)
- Timestamps enabled (`createdAt`, `updatedAt`)
- Interface: `IUser`

### Task (`models/taskModel.ts`)
- Fields: `user` (ObjectId ref to User), `title` (string), `description` (string), `isCompleted` (boolean)
- Timestamps enabled
- Interface: `ITask`
- Always filter tasks by `user` field to enforce ownership

## Conventions
- Interface prefix: `IUser`, `ITask`
- Always use `{ timestamps: true }` on new schemas
- Never expose password field in API responses
- Scope all task queries to the authenticated user: `{ user: req.user._id }`

## No Migrations
- Mongoose handles schema at the application level — no migration files
- No seed scripts exist
- Schema changes are made by modifying model files directly
