# Design Document — Kinective Address Book

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [MVC Pattern](#mvc-pattern)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Database Choice & Migration Path](#database-choice--migration-path)
6. [Data Validation Rules](#data-validation-rules)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  React + TypeScript (Vite, port 5173)                          │
│  src/api/contacts.ts  ──axios──►  /api/v1/*  (proxied)         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/JSON  (proxy: vite → :8080)
┌───────────────────────────▼─────────────────────────────────────┐
│  KTOR Backend (Netty, port 8080)                                │
│                                                                 │
│  Plugins                                                        │
│  ├── ContentNegotiation  (kotlinx JSON)                        │
│  ├── CORS               (anyHost for dev)                      │
│  └── StatusPages        (400 / 404 / 500 handlers)             │
│                                                                 │
│  Routes → Controller → Service → Repository                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Exposed DSL (JDBC)
┌───────────────────────────▼─────────────────────────────────────┐
│  SQLite  (addressbook.db — file on disk)                        │
│  Table: contacts                                                │
└─────────────────────────────────────────────────────────────────┘
```

The frontend never talks directly to the database. All data access is gated through the REST API. The Vite dev server proxies `/api` requests to `localhost:8080`, so no CORS configuration is needed in production if the two are co-hosted.

---

## MVC Pattern

This project follows a strict four-layer MVC variant: **Routes → Controller → Service → Repository**. Business logic lives exclusively in the Service layer; all other layers are deliberately thin.

| Layer | File | Responsibility |
|---|---|---|
| **Routes** | `routes/ContactRoutes.kt` | Parse HTTP request, extract path/query params, call controller, map exceptions to HTTP status codes, respond. No business logic. |
| **Controller** | `controllers/ContactController.kt` | Thin delegate — receives typed arguments from Routes, calls Service, returns typed result. Exists to decouple HTTP concerns from business logic. |
| **Service** | `services/ContactService.kt` | All business logic: calls `ContactValidator`, throws `NotFoundException` vs `IllegalArgumentException` to distinguish 404 from 400, orchestrates repository calls. |
| **Repository** | `repositories/ContactRepository.kt` | All database I/O using Exposed DSL. Maps `ResultRow → ContactResponse`. Never throws HTTP-aware exceptions. |
| **Validator** | `validation/ContactValidator.kt` | Stateless object with overloads for `CreateContactRequest` and `UpdateContactRequest`. Uses Kotlin `require()` which throws `IllegalArgumentException` on failure. |

```
HTTP Request
    │
    ▼
ContactRoutes          ← parse params, map exceptions to HTTP codes
    │
    ▼
ContactController      ← thin delegate
    │
    ▼
ContactService         ← validate, orchestrate, throw domain exceptions
    │         │
    │         ▼
    │    ContactValidator   ← throws IllegalArgumentException (→ 400)
    │
    ▼
ContactRepository      ← Exposed DSL, returns null on not-found
    │
    ▼
SQLite
```

---

## Database Schema

### `contacts` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Surrogate key |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE INDEX | Enforces no duplicate contacts |
| `phone` | VARCHAR(50) | NULLABLE | |
| `address` | TEXT | NULLABLE | |
| `created_at` | VARCHAR(50) | NOT NULL | ISO-8601 string, set at insert via `clientDefault { LocalDateTime.now().toString() }` |

SchemaUtils.create(Contacts) is called at application startup (idempotent — does nothing if the table already exists).

#### DDL equivalent
```sql
CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER     PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(50),
    address    TEXT,
    created_at VARCHAR(50)  NOT NULL
);
```

---

## API Reference

Base path: `/api/v1`

All request and response bodies are JSON. All error responses share the shape:
```json
{ "error": "Not Found", "message": "Contact with id 42 not found" }
```

### Endpoints

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/contacts` | 200 | List contacts (paginated + filterable) |
| `POST` | `/contacts` | 201 | Create a new contact |
| `GET` | `/contacts/{id}` | 200 | Get contact by ID |
| `PUT` | `/contacts/{id}` | 200 | Update contact by ID |
| `DELETE` | `/contacts/{id}` | 204 | Delete contact by ID |

### `GET /contacts` — Query Parameters

| Param | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `name` | string | — | optional | Case-insensitive partial match on `firstName` OR `lastName` |
| `email` | string | — | optional | Case-insensitive partial match on `email` |
| `page` | integer | 1 | ≥ 1 | 1-indexed page number |
| `limit` | integer | 10 | 1–50 | Results per page |

**Response — `PaginatedContactResponse`**
```json
{
  "data": [ { ...ContactResponse } ],
  "page": 1,
  "limit": 10,
  "totalCount": 42,
  "totalPages": 5
}
```

### `POST /contacts` — Request Body (`CreateContactRequest`)
```json
{
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane@example.com",
  "phone":     "+1 (555) 000-0000",
  "address":   "123 Main St"
}
```
`phone` and `address` are optional.

### `PUT /contacts/{id}` — Request Body (`UpdateContactRequest`)
All fields are optional — only supplied fields are updated (partial update).
```json
{
  "email": "jane.doe@example.com"
}
```

### `ContactResponse` shape
```json
{
  "id":        1,
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane@example.com",
  "phone":     "+1 (555) 000-0000",
  "address":   "123 Main St",
  "createdAt": "2026-04-16T12:00:00.000000"
}
```

---

## Database Choice & Migration Path

### Why SQLite

SQLite was chosen for this assessment because:

- **Zero setup** — no server process, credentials, or installation required. The database is a single file (`addressbook.db`) created automatically on first run.
- **Portable** — the entire database is committed alongside the code if needed, making it trivially reproducible.
- **Sufficient for assessment scale** — SQLite handles concurrent reads well and serializes writes, which is fine for a single-user address book.

### Swapping to PostgreSQL for Production

Because all database access goes through Exposed's DSL (no raw SQL), migrating requires only two changes:

**1. `build.gradle.kts`** — swap the driver:
```kotlin
// Remove:
implementation("org.xerial:sqlite-jdbc:3.45.3.0")
// Add:
implementation("org.postgresql:postgresql:42.7.3")
```

**2. `DatabaseFactory.kt`** — swap the connection string:
```kotlin
// SQLite (current):
Database.connect("jdbc:sqlite:addressbook.db", driver = "org.sqlite.JDBC")

// PostgreSQL (production):
Database.connect(
    url      = "jdbc:postgresql://localhost:5432/addressbook",
    driver   = "org.postgresql.Driver",
    user     = System.getenv("DB_USER"),
    password = System.getenv("DB_PASSWORD")
)
```

The Exposed DSL, schema creation, and all queries remain unchanged. The `createdAt` column can be migrated from `VARCHAR` to a native `TIMESTAMP` type using Exposed's `datetime` column and the `exposed-kotlin-datetime` extension — a one-line change in `Contact.kt`.

---

## Data Validation Rules

Validation is applied at two layers: **frontend** (immediate feedback) and **backend** (authoritative). The backend rules are the source of truth.

| Field | Rule | Frontend | Backend |
|---|---|---|---|
| `firstName` | Not blank | ✓ | ✓ `require(!isBlank)` |
| `lastName` | Not blank | ✓ | ✓ `require(!isBlank)` |
| `email` | Matches `^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$` | ✓ | ✓ |
| `email` | Unique in database | — | ✓ SQLite UNIQUE constraint |
| `phone` | If provided: only digits, spaces, `+`, `-`, `(`, `)` | ✓ | ✓ |
| `address` | If provided: not blank | ✓ | ✓ |
| `page` | ≥ 1 | — | ✓ route guard, returns 400 |
| `limit` | 1–50 | — | ✓ route guard, returns 400 |

**Error codes**

| Scenario | HTTP Status |
|---|---|
| Validation failure (`firstName` blank, invalid email, etc.) | 400 Bad Request |
| Contact not found by ID | 404 Not Found |
| Malformed JSON body | 400 Bad Request |
| Non-integer `{id}` path param | 400 Bad Request |
| Unexpected server error | 500 Internal Server Error |
