# Kinective Address Book — Claude Code Context

## Project Overview
KTOR backend + React frontend address book app built for a Kinective internship assessment.

## Stack
- Backend: Kotlin + KTOR, JDK 17, Gradle
- Database: SQLite via Exposed ORM
- Frontend: React + TypeScript (Vite)

## Project Structure
- /backend — KTOR application
- /frontend — React application

## Architecture
Follow strict MVC layering: Routes → Controller → Service → Repository
Never put business logic in routes or controllers directly.

## Conventions
- Use data classes for all models
- Use @Serializable on all DTOs
- Return proper HTTP status codes on all endpoints
- All errors go through StatusPages plugin
- Kotlin idiomatic style: null safety, scope functions, extension functions where appropriate

## Current Phase
Phase 4 — React frontend