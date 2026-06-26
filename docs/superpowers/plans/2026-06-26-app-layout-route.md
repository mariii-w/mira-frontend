# Context

Every app page currently includes `<Navbar />` inline inside its own component, meaning it is duplicated ~15 times. There is no shared footer either — only `Home.tsx` has one. The goal is a single `_app` pathless layout route (TanStack Router convention) that renders `<Navbar />` and `<Footer />` once, wrapping all app pages via `<Outlet />`. Routes that must not get this chrome — `/login` and `/register/*` — stay outside `_app` and are unaffected.

## Status

**Postponed — 2026-06-26.** The plan was fully executed and all 369 tests passed, but the changes were reverted before merging because the branch (`refactor/accessibility-check`) has significant divergence from `main`. Applying this refactor on top of it would cause widespread merge conflicts when integrating back. The plan is ready to execute on a fresh branch from `main` once the current work is merged.


# Plan

## Task 1 — Extract `Footer` component

**Why:** The footer JSX currently lives inline in `Home.tsx`. It needs to become a standalone component so `_app/route.tsx` can import it.

**Create:** `src/components/Footer.tsx`

Move the `FOOTER_LINKS` constant and the `<footer>` JSX block out of `Home.tsx` into this new file. It needs `Link` from `@tanstack/react-router` and `Logo` from `./Logo`.

```tsx
import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'

const FOOTER_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact-us' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Terms of Use', to: '/terms-of-use' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
] as const

export function Footer() {
  return (
    <footer className="bg-charcoal px-6 py-10">
      <div className="mx-auto max-w-4xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 max-w-45">
          <Logo variant="white" height={32} title="Mira" />
          <p className="text-small text-cream/50 leading-relaxed">
            A service marketplace connecting people with trusted local helpers. Designed for everyone.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 list-none m-0 p-0 justify-end">
            {FOOTER_LINKS.map((link, i) => (
              <li key={link.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="text-cream/30 select-none" aria-hidden="true">·</span>
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
```

**Modify:** `src/components/Home.tsx` — remove the inline `FOOTER_LINKS` constant and the `<footer>…</footer>` block (lines ~114–120 and ~633–667). The layout will provide the footer.

---

## Task 2 — Create `_app` layout route

**Create:** `src/routes/_app/route.tsx`

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})
```

No routes are under `_app` yet — this has no visible effect until Task 3.

---

## Task 3 — Move all app routes under `_app/` and clean up per-component Navbars

### 3a. Move files

Use `git mv` to move all route files except `login.tsx` and `register/` into `src/routes/_app/`:

```
# Root-level files → _app/
git mv src/routes/index.tsx               src/routes/_app/index.tsx
git mv src/routes/about.tsx               src/routes/_app/about.tsx
git mv src/routes/accessibility.tsx       src/routes/_app/accessibility.tsx
git mv src/routes/calendar.tsx            src/routes/_app/calendar.tsx
git mv src/routes/chat.tsx                src/routes/_app/chat.tsx
git mv src/routes/contact-us.tsx          src/routes/_app/contact-us.tsx
git mv src/routes/create-listing.tsx      src/routes/_app/create-listing.tsx
git mv "src/routes/edit-listing.\$listingId.tsx"  "src/routes/_app/edit-listing.\$listingId.tsx"
git mv src/routes/my-bookings.tsx         src/routes/_app/my-bookings.tsx
git mv src/routes/my-credentials.tsx      src/routes/_app/my-credentials.tsx
git mv src/routes/my-listings.tsx         src/routes/_app/my-listings.tsx
git mv src/routes/privacy-policy.tsx      src/routes/_app/privacy-policy.tsx
git mv "src/routes/profile.\$userId.tsx"        "src/routes/_app/profile.\$userId.tsx"
git mv "src/routes/profile.\$userId.edit.tsx"   "src/routes/_app/profile.\$userId.edit.tsx"
git mv src/routes/styleguide.tsx          src/routes/_app/styleguide.tsx
git mv src/routes/terms-of-use.tsx        src/routes/_app/terms-of-use.tsx

# Subdirectories
git mv src/routes/bookings  src/routes/_app/bookings
git mv src/routes/listings  src/routes/_app/listings

