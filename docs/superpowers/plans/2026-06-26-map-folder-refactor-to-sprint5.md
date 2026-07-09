# Map Folder Refactor To Sprint5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reapply the navbar/layout-route and component folder refactor work from `refactor/folder-structure` onto current `sprint5`, preserving the newer profile, accessibility, meta, and deployment changes already merged into `sprint5`.

**Architecture:** Treat `refactor/folder-structure` as a reference branch, not as a branch to merge or cherry-pick wholesale. Port the layout route first, then move the existing current-branch component files directly into the final umbrella structure: `src/components/common` and `src/components/features`. Update route/test imports after each move and let TanStack Router regenerate `src/routeTree.gen.ts`.

**Tech Stack:** React 19, TanStack Router file routes, TypeScript, Vitest, Vite, ESLint, Orval

---

## Subagent Prime Directive

Every implementation subagent must work from current `sprint5` files as the source of truth.

Use `refactor/folder-structure` only as guidance for:

- the intended order of operations
- examples of route layout changes
- examples of file destinations
- examples of import rewrites

Do not copy files wholesale from `refactor/folder-structure`, do not merge it, and do not cherry-pick its commits without first comparing against current `sprint5`. If old-branch code differs from current `sprint5`, preserve current `sprint5` behavior and adapt only the structure/imports. This specifically protects newer navbar, profile, accessibility, metadata, deployment, openapi, and test changes.

## Fast Execution Mode

Because the target structure is now clear, use this shortened execution path unless a verification step fails:

1. Baseline once.
2. Apply the `_app` layout route and footer extraction as one task while components are still in the current flat `src/components` structure.
3. Move all `common` and `features` files in one mechanical structure task.
4. Fix imports/tests/route IDs in one integration task, including the `_app` route imports that changed because `Navbar` and `Footer` moved.
5. Run the full verification suite once at the end, plus targeted `npx tsc --noEmit` after any large import rewrite.

Do not run the entire CI suite after each folder subgroup. Use TypeScript as the fast feedback loop during the mechanical migration, then run the complete local CI surface before final commit.

This is not parallel implementation. The tasks are sequential because the route import paths depend on where the files live at that moment. "Subagent-driven" means a fresh focused subagent per stage, not simultaneous edits to the same tree.

Fast sequential subagent split:

```text
Subagent A: Task 1 only - layout route/footer using current flat src/components imports, preserving current sprint5 Navbar.
Subagent B: Tasks 2 and 3 together - all git mv operations into src/components/common and src/components/features.
Subagent C: Task 4 - import repair after the moves, route tree generation, tests, lint, build, openapi, cleanup.
Controller: final spec review and code-quality review across the whole diff.
```

Fallback rule: if Subagent B or C reports `BLOCKED` or the import repair becomes noisy, split by domain in this order: common/layout+ui, auth/home/register/search, listings/bookings/credentials, chat/profiles/payments.

## Branch Facts

Current target branch:

```bash
git branch --show-current
```

Expected: `sprint5`

Relevant source commits on `refactor/folder-structure`:

```text
7dacdab added layout route with navbar and footer
b462373 refactor: snapshot component structure tasks 1-7
9ffc4c8 refactor: move register components to feature folder
af09f02 chore: finalize component refactor cleanup
bdd3ca6 folder structure update
```

Important constraint: do not merge or cherry-pick the whole old branch. Its history predates later `sprint5` work and the raw diff includes unrelated deletes/changes to Docker, docs, favicons, openapi files, profile routes, and accessibility work.

Navbar correction: `7dacdab` is only the source for the `_app` layout route shape and the extracted footer. It does not contain the newer `sprint5` navbar behavior. Preserve the current `sprint5` navbar implementation, including `MobileNavDrawer`, role-aware links, hidden Calendar/Chat links for logged-out visitors, `My Services` for providers, the `VITE_API_BASE_URL` login URL, and `UserMenu` profile-link behavior. During this migration, navbar files should be moved and import-adjusted, not rewritten to match `refactor/folder-structure`.

## Final Target Structure

