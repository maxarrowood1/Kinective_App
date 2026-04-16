import { useState, useCallback } from 'react'
import ContactsPage from './pages/ContactsPage'
import Toast, { type ToastType } from './components/Toast'
import './App.css'

interface ToastState {
  message: string
  type: ToastType
  id: number
}

export default function App() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: Date.now() })
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">📇</div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">Kinective</span>
            <span className="sidebar__logo-sub">Address Book</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <a className="sidebar__nav-item sidebar__nav-item--active" href="#">
            <span className="sidebar__nav-icon">👥</span>
            Contacts
          </a>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__footer-text">v1.0 · Kinective Assessment</div>
        </div>
      </aside>

      <main className="content">
        <ContactsPage showToast={showToast} />
      </main>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
