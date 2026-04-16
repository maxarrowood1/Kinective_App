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

fun Application.configureRouting(controller: ContactController) {
    routing {
        route("/api/v1") {
            contactRoutes(controller)
        }
    }
}

private fun Route.contactRoutes(controller: ContactController) {
    post("/contacts") {
        runCatching { call.receive<CreateContactRequest>() }
            .onFailure { return@post call.respondError(HttpStatusCode.BadRequest, "Invalid request body") }
            .onSuccess { request ->
                runCatching { controller.createContact(request) }
                    .onSuccess { call.respond(HttpStatusCode.Created, it) }
                    .onFailure { e -> call.respondException(e) }
            }
    }

    get("/contacts") {
        runCatching { controller.getAllContacts() }
            .onSuccess { call.respond(HttpStatusCode.OK, it) }
            .onFailure { e -> call.respondException(e) }
    }

    get("/contacts/{id}") {
        val id = call.parseId() ?: return@get
        runCatching { controller.getContactById(id) }
            .onSuccess { call.respond(HttpStatusCode.OK, it) }
            .onFailure { e -> call.respondException(e) }
    }

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

    delete("/contacts/{id}") {
        val id = call.parseId() ?: return@delete
        runCatching { controller.deleteContact(id) }
            .onSuccess { call.respond(HttpStatusCode.NoContent) }
            .onFailure { e -> call.respondException(e) }
    }
}

private suspend fun ApplicationCall.parseId(): Int? {
    val id = parameters["id"]?.toIntOrNull()
    if (id == null) respondError(HttpStatusCode.BadRequest, "id must be a valid integer")
    return id
}

private suspend fun ApplicationCall.respondException(e: Throwable) = when (e) {
    is NotFoundException -> respondError(HttpStatusCode.NotFound, e.message ?: "Not found")
    is IllegalArgumentException -> respondError(HttpStatusCode.BadRequest, e.message ?: "Invalid input")
    else -> respondError(HttpStatusCode.InternalServerError, e.message ?: "An unexpected error occurred")
}

@Serializable
private data class RouteError(val error: String, val message: String)

private suspend fun ApplicationCall.respondError(status: HttpStatusCode, message: String) =
    respond(status, RouteError(status.description, message))
