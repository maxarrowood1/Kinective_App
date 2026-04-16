package com.addressbook.routes

import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        contactRoutes()
    }
}

fun Route.contactRoutes() {
    // TODO: GET    /contacts        — list all contacts
    // TODO: POST   /contacts        — create a contact
    // TODO: GET    /contacts/{id}   — get contact by id
    // TODO: PUT    /contacts/{id}   — update contact by id
    // TODO: DELETE /contacts/{id}   — delete contact by id
}
