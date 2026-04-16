import { useState, useEffect, useCallback } from 'react'
import type { ContactResponse, CreateContactRequest, UpdateContactRequest } from '../types/contact'
import { getContacts, createContact, updateContact, deleteContact } from '../api/contacts'
import ContactModal from '../components/ContactModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { ToastType } from '../components/Toast'
import './ContactsPage.css'

interface Props {
  showToast: (message: string, type: ToastType) => void
}

const PAGE_LIMIT = 10

export default function ContactsPage({ showToast }: Props) {
  const [contacts, setContacts] = useState<ContactResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContactResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactResponse | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getContacts({
        name: debouncedSearch || undefined,
        page,
        limit: PAGE_LIMIT,
      })
      setContacts(result.data)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
    } catch {
      showToast('Failed to load contacts', 'error')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, showToast])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleCreate = async (data: CreateContactRequest) => {
    await createContact(data)
    showToast('Contact created successfully', 'success')
    setPage(1)
    fetchContacts()
  }

  const handleUpdate = async (data: CreateContactRequest) => {
    if (!editTarget) return
    const payload: UpdateContactRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
    }
    await updateContact(editTarget.id, payload)
    showToast('Contact updated successfully', 'success')
    fetchContacts()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteContact(deleteTarget.id)
      showToast('Contact deleted', 'success')
      setDeleteTarget(null)
      if (contacts.length === 1 && page > 1) setPage(p => p - 1)
      else fetchContacts()
    } catch {
      showToast('Failed to delete contact', 'error')
      setDeleteTarget(null)
    }
  }

  const openEdit = (c: ContactResponse) => { setEditTarget(c); setModalOpen(true) }
  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  return (
    <div className="contacts-page">
      <div className="contacts-page__header">
        <div>
          <h1 className="contacts-page__title">Contacts</h1>
          <p className="contacts-page__subtitle">
            {totalCount} {totalCount === 1 ? 'contact' : 'contacts'} total
          </p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>
          <span>＋</span> Add Contact
        </button>
      </div>

      <div className="contacts-page__toolbar">
        <div className="search-box">
          <span className="search-box__icon">⌕</span>
          <input
            className="search-box__input"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>
      </div>

      <div className="contacts-table-wrap">
        {loading ? (
          <div className="contacts-table__empty">
            <div className="spinner" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="contacts-table__empty">
            <div className="contacts-table__empty-icon">👤</div>
            <p>{debouncedSearch ? `No contacts matching "${debouncedSearch}"` : 'No contacts yet. Add one!'}</p>
          </div>
        ) : (
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Added</th>
                <th className="contacts-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="contacts-table__row">
                  <td>
                    <div className="contact-name">
                      <div className="contact-name__avatar">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <div className="contact-name__full">{c.firstName} {c.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="contacts-table__muted">{c.email}</td>
                  <td className="contacts-table__muted">{c.phone ?? '—'}</td>
                  <td className="contacts-table__muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="contact-actions">
                      <button className="contact-actions__btn contact-actions__btn--edit" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button className="contact-actions__btn contact-actions__btn--delete" onClick={() => setDeleteTarget(c)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination__btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Previous
          </button>
          <span className="pagination__info">Page {page} of {totalPages}</span>
          <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {modalOpen && (
        <ContactModal
          contact={editTarget}
          onSave={editTarget ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
