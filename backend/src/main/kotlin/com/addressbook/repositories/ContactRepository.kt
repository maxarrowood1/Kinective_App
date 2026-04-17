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

    /**
     * Inserts a new contact row and returns the fully-populated [ContactResponse].
     */
    fun createContact(request: CreateContactRequest): ContactResponse = transaction {
        val id = Contacts.insert {
            it[firstName] = request.firstName
            it[lastName] = request.lastName
            it[email] = request.email
            it[phone] = request.phone
            it[address] = request.address
            it[createdAt] = LocalDateTime.now().toString()
        } get Contacts.id

        Contacts.selectAll().where { Contacts.id eq id }.single().toContactResponse()
    }

    /**
     * Returns the contact with the given [id], or null if no such row exists.
     */
    fun getContactById(id: Int): ContactResponse? = transaction {
        Contacts.selectAll().where { Contacts.id eq id }.singleOrNull()?.toContactResponse()
    }

    /**
     * Returns a paginated, optionally-filtered page of contacts.
     *
     * @param name  Case-insensitive partial match against firstName OR lastName.
     * @param email Case-insensitive partial match against email.
     * @param page  1-indexed page number.
     * @param limit Maximum rows per page.
     * @return [PaginatedContactResponse] with data, totals, and pagination metadata.
     */
    fun getAllContacts(
        name: String?,
        email: String?,
        page: Int,
        limit: Int
    ): PaginatedContactResponse = transaction {
        // Local extension so each query gets its own fresh instance — avoids count() mutating the fetch query.
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

    /**
     * Applies partial updates from [request] to the contact with the given [id].
     * Returns the updated [ContactResponse], or null if the id does not exist.
     */
    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse? = transaction {
        val updated = Contacts.update({ Contacts.id eq id }) {
            request.firstName?.let { v -> it[firstName] = v }
            request.lastName?.let { v -> it[lastName] = v }
            request.email?.let { v -> it[email] = v }
            request.phone.let { v -> it[phone] = v }
            request.address.let { v -> it[address] = v }
        }
        if (updated == 0) null
        else Contacts.selectAll().where { Contacts.id eq id }.single().toContactResponse()
    }

    /**
     * Deletes the contact with the given [id].
     * @return true if a row was deleted, false if the id did not exist.
     */
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
