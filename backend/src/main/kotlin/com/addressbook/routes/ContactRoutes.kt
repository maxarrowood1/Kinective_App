package com.addressbook.routes

import com.addressbook.controllers.ContactController
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest
import com.addressbook.services.NotFoundException
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

/**
 * Registers all contact routes under `/api/v1` and wires them to [controller].
 */
fun Application.configureRouting(controller: ContactController) {
    routing {
        route("/api/v1") {
            contactRoutes(controller)
        }
    }
}

private fun Route.contactRoutes(controller: ContactController) {
    /** POST /api/v1/contacts — create a contact, responds 201 with [ContactResponse]. */
    post("/contacts") {
        runCatching { call.receive<CreateContactRequest>() }
            .onFailure { return@post call.respondError(HttpStatusCode.BadRequest, "Invalid request body") }
            .onSuccess { request ->
                runCatching { controller.createContact(request) }
                    .onSuccess { call.respond(HttpStatusCode.Created, it) }
                    .onFailure { e -> call.respondException(e) }
            }
    }

    /** GET /api/v1/contacts — list contacts; supports ?name, ?email, ?page, ?limit. */
    get("/contacts") {
        val name = call.request.queryParameters["name"]?.takeIf { it.isNotBlank() }
        val email = call.request.queryParameters["email"]?.takeIf { it.isNotBlank() }

        val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
        val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 10

        if (page < 1)
            return@get call.respondError(HttpStatusCode.BadRequest, "page must be >= 1")
        if (limit < 1 || limit > 50)
            return@get call.respondError(HttpStatusCode.BadRequest, "limit must be between 1 and 50")

        runCatching { controller.getAllContacts(name, email, page, limit) }
            .onSuccess { call.respond(HttpStatusCode.OK, it) }
            .onFailure { e -> call.respondException(e) }
    }

    /** GET /api/v1/contacts/{id} — fetch a single contact by id. */
    get("/contacts/{id}") {
        val id = call.parseId() ?: return@get
        runCatching { controller.getContactById(id) }
            .onSuccess { call.respond(HttpStatusCode.OK, it) }
            .onFailure { e -> call.respondException(e) }
    }

    /** PUT /api/v1/contacts/{id} — partially update a contact, responds 200 with updated [ContactResponse]. */
    put("/contacts/{id}") {
        val id = call.parseId() ?: return@put
        runCatching { call.receive<UpdateContactRequest>() }
            .onFailure { return@put call.respondError(HttpStatusCode.BadRequest, "Invalid request body") }
            .onSuccess { request ->
                runCatching { controller.updateContact(id, request) }
                    .onSuccess { call.respond(HttpStatusCode.OK, it) }
                    .onFailure { e -> call.respondException(e) }
            }
    }

    /** DELETE /api/v1/contacts/{id} — delete a contact, responds 204 No Content. */
    delete("/contacts/{id}") {
        val id = call.parseId() ?: return@delete
        runCatching { controller.deleteContact(id) }
            .onSuccess { call.respond(HttpStatusCode.NoContent) }
            .onFailure { e -> call.respondException(e) }
    }
}

/** Parses the `{id}` path parameter as an Int, responding 400 and returning null on failure. */
private suspend fun ApplicationCall.parseId(): Int? {
    val id = parameters["id"]?.toIntOrNull()
    if (id == null) respondError(HttpStatusCode.BadRequest, "id must be a valid integer")
    return id
}

/** Maps domain exceptions to appropriate HTTP status codes and responds with a JSON error body. */
private suspend fun ApplicationCall.respondException(e: Throwable) = when (e) {
    is NotFoundException -> respondError(HttpStatusCode.NotFound, e.message ?: "Not found")
    is IllegalArgumentException -> respondError(HttpStatusCode.BadRequest, e.message ?: "Invalid input")
    else -> respondError(HttpStatusCode.InternalServerError, "An unexpected error occurred")
}

@Serializable
private data class RouteError(val error: String, val message: String)

private suspend fun ApplicationCall.respondError(status: HttpStatusCode, message: String) =
    respond(status, RouteError(status.description, message))
