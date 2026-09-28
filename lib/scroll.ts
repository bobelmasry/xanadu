import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(l: Lenis | null) {
  instance = l
}

export function getLenis() {
  return instance
}

export function scrollToId(id: string, duration?: number) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  if (instance) {
    instance.scrollTo(el, { offset: 0, ...(duration === undefined ? {} : { duration }) })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export function setScrollLock(locked: boolean) {
  if (!instance) return
  if (locked) {
    instance.stop()
  } else {
    instance.start()
  }
}
