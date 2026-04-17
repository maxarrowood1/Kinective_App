import { useState, useCallback } from 'react'
import ContactsPage from './pages/ContactsPage'
import Toast, { type ToastType } from './components/Toast'
import SettingsModal from './components/SettingsModal'
import { useSettings } from './hooks/useSettings'
import './App.css'

interface ToastState {
  message: string
  type: ToastType
  id: number
}

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="url(#logoGrad)"/>
    <path d="M8 9h5l3 5-3 5H8l3-5-3-5z" fill="rgba(255,255,255,0.9)"/>
    <path d="M15 9h5l-3 5 3 5h-5l3-5-3-5z" fill="rgba(255,255,255,0.45)"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
        <stop offset="0%" stopColor="#58a6ff"/>
        <stop offset="100%" stopColor="#a78bfa"/>
      </linearGradient>
    </defs>
  </svg>
)

const IconContacts = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="5" r="2.5"/>
    <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
  </svg>
)

const IconGear = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/>
  </svg>
)

export default function App() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, accent, fontSize, setTheme, setAccent, setFontSize } = useSettings()

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: Date.now() })
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <LogoMark />
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">Kinective</span>
            <span className="sidebar__logo-sub">Address Book</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <a className="sidebar__nav-item sidebar__nav-item--active" href="#">
            <span className="sidebar__nav-icon"><IconContacts /></span>
            Contacts
          </a>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__footer-text">v1.0 · Kinective Assessment</div>
          <button
            className="sidebar__settings-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <span className="sidebar__settings-icon"><IconGear /></span>
            Settings
          </button>
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

      {settingsOpen && (
        <SettingsModal
          theme={theme}
          accent={accent}
          fontSize={fontSize}
          onTheme={setTheme}
          onAccent={setAccent}
          onFontSize={setFontSize}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
