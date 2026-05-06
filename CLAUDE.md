# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY: Code Quality Principles

**Before writing or editing any code, you MUST invoke the `solid-dry-kiss` skill.**

Every code change — new features, bug fixes, refactors, hotfixes — must comply with SOLID, DRY, KISS, YAGNI, Law of Demeter, and Composition over Inheritance. No exceptions.

## Project Overview

Full-stack task management app (to-do list) for the Essentia Group technical challenge. Built as a monorepo with two workspaces:

- `backend/` — Node.js + TypeScript REST API (Express, MySQL via TypeORM, optional MongoDB + JWT)
- `frontend/` — Angular SPA consuming the backend API

## Architecture

### Backend (`backend/`)

RESTful API with the following layer structure:

```
src/
  controllers/   # Route handlers — thin, delegate to services
  services/      # Business logic — all data access goes through here
  entities/      # TypeORM entities (MySQL models)
  routes/        # Express router definitions
  middlewares/   # Auth (JWT), error handling
  config/        # DB connections (MySQL + optionally MongoDB)
  app.ts         # Express app setup
  server.ts      # Entry point
```

Key decisions:
- TypeORM 0.3.28 for MySQL — `synchronize: false` always; use `migration:generate` + `migration:run` for all schema changes
- `emitDecoratorMetadata: true` is required in `tsconfig.json` — TypeORM's reflection system cannot discover column types without it
- Custom repositories use `dataSource.getRepository(Entity).extend({})` — `@EntityRepository` decorator was removed in TypeORM 0.3+
- Request validation via `class-validator` + `class-transformer` (`whitelist: true` blocks mass-assignment)
- Express 5.2.1 — async errors propagate natively; no `asyncHandler` wrapper needed
- Express middleware order is load-bearing: `cors → json → public routes → authMiddleware → protected routes → 404 → 4-arg error handler`
- JWT via `jsonwebtoken` 9: always pass `{ algorithm: 'HS256', expiresIn: '24h' }` to `sign()` and `{ algorithms: ['HS256'] }` to `verify()`
- MongoDB (Mongoose 9) for supplementary task metadata only — `activityLog: [{ action, timestamp, detail }]` is the strongest dual-DB justification
- All routes prefixed with `/api/v1`
- Dual-DB writes use compensating transaction pattern: commit MySQL first, then MongoDB; roll back MySQL if MongoDB fails
- Three-layer architecture enforced: Router → Controller → Service → Repository — controllers never import repositories directly

### Frontend (`frontend/`)

Angular standalone components with the following structure:

```
src/app/
  core/
    services/      # TaskService, AuthService — HTTP calls to backend
    guards/        # AuthGuard — protects routes requiring login
    interceptors/  # JWT interceptor — attaches token to every request
    models/        # TypeScript interfaces (Task, User)
  features/
    tasks/         # Task list, task form, task item components
    auth/          # Login and register pages
  shared/          # Reusable UI components
```

Key decisions:
- Angular 21 standalone components + `signal()` with `OnPush` change detection (NgModules and BehaviorSubject are legacy)
- `HttpInterceptorFn` (functional, registered via `withInterceptors`) — not class-based interceptor
- `CanActivateFn` with `inject()` for route guards — not class-based guard
- JWT token stored in `localStorage` — functional `AuthInterceptor` attaches it to every request
- Angular Router: `/tasks` (default, guarded), `/login`, `/register`
- Reactive forms for task creation/editing
- `toSignal()` bridges HttpClient Observables to the signal boundary

## Commands

### Backend

```bash
cd backend
npm install
npm run dev          # Start with ts-node-dev (hot reload)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output
npm run migration:run    # Run pending TypeORM migrations
npm run migration:generate -- src/migrations/MigrationName  # Generate from entity changes
npm test             # Run Jest tests
npm test -- --testPathPattern=tasks.service  # Run a single test file
```

### Frontend

```bash
cd frontend
npm install
ng serve             # Dev server at http://localhost:4200
ng build             # Production build to dist/
ng test              # Run Vitest unit tests (Angular 21 default — Karma is deprecated)
ng lint              # ESLint
ng generate component features/tasks/components/task-item  # Scaffold component
```

### Docker (full stack)

```bash
docker compose up -d          # Start MySQL (and optionally MongoDB)
docker compose down -v        # Tear down with volumes
```

## Environment Variables

### Backend (`.env`)

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=secret
DB_NAME=techx_tasks
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d

# Optional (extra challenge)
MONGO_URI=mongodb://localhost:27017/techx_tasks
```

### Frontend (`environment.ts`)

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```

## Task Data Model

```ts
// MySQL entity
{
  id: number (PK, auto-increment)
  title: string (not null)
  description?: string
  completed: boolean (default false)
  userId?: number (FK → users.id, null if auth not implemented)
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/tasks` | List all tasks (filtered by auth user if JWT enabled) |
| POST | `/api/v1/tasks` | Create task |
| PUT | `/api/v1/tasks/:id` | Full update |
| PATCH | `/api/v1/tasks/:id/toggle` | Toggle completed |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| POST | `/api/v1/auth/register` | Register user (extra) |
| POST | `/api/v1/auth/login` | Login, returns JWT (extra) |

## Evaluation Criteria (from challenge)

Code is evaluated on: functionality, code structure/modularity/legibility, and correct use of required technologies. Implement the optional extras (JWT auth + MongoDB) to maximize score.

## GSD Workflow

This project uses the GSD planning system. Planning artifacts live in `.planning/` (git-ignored).

```
.planning/
  PROJECT.md        # Project context and decisions
  REQUIREMENTS.md   # 27 v1 requirements with REQ-IDs
  ROADMAP.md        # 4-phase execution roadmap
  STATE.md          # Current position and session continuity
  config.json       # Workflow settings (YOLO, coarse, sequential)
  research/         # Domain research from initialization
```

**Workflow commands:**
```bash
/gsd-plan-phase 1     # Plan Phase 1: Backend Foundation
/gsd-execute-phase 1  # Execute Phase 1 plans
/gsd-progress         # Check current progress
/gsd-discuss-phase N  # Discuss approach before planning a phase
```

**Phase order (must respect dependencies):**
1. **Backend Foundation** — Express + TypeORM + MySQL + Docker Compose + task CRUD API
2. **Angular Frontend** — Angular app + task UI components + API integration
3. **Auth & MongoDB** — JWT register/login + protected routes + Angular interceptor/guards + MongoDB metadata
4. **Polish & Docs** — Error handling + UI polish + README for submission

**Submission branch:** `git checkout -b agsouza` (per challenge instructions)
