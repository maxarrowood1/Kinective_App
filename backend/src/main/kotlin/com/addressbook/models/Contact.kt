package com.addressbook.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import java.time.LocalDateTime

object Contacts : Table("contacts") {
    val id = integer("id").autoIncrement()
    val firstName = varchar("first_name", 100)
    val lastName = varchar("last_name", 100)
    val email = varchar("email", 255).uniqueIndex()
    val phone = varchar("phone", 50).nullable()
    val address = text("address").nullable()
    val createdAt = varchar("created_at", 50).clientDefault { LocalDateTime.now().toString() }

    override val primaryKey = PrimaryKey(id)
}

@Serializable
data class ContactEntity(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String?,
    val address: String?,
    val createdAt: String
)
