import { useState, useEffect } from 'react'
import type { ContactResponse, CreateContactRequest } from '../types/contact'
import './ContactModal.css'

interface Props {
  contact?: ContactResponse | null
  onSave: (data: CreateContactRequest) => Promise<void>
  onClose: () => void
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
}

const EMAIL_RE = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PHONE_RE = /^[0-9 +()\-]+$/

function validate(f: FormState): FormErrors {
  const e: FormErrors = {}
  if (!f.firstName.trim()) e.firstName = 'First name is required'
  if (!f.lastName.trim()) e.lastName = 'Last name is required'
  if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email address'
  if (f.phone && !PHONE_RE.test(f.phone)) e.phone = 'Phone may only contain digits, spaces, +, -, (, )'
  if (f.address && !f.address.trim()) e.address = 'Address must not be blank if provided'
  return e
}

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 1l10 10M11 1 1 11"/>
  </svg>
)

export default function ContactModal({ contact, onSave, onClose }: Props) {
  const isEdit = Boolean(contact)

  const [form, setForm] = useState<FormState>({
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    address: contact?.address ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(ev => ({ ...ev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setServerError('')
    try {
      await onSave({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setServerError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          {serverError && <div className="modal__server-error">{serverError}</div>}

          <div className="modal__row">
            <div className="field">
              <label className="field__label">First Name <span className="field__required">*</span></label>
              <input className={`field__input ${errors.firstName ? 'field__input--error' : ''}`}
                value={form.firstName} onChange={set('firstName')} placeholder="Jane" />
              {errors.firstName && <span className="field__error">{errors.firstName}</span>}
            </div>
            <div className="field">
              <label className="field__label">Last Name <span className="field__required">*</span></label>
              <input className={`field__input ${errors.lastName ? 'field__input--error' : ''}`}
                value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
              {errors.lastName && <span className="field__error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="field">
            <label className="field__label">Email <span className="field__required">*</span></label>
            <input type="email"
              className={`field__input ${errors.email ? 'field__input--error' : ''}`}
              value={form.email} onChange={set('email')} placeholder="jane@example.com" />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field__label">Phone</label>
            <input className={`field__input ${errors.phone ? 'field__input--error' : ''}`}
              value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
            {errors.phone && <span className="field__error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label className="field__label">Address</label>
            <textarea className={`field__input field__textarea ${errors.address ? 'field__input--error' : ''}`}
              value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" rows={3} />
            {errors.address && <span className="field__error">{errors.address}</span>}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
