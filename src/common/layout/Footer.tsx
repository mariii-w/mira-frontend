import { Link } from '@tanstack/react-router'
import { Logo } from '../ui/Logo'

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Accessibility", to: "/accessibility" },
  { label: "Terms of Use", to: "/terms-of-use" },
  { label: "Privacy Policy", to: "/privacy-policy" },
] as const

export function Footer() {
  return (
    <footer className="bg-charcoal px-6 py-10">
      <div className="mx-auto max-w-4xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 max-w-45">
          <Logo variant="white" height={32} title="Mira" />
          <p className="text-small text-cream/50 leading-relaxed">
            A service marketplace connecting people with trusted local
            helpers. Designed for everyone.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 list-none m-0 p-0 justify-end">
            {FOOTER_LINKS.map((link, i) => (
              <li key={link.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span
                    className="text-cream/30 select-none"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )}

                <Link
                  to={link.to}
                  className="text-small text-cream/70 no-underline hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream rounded transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
