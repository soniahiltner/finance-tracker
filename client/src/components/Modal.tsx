import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  describedBy?: string
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  role?: 'dialog' | 'alertdialog'
}

let openModalCount = 0
let previousBodyOverflow = ''
let rootHadInert = false
const modalStack: string[] = []

const getRootElement = () =>
  typeof document !== 'undefined' ? document.getElementById('root') : null

const setRootInert = (isInert: boolean) => {
  const root = getRootElement()
  if (!root) return

  if (isInert) {
    rootHadInert = root.hasAttribute('inert')
    root.setAttribute('inert', '')
    return
  }

  if (!rootHadInert) {
    root.removeAttribute('inert')
  }
}

const ensureModalRoot = () => {
  if (typeof document === 'undefined') return null

  const existing = document.getElementById('modal-root')
  if (existing) return existing

  const modalRoot = document.createElement('div')
  modalRoot.setAttribute('id', 'modal-root')
  document.body.appendChild(modalRoot)
  return modalRoot
}

const focusableSelector =
  "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"

const Modal = ({
  isOpen,
  onClose,
  children,
  labelledBy,
  describedBy,
  closeOnEsc = true,
  closeOnBackdrop = true,
  role = 'dialog'
}: ModalProps) => {
  const modalId = useId()
  const modalRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const portalTarget = isOpen ? ensureModalRoot() : null

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    modalStack.push(modalId)

    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      setRootInert(true)
    }

    openModalCount += 1

    return () => {
      openModalCount = Math.max(0, openModalCount - 1)
      const index = modalStack.lastIndexOf(modalId)
      if (index >= 0) modalStack.splice(index, 1)

      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow
        setRootInert(false)
      }

      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [isOpen, modalId])

  useEffect(() => {
    if (!isOpen) return

    const modalElement = modalRef.current
    if (!modalElement) return

    const focusModal = () => {
      const focusable = Array.from(
        modalElement.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

      const initialFocus =
        modalElement.querySelector<HTMLElement>('[data-autofocus]') ||
        focusable[0] ||
        modalElement

      initialFocus.focus()
    }

    const focusTimeout = window.setTimeout(focusModal, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== modalId) return

      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        modalElement.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

      if (focusable.length === 0) {
        event.preventDefault()
        modalElement.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimeout)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOnEsc, onClose, modalId])

  if (!isOpen || !portalTarget) return null

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
      <button
        type='button'
        className='absolute inset-0 cursor-default'
        aria-hidden='true'
        tabIndex={-1}
        onMouseDown={(event) => {
          if (!closeOnBackdrop) return
          if (modalStack[modalStack.length - 1] !== modalId) return
          event.preventDefault()
          onClose()
        }}
      />
      <div
        ref={modalRef}
        role={role}
        aria-modal='true'
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className='relative z-10'
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalTarget
  )
}

export default Modal
