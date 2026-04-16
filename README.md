# Kinective Address Book

A full-stack address book application built for the Kinective Back-End Developer Skills Assessment. Features a Kotlin/KTOR REST API with SQLite, a React + TypeScript frontend, full CRUD, search/filter, and pagination.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Kotlin, KTOR (Netty), Gradle |
| ORM | JetBrains Exposed (DSL) |
| Database | SQLite (via `sqlite-jdbc`) |
| Serialization | `kotlinx.serialization` |
| Frontend | React 18, TypeScript, Vite |
| HTTP Client | Axios |

---

## Prerequisites

| Tool | Minimum Version |
|---|---|
| JDK | 17 |
| Node.js | 18 |
| npm | 9 |

> The Gradle wrapper (`./gradlew`) is included — no separate Gradle installation is needed.

---

## Setup & Run

### 1. Clone the repository
```bash
git clone <repository-url>
cd Kinective_App
```

### 2. Start the backend
```bash
cd backend
./gradlew run
```

The server starts on **http://localhost:8080**. On first run, `addressbook.db` is created automatically in the `backend/` directory.

### 3. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

The UI is available at **http://localhost:5173**. Vite proxies all `/api` requests to `localhost:8080`, so no CORS configuration is needed during development.

---

## Project Structure

```
Kinective_App/
├── backend/                        # KTOR application
│   ├── build.gradle.kts
│   └── src/main/kotlin/com/addressbook/
│       ├── Application.kt          # Server entry point, plugins
│       ├── DatabaseFactory.kt      # SQLite init, schema creation
│       ├── models/                 # Exposed table objects + DTOs
│       ├── routes/                 # HTTP routing (ContactRoutes.kt)
│       ├── controllers/            # Thin delegates to service
│       ├── services/               # Business logic + domain exceptions
│       ├── repositories/           # Exposed DSL database access
│       └── validation/             # ContactValidator (create + update)
├── frontend/                       # React + TypeScript (Vite)
│   ├── vite.config.ts              # /api proxy to :8080
│   └── src/
│       ├── api/contacts.ts         # All axios API calls
│       ├── types/contact.ts        # TypeScript interfaces
│       ├── components/             # Toast, ContactModal, ConfirmDialog
│       └── pages/ContactsPage.tsx  # Main contacts UI
└── docs/
    ├── DESIGN.md                   # Architecture, schema, API reference
    ├── FLOW.md                     # Mermaid sequence diagrams per operation
    └── FUTURE_ENHANCEMENTS.md      # Production readiness roadmap
```

---

## API Reference

Base URL: `http://localhost:8080/api/v1`

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/contacts` | 200 | List contacts (paginated, filterable) |
| `POST` | `/contacts` | 201 | Create a new contact |
| `GET` | `/contacts/{id}` | 200 | Get contact by ID |
| `PUT` | `/contacts/{id}` | 200 | Update contact by ID |
| `DELETE` | `/contacts/{id}` | 204 | Delete contact by ID |

### GET /contacts — Query Parameters

| Param | Default | Description |
|---|---|---|
| `name` | — | Case-insensitive partial match on first or last name |
| `email` | — | Case-insensitive partial match on email |
| `page` | `1` | Page number (1-indexed) |
| `limit` | `10` | Results per page (max 50) |

### Example Requests

```bash
# List all contacts
curl http://localhost:8080/api/v1/contacts

# Search by name, paginated
curl "http://localhost:8080/api/v1/contacts?name=john&page=1&limit=5"

# Create a contact
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","phone":"+1 555 0100"}'

# Update a contact
curl -X PUT http://localhost:8080/api/v1/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com"}'

# Delete a contact
curl -X DELETE http://localhost:8080/api/v1/contacts/1
```

### Error Response Shape

All errors return JSON:
```json
{
  "error": "Not Found",
  "message": "Contact with id 42 not found"
}
```

| Scenario | Status |
|---|---|
| Validation failure | 400 |
| Invalid / missing ID | 400 |
| Contact not found | 404 |
| Server error | 500 |

---

## Configuration

### Backend (`backend/src/main/resources/application.conf`)

| Setting | Default | Description |
|---|---|---|
| `ktor.deployment.port` | `8080` | HTTP port |

### Database

The SQLite database file is created at `backend/addressbook.db` on first run. No credentials or additional setup required.

To migrate to PostgreSQL for production, see [docs/DESIGN.md — Database Choice & Migration Path](docs/DESIGN.md#database-choice--migration-path).

---

## Documentation

| Document | Description |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | Architecture overview, MVC breakdown, database schema, full API reference, validation rules |
| [docs/FLOW.md](docs/FLOW.md) | Mermaid sequence diagrams for Create, Read, Update, Delete — including failure paths |
| [docs/FUTURE_ENHANCEMENTS.md](docs/FUTURE_ENHANCEMENTS.md) | Production readiness roadmap: auth, rate limiting, PostgreSQL, Docker, audit logs, and more |

---

## Architecture Overview

```
Browser (React + Vite :5173)
        │  axios  /api/v1/*
        ▼  (Vite proxy)
KTOR Backend (:8080)
  Routes → Controller → Service → Repository
                              │
                         Exposed DSL
                              │
                           SQLite
                       (addressbook.db)
```

The MVC chain enforces strict separation: Routes handle HTTP concerns, Controllers are thin delegates, Services own all business logic, Repositories own all database I/O.
