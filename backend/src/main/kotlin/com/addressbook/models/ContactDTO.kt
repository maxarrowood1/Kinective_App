package com.addressbook.models

import kotlinx.serialization.Serializable

@Serializable
data class CreateContactRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String? = null,
    val address: String? = null
)

@Serializable
data class UpdateContactRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val address: String? = null
)

@Serializable
data class ContactResponse(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String?,
    val address: String?,
    val createdAt: String
)

@Serializable
data class PaginatedContactResponse(
    val data: List<ContactResponse>,
    val page: Int,
    val limit: Int,
    val totalCount: Int,
    val totalPages: Int
)
