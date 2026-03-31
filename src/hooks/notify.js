import toast from 'react-hot-toast'

/**
 * notify — a thin wrapper around react-hot-toast that enforces
 * consistent messaging patterns across the app.
 *
 * Usage:
 *   notify.success('Order placed!')
 *   notify.error('Something went wrong')
 *   notify.loading('Saving…')   → returns toastId
 *   notify.dismiss(toastId)
 *   notify.promise(apiCall(), { loading: '…', success: '✓', error: '✗' })
 */
const notify = {
  success: (message, options = {}) =>
    toast.success(message, { duration: 3500, ...options }),

  error: (message, options = {}) =>
    toast.error(message, { duration: 5000, ...options }),

  info: (message, options = {}) =>
    toast(message, { icon: 'ℹ️', duration: 3500, ...options }),

  warning: (message, options = {}) =>
    toast(message, {
      icon: '⚠️',
      duration: 4500,
      style: { background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' },
      ...options,
    }),

  loading: (message, options = {}) =>
    toast.loading(message, options),

  dismiss: (toastId) =>
    toast.dismiss(toastId),

  /**
   * promise — wraps a Promise and shows loading → success/error toasts automatically.
   *
   * const data = await notify.promise(
   *   apiCall(),
   *   { loading: 'Saving…', success: 'Saved!', error: 'Save failed' }
   * )
   */
  promise: (promise, messages, options = {}) =>
    toast.promise(promise, messages, options),
}

export default notify
