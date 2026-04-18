package com.addressbook.validation

import com.addressbook.models.CreateContactRequest
import com.addressbook.models.UpdateContactRequest

object ContactValidator {

    private val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private val phoneRegex = Regex("^\\+?[0-9][0-9 ().\\-]{5,19}$")

    fun validate(request: CreateContactRequest) {
        require(request.firstName.isNotBlank()) { "firstName must not be blank" }
        require(request.firstName.length <= 100) { "firstName must not exceed 100 characters" }
        require(request.lastName.isNotBlank()) { "lastName must not be blank" }
        require(request.lastName.length <= 100) { "lastName must not exceed 100 characters" }
        require(emailRegex.matches(request.email)) { "email is not a valid email address" }
        require(request.email.length <= 254) { "email must not exceed 254 characters" }
        request.phone?.let { phone ->
            require(phoneRegex.matches(phone)) { "phone is not a valid phone number (6–20 digits, optional leading +, allowed separators: spaces, -, ., ())" }
        }
        request.address?.let { address ->
            require(address.isNotBlank()) { "address must not be blank if provided" }
            require(address.length <= 500) { "address must not exceed 500 characters" }
        }
    }

    fun validate(request: UpdateContactRequest) {
        request.firstName?.let {
            require(it.isNotBlank()) { "firstName must not be blank" }
            require(it.length <= 100) { "firstName must not exceed 100 characters" }
        }
        request.lastName?.let {
            require(it.isNotBlank()) { "lastName must not be blank" }
            require(it.length <= 100) { "lastName must not exceed 100 characters" }
        }
        request.email?.let { email ->
            require(emailRegex.matches(email)) { "email is not a valid email address" }
            require(email.length <= 254) { "email must not exceed 254 characters" }
        }
        request.phone?.let { phone ->
            require(phoneRegex.matches(phone)) { "phone is not a valid phone number (6–20 digits, optional leading +, allowed separators: spaces, -, ., ())" }
        }
        request.address?.let { address ->
            require(address.isNotBlank()) { "address must not be blank if provided" }
            require(address.length <= 500) { "address must not exceed 500 characters" }
        }
    }
}
