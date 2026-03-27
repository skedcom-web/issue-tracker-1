# vThink Project & Issue Tracker — Backend

NestJS + Prisma + PostgreSQL · Modular Monolith · JWT Auth

---

## Prerequisites

- Node.js 24.14.0 (use `nvm use` in this directory)
- PostgreSQL 15+ running locally
- npm

---

## First-Time Setup

### 1. Install Node version
```bash
nvm install 24.14.0
nvm use
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```
Edit `.env` and set your PostgreSQL connection string:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vthink_tracker?schema=public"
JWT_SECRET="any-long-random-string-here"
CORS_ALLOWED_ORIGINS="http://localhost:5173"
PORT=3001
```

### 4. Create the database
In pgAdmin or psql:
```sql
CREATE DATABASE vthink_tracker;
```

### 5. Generate Prisma client
```bash
npm run db:generate
```

### 6. Run migrations
```bash
npm run db:migrate
```
When prompted for a migration name, type: `init`

### 7. Seed the database (creates default admin)
```bash
npm run db:seed
```

### 8. Start development server
```bash
npm run start:dev
```

API is now running at: **http://localhost:3001/api/v1**

---

## Default Login
- Email: `admin@company.com`
- Password: `Admin@123`

---

## Available Commands

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production build |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed default data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

---

## API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login (email or employee number) |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |

### Projects
| Method | URL | Roles |
|---|---|---|
| GET | `/api/v1/projects` | All |
| GET | `/api/v1/projects/:id` | All |
| POST | `/api/v1/projects` | Admin, Manager |
| PUT | `/api/v1/projects/:id` | Admin, Manager |
| DELETE | `/api/v1/projects/:id` | Admin |

### Issues
| Method | URL | Description |
|---|---|---|
| GET | `/api/v1/issues` | List with filters |
| GET | `/api/v1/issues/stats` | Dashboard stats |
| GET | `/api/v1/issues/:id` | Issue detail |
| POST | `/api/v1/issues` | Create issue |
| PATCH | `/api/v1/issues/:id` | Update issue |
| POST | `/api/v1/issues/:id/comments` | Add comment |

### Employees
| Method | URL | Roles |
|---|---|---|
| GET | `/api/v1/employees` | All |
| POST | `/api/v1/employees` | Admin, Manager |
| POST | `/api/v1/employees/bulk` | Admin, Manager |
| PATCH | `/api/v1/employees/:id` | Admin, Manager |
| DELETE | `/api/v1/employees/:id` | Admin, Manager |

### Users
| Method | URL | Roles |
|---|---|---|
| GET | `/api/v1/users` | Admin, Manager |
| POST | `/api/v1/users` | Admin, Manager |
| PATCH | `/api/v1/users/:id` | Admin, Manager |
| POST | `/api/v1/users/:id/reset-password` | Admin, Manager |
| DELETE | `/api/v1/users/:id` | Admin |

### Dashboard
| Method | URL | Description |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Stats with optional ?projectId= |

---

## Architecture

```
src/
├── main.ts                          # Bootstrap, CORS, validation
├── app.module.ts                    # Root module
├── infrastructure/
│   └── database/prisma/             # PrismaService (global)
├── common/
│   ├── filters/                     # GlobalExceptionFilter (W3C trace in errors)
│   ├── guards/                      # JwtAuthGuard, RbacGuard
│   ├── middleware/                  # TraceMiddleware (W3C traceparent)
│   └── types/                       # ApiResponse helpers
└── modules/
    ├── auth/                        # JWT login, me, change-password
    ├── projects/                    # Project CRUD + defect number generation
    ├── issues/                      # Full issue lifecycle + comments + stats
    ├── employees/                   # Employee CRUD + bulk import
    ├── users/                       # User management + password reset
    └── dashboard/                   # Aggregated stats
```