```text
src/components/
├── common/
│   ├── InfoPage.tsx
│   ├── infoPages.ts
│   ├── layout/
│   │   ├── AccessibilityPanel.tsx
│   │   ├── BreadCrumb.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNavDrawer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   └── UserMenu.tsx
│   └── ui/
│       ├── AvatarIcon.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Logo.tsx
│       ├── Modal.tsx
│       ├── MultiSelect.tsx
│       ├── Popover.tsx
│       ├── Slider.tsx
│       ├── Switch.tsx
│       └── Textarea.tsx
└── features/
    ├── auth/
    │   └── LoginCallback.tsx
    ├── bookings/
    │   ├── BookingCard.tsx
    │   ├── BookingPage.tsx
    │   ├── CalendarGrid.tsx
    │   ├── CalendarPage.tsx
    │   ├── ExceptionModal.tsx
    │   ├── MyBookings.tsx
    │   └── WeeklyScheduleModal.tsx
    ├── chat/
    │   ├── ChatBubble.tsx
    │   ├── ChatInbox.tsx
    │   └── ChatPageView.tsx
    ├── credentials/
    │   ├── CredentialCard.tsx
    │   ├── CredentialDocumentViewer.tsx
    │   ├── Credentials.tsx
    │   └── SubmitCredentialModal.tsx
    ├── home/
    │   ├── CategoryCard.tsx
    │   └── Home.tsx
    ├── listings/
    │   ├── CreateListing.tsx
    │   ├── EditListing.tsx
    │   ├── ListingDetailPage.tsx
    │   ├── ListingProviderCard.tsx
    │   ├── MyListingCard.tsx
    │   ├── MyListings.tsx
    │   ├── ServiceCard.tsx
    │   ├── ServiceCardChat.tsx
    │   └── ServiceCardEdit.tsx
    ├── payments/
    │   └── PaymentReturnPage.tsx
    ├── profiles/
    │   ├── EditProfileForm.tsx
    │   ├── PrivateProfilePage.tsx
    │   ├── ProfilePageContent.tsx
    │   ├── ProfilePageLoadingError.tsx
    │   └── PublicProfilePage.tsx
    ├── register/
    │   ├── RegisterAbout.tsx
    │   ├── RegisterAddress.tsx
    │   ├── RegisterDone.tsx
    │   ├── RegisterLayout.tsx
    │   ├── RegisterName.tsx
    │   ├── RegisterPhoto.tsx
    │   └── RegisterRole.tsx
    └── search/
        ├── FilterBar.tsx
        ├── FilterDrawer.tsx
        ├── ProviderServicesSection.tsx
        ├── SearchBar.tsx
        ├── SearchRootPage.tsx
        ├── SearchServicesPage.tsx
        ├── SearchUsersPage.tsx
        ├── ServiceUserToggle.tsx
        ├── UserCard.tsx
        ├── UserTypeFilter.tsx
        └── searchSchemas.ts
```

The files under `chat/`, `payments/`, and `profiles/` exist on current `sprint5` and must be kept. The earlier implementation-ready plan dropped some of these because they did not exist on that older snapshot.

## Import Prefix Reference

```text
src/routes/__root.tsx                    -> ../components/...
src/routes/login.tsx                     -> ../components/...
src/routes/register/*.tsx                -> ../../components/...
src/routes/_app/*.tsx                    -> ../../components/...
src/routes/_app/_search/*.tsx            -> ../../../components/...
src/routes/_app/bookings/payment/*.tsx   -> ../../../../components/...
src/routes/_app/listings/*.tsx           -> ../../../components/...
src/__tests__/*.tsx                      -> ../components/...
src/components/features/*/*.tsx          -> ../../common/... or ../sibling-feature/...
src/components/common/*.tsx              -> ./layout/... or ./ui/...
src/components/common/layout/*.tsx       -> ../ui/... and ../../../lib|stores/...
src/components/common/ui/*.tsx           -> ../../../lib|stores/... when needed
```

## Task 0: Baseline And Guardrails

**Files:**
- Read-only: current working tree

- [ ] **Step 1: Confirm branch and cleanliness**

Run:

```bash
git branch --show-current
git status --short
```

Expected: branch is `sprint5`; status is empty or contains only this plan file if it has already been added.

- [ ] **Step 2: Record source branch facts**

Run:

