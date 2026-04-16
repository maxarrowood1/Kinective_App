export interface ContactResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  createdAt: string
}

export interface PaginatedContactResponse {
  data: ContactResponse[]
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export interface CreateContactRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
}

export interface UpdateContactRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
}
