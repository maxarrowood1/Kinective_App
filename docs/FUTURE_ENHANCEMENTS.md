# Future Enhancements

The current implementation satisfies the assessment requirements with a clean CRUD API, search, pagination, and a React UI. The items below describe what would be needed to harden this into a production-grade application.

---

## 1. JWT Authentication & Role-Based Authorization

**What:** Protect all `/api/v1/*` endpoints behind JWT bearer tokens. Issue tokens via a `POST /auth/login` endpoint and verify them in a KTOR authentication plugin. Define roles (e.g. `ADMIN`, `USER`) stored on the token claims. Admins can delete any contact; regular users can only modify their own.

**Why it matters:** Without authentication, any client on the network can read, modify, or delete all contacts. JWT is stateless — the server doesn't need to store session state — making it horizontally scalable. KTOR has a first-party `ktor-server-auth-jwt` plugin that wires in with minimal boilerplate.

---

## 2. Contact Groups & Categories

**What:** Add a `groups` table with columns `(id, name, createdAt)` and a join table `contact_groups (contactId, groupId)`. Expose `GET /api/v1/groups` and allow contacts to be assigned to multiple groups. Filter the contacts list by `?groupId=`.

**Why it matters:** Real-world address books segment contacts (Family, Work, Clients). This also exercises many-to-many modelling with Exposed's DAO layer and demonstrates more complex query composition (JOINs in the repository layer).

---

## 3. Soft Deletes

**What:** Add an `is_deleted BOOLEAN NOT NULL DEFAULT 0` column to the `contacts` table. Replace `DELETE FROM contacts` with `UPDATE contacts SET is_deleted = 1`. Filter all read queries with `WHERE is_deleted = 0`. Expose a `GET /api/v1/contacts/trash` endpoint to view and restore soft-deleted contacts.

**Why it matters:** Hard deletes are irreversible. Soft deletes give users an "undo" window, support audit trails, and prevent accidental data loss. They also avoid foreign key violations if contacts are referenced by other tables (e.g. future audit log or group membership).

---

## 4. API Rate Limiting

**What:** Install a rate-limiting plugin (e.g. KTOR's `ktor-server-rate-limit` in 2.x, or a custom plugin using an in-memory token bucket) to cap requests per IP — e.g. 100 requests per minute for reads, 20 per minute for writes. Return `429 Too Many Requests` with a `Retry-After` header when the limit is exceeded.

**Why it matters:** Without rate limiting, the API is vulnerable to denial-of-service from a single client, accidental runaway loops in client code, and credential-stuffing against any future auth endpoint. Rate limiting is the first line of defence at the application layer before traffic even reaches business logic.

---

## 5. PostgreSQL Migration for Production

**What:** Replace SQLite with PostgreSQL. Change the JDBC driver dependency and connection string in `DatabaseFactory.kt` (see `docs/DESIGN.md` — Database Choice & Migration Path). Move the connection string and credentials to environment variables. Add a connection pool (HikariCP, which Exposed supports natively via `Database.connect(HikariDataSource(...))`).

**Why it matters:** SQLite serialises all writes — only one write can occur at a time across the whole database. Under concurrent load (even a handful of users), this becomes a bottleneck. PostgreSQL supports true concurrent writes, row-level locking, replication, and mature tooling for backups and migrations. HikariCP pools connections so the application isn't creating a new JDBC connection per request.

---

## 6. Audit Trail / Activity Log

**What:** Add an `audit_log` table: `(id, entityType, entityId, action, changedBy, changedAt, diff)`. After every successful create, update, or delete in the Service layer, insert an audit record capturing what changed and who changed it. Expose a `GET /api/v1/contacts/{id}/history` endpoint.

**Why it matters:** Audit logs answer "who changed what, and when?" — a compliance requirement in most enterprise environments. They also provide the data needed to implement the soft-delete restore feature above. Keeping the audit write in the Service layer (in the same transaction as the mutation) ensures the log is always consistent with the actual data.

---

## 7. Input Sanitization Against XSS

**What:** Although this API returns JSON (not HTML), stored XSS is still a risk if a future frontend renders field values as raw HTML. Sanitize `firstName`, `lastName`, and `address` fields on input to strip or escape HTML tags using a library such as OWASP's Java HTML Sanitizer (available on the JVM). Add a check in `ContactValidator` alongside the existing validation.

**Why it matters:** If the frontend ever renders contact data in a context where HTML is interpreted (e.g. a tooltip rendered via `innerHTML`, a PDF export, or an email template), unsanitized stored values become a persistent XSS vector. Sanitizing at the API boundary ensures every consumer of the data is protected regardless of rendering context.

---

## 8. Docker Containerization

**What:** Add a `Dockerfile` for the backend that builds the fat JAR with `./gradlew shadowJar` and runs it with `java -jar`. Add a multi-stage `Dockerfile` for the frontend (`npm run build` → serve with nginx). Add a `docker-compose.yml` at the project root that starts both services (and PostgreSQL once migrated) with a single `docker compose up`.

**Why it matters:** "Works on my machine" is eliminated. Any developer or CI runner with Docker installed can build and run the full stack in one command with no JDK or Node installation required. It also mirrors the deployment environment, making production incidents easier to reproduce locally. The compose file documents all environment variables (ports, DB credentials) as a form of living runbook.

---

## Summary Priority Matrix

| Enhancement | Effort | Impact | Priority |
|---|---|---|---|
| JWT Authentication | Medium | Critical — security | P0 |
| PostgreSQL + HikariCP | Low | Critical — scalability | P0 |
| Rate Limiting | Low | High — availability | P1 |
| Soft Deletes | Low | High — data safety | P1 |
| Docker Containerization | Low | High — operability | P1 |
| Input Sanitization | Low | Medium — security depth | P2 |
| Audit Trail | Medium | Medium — compliance | P2 |
| Contact Groups | High | Medium — features | P3 |
