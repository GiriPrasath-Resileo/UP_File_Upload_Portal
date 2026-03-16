# EduResource Portal — Uttar Pradesh

A full-stack monorepo for managing educational resource uploads across Uttar Pradesh schools.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | TailwindCSS v3 + Inter font |
| Forms | React Hook Form + Zod |
| State | Zustand (sessionStorage persist) |
| Server State | TanStack React Query v5 |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Storage | AWS S3 (aws-sdk v3) |
| Auth | JWT access+refresh in httpOnly cookies |
| File Upload | Multer (memory storage) |
| Excel | xlsx |
| Logging | Winston |
| Validation | Zod (shared schemas) |

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ installed and running locally
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

Create the database and user in psql:

```sql
CREATE USER edu_user WITH PASSWORD 'edu_pass';
CREATE DATABASE edu_portal OWNER edu_user;
GRANT ALL PRIVILEGES ON DATABASE edu_portal TO edu_user;
```

Then update `server/.env` with your connection string.

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start development servers

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- API health: http://localhost:5000/health

### Default credentials

| User ID | Password | Role |
|---|---|---|
| `admin` | `Admin@1234` | ADMIN |
| `uploader1` | `Upload@1234` | UPLOADER |

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 32+ char secret for access tokens |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens |
| `AWS_ACCESS_KEY_ID` | AWS credentials (fill in production) |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials (fill in production) |
| `S3_BUCKET_NAME` | Target S3 bucket |

### Client (`client/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_APP_STATE_LABEL` | Display name (e.g. Uttar Pradesh) |
| `VITE_MAX_FILE_MB` | Max PDF upload size in MB |

## Project Structure

```
edu-resource-portal/
├── shared/          # Shared Zod schemas (FE + BE)
├── client/          # React frontend
└── server/          # Express backend
```

## Features

- **Dashboard**: Stats cards + sortable/filterable uploads table
- **New Upload**: Modal form with cascading District → Block → School → UDISE auto-fill
- **Bulk Upload**: Excel template download, multi-PDF + Excel upload
- **School Master**: Manage school directory, import via Excel
- **Manage Users**: Admin CRUD for user accounts (Admin only)
- **JWT Auth**: httpOnly cookie-based access + refresh token rotation
- **S3 Storage**: Hierarchical path: `{state}/{district}/{block}/{place}/{board}/{school}/{medium}/{grade}/{subject}/{sampleType}/{gender}/{hand}/{fileNumber}.pdf`

## API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Uploads
- `GET  /api/uploads` — paginated list
- `GET  /api/uploads/stats`
- `GET  /api/uploads/bulk-template` — download Excel template
- `POST /api/uploads` — single upload
- `POST /api/uploads/bulk` — bulk upload (Excel + PDFs)
- `GET  /api/uploads/:id/url` — presigned S3 URL
- `DELETE /api/uploads/:id`

### Schools
- `GET  /api/schools` — paginated list
- `GET  /api/schools/districts`
- `GET  /api/schools/districts/:district/blocks`
- `GET  /api/schools/districts/:district/blocks/:block/schools`
- `POST /api/schools`
- `PUT  /api/schools/:id`
- `DELETE /api/schools/:id`
- `POST /api/schools/ingest` — import from Excel

### Admin
- `GET    /api/admin/users`
- `POST   /api/admin/users`
- `PUT    /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST   /api/admin/change-password`
