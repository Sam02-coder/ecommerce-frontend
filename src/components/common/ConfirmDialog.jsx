import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * ConfirmDialog — replaces browser's native confirm() for production use.
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null)
 *
 *   const showConfirm = (message, onConfirm) =>
 *     setConfirmState({ message, onConfirm })
 *
 *   <ConfirmDialog
 *     open={!!confirmState}
 *     message={confirmState?.message}
 *     onConfirm={() => { confirmState?.onConfirm(); setConfirmState(null) }}
 *     onCancel={() => setConfirmState(null)}
 *   />
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (open) {
      // Trap focus on confirm button when dialog opens
      setTimeout(() => confirmRef.current?.focus(), 50)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && open) onCancel?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const iconColors = {
    danger: 'bg-red-50 text-red-500',
    warning: 'bg-yellow-50 text-yellow-500',
    info: 'bg-blue-50 text-blue-500',
  }
  const btnColors = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-primary-500 hover:bg-primary-600 text-white',
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconColors[variant]}`}>
          <AlertTriangle size={22} />
        </div>

        <h3 id="confirm-title" className="font-display font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary !py-2.5 !text-sm"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