```bash
git log --oneline --decorate --left-right --cherry-pick sprint5...refactor/folder-structure | head -n 80
git show --name-status --oneline 7dacdab | sed -n '1,220p'
git show --name-status --oneline bdd3ca6 | sed -n '1,220p'
```

Expected: `7dacdab` shows the `_app` layout route change; `bdd3ca6` shows the final `src/components/{common,features}` umbrella move.

- [ ] **Step 3: Run baseline verification**

Run:

```bash
npx tsc --noEmit
npm run test:ci
npm run test:a11y
npm run lint
npm run check:routes-no-html
npm run openapi
```

Expected: all commands pass before refactoring. If a command fails before edits, stop and capture the failure as a baseline issue instead of fixing it inside this migration.

## Task 1: Port Navbar Layout Route First

**Files:**
- Create: `src/components/Footer.tsx` or `src/components/common/layout/Footer.tsx`
- Create: `src/routes/_app/route.tsx`
- Move: route files from `src/routes/` into `src/routes/_app/`
- Modify: page components that currently render `<Navbar />`
- Modify: route tests and raw-source architecture tests

- [ ] **Step 1: Create route and optional layout destination folders**

Run:

```bash
mkdir -p src/components/common/layout src/routes/_app
```

- [ ] **Step 2: Extract `Footer` without changing navbar behavior**

Create `Footer` using the `Footer` from old commit `7dacdab`. If you have not moved `Logo.tsx` yet, create this as `src/components/Footer.tsx` and import `Logo` from `./Logo`; Task 2 will move it to `src/components/common/layout/Footer.tsx`. If you create it directly as `src/components/common/layout/Footer.tsx`, move `Logo.tsx` first or use a temporary import and fix it in Task 2.

For a direct final-location file, the content is:

```tsx
import { Link } from '@tanstack/react-router'
import { Logo } from '../ui/Logo'

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
                  <span className="text-cream/30 select-none" aria-hidden="true">
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
```

Important: do not copy `Navbar.tsx`, `UserMenu.tsx`, or any navbar-related code from `refactor/folder-structure`. Current `sprint5` has newer navbar behavior and must remain the source of truth.

- [ ] **Step 3: Create `_app` layout route**

