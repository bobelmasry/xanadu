export const metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy — Xanadu',
  description:
    'How Xanadu collects, uses, stores, and protects the personal information you submit through the contact form.',
}

export default function PrivacyPage() {
  return (
    <main
      className="relative min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <article className="section-container max-w-3xl mx-auto py-32 md:py-44">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
          Last updated: 2026-06-22
        </p>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              What we collect
            </h2>
            <p>
              When you submit the contact form, we collect the details you choose to provide:
              your name, email address, phone number (optional), and company name (optional),
              along with your answers to the qualifying questions, the session type you select,
              and the Xanadu division your answers route to.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Lawful basis
            </h2>
            <p>
              We process the personal data you submit on the basis of your consent
              (GDPR Art. 6(1)(a), and equivalent provisions under PDPL and other MENA data-protection
              laws). You explicitly consent by checking the consent box before submitting the form,
              and you may withdraw consent at any time (see Your rights).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              How we use it
            </h2>
            <p>
              Your information is used solely to review your inquiry and connect you with the
              right Xanadu team. We do not sell or rent your personal data, and we do not use it
              for profiling or automated decision-making.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              How we store it
            </h2>
            <p>
              In production, submissions are delivered directly to our team by email — sent
              securely over TLS via our mail provider — and stored only in the team mailbox,
              where access is restricted to authorized team members. We do not maintain a separate
              database or spreadsheet of submissions. In development, submissions are stored in a
              local file encrypted with AES-256-GCM. Access to submissions is limited to
              authorized team members.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Retention
            </h2>
            <p>
              We retain submissions (held in the team mailbox) for up to 24 months from the date we
              receive them, after which they are deleted from our mail system. You can request
              earlier deletion at any time (see Your rights); deletion is carried out by removing
              the relevant message(s) from our mailbox.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Cross-border transfers
            </h2>
            <p>
              Because we use email infrastructure, your data may be processed outside your country
              of residence. We rely on the standard safeguards provided by our processors
              (including recognized certification frameworks) to protect data during any transfer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Your rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal data, as well
              as restriction or portability of processing, and you may withdraw your consent or
              object to processing at any time. To exercise any of these rights, contact us at the
              address below. If you are in a jurisdiction with a data-protection authority, you also
              have the right to lodge a complaint with that authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Security &amp; responsible disclosure
            </h2>
            <p>
              If you believe you have found a security vulnerability, please see our{' '}
              <a href="/.well-known/security.txt" style={{ color: 'var(--text-primary)' }}>
                responsible-disclosure policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Contact
            </h2>
            <p>
              For privacy questions or data requests, email{' '}
              <a href="mailto:privacy@xanadu.com" style={{ color: 'var(--text-primary)' }}>
                privacy@xanadu.com
              </a>
              . For security reports, email{' '}
              <a href="mailto:security@xanadu.com" style={{ color: 'var(--text-primary)' }}>
                security@xanadu.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
