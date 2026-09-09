"use client"

import { useEffect, useRef } from 'react'
import { setScrollLock } from './scroll'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface UseFocusTrapOptions {
  isOpen: boolean
  onClose: () => void
  resetForm: () => void
  isSubmittingRef: { current: boolean }
}

/** a11y: while open, lock background scroll, trap focus, support Escape, and
 *  restore focus to whatever opened the modal on close. Owns the dialog + close
 *  button refs (returned for JSX attachment); the is-submitting ref is passed in
 *  so Escape is ignored while a submit is in flight. */
export function useFocusTrap({ isOpen, onClose, resetForm, isSubmittingRef }: UseFocusTrapOptions) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    setScrollLock(true)
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 0)
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSubmittingRef.current) {
          onClose()
          resetForm()
        }
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
          .filter((n) => n.tabIndex >= 0)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      setScrollLock(false)
      window.clearTimeout(focusTimer)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose, resetForm, isSubmittingRef])

  return { dialogRef, closeBtnRef }
}