Create `src/routes/_app/route.tsx`:

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Footer } from '../../components/Footer'
import { Navbar } from '../../components/Navbar'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}
```

If `Footer` and `Navbar` are already in `src/components/common/layout`, use these imports instead:

```tsx
import { Footer } from '../../components/common/layout/Footer'
import { Navbar } from '../../components/common/layout/Navbar'
```

- [ ] **Step 4: Move app routes under `_app`**

Run:

```bash
git mv src/routes/index.tsx src/routes/_app/index.tsx
git mv src/routes/about.tsx src/routes/_app/about.tsx
git mv src/routes/accessibility.tsx src/routes/_app/accessibility.tsx
git mv src/routes/calendar.tsx src/routes/_app/calendar.tsx
git mv src/routes/chat.tsx src/routes/_app/chat.tsx
git mv src/routes/contact-us.tsx src/routes/_app/contact-us.tsx
git mv src/routes/create-listing.tsx src/routes/_app/create-listing.tsx
git mv "src/routes/edit-listing.\$listingId.tsx" "src/routes/_app/edit-listing.\$listingId.tsx"
git mv src/routes/my-bookings.tsx src/routes/_app/my-bookings.tsx
git mv src/routes/my-credentials.tsx src/routes/_app/my-credentials.tsx
git mv src/routes/my-listings.tsx src/routes/_app/my-listings.tsx
git mv src/routes/privacy-policy.tsx src/routes/_app/privacy-policy.tsx
git mv "src/routes/profile.\$userId.tsx" "src/routes/_app/profile.\$userId.tsx"
git mv "src/routes/profile.\$userId.edit.tsx" "src/routes/_app/profile.\$userId.edit.tsx"
git mv src/routes/styleguide.tsx src/routes/_app/styleguide.tsx
git mv src/routes/terms-of-use.tsx src/routes/_app/terms-of-use.tsx
git mv src/routes/bookings src/routes/_app/bookings
git mv src/routes/listings src/routes/_app/listings
git mv src/routes/_search src/routes/_app/_search
```

Do not move:

```text
src/routes/__root.tsx
src/routes/login.tsx
src/routes/register/*
```

- [ ] **Step 5: Update route IDs**

Every moved file must prepend `/_app` inside `createFileRoute`.

```text
/                                  -> /_app/
/about                             -> /_app/about
/accessibility                     -> /_app/accessibility
/calendar                          -> /_app/calendar
/chat                              -> /_app/chat
/contact-us                        -> /_app/contact-us
/create-listing                    -> /_app/create-listing
/edit-listing/$listingId           -> /_app/edit-listing/$listingId
/my-bookings                       -> /_app/my-bookings
/my-credentials                    -> /_app/my-credentials
/my-listings                       -> /_app/my-listings
/privacy-policy                    -> /_app/privacy-policy
/profile/$userId                   -> /_app/profile/$userId
/profile/$userId/edit              -> /_app/profile/$userId/edit
/styleguide                        -> /_app/styleguide
/terms-of-use                      -> /_app/terms-of-use
/bookings/payment/success          -> /_app/bookings/payment/success
/bookings/payment/cancelled        -> /_app/bookings/payment/cancelled
/listings/$listingId/              -> /_app/listings/$listingId/
/listings/$listingId_/book         -> /_app/listings/$listingId_/book
/_search                           -> /_app/_search
/_search/browse-services           -> /_app/_search/browse-services
/_search/browse-users              -> /_app/_search/browse-users
```

- [ ] **Step 6: Update relative imports in moved routes**

Use these mechanical rules:

```text
src/routes/*.tsx moved to src/routes/_app/*.tsx:
  ../components/... -> ../../components/...
  ../api/...        -> ../../api/...
  ../lib/...        -> ../../lib/...
  ../stores/...     -> ../../stores/...

src/routes/bookings/payment/*.tsx moved to src/routes/_app/bookings/payment/*.tsx:
  ../../../components/... -> ../../../../components/...
  ../../../api/...        -> ../../../../api/...
  ../../../lib/...        -> ../../../../lib/...

src/routes/listings/*.tsx moved to src/routes/_app/listings/*.tsx:
  ../../components/... -> ../../../components/...
  ../../api/...        -> ../../../api/...
  ../../lib/...        -> ../../../lib/...

src/routes/_search/*.tsx moved to src/routes/_app/_search/*.tsx:
  ../../components/... -> ../../../components/...
  ../../api/...        -> ../../../api/...
  ../../lib/...        -> ../../../lib/...
```

- [ ] **Step 7: Remove duplicated page-level navbars**

Remove `Navbar` imports and rendered `<Navbar />` from these current-branch files:

```text
src/components/Home.tsx
src/components/CalendarPage.tsx
src/components/ProfilePageLoadingError.tsx
src/components/InfoPage.tsx
src/components/ChatPageView.tsx
src/components/BookingPage.tsx
src/components/CreateListing.tsx
src/components/Credentials.tsx
src/components/MyListings.tsx
src/components/EditListing.tsx
src/components/MyBookings.tsx
src/components/ProfilePageContent.tsx
src/components/PaymentReturnPage.tsx
src/components/ListingDetailPage.tsx
src/components/EditProfileForm.tsx
src/components/search/pages/SearchRootPage.tsx
src/components/search/pages/SearchServicesPage.tsx
src/components/search/pages/SearchUsersPage.tsx
```

Do not remove the navbar from `src/components/RegisterLayout.tsx`; register routes stay outside `_app`.

- [ ] **Step 8: Update route API references**

Search:

```bash
rg -n "getRouteApi\\('/_search|getRouteApi\\(\"/_search|/_search/browse" src
```

Replace search route IDs with:

```text
/_app/_search/browse-services
/_app/_search/browse-users
```

- [ ] **Step 9: Update tests for the layout route**

Update imports from route files to the `_app` path where needed, for example:

```text
../routes/calendar                      -> ../routes/_app/calendar
../routes/create-listing                -> ../routes/_app/create-listing
../routes/edit-listing.$listingId       -> ../routes/_app/edit-listing.$listingId
../routes/my-bookings                   -> ../routes/_app/my-bookings
../routes/my-credentials                -> ../routes/_app/my-credentials
../routes/my-listings                   -> ../routes/_app/my-listings
../routes/listings/$listingId.index     -> ../routes/_app/listings/$listingId.index
```

Update `HomeFooter.test.tsx` to render `Footer` directly from `../components/common/layout/Footer`.

Remove stale navbar mocks/assertions from page tests where the navbar is now supplied by `_app`.

- [ ] **Step 10: Regenerate and verify after Task 1**

Run:

```bash
npm run dev
```

Wait until the Vite/TanStack Router plugin regenerates `src/routeTree.gen.ts`, then stop the server.

Run:

```bash
npx tsc --noEmit
npm run test:ci
```

Expected: both pass before starting the folder move.

Commit:

```bash
git add src docs/superpowers/plans/2026-06-26-map-folder-refactor-to-sprint5.md
git commit -m "refactor: add app layout route"
```

## Task 2: Move Common Layout And UI Under Components

**Files:**
- Move: shared primitives to `src/components/common/ui`
- Move: shared chrome to `src/components/common/layout`
- Move: info pages to `src/components/common`
- Modify: imports in moved files, routes, tests, and feature components

- [ ] **Step 1: Create destination folders**

Run:

```bash
mkdir -p src/components/common/ui src/components/common/layout
```

- [ ] **Step 2: Move UI primitives**

Run:

```bash
git mv src/components/AvatarIcon.tsx src/components/common/ui/AvatarIcon.tsx
git mv src/components/Badge.tsx src/components/common/ui/Badge.tsx
git mv src/components/Button.tsx src/components/common/ui/Button.tsx
git mv src/components/Input.tsx src/components/common/ui/Input.tsx
git mv src/components/Label.tsx src/components/common/ui/Label.tsx
git mv src/components/Logo.tsx src/components/common/ui/Logo.tsx
git mv src/components/Modal.tsx src/components/common/ui/Modal.tsx
git mv src/components/MultiSelect.tsx src/components/common/ui/MultiSelect.tsx
git mv src/components/Popover.tsx src/components/common/ui/Popover.tsx
git mv src/components/Slider.tsx src/components/common/ui/Slider.tsx
git mv src/components/Switch.tsx src/components/common/ui/Switch.tsx
git mv src/components/Textarea.tsx src/components/common/ui/Textarea.tsx
```

- [ ] **Step 3: Move shared layout/info files**

Run:

```bash
git mv src/components/AccessibilityPanel.tsx src/components/common/layout/AccessibilityPanel.tsx
git mv src/components/BreadCrumb.tsx src/components/common/layout/BreadCrumb.tsx
git mv src/components/MobileNavDrawer.tsx src/components/common/layout/MobileNavDrawer.tsx
git mv src/components/Navbar.tsx src/components/common/layout/Navbar.tsx
git mv src/components/Pagination.tsx src/components/common/layout/Pagination.tsx
git mv src/components/UserMenu.tsx src/components/common/layout/UserMenu.tsx
git mv src/components/InfoPage.tsx src/components/common/InfoPage.tsx
git mv src/components/infoPages.ts src/components/common/infoPages.ts
```

If `Footer.tsx` was created at `src/components/Footer.tsx` during Task 1, move it now:

```bash
git mv src/components/Footer.tsx src/components/common/layout/Footer.tsx
```

- [ ] **Step 4: Fix common-internal imports**

Use these final paths:

```text
src/components/common/layout/Navbar.tsx:
  ../ui/Logo
  ./AccessibilityPanel
  ./UserMenu
  ./MobileNavDrawer
  ../../../stores/auth
  ../../../lib/mediaUrl
  keep API_BASE_URL and current navLinks logic from sprint5

src/components/common/layout/UserMenu.tsx:
  ../ui/AvatarIcon
  ../ui/Button
  ../ui/Popover
  ../../../stores/auth
  keep useAuthStore/profilePath behavior from sprint5

src/components/common/layout/MobileNavDrawer.tsx:
  ../ui/Button
  ../ui/AvatarIcon
  ./UserMenu
  ../../../stores/auth

src/components/common/layout/AccessibilityPanel.tsx:
  ../ui/Button
  ../ui/Popover
  ../ui/Switch

src/components/common/InfoPage.tsx:
  ./layout/Navbar should be removed already by Task 1
```

- [ ] **Step 5: Update callers of common files**

Run:

```bash
rg -n "components/(AvatarIcon|Badge|Button|Input|Label|Logo|Modal|MultiSelect|Popover|Slider|Switch|Textarea|AccessibilityPanel|BreadCrumb|Footer|MobileNavDrawer|Navbar|Pagination|UserMenu|InfoPage|infoPages)" src
```

Replace imports with the final common locations:

```text
components/common/ui/<Name>
components/common/layout/<Name>
components/common/InfoPage
components/common/infoPages
```

- [ ] **Step 6: Verify Task 2**

Run:

```bash
npx tsc --noEmit
npm run test:ci
```

Expected: both pass.

Commit:

```bash
git add src
git commit -m "refactor: move shared components under common"
```

## Task 3: Move Feature Components Under Components

**Files:**
- Move: domain files into `src/components/features/*`
- Modify: feature-internal imports, route imports, and tests

- [ ] **Step 1: Create feature folders**

Run:

```bash
mkdir -p src/components/features/auth src/components/features/bookings src/components/features/chat src/components/features/credentials src/components/features/home src/components/features/listings src/components/features/payments src/components/features/profiles src/components/features/register src/components/features/search
```

- [ ] **Step 2: Move auth, home, search, and register**

Run:

```bash
git mv src/components/LoginCallback.tsx src/components/features/auth/LoginCallback.tsx
git mv src/components/Home.tsx src/components/features/home/Home.tsx
git mv src/components/CategoryCard.tsx src/components/features/home/CategoryCard.tsx
git mv src/components/search/SearchBar.tsx src/components/features/search/SearchBar.tsx
git mv src/components/search/ServiceUserToggle.tsx src/components/features/search/ServiceUserToggle.tsx
git mv src/components/search/UserTypeFilter.tsx src/components/features/search/UserTypeFilter.tsx
git mv src/components/search/searchSchemas.ts src/components/features/search/searchSchemas.ts
git mv src/components/search/cards/ProviderServicesSection.tsx src/components/features/search/ProviderServicesSection.tsx
git mv src/components/search/cards/UserCard.tsx src/components/features/search/UserCard.tsx
git mv src/components/search/pages/SearchRootPage.tsx src/components/features/search/SearchRootPage.tsx
git mv src/components/search/pages/SearchServicesPage.tsx src/components/features/search/SearchServicesPage.tsx
git mv src/components/search/pages/SearchUsersPage.tsx src/components/features/search/SearchUsersPage.tsx
git mv src/components/FilterBar.tsx src/components/features/search/FilterBar.tsx
git mv src/components/FilterDrawer.tsx src/components/features/search/FilterDrawer.tsx
git mv src/components/RegisterAbout.tsx src/components/features/register/RegisterAbout.tsx
git mv src/components/RegisterAddress.tsx src/components/features/register/RegisterAddress.tsx
git mv src/components/RegisterDone.tsx src/components/features/register/RegisterDone.tsx
git mv src/components/RegisterLayout.tsx src/components/features/register/RegisterLayout.tsx
git mv src/components/RegisterName.tsx src/components/features/register/RegisterName.tsx
git mv src/components/RegisterPhoto.tsx src/components/features/register/RegisterPhoto.tsx
git mv src/components/RegisterRole.tsx src/components/features/register/RegisterRole.tsx
```

- [ ] **Step 3: Move listings, bookings, credentials, chat, profiles, and payments**

Run:

```bash
git mv src/components/CreateListing.tsx src/components/features/listings/CreateListing.tsx
git mv src/components/EditListing.tsx src/components/features/listings/EditListing.tsx
git mv src/components/ListingDetailPage.tsx src/components/features/listings/ListingDetailPage.tsx
git mv src/components/ListingProviderCard.tsx src/components/features/listings/ListingProviderCard.tsx
git mv src/components/MyListingCard.tsx src/components/features/listings/MyListingCard.tsx
git mv src/components/MyListings.tsx src/components/features/listings/MyListings.tsx
git mv src/components/ServiceCard.tsx src/components/features/listings/ServiceCard.tsx
git mv src/components/ServiceCardChat.tsx src/components/features/listings/ServiceCardChat.tsx
git mv src/components/ServiceCardEdit.tsx src/components/features/listings/ServiceCardEdit.tsx
git mv src/components/BookingCard.tsx src/components/features/bookings/BookingCard.tsx
git mv src/components/BookingPage.tsx src/components/features/bookings/BookingPage.tsx
git mv src/components/CalendarGrid.tsx src/components/features/bookings/CalendarGrid.tsx
git mv src/components/CalendarPage.tsx src/components/features/bookings/CalendarPage.tsx
git mv src/components/ExceptionModal.tsx src/components/features/bookings/ExceptionModal.tsx
git mv src/components/MyBookings.tsx src/components/features/bookings/MyBookings.tsx
git mv src/components/WeeklyScheduleModal.tsx src/components/features/bookings/WeeklyScheduleModal.tsx
git mv src/components/CredentialCard.tsx src/components/features/credentials/CredentialCard.tsx
git mv src/components/CredentialDocumentViewer.tsx src/components/features/credentials/CredentialDocumentViewer.tsx
git mv src/components/Credentials.tsx src/components/features/credentials/Credentials.tsx
git mv src/components/SubmitCredentialModal.tsx src/components/features/credentials/SubmitCredentialModal.tsx
git mv src/components/ChatBubble.tsx src/components/features/chat/ChatBubble.tsx
git mv src/components/ChatInbox.tsx src/components/features/chat/ChatInbox.tsx
git mv src/components/ChatPageView.tsx src/components/features/chat/ChatPageView.tsx
git mv src/components/EditProfileForm.tsx src/components/features/profiles/EditProfileForm.tsx
git mv src/components/PrivateProfilePage.tsx src/components/features/profiles/PrivateProfilePage.tsx
git mv src/components/ProfilePageContent.tsx src/components/features/profiles/ProfilePageContent.tsx
git mv src/components/ProfilePageLoadingError.tsx src/components/features/profiles/ProfilePageLoadingError.tsx
git mv src/components/PublicProfilePage.tsx src/components/features/profiles/PublicProfilePage.tsx
git mv src/components/PaymentReturnPage.tsx src/components/features/payments/PaymentReturnPage.tsx
```

- [ ] **Step 4: Fix feature imports**

Use these final import patterns:

```text
Feature -> common UI/layout:
  ../../common/ui/Button
  ../../common/layout/BreadCrumb
  ../../common/layout/Pagination

Feature -> same feature:
  ./SiblingComponent

Feature -> sibling feature:
  ../listings/ServiceCard
  ../search/UserCard

Feature -> app libraries:
  ../../../api/...
  ../../../lib/...
  ../../../stores/...
  ../../../hooks/...
```

Known cross-feature references to check:

```text
src/components/features/search/SearchServicesPage.tsx -> ../listings/ServiceCard
src/components/features/profiles/PublicProfilePage.tsx -> ../listings/ServiceCard
src/components/features/profiles/PrivateProfilePage.tsx -> ../listings/ServiceCard
src/components/features/chat/ChatPageView.tsx -> ./ChatBubble and ./ChatInbox
src/components/features/listings/ListingDetailPage.tsx -> ./ListingProviderCard and ./ServiceCardChat
src/components/features/listings/MyListings.tsx -> ./MyListingCard and ./ServiceCardEdit
src/components/features/register/RegisterLayout.tsx -> ../../common/layout/Navbar and ../../common/ui/Logo
```

- [ ] **Step 5: Update route imports**

Run:

```bash
rg -n "components/(Home|LoginCallback|Search|Filter|UserTypeFilter|ServiceUserToggle|ProviderServicesSection|UserCard|CreateListing|EditListing|Listing|ServiceCard|Booking|Calendar|Exception|MyBookings|Credential|SubmitCredential|Register|Chat|Profile|Payment)" src/routes src/__tests__
```

Replace route imports with the final feature locations, for example:

```text
../../components/features/home/Home
../../components/features/auth/LoginCallback
../../components/features/search/SearchServicesPage
../../components/features/listings/CreateListing
../../components/features/bookings/CalendarPage
../../components/features/credentials/Credentials
../../components/features/profiles/PublicProfilePage
../../components/features/chat/ChatPageView
../../components/features/payments/PaymentReturnPage
../../components/features/register/RegisterLayout
```

- [ ] **Step 6: Update raw-source tests**

Replace raw imports:

```text
../components/BookingPage.tsx?raw         -> ../components/features/bookings/BookingPage.tsx?raw
../components/BookingCard.tsx?raw         -> ../components/features/bookings/BookingCard.tsx?raw
../components/CalendarPage.tsx?raw        -> ../components/features/bookings/CalendarPage.tsx?raw
../components/RegisterDone.tsx?raw        -> ../components/features/register/RegisterDone.tsx?raw
../components/RegisterRole.tsx?raw        -> ../components/features/register/RegisterRole.tsx?raw
../components/RegisterLayout.tsx?raw      -> ../components/features/register/RegisterLayout.tsx?raw
```

- [ ] **Step 7: Delete empty legacy directories**

Run:

```bash
find src/components -type d -empty -print
```

Remove only empty directories under the old `src/components/search` tree after confirming they are empty.

- [ ] **Step 8: Verify Task 3**

Run:

```bash
npx tsc --noEmit
npm run test:ci
```

Expected: both pass.

Commit:

```bash
git add src
git commit -m "refactor: move domain components under features"
```

## Task 4: Route Tree, Lint, A11y, And Cleanup

**Files:**
- Modify: `src/routeTree.gen.ts` via router plugin regeneration only
- Modify: any remaining stale imports
- Verify: full local CI surface

- [ ] **Step 1: Check for stale imports**

Run:

```bash
rg -n "from ['\"](\\.\\./)?components/(?!common|features)|from ['\"]\\.\\.?/components/(?!common|features)|src/components/(?!common|features)" src
rg -n "src/common|src/features|\\.\\./common|\\.\\./features|@/common|@/features" src
```

Expected: no stale imports to the old flat component locations and no intermediate `src/common` or `src/features` paths.

- [ ] **Step 2: Regenerate route tree**

Run:

```bash
npm run dev
```

Expected: Vite starts, TanStack Router regenerates `src/routeTree.gen.ts`, and there are no file-route ID errors. Stop the dev server after generation.

- [ ] **Step 3: Run full verification**

Run:

```bash
npx tsc --noEmit
npm run test:ci
npm run test:a11y
npm run lint
npm run check:routes-no-html
npm run build
npm run openapi
```

Expected:

```text
TypeScript clean
Vitest unit/coverage clean
Vitest a11y clean
ESLint clean
Route HTML check clean
Production build clean
Orval generation clean
```

- [ ] **Step 4: Inspect generated or incidental changes**

Run:

```bash
git status --short
git diff --stat
git diff -- src/routeTree.gen.ts | sed -n '1,220p'
git diff -- package-lock.json package.json orval.config.ts mira-api.yaml | sed -n '1,220p'
```

Expected: `routeTree.gen.ts` changed only because routes moved. There should be no incidental package, openapi, Docker, favicon, or unrelated docs changes.

- [ ] **Step 5: Final commit**

Run:

```bash
git add src docs/superpowers/plans/2026-06-26-map-folder-refactor-to-sprint5.md
git commit -m "chore: verify folder structure migration"
```

## Task 5: Manual Smoke Check

**Files:**
- Runtime only

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

- [ ] **Step 2: Visit the key pages**

Open these paths:

```text
/
/browse-services
/browse-users
/calendar
/chat
/my-listings
/my-bookings
/my-credentials
/profile/<known-user-id>
/login
/register
```

Expected:

```text
App pages: one Navbar and one Footer from _app
/login: no app Navbar/Footer
/register: RegisterLayout Navbar remains, no app Footer
Search pages: URL/search params still work
Profile/chat/payment pages: preserved from current sprint5, not deleted
```

## Self-Review Checklist

- [ ] Navbar/layout change is applied before folder moves.
- [ ] Final structure is `src/components/common` and `src/components/features`, not intermediate `src/common` or `src/features`.
- [ ] Current-only files are preserved: chat, profile, payment, and service-card variants.
- [ ] `RegisterLayout` keeps its navbar because register routes stay outside `_app`.
- [ ] `src/routeTree.gen.ts` is generated, not manually edited.
- [ ] `ki-nutzungsprotokoll.md` and unrelated infra/docs/assets are not touched by this migration.
