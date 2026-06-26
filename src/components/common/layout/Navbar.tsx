// src/components/Navbar.tsx
//
// Logged-out navbar variant
// Logged-in variant

import { Link } from "@tanstack/react-router";
import { Logo } from "../ui/Logo";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { UserMenu } from "./UserMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useAuthStore } from "../../../stores/auth";
import { mediaUrl } from "../../../lib/mediaUrl";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const COMMON_NAV_LINKS = [
  { label: "Browse Services", to: "/browse-services" },
  { label: "Find Users", to: "/browse-users" },
  { label: "Calendar", to: "/calendar" },
  { label: "Chat", to: "/chat" },
] as const;

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const isProvider = user?.userType === "PROVIDER";
  const pictureUrl = user?.profileMedia
    ? mediaUrl(user.profileMedia.url)
    : undefined;
  const navLinks = [
    COMMON_NAV_LINKS[0],
    COMMON_NAV_LINKS[1],
    ...(isProvider ? [{ label: "My Services", to: "/my-listings" as const }] : []),
    // Calendar and Chat require an account, so don't even show them to
    // logged-out visitors.
    ...(user ? [COMMON_NAV_LINKS[2], COMMON_NAV_LINKS[3]] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:gap-8 lg:px-6"
        aria-label="Main navigation"
      >
        <Link to="/" aria-label="Mira home" className="shrink-0">
          <Logo variant="primary" height={36} />
        </Link>

        <ul className="m-0 hidden list-none items-center gap-6 p-0 lg:flex">
          {navLinks.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                search={{} as never}
                className="text-small font-medium no-underline transition-colors duration-150"
                activeProps={{ className: "text-cream font-bold" }}
                inactiveProps={{ className: "text-cream/80 hover:text-cream" }}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/"
              hash="how-it-works"
              className="text-cream/80 text-small font-medium no-underline transition-colors duration-150 hover:text-cream"
            >
              How it works
            </Link>
          </li>
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <AccessibilityPanel />

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
            <a
              href={`${API_BASE_URL}/auth/login/google`}
              className="relative inline-flex h-11 items-center justify-center rounded-full bg-primary px-3 text-body font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary-hover active:bg-primary-hover lg:px-5"
            >
              Login
            </a>
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
