package com.addressbook.services

import com.addressbook.models.ContactResponse
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest
import com.addressbook.repositories.ContactRepository
import com.addressbook.validation.ContactValidator

class NotFoundException(message: String) : Exception(message)

class ContactService(private val repository: ContactRepository) {

    fun createContact(request: CreateContactRequest): ContactResponse {
        ContactValidator.validate(request)
        return repository.createContact(request)
    }

    fun getContactById(id: Int): ContactResponse =
        repository.getContactById(id)
            ?: throw NotFoundException("Contact with id $id not found")

    fun getAllContacts(): List<ContactResponse> =
        repository.getAllContacts()

    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse {
        ContactValidator.validate(request)
        return repository.updateContact(id, request)
            ?: throw NotFoundException("Contact with id $id not found")
    }

    fun deleteContact(id: Int) {
        val deleted = repository.deleteContact(id)
        if (!deleted) throw NotFoundException("Contact with id $id not found")
    }
}
