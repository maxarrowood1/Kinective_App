package com.addressbook.repositories

import com.addressbook.models.ContactResponse
import com.addressbook.models.Contacts
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.PaginatedContactResponse
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

    fun getAllContacts(
        name: String?,
        email: String?,
        page: Int,
        limit: Int
    ): PaginatedContactResponse = transaction {
        // Build filters as a local function so each query gets its own fresh instance
        fun Query.applyFilters(): Query = apply {
            name?.lowercase()?.let { n ->
                andWhere {
                    (Contacts.firstName.lowerCase() like "%$n%") or
                    (Contacts.lastName.lowerCase() like "%$n%")
                }
            }
            email?.lowercase()?.let { e ->
                andWhere { Contacts.email.lowerCase() like "%$e%" }
            }
        }

        // Separate query for count — avoids mutating the fetch query
        val totalCount = Contacts.selectAll().applyFilters().count().toInt()
        val totalPages = Math.ceil(totalCount.toDouble() / limit).toInt().coerceAtLeast(1)
        val offset = ((page - 1) * limit).toLong()

        val data = Contacts.selectAll()
            .applyFilters()
            .limit(limit, offset)
            .map { it.toContactResponse() }

        PaginatedContactResponse(
            data = data,
            page = page,
            limit = limit,
            totalCount = totalCount,
            totalPages = totalPages
        )
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