# _search group
git mv src/routes/_search  src/routes/_app/_search
```

### 3b. Update `createFileRoute` strings

Every moved file must have `/_app` prepended to its route ID. The Vite plugin validates this at dev-server start.

| File (new path under `_app/`) | Old ID | New ID |
|---|---|---|
| `index.tsx` | `'/'` | `'/_app/'` |
| `about.tsx` | `'/about'` | `'/_app/about'` |
| `accessibility.tsx` | `'/accessibility'` | `'/_app/accessibility'` |
| `calendar.tsx` | `'/calendar'` | `'/_app/calendar'` |
| `chat.tsx` | `'/chat'` | `'/_app/chat'` |
| `contact-us.tsx` | `'/contact-us'` | `'/_app/contact-us'` |
| `create-listing.tsx` | `'/create-listing'` | `'/_app/create-listing'` |
| `edit-listing.$listingId.tsx` | `'/edit-listing/$listingId'` | `'/_app/edit-listing/$listingId'` |
| `my-bookings.tsx` | `'/my-bookings'` | `'/_app/my-bookings'` |
| `my-credentials.tsx` | `'/my-credentials'` | `'/_app/my-credentials'` |
| `my-listings.tsx` | `'/my-listings'` | `'/_app/my-listings'` |
| `privacy-policy.tsx` | `'/privacy-policy'` | `'/_app/privacy-policy'` |
| `profile.$userId.tsx` | `'/profile/$userId'` | `'/_app/profile/$userId'` |
| `profile.$userId.edit.tsx` | `'/profile/$userId/edit'` | `'/_app/profile/$userId/edit'` |
| `styleguide.tsx` | `'/styleguide'` | `'/_app/styleguide'` |
| `terms-of-use.tsx` | `'/terms-of-use'` | `'/_app/terms-of-use'` |
| `bookings/payment/success.tsx` | `'/bookings/payment/success'` | `'/_app/bookings/payment/success'` |
| `bookings/payment/cancelled.tsx` | `'/bookings/payment/cancelled'` | `'/_app/bookings/payment/cancelled'` |
| `listings/$listingId.index.tsx` | `'/listings/$listingId/'` | `'/_app/listings/$listingId/'` |
| `listings/$listingId_.book.tsx` | `'/listings/$listingId_/book'` | `'/_app/listings/$listingId_/book'` |
| `_search/route.tsx` | `'/_search'` | `'/_app/_search'` |
| `_search/browse-services.tsx` | `'/_search/browse-services'` | `'/_app/_search/browse-services'` |
| `_search/browse-users.tsx` | `'/_search/browse-users'` | `'/_app/_search/browse-users'` |

### 3c. Fix relative import paths

Moving into `_app/` adds one directory level. Apply these rules:

- Files moved from `src/routes/*.tsx` → `src/routes/_app/*.tsx`: every `'../'` prefix in imports gains one level → `'../../'`
- Files moved from `src/routes/bookings/payment/` → `src/routes/_app/bookings/payment/`: `'../../../'` → `'../../../../'`
- Files moved from `src/routes/listings/` → `src/routes/_app/listings/`: `'../../'` → `'../../../'`
- Files moved from `src/routes/_search/` → `src/routes/_app/_search/`: `'../../'` → `'../../../'`

Also update `getRouteApi` calls in `src/components/search/pages/SearchUsersPage.tsx` and `SearchServicesPage.tsx` — they reference the old route IDs `/_search/browse-users` and `/_search/browse-services` which must become `/_app/_search/browse-users` and `/_app/_search/browse-services`.

`routeTree.gen.ts` is auto-generated — do not edit it manually.

### 3d. Remove `<Navbar />` from page components

Remove the `<Navbar />` JSX and its import from these components (the layout now provides it):

- `src/components/Home.tsx`
- `src/components/CalendarPage.tsx`
- `src/components/ProfilePageLoadingError.tsx` (2 instances)
- `src/components/InfoPage.tsx`
- `src/components/ChatPageView.tsx`
- `src/components/BookingPage.tsx`
- `src/components/CreateListing.tsx`
- `src/components/Credentials.tsx`
- `src/components/MyListings.tsx`
- `src/components/EditListing.tsx` (3 instances)
- `src/components/MyBookings.tsx`
- `src/components/ProfilePageContent.tsx`
- `src/components/PaymentReturnPage.tsx`
- `src/components/ListingDetailPage.tsx` (3 instances)
- `src/components/EditProfileForm.tsx`
- `src/components/search/pages/SearchRootPage.tsx` — also remove the `<>` fragment wrapper since `<Navbar />` was its only sibling; the `<div>` becomes the sole root

**Do NOT touch `RegisterLayout.tsx`** — register routes are outside `_app/` and need their own Navbar.

### 3e. Update tests

Five test files need updating after the move:

- `src/__tests__/CalendarPageArchitecture.test.ts` — regex expects `../api/mira`; update to `../../api/mira`
- `src/__tests__/BookingPageArchitecture.test.ts` — regex expects `../../api/mira`; update to `../../../api/mira`
- `src/__tests__/CalendarPage.test.tsx` — remove `vi.mock('../components/Navbar', ...)` and the `expect(screen.getByTestId('navbar'))` assertion; update test name
- `src/__tests__/HomeFooter.test.tsx` — render `<Footer />` directly instead of `<Home />`; remove `QueryClientProvider` and API mocks
- `src/__tests__/EditListingPage.test.tsx`, `MyCredentialsPage.test.tsx`, `MyListingsPage.test.tsx`, `BookingPageArchitecture.test.ts`, `CalendarPageArchitecture.test.ts` — update route import paths from `../routes/…` to `../routes/_app/…`

---

## Verification

1. `npm run dev` — dev server starts with no TypeScript or router errors
2. Visit `/` — single Navbar at top, Footer at bottom
3. Visit `/calendar`, `/chat`, `/my-listings`, `/browse-services`, `/browse-users` — same chrome, correct content
4. Visit `/login` — no Navbar, no Footer
5. Visit `/register` — Navbar from RegisterLayout, no Footer
6. `npm test` — all tests pass (or only pre-existing failures)
