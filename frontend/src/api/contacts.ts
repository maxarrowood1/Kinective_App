import axios from 'axios'
import type {
  ContactResponse,
  PaginatedContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../types/contact'

const client = axios.create({ baseURL: '/api/v1' })

// Re-throw all error responses so callers receive the original AxiosError
// (with .response.data.message) rather than a swallowed generic error.
client.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

interface GetContactsParams {
  name?: string
  email?: string
  page?: number
  limit?: number
}

/** Fetches a paginated, optionally-filtered list of contacts. */
export const getContacts = (params?: GetContactsParams) =>
  client.get<PaginatedContactResponse>('/contacts', { params }).then(r => r.data)

/** Fetches a single contact by id. */
export const getContactById = (id: number) =>
  client.get<ContactResponse>(`/contacts/${id}`).then(r => r.data)

/** Creates a new contact and returns the persisted ContactResponse. */
export const createContact = (data: CreateContactRequest) =>
  client.post<ContactResponse>('/contacts', data).then(r => r.data)

/** Partially updates a contact by id and returns the updated ContactResponse. */
export const updateContact = (id: number, data: UpdateContactRequest) =>
  client.put<ContactResponse>(`/contacts/${id}`, data).then(r => r.data)

/** Deletes a contact by id. Resolves on 204, rejects on any error. */
export const deleteContact = (id: number) =>
  client.delete(`/contacts/${id}`)
