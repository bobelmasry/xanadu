"use client"

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Effect A: one-time desktop, fine-pointer, and reduced-motion detection.
  // The cursor divs only mount once `isVisible` flips true, so listener setup
  // lives in Effect B. Skip entirely for touch and reduced-motion users.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time client-only feature detection (window isn't available during SSR/initial render)
    setIsVisible(true)
  }, [])

  // Effect B: tracking — runs only after the cursor divs exist in the DOM.
  useEffect(() => {
    if (!isVisible) return
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let cursorX = mouseX
    let cursorY = mouseY
    let prevInteractive = false
    let rafId = 0

    // Per-property quickSetters: mousemove can fire at input-device rate
    // (>120 Hz), and every gsap.set call allocates + parses a vars object —
    // quickSetter writes straight to GSAP's transform cache with zero alloc.
    const setDotX = gsap.quickSetter(dot, 'x', 'px')
    const setDotY = gsap.quickSetter(dot, 'y', 'px')
    const setCursorX = gsap.quickSetter(cursor, 'x', 'px')
    const setCursorY = gsap.quickSetter(cursor, 'y', 'px')

    const setHover = (on: boolean) => {
      if (on) {
        gsap.to(cursor, { scale: 1.5, opacity: 0.2, duration: 0.3 })
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.3 })
      } else {
        gsap.to(cursor, { scale: 1, opacity: 0.5, duration: 0.3 })
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3 })
      }
    }

    // Smooth animation for outer ring. The rAF self-suspends once the ring
    // has caught up with the pointer (within half a pixel) and resumes on the
    // next mousemove — no per-frame work while the cursor is idle.
    const render = () => {
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      setCursorX(cursorX)
      setCursorY(cursorY)
      if (Math.abs(mouseX - cursorX) < 0.5 && Math.abs(mouseY - cursorY) < 0.5) {
        rafId = 0
        return
      }
      rafId = requestAnimationFrame(render)
    }
    const ensureTracking = () => {
      if (rafId === 0) rafId = requestAnimationFrame(render)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Move dot immediately
      setDotX(mouseX)
      setDotY(mouseY)

      // Detect interactive target. Only animate when the state actually
      // changes — avoids flicker that mouseover/mouseout caused when moving
      // between an element and its children. Selector match only: a
      // getComputedStyle(target) call here forces style recalculation on the
      // hottest input path (every mousemove), which janks busy pages.
      const target = e.target as HTMLElement | null
      const interactive = !!target?.closest(
        'button,a,[role="button"],input,textarea,select,label,[onclick]'
      )
      if (interactive !== prevInteractive) {
        prevInteractive = interactive
        setHover(interactive)
      }

      ensureTracking()
    }

    window.addEventListener('mousemove', onMouseMove)
    ensureTracking()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      gsap.killTweensOf([cursor, dot])
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[9999]"
        style={{ transform: 'translate(-50%, -50%)', opacity: 0.5, mixBlendMode: 'difference' }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999]"
        style={{ transform: 'translate(-50%, -50%)', mixBlendMode: 'difference' }}
      />
    </>
  )
}
