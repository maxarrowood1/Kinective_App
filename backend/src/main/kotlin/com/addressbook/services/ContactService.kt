package com.addressbook.services

import com.addressbook.models.ContactResponse
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.PaginatedContactResponse
import com.addressbook.models.UpdateContactRequest
import com.addressbook.repositories.ContactRepository
import com.addressbook.validation.ContactValidator

/** Thrown by [ContactService] when a requested contact id does not exist. */
class NotFoundException(message: String) : Exception(message)

class ContactService(private val repository: ContactRepository) {

    /**
     * Validates [request] then creates and returns the new contact.
     * @throws IllegalArgumentException if validation fails.
     */
    fun createContact(request: CreateContactRequest): ContactResponse {
        ContactValidator.validate(request)
        return repository.createContact(request)
    }

    /**
     * Returns the contact with the given [id].
     * @throws NotFoundException if no contact with [id] exists.
     */
    fun getContactById(id: Int): ContactResponse =
        repository.getContactById(id)
            ?: throw NotFoundException("Contact with id $id not found")

    /**
     * Returns a paginated, optionally-filtered list of contacts.
     *
     * @param name  Partial case-insensitive match on first or last name.
     * @param email Partial case-insensitive match on email.
     * @param page  1-indexed page number.
     * @param limit Results per page (1–50).
     */
    fun getAllContacts(
        name: String?,
        email: String?,
        page: Int,
        limit: Int
    ): PaginatedContactResponse = repository.getAllContacts(name, email, page, limit)

    /**
     * Validates [request] then applies partial updates to the contact with [id].
     * @throws IllegalArgumentException if validation fails.
     * @throws NotFoundException if no contact with [id] exists.
     */
    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse {
        ContactValidator.validate(request)
        return repository.updateContact(id, request)
            ?: throw NotFoundException("Contact with id $id not found")
    }

    /**
     * Deletes the contact with the given [id].
     * @throws NotFoundException if no contact with [id] exists.
     */
    fun deleteContact(id: Int) {
        val deleted = repository.deleteContact(id)
        if (!deleted) throw NotFoundException("Contact with id $id not found")
    }
}
