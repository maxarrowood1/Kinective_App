import axios from 'axios'
import type {
  ContactResponse,
  PaginatedContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../types/contact'

const client = axios.create({ baseURL: '/api/v1' })

interface GetContactsParams {
  name?: string
  email?: string
  page?: number
  limit?: number
}

export const getContacts = (params?: GetContactsParams) =>
  client.get<PaginatedContactResponse>('/contacts', { params }).then(r => r.data)

export const getContactById = (id: number) =>
  client.get<ContactResponse>(`/contacts/${id}`).then(r => r.data)

export const createContact = (data: CreateContactRequest) =>
  client.post<ContactResponse>('/contacts', data).then(r => r.data)

export const updateContact = (id: number, data: UpdateContactRequest) =>
  client.put<ContactResponse>(`/contacts/${id}`, data).then(r => r.data)

export const deleteContact = (id: number) =>
  client.delete(`/contacts/${id}`)
