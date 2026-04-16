import { useEffect } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error'

interface Props {
  message: string
  type: ToastType
  onClose: () => void
}

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{type === 'success' ? '✓' : '✕'}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose}>×</button>
    </div>
  )
}
