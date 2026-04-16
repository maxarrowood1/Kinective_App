package com.addressbook.repositories

import com.addressbook.models.ContactResponse
import com.addressbook.models.Contacts
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

class ContactRepository {

    fun createContact(request: CreateContactRequest): ContactResponse = transaction {
        val id = Contacts.insert {
            it[firstName] = request.firstName
            it[lastName] = request.lastName
            it[email] = request.email
            it[phone] = request.phone
            it[address] = request.address
            it[createdAt] = LocalDateTime.now().toString()
        } get Contacts.id

        Contacts.select { Contacts.id eq id }.single().toContactResponse()
    }

    fun getContactById(id: Int): ContactResponse? = transaction {
        Contacts.select { Contacts.id eq id }.singleOrNull()?.toContactResponse()
    }

    fun getAllContacts(): List<ContactResponse> = transaction {
        Contacts.selectAll().map { it.toContactResponse() }
    }

    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse? = transaction {
        val updated = Contacts.update({ Contacts.id eq id }) {
            request.firstName?.let { v -> it[firstName] = v }
            request.lastName?.let { v -> it[lastName] = v }
            request.email?.let { v -> it[email] = v }
            request.phone?.let { v -> it[phone] = v }
            request.address?.let { v -> it[address] = v }
        }
        if (updated == 0) null
        else Contacts.select { Contacts.id eq id }.single().toContactResponse()
    }

    fun deleteContact(id: Int): Boolean = transaction {
        Contacts.deleteWhere { Contacts.id eq id } > 0
    }

    private fun ResultRow.toContactResponse() = ContactResponse(
        id = this[Contacts.id],
        firstName = this[Contacts.firstName],
        lastName = this[Contacts.lastName],
        email = this[Contacts.email],
        phone = this[Contacts.phone],
        address = this[Contacts.address],
        createdAt = this[Contacts.createdAt]
    )
}
