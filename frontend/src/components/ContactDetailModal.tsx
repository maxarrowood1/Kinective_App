import { useEffect } from 'react'
import type { ContactResponse } from '../types/contact'
import './ContactModal.css'
import './ContactDetailModal.css'

interface Props {
  contact: ContactResponse
  onEdit: (contact: ContactResponse) => void
  onClose: () => void
}

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 1l10 10M11 1 1 11"/>
  </svg>
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ContactDetailModal({ contact, onEdit, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Contact Details</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <div className="detail-header-section">
          <div className="detail-avatar">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <h3 className="detail-name">{contact.firstName} {contact.lastName}</h3>
        </div>

        <hr className="detail-divider" />

        <div className="detail-info">
          <div className="detail-info__row">
            <span className="detail-info__label">Email</span>
            <span className="detail-info__value">{contact.email}</span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">Phone</span>
            <span className={contact.phone ? 'detail-info__value' : 'detail-info__value detail-info__value--muted'}>
              {contact.phone || '—'}
            </span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">Address</span>
            <span className={contact.address ? 'detail-info__value' : 'detail-info__value detail-info__value--muted'}>
              {contact.address || '—'}
            </span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">Added</span>
            <span className="detail-info__value">{formatDate(contact.createdAt)}</span>
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
          <button type="button" className="btn btn--primary" onClick={() => onEdit(contact)}>Edit</button>
        </div>
      </div>
    </div>
  )
}
