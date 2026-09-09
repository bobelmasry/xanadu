"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/subsidiaries', label: 'Subsidiaries' },
  { href: '/investments', label: 'Investments' },
  { href: '/portfolio', label: 'Our Portfolio' },
  { href: '/about', label: 'About Us' },
  { href: '/founder', label: 'About the Founder' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: 'rgba(5, 5, 8, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="section-container flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Xanadu — home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small brand mark */}
          <img
            src="/logos/group.png"
            alt=""
            aria-hidden="true"
            width={128}
            height={118}
            className="h-7 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(61,90,128,0.45))' }}
          />
          <span
            className="text-lg font-semibold tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Xanadu
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-7" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="relative text-sm transition-colors duration-300 py-1"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {item.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
                  style={{
                    width: active ? '100%' : '0%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px rgba(61,90,128,0.7)',
                  }}
                />
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg transition-colors hover:bg-white/5"
        >
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              background: 'var(--text-primary)',
              transform: open ? 'translateY(8px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{ background: 'var(--text-primary)', opacity: open ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              background: 'var(--text-primary)',
              transform: open ? 'translateY(-8px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile overlay — sits below the bar (z-40) so the bar's close button stays clickable. */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-8"
          style={{
            background: 'rgba(5, 5, 8, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="text-2xl font-semibold tracking-wide transition-colors"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
