# Kinective Address Book

A full-stack address book application built for the Kinective Back-End Developer Skills Assessment. Features a Kotlin/KTOR REST API with SQLite, a React + TypeScript frontend, full CRUD, search/filter, pagination, a read-only contact detail view, and a settings panel with theme, accent color, and font-size controls.

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
│       ├── components/
│       │   ├── ContactModal.tsx      # Create / edit form modal
│       │   ├── ContactDetailModal.tsx# Read-only contact detail view
│       │   ├── ConfirmDialog.tsx     # Delete confirmation dialog
│       │   ├── SettingsModal.tsx     # Theme, accent, font-size controls
│       │   ├── Toast.tsx             # Success / error notifications
│       │   ├── Snowstorm.tsx         # Easter egg — canvas snowstorm
│       │   └── Disco.tsx             # Easter egg — canvas disco ball
│       └── pages/ContactsPage.tsx  # Main contacts UI
└── docs/
    ├── DESIGN.md                   # Architecture, schema, API reference
    ├── FLOW.md                     # Mermaid sequence diagrams per operation
    └── FUTURE_ENHANCEMENTS.md      # Production readiness roadmap
```

---

## UI Features

### Contacts Table
The main view lists all contacts with columns for **Name**, **Email**, **Phone**, and **Address**. Results are paginated (10 per page) and filterable by name via the search bar.

### Contact Detail View
Clicking anywhere on a table row (except the edit/delete buttons) opens a read-only detail modal showing all contact fields — name, email, phone, address, and the formatted date the contact was added. An **Edit** button inside the modal transitions directly to the edit form.

### Create / Edit / Delete
- **New Contact** button opens a validated form modal. First name, last name, and a valid email are required; phone and address are optional.
- The pencil icon on any row opens the same form pre-filled for editing.
- The trash icon opens a confirmation dialog before deleting.

### Settings
The sidebar **Settings** button opens a panel with three controls:

| Setting | Options |
|---|---|
| Theme | Light / Dark |
| Accent Color | Six colour presets (blue, purple, green, orange, pink, red) |
| Font Size | Small / Medium / Large |

Preferences are persisted to `localStorage` and applied via CSS variables on the root element.

### Easter Eggs
Two canvas overlays are accessible from the bottom of the Settings panel:

| Button | Effect |
|---|---|
| ❄ Snowstorm | 120 snowflakes spawn gradually over ~4 seconds and drift down the screen. Color adapts to the active theme (white on dark, blue on light). Canvas unmounts automatically once all flakes exit the bottom. |
| 🪩 Disco | A disco ball drops from the top of the screen, hangs for ~5 seconds spinning with reflective tiles and sweeping light beams that reach the screen edges, then rises back up. Sparkle particles emit while the ball is hanging. |

Both effects are mutually exclusive — triggering one disables the other's button until the animation completes. All canvas overlays use `pointer-events: none` and leave zero side-effects on app state when done.

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
