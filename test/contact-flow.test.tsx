// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactFlow from '../components/ContactFlow'

// lib/scroll calls into the Lenis instance; none exists under jsdom, so its
// setScrollLock is a no-op — safe to import as-is.

function renderOpen() {
  const onClose = vi.fn()
  const utils = render(<ContactFlow isOpen onClose={onClose} />)
  return { onClose, ...utils }
}

// Navigate to the contact-details step (step 4) with fields still empty.
async function driveToContactStep() {
  const user = userEvent.setup()
  const { onClose } = renderOpen()

  await user.click(await screen.findByRole('button', { name: /let's start/i }))
  await user.click(screen.getByRole('button', { name: 'Growth & Strategy' }))
  await user.click(screen.getByRole('button', { name: /startup/i }))
  await user.type(screen.getByLabelText(/biggest challenge/i), 'Scaling fast')
  await user.click(screen.getByRole('button', { name: /continue/i }))

  await screen.findByPlaceholderText('Full Name') // step 4 mounted
  return { user, onClose }
}

// Drive the flow all the way to the result screen (where the Free/Paid submit
// buttons live). Returns the user-event controller for further clicks.
async function driveToResult() {
  const { user, onClose } = await driveToContactStep()

  // Step 4 (contact) → fill required name + email, consent, then submit
  await user.type(screen.getByLabelText('Full Name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Work Email'), 'jane@example.com')
  await user.click(screen.getByLabelText(/agree to be contacted/i))
  await user.click(screen.getByRole('button', { name: /get my strategy path/i }))

  // Result screen
  await screen.findByText(/we've matched you with/i)
  return { user, onClose }
}

describe('ContactFlow', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(<ContactFlow isOpen={false} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('opens on the welcome step and exposes the start button', async () => {
    renderOpen()
    expect(await screen.findByText(/Let's find the right path for you/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /let's start/i })).toBeTruthy()
  })

  it('renders a hidden honeypot field that humans do not fill', async () => {
    await driveToContactStep()
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement | null
    expect(honeypot).not.toBeNull()
    expect(honeypot!.getAttribute('aria-hidden')).toBe('true')
    expect(honeypot!.getAttribute('tabindex')).toBe('-1')
    expect(honeypot!.getAttribute('autocomplete')).toBe('off')
  })

  it('navigates through all steps to the matched-division result screen', async () => {
    await driveToResult()
    expect(screen.getByText('Xanadu Consulting')).toBeTruthy()
    expect(screen.getByRole('button', { name: /free alignment call/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /paid strategic session/i })).toBeTruthy()
  })

  it('guards against the Free/Paid double-submit race (one network send)', async () => {
    let resolveFetch!: (v: Response) => void
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { user } = await driveToResult()

    // Click Free, then immediately Paid, before the first fetch resolves.
    await user.click(screen.getByRole('button', { name: /free alignment call/i }))
    await user.click(screen.getByRole('button', { name: /paid strategic session/i }))

    // Resolve the in-flight request.
    resolveFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  })

  it('surfaces a server error and does not advance', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
        )
      )
    )
    const { user } = await driveToResult()
    await user.click(screen.getByRole('button', { name: /free alignment call/i }))
    expect(await screen.findByText(/internal server error/i)).toBeTruthy()
    // Still on the result screen (no confirmation)
    expect(screen.getByRole('button', { name: /paid strategic session/i })).toBeTruthy()
  })
})
