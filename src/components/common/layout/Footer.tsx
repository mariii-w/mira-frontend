import { Link } from "@tanstack/react-router";
import { Logo } from "../ui/Logo";

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Accessibility", to: "/accessibility" },
  { label: "Terms of Use", to: "/terms-of-use" },
  { label: "Privacy Policy", to: "/privacy-policy" },
] as const;

export function Footer() {
  return (
    <footer className="bg-charcoal px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex max-w-45 flex-col items-center gap-2 sm:items-start">
          <Logo variant="white" height={32} title="Mira" />
          <p className="hidden text-small text-cream/50 leading-relaxed sm:block">
            A service marketplace connecting people with trusted local helpers.
            Designed for everyone.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap list-none items-center justify-center gap-x-4 gap-y-2 m-0 p-0 sm:justify-end">
            {FOOTER_LINKS.map((link, i) => (
              <li key={link.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="hidden text-cream/30 select-none sm:inline" aria-hidden="true">
                    ·
                  </span>
                )}
                <Link
                  to={link.to}
                  className="inline-block py-1.5 text-small text-cream/70 no-underline hover:text-cream active:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream rounded transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
