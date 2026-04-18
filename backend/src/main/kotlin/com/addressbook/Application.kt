package com.addressbook

import com.addressbook.controllers.ContactController
import com.addressbook.repositories.ContactRepository
import com.addressbook.routes.configureRouting
import com.addressbook.services.ContactService
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()

    val controller = ContactController(ContactService(ContactRepository()))

    install(ContentNegotiation) {
        json(Json { prettyPrint = true; isLenient = false })
    }

    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
    }

    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("Bad Request", cause.message ?: "Invalid input"))
        }
        status(HttpStatusCode.NotFound) { call, _ ->
            call.respond(HttpStatusCode.NotFound, ErrorResponse("Not Found", "The requested resource was not found"))
        }
        exception<Throwable> { call, _ ->
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Internal Server Error", "An unexpected error occurred"))
        }
    }

    configureRouting(controller)
}

@Serializable
data class ErrorResponse(val error: String, val message: String)
