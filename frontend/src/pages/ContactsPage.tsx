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

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5"/><path d="m10.5 10.5 3 3"/>
  </svg>
)

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"/>
  </svg>
)

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
  </svg>
)

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 1l10 10M11 1 1 11"/>
  </svg>
)

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
      {/* ── Header bar ── */}
      <div className="contacts-page__header">
        <div>
          <h1 className="contacts-page__title">Contacts</h1>
          <p className="contacts-page__subtitle">
            {totalCount} {totalCount === 1 ? 'contact' : 'contacts'}
          </p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>
          + New Contact
        </button>
      </div>

      {/* ── Body ── */}
      <div className="contacts-page__body">
        {/* Search */}
        <div className="contacts-page__toolbar">
          <div className="search-box">
            <span className="search-box__icon"><IconSearch /></span>
            <input
              className="search-box__input"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-box__clear" onClick={() => setSearch('')}>
                <IconClose />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="contacts-table-wrap">
          {loading ? (
            <div className="contacts-table__empty">
              <div className="spinner" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="contacts-table__empty">
              <div className="contacts-table__empty-icon">👤</div>
              <p>{debouncedSearch ? `No results for "${debouncedSearch}"` : 'No contacts yet — add one!'}</p>
            </div>
          ) : (
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Added</th>
                  <th className="contacts-table__actions-col" />
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
                        <span className="contact-name__full">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="contacts-table__muted">{c.email}</td>
                    <td className="contacts-table__muted">{c.phone ?? '—'}</td>
                    <td className="contacts-table__muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="contact-actions">
                        <button
                          className="contact-actions__btn contact-actions__btn--edit"
                          onClick={() => openEdit(c)}
                          title="Edit"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="contact-actions__btn contact-actions__btn--delete"
                          onClick={() => setDeleteTarget(c)}
                          title="Delete"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination__btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            <span className="pagination__info">Page {page} of {totalPages}</span>
            <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>

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
