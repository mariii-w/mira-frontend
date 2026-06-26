// src/components/Navbar.tsx
//
// Logged-out navbar variant
// Logged-in variant

import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { UserMenu } from "./UserMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useAuthStore } from "../stores/auth";
import { mediaUrl } from "../lib/mediaUrl";

const COMMON_NAV_LINKS = [
  { label: 'Browse Services', to: '/browse-services' },
  { label: 'Find Users', to: '/browse-users' },
  { label: "Calendar", to: "/calendar" },
  { label: "Chat", to: "/chat" },
] as const;

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const isProvider = user?.userType === "PROVIDER";
  const pictureUrl = user?.profileMedia ? mediaUrl(user.profileMedia.url) : undefined;
  const navLinks = [
    COMMON_NAV_LINKS[0],
    COMMON_NAV_LINKS[1],
    ...(isProvider ? [{ label: "My Services", to: "/my-listings" as const }] : []),
    // Calendar and Chat require an account, so don't even show them to
    // logged-out visitors.
    ...(user ? [COMMON_NAV_LINKS[2], COMMON_NAV_LINKS[3]] : []),
  ];

  function handleGoogleLogin() {
    window.location.href = "http://localhost:8081/auth/login/google";
  }

  return (
      <header className="sticky top-0 z-40 w-full bg-charcoal">
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <nav
            className="mx-auto flex h-16 max-w-7xl items-center gap-4 lg:gap-8 px-4 lg:px-6"
            aria-label="Main navigation"
        >
          {/* Logo */}
          <Link to="/" aria-label="Mira home" className="shrink-0">
            <Logo variant="primary" height={36} />
          </Link>

          {/* Nav links */}
          <ul className="hidden lg:flex items-center gap-6 list-none m-0 p-0">
            {navLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                      to={to}
                      search={{} as never}
                      className="text-small font-medium no-underline transition-colors duration-150"
                      activeProps={{ className: 'text-cream font-bold' }}
                      inactiveProps={{ className: 'text-cream/80 hover:text-cream' }}
                  >
                    {label}
                  </Link>
                </li>
            ))}
            <li>
              <Link
                  to="/"
                  hash="how-it-works"
                  className="text-cream/80 text-small font-medium no-underline hover:text-cream transition-colors duration-150"
              >
                How it works
              </Link>
            </li>
          </ul>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            <AccessibilityPanel />

            {/* Divider */}
            <div className="h-6 w-px bg-cream/20" aria-hidden="true" />

            {user ? (
                <div className="hidden lg:block">
                  <UserMenu
                      firstName={firstName}
                      lastName={lastName}
                      isProvider={isProvider}
                      pictureUrl={pictureUrl}
                  />
                </div>
            ) : (
                <Button variant="primary" size="md" className="px-3 lg:px-5" onClick={handleGoogleLogin}>
                  Login
                </Button>
            )}

            <MobileNavDrawer
                navLinks={navLinks}
                firstName={firstName}
                lastName={lastName}
                isLoggedIn={!!user}
                isProvider={isProvider}
                pictureUrl={pictureUrl}
            />
          </div>
        </nav>
      </header>
  );
}
