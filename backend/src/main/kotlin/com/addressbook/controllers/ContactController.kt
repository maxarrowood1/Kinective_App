package com.addressbook.controllers

import com.addressbook.models.ContactResponse
import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest
import com.addressbook.services.ContactService

class ContactController(private val service: ContactService) {

    fun createContact(request: CreateContactRequest): ContactResponse =
        service.createContact(request)

    fun getContactById(id: Int): ContactResponse =
        service.getContactById(id)

    fun getAllContacts(): List<ContactResponse> =
        service.getAllContacts()

    fun updateContact(id: Int, request: UpdateContactRequest): ContactResponse =
        service.updateContact(id, request)

    fun deleteContact(id: Int) =
        service.deleteContact(id)
}
