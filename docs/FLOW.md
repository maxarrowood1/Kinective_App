# Request Flow Diagrams

Full lifecycle diagrams for each CRUD operation across the Routes → Controller → Service → Validator → Repository → SQLite chain. Each diagram includes both the happy path and the primary failure paths.

---

## Create Contact

`POST /api/v1/contacts`

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Validator
    participant Repository
    participant SQLite

    Client->>Routes: POST /api/v1/contacts {firstName, lastName, email, ...}

    alt Malformed JSON
        Routes-->>Client: 400 Bad Request "Invalid request body"
    end

    Routes->>Controller: createContact(request)
    Controller->>Service: createContact(request)
    Service->>Validator: validate(CreateContactRequest)

    alt Blank firstName / lastName
        Validator-->>Service: throw IllegalArgumentException("firstName must not be blank")
        Service-->>Routes: IllegalArgumentException bubbles up
        Routes-->>Client: 400 Bad Request {error, message}
    else Invalid email format
        Validator-->>Service: throw IllegalArgumentException("email '...' is not a valid email address")
        Service-->>Routes: IllegalArgumentException bubbles up
        Routes-->>Client: 400 Bad Request {error, message}
    else Invalid phone characters
        Validator-->>Service: throw IllegalArgumentException("phone '...' contains invalid characters")
        Service-->>Routes: IllegalArgumentException bubbles up
        Routes-->>Client: 400 Bad Request {error, message}
    end

    Validator-->>Service: validation passed
    Service->>Repository: createContact(request)
    Repository->>SQLite: INSERT INTO contacts (...)

    alt Duplicate email (UNIQUE constraint violation)
        SQLite-->>Repository: SQLException
        Repository-->>Routes: exception bubbles up
        Routes-->>Client: 500 Internal Server Error
    end

    SQLite-->>Repository: inserted id
    Repository->>SQLite: SELECT * FROM contacts WHERE id = ?
    SQLite-->>Repository: ResultRow
    Repository-->>Service: ContactResponse
    Service-->>Controller: ContactResponse
    Controller-->>Routes: ContactResponse
    Routes-->>Client: 201 Created {id, firstName, lastName, email, phone, address, createdAt}
```

---

## Read All Contacts (with search & pagination)

`GET /api/v1/contacts?name=john&page=1&limit=10`

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Repository
    participant SQLite

    Client->>Routes: GET /api/v1/contacts?name=john&page=1&limit=10

    alt page < 1
        Routes-->>Client: 400 Bad Request "page must be >= 1"
    else limit < 1 or limit > 50
        Routes-->>Client: 400 Bad Request "limit must be between 1 and 50"
    end

    Routes->>Controller: getAllContacts(name="john", email=null, page=1, limit=10)
    Controller->>Service: getAllContacts(name, email, page, limit)
    Service->>Repository: getAllContacts(name, email, page, limit)

    Repository->>SQLite: SELECT COUNT(*) FROM contacts WHERE LOWER(first_name) LIKE '%john%' OR LOWER(last_name) LIKE '%john%'
    SQLite-->>Repository: totalCount = 3

    Repository->>SQLite: SELECT * FROM contacts WHERE ... LIMIT 10 OFFSET 0
    SQLite-->>Repository: List<ResultRow>

    Repository-->>Service: PaginatedContactResponse {data, page, limit, totalCount, totalPages}
    Service-->>Controller: PaginatedContactResponse
    Controller-->>Routes: PaginatedContactResponse
    Routes-->>Client: 200 OK {data: [...], page: 1, limit: 10, totalCount: 3, totalPages: 1}
```

---

## Read Single Contact

`GET /api/v1/contacts/{id}`

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Repository
    participant SQLite

    Client->>Routes: GET /api/v1/contacts/42

    alt id is not a valid integer
        Routes-->>Client: 400 Bad Request "id must be a valid integer"
    end

    Routes->>Controller: getContactById(42)
    Controller->>Service: getContactById(42)
    Service->>Repository: getContactById(42)

    Repository->>SQLite: SELECT * FROM contacts WHERE id = 42
    SQLite-->>Repository: ResultRow or null

    alt Contact not found (null)
        Repository-->>Service: null
        Service-->>Routes: throw NotFoundException("Contact with id 42 not found")
        Routes-->>Client: 404 Not Found {error, message}
    end

    Repository-->>Service: ContactResponse
    Service-->>Controller: ContactResponse
    Controller-->>Routes: ContactResponse
    Routes-->>Client: 200 OK {id, firstName, lastName, email, ...}
```

---

## Update Contact

`PUT /api/v1/contacts/{id}`

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Validator
    participant Repository
    participant SQLite

    Client->>Routes: PUT /api/v1/contacts/42 {email: "new@example.com"}

    alt id is not a valid integer
        Routes-->>Client: 400 Bad Request "id must be a valid integer"
    end

    alt Malformed JSON
        Routes-->>Client: 400 Bad Request "Invalid request body"
    end

    Routes->>Controller: updateContact(42, request)
    Controller->>Service: updateContact(42, request)
    Service->>Validator: validate(UpdateContactRequest)

    alt Any provided field fails validation
        Validator-->>Service: throw IllegalArgumentException(message)
        Service-->>Routes: IllegalArgumentException bubbles up
        Routes-->>Client: 400 Bad Request {error, message}
    end

    Validator-->>Service: validation passed
    Service->>Repository: updateContact(42, request)

    Repository->>SQLite: UPDATE contacts SET email = ? WHERE id = 42
    SQLite-->>Repository: rowsUpdated (0 or 1)

    alt rowsUpdated == 0 (id does not exist)
        Repository-->>Service: null
        Service-->>Routes: throw NotFoundException("Contact with id 42 not found")
        Routes-->>Client: 404 Not Found {error, message}
    end

    Repository->>SQLite: SELECT * FROM contacts WHERE id = 42
    SQLite-->>Repository: ResultRow
    Repository-->>Service: ContactResponse
    Service-->>Controller: ContactResponse
    Controller-->>Routes: ContactResponse
    Routes-->>Client: 200 OK {id, firstName, lastName, email, ...}
```

---

## Delete Contact

`DELETE /api/v1/contacts/{id}`

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Repository
    participant SQLite

    Client->>Routes: DELETE /api/v1/contacts/42

    alt id is not a valid integer
        Routes-->>Client: 400 Bad Request "id must be a valid integer"
    end

    Routes->>Controller: deleteContact(42)
    Controller->>Service: deleteContact(42)
    Service->>Repository: deleteContact(42)

    Repository->>SQLite: DELETE FROM contacts WHERE id = 42
    SQLite-->>Repository: rowsDeleted (0 or 1)

    alt rowsDeleted == 0 (id does not exist)
        Repository-->>Service: false
        Service-->>Routes: throw NotFoundException("Contact with id 42 not found")
        Routes-->>Client: 404 Not Found {error, message}
    end

    Repository-->>Service: true
    Service-->>Controller: (Unit)
    Controller-->>Routes: (Unit)
    Routes-->>Client: 204 No Content
```
