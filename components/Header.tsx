"use client"

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SUBSIDIARIES } from '../lib/subsidiaries'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/investments', label: 'Investments' },
  { href: '/work', label: 'Our Work' },
  { href: '/about', label: 'About Us' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileSubsOpen, setMobileSubsOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const dropBtnRef = useRef<HTMLButtonElement>(null)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)
  const subsActive = pathname.startsWith('/subsidiaries')

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setDropOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  // Click-outside (and outside-focus) dismissal for the desktop dropdown.
  useEffect(() => {
    if (!dropOpen) return
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [dropOpen])

  const closeMobile = () => {
    setOpen(false)
    setMobileSubsOpen(false)
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
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
          />
          <span
            className="text-lg font-semibold tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Xanadu
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-7" aria-label="Primary">
          <Link
            href="/"
            aria-current={isActive('/') ? 'page' : undefined}
            className="relative text-sm transition-colors duration-300 py-1"
            style={{
              color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Home
            <span
              className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
              style={{
                width: isActive('/') ? '100%' : '0%',
                background: 'var(--accent-primary)',
              }}
            />
          </Link>

          {/* Subsidiaries dropdown — click/keyboard toggle, hover-assist open. */}
          <div
            ref={dropRef}
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              ref={dropBtnRef}
              type="button"
              aria-expanded={dropOpen}
              aria-haspopup="true"
              aria-current={subsActive ? 'page' : undefined}
              onClick={() => setDropOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setDropOpen(true)
                }
              }}
              className="relative flex items-center gap-1.5 text-sm transition-colors duration-300 py-1 cursor-pointer"
              style={{
                color: subsActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Subsidiaries
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 text-[10px]"
                style={{ transform: dropOpen ? 'rotate(180deg)' : 'none' }}
              >
                ▼
              </span>
              <span
                className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
                style={{
                  width: subsActive || dropOpen ? '100%' : '0%',
                  background: 'var(--accent-primary)',
                }}
              />
            </button>

            {dropOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[220px]"
                role="menu"
                aria-label="Subsidiaries"
              >
                <div
                  className="rounded-xl py-2 shadow-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                  }}
                >
                  {SUBSIDIARIES.map((s) => {
                    const active = pathname === `/subsidiaries/${s.id}`
                    return (
                      <Link
                        key={s.id}
                        href={`/subsidiaries/${s.id}`}
                        role="menuitem"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{
                          color: active ? s.color : 'var(--text-secondary)',
                          fontFamily: 'var(--font-heading)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = s.color
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                          aria-hidden="true"
                        />
                        {s.id === 'xw3' ? 'Web3' : `Xanadu ${s.name}`}
                      </Link>
                    )
                  })}
                  <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)' }} className="my-1.5" />
                  <Link
                    href="/subsidiaries"
                    role="menuitem"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}
                  >
                    All Subsidiaries <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {NAV.filter((item) => item.href !== '/').map((item) => {
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
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg transition-colors hover:bg-slate-900/5"
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
          className="md:hidden fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-6 overflow-y-auto py-10"
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <Link
            href="/"
            onClick={closeMobile}
            className="text-2xl font-semibold tracking-wide transition-colors"
            style={{
              color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Home
          </Link>

          {/* Subsidiaries accordion */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileSubsOpen((v) => !v)}
              aria-expanded={mobileSubsOpen}
              className="flex items-center gap-2 text-2xl font-semibold tracking-wide"
              style={{
                color: subsActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Subsidiaries
              <span
                aria-hidden="true"
                className="inline-block text-xs transition-transform duration-300"
                style={{ transform: mobileSubsOpen ? 'rotate(180deg)' : 'none' }}
              >
                ▼
              </span>
            </button>
            {mobileSubsOpen && (
              <div className="flex flex-col items-center gap-4 pt-2">
                {SUBSIDIARIES.map((s) => (
                  <Link
                    key={s.id}
                    href={`/subsidiaries/${s.id}`}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 text-lg font-medium"
                    style={{
                      color: pathname === `/subsidiaries/${s.id}` ? s.color : 'var(--text-secondary)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                      aria-hidden="true"
                    />
                    {s.id === 'xw3' ? 'Web3' : `Xanadu ${s.name}`}
                  </Link>
                ))}
                <Link
                  href="/subsidiaries"
                  onClick={closeMobile}
                  className="text-sm uppercase tracking-[0.2em]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  All Subsidiaries →
                </Link>
              </div>
            )}
          </div>

          {NAV.filter((item) => item.href !== '/').map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
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
