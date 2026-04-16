package com.addressbook.controllers

import com.addressbook.models.ContactResponse
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.PaginatedContactResponse
import com.addressbook.models.UpdateContactRequest
import com.addressbook.services.ContactService

class ContactController(private val service: ContactService) {

    /** Creates a new contact and returns the persisted [ContactResponse]. */
    fun createContact(request: CreateContactRequest): ContactResponse =
        service.createContact(request)

    /** Returns the contact with the given [id]. */
    fun getContactById(id: Int): ContactResponse =
        service.getContactById(id)

    /**
     * Returns a paginated, optionally-filtered contact list.
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
    ): PaginatedContactResponse = service.getAllContacts(name, email, page, limit)

    /** Applies partial updates to the contact with [id] and returns the updated [ContactResponse]. */
    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse =
        service.updateContact(id, request)

    /** Deletes the contact with the given [id]. */
    fun deleteContact(id: Int) =
        service.deleteContact(id)
}
