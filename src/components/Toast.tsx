import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Alert, type AlertTone } from './Alert'

export type ToastTone = AlertTone

export interface ToastOptions {
  /** Semantic tone. Defaults to `info`. */
  tone?: ToastTone
  /** Optional bold lead line. */
  title?: ReactNode
  /** Auto-dismiss after N ms; `0` keeps it until dismissed. Falls back to the
   *  provider's `duration`. */
  duration?: number
}

type ToneOptions = Omit<ToastOptions, 'tone'>

interface ToastItem {
  id: number
  tone: ToastTone
  title?: ReactNode
  message: ReactNode
  autoDismiss: boolean
}

export interface ToastApi {
  show: (message: ReactNode, options?: ToastOptions) => number
  info: (message: ReactNode, options?: ToneOptions) => number
  success: (message: ReactNode, options?: ToneOptions) => number
  warning: (message: ReactNode, options?: ToneOptions) => number
  error: (message: ReactNode, options?: ToneOptions) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** Access the toast API. Throws if called outside `<ToastProvider>`. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (ctx === null) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

export interface ToastProviderProps {
  children: ReactNode
  /** Default auto-dismiss in ms (a per-toast `duration` overrides). Defaults to 3000. */
  duration?: number
  /** Accessible label for a dismissible toast's ✕ button — **required**; pass a translated string. */
  dismissLabel: string
}

/**
 * Mounts the toast store and a fixed viewport (portaled to `document.body`), and
 * exposes the imperative API via `useToast()`. Each toast renders as an `Alert`,
 * so toasts inherit the same tone tokens.
 */
export function ToastProvider({ children, duration = 3000, dismissLabel }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: ReactNode, options?: ToastOptions): number => {
      const id = (idRef.current += 1)
      const ms = options?.duration ?? duration
      setToasts((list) => [
        ...list,
        { id, tone: options?.tone ?? 'info', title: options?.title, message, autoDismiss: ms > 0 },
      ])
      if (ms > 0) {
        setTimeout(() => dismiss(id), ms)
      }
      return id
    },
    [dismiss, duration],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      info: (message, options) => show(message, { ...options, tone: 'info' }),
      success: (message, options) => show(message, { ...options, tone: 'success' }),
      warning: (message, options) => show(message, { ...options, tone: 'warning' }),
      error: (message, options) => show(message, { ...options, tone: 'danger' }),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="mrs-toast-viewport">
            {toasts.map((t) => (
              <div className="mrs-toast" key={t.id}>
                {t.autoDismiss ? (
                  <Alert tone={t.tone} title={t.title} role="status">
                    {t.message}
                  </Alert>
                ) : (
                  <Alert
                    tone={t.tone}
                    title={t.title}
                    role="status"
                    onDismiss={() => dismiss(t.id)}
                    dismissLabel={dismissLabel}
                  >
                    {t.message}
                  </Alert>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}
