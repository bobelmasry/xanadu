"use client"

import React, { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  level: number // alpha bucket index (ALPHA_COLORS[level])
}

// Alpha is quantized into a handful of buckets so the render loop can batch:
// one beginPath/fill per level instead of per particle, with fillStyle set
// from these precomputed strings — no per-frame color-string allocation or
// CSS parse (previously ~width/15 template strings were built + parsed
// every frame).
const ALPHA_LEVELS = 5
const ALPHA_MIN = 0.1
const ALPHA_MAX = 0.5
const ALPHA_COLORS = Array.from(
  { length: ALPHA_LEVELS },
  (_, i) =>
    `rgba(255, 255, 255, ${(ALPHA_MIN + ((ALPHA_MAX - ALPHA_MIN) * i) / (ALPHA_LEVELS - 1)).toFixed(3)})`
)

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Reactive: toggling the OS preference re-runs the effect below so the rAF
  // loop stops/starts without a reload (WCAG 2.3.3).
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = window.devicePixelRatio || 1

    // Render at physical resolution (crisp on retina) while drawing in CSS px.
    const setSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    setSize()

    // Particles in per-alpha-bucket arrays (shared objects, two views) so the
    // render loop groups draws by fillStyle.
    const all: Particle[] = []
    const byLevel: Particle[][] = Array.from({ length: ALPHA_LEVELS }, () => [])

    const makeParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.2, // slight upward drift
      level: Math.floor(Math.random() * ALPHA_LEVELS),
    })

    // Re-seed (grow/trim) instead of a full reset, so resizing doesn't flicker.
    const seedParticles = () => {
      const target = Math.floor(width / 15) // Responsive count
      while (all.length < target) {
        const p = makeParticle()
        all.push(p)
        byLevel[p.level].push(p)
      }
      while (all.length > target) {
        const p = all.pop()
        if (p) {
          const bucket = byLevel[p.level]
          bucket.splice(bucket.indexOf(p), 1)
        }
      }
    }
    seedParticles()

    let animationFrameId = 0

    // Advance + wrap positions, then draw batched per alpha bucket (one
    // path + fill per level instead of per particle).
    const step = () => {
      for (let l = 0; l < ALPHA_LEVELS; l++) {
        const bucket = byLevel[l]
        if (bucket.length === 0) continue
        ctx.fillStyle = ALPHA_COLORS[l]
        ctx.beginPath()
        for (let i = 0; i < bucket.length; i++) {
          const p = bucket[i]
          p.x += p.vx
          p.y += p.vy
          // Wrap around
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0
          // moveTo before each arc so consecutive arcs don't get a
          // connecting line inside the shared path.
          ctx.moveTo(p.x + p.r, p.y)
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      step()
      animationFrameId = requestAnimationFrame(render)
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      for (let l = 0; l < ALPHA_LEVELS; l++) {
        const bucket = byLevel[l]
        if (bucket.length === 0) continue
        ctx.fillStyle = ALPHA_COLORS[l]
        ctx.beginPath()
        for (let i = 0; i < bucket.length; i++) {
          const p = bucket[i]
          ctx.moveTo(p.x + p.r, p.y)
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }

    // Respect prefers-reduced-motion: paint one static frame instead of running
    // an infinite rAF loop (WCAG 2.3.3).
    if (prefersReduced) {
      drawStatic()
    } else {
      render()
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setSize()
        // Wrap any particle now outside bounds, then re-seed to the new width so
        // widening the viewport re-populates the field (previously the count was
        // frozen at the mount value and the field thinned out on widen).
        for (const p of all) {
          if (p.x > width) p.x = width
          if (p.y > height) p.y = height
        }
        seedParticles()
        if (prefersReduced) drawStatic()
      }, 150)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [prefersReduced])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  )
}
