package com.addressbook.validation

import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest

object ContactValidator {

    private val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private val phoneRegex = Regex("^[0-9 +()\\-]+$")

    fun validate(request: CreateContactRequest) {
        require(request.firstName.isNotBlank()) { "firstName must not be blank" }
        require(request.lastName.isNotBlank()) { "lastName must not be blank" }
        require(emailRegex.matches(request.email)) { "email '${request.email}' is not a valid email address" }
        request.phone?.let { phone ->
            require(phoneRegex.matches(phone)) { "phone '$phone' contains invalid characters" }
        }
        request.address?.let { address ->
            require(address.isNotBlank()) { "address must not be blank if provided" }
        }
    }

    fun validate(request: UpdateContactRequest) {
        request.firstName?.let { require(it.isNotBlank()) { "firstName must not be blank" } }
        request.lastName?.let { require(it.isNotBlank()) { "lastName must not be blank" } }
        request.email?.let { email ->
            require(emailRegex.matches(email)) { "email '$email' is not a valid email address" }
        }
        request.phone?.let { phone ->
            require(phoneRegex.matches(phone)) { "phone '$phone' contains invalid characters" }
        }
        request.address?.let { address ->
            require(address.isNotBlank()) { "address must not be blank if provided" }
        }
    }
}
