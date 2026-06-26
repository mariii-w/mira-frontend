# Component Structure Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise the flat `src/components/` (62 files) into a feature-based structure (`src/features/`) with a shared primitives area (`src/common/`), so every component lives next to the domain it belongs to.

**Architecture:** Files move — no component logic changes. Routes in `src/routes/` keep their file-based structure and update import paths. Tests in `src/__tests__/` update import paths only. `src/lib/`, `src/stores/`, `src/hooks/`, and `src/api/` are untouched. `routeTree.gen.ts` is auto-generated — never edit it manually.

**Tech Stack:** React 19, TanStack Router v1 (file-based, Vite plugin), TypeScript, Vitest

## Global Constraints

- `git mv` every move — preserves git history
- Zero logic changes — imports and file locations only
- `npx tsc --noEmit` must pass after each task before proceeding
- Do not edit `routeTree.gen.ts` — it regenerates on dev server start
- ⚠️ After this refactor lands, the `_app` layout route plan (`docs/superpowers/plans/2026-06-26-app-layout-route.md`) has stale import paths (it still references `../../components/X`). Update those paths to the new locations before executing that plan.

---

## Target Structure

```
src/
├── routes/            ← unchanged
├── features/
│   ├── home/
│   ├── auth/
│   ├── search/        ← flattened (no cards/ or pages/ subdirs)
│   ├── listings/
│   ├── bookings/
│   ├── profile/
│   ├── chat/
│   ├── credentials/
│   └── register/
├── common/
│   ├── ui/            ← design system primitives
│   └── layout/        ← navigation & layout chrome
├── hooks/
├── lib/
├── stores/
└── api/
```

## Complete File Move Table

| From `src/components/` | To `src/` |
|---|---|
| `Button.tsx` | `common/ui/Button.tsx` |
| `Input.tsx` | `common/ui/Input.tsx` |
| `Label.tsx` | `common/ui/Label.tsx` |
| `Badge.tsx` | `common/ui/Badge.tsx` |
| `Textarea.tsx` | `common/ui/Textarea.tsx` |
| `Slider.tsx` | `common/ui/Slider.tsx` |
| `Switch.tsx` | `common/ui/Switch.tsx` |
| `Modal.tsx` | `common/ui/Modal.tsx` |
| `Popover.tsx` | `common/ui/Popover.tsx` |
| `Logo.tsx` | `common/ui/Logo.tsx` |
| `MultiSelect.tsx` | `common/ui/MultiSelect.tsx` |
| `AvatarIcon.tsx` | `common/ui/AvatarIcon.tsx` |
| `Navbar.tsx` | `common/layout/Navbar.tsx` |
| `MobileNavDrawer.tsx` | `common/layout/MobileNavDrawer.tsx` |
| `BreadCrumb.tsx` | `common/layout/BreadCrumb.tsx` |
| `Pagination.tsx` | `common/layout/Pagination.tsx` |
| `UserMenu.tsx` | `common/layout/UserMenu.tsx` |
| `AccessibilityPanel.tsx` | `common/layout/AccessibilityPanel.tsx` |
| `InfoPage.tsx` | `common/InfoPage.tsx` |
| `infoPages.ts` | `common/infoPages.ts` |
| `Home.tsx` | `features/home/Home.tsx` |
| `CategoryCard.tsx` | `features/home/CategoryCard.tsx` |
| `LoginCallback.tsx` | `features/auth/LoginCallback.tsx` |
| `search/SearchBar.tsx` | `features/search/SearchBar.tsx` |
| `search/searchSchemas.ts` | `features/search/searchSchemas.ts` |
| `search/ServiceUserToggle.tsx` | `features/search/ServiceUserToggle.tsx` |
| `search/UserTypeFilter.tsx` | `features/search/UserTypeFilter.tsx` |
| `search/pages/SearchRootPage.tsx` | `features/search/SearchRootPage.tsx` |
| `search/pages/SearchServicesPage.tsx` | `features/search/SearchServicesPage.tsx` |
| `search/pages/SearchUsersPage.tsx` | `features/search/SearchUsersPage.tsx` |
| `search/cards/UserCard.tsx` | `features/search/UserCard.tsx` |
| `search/cards/ProviderServicesSection.tsx` | `features/search/ProviderServicesSection.tsx` |
| `FilterBar.tsx` | `features/search/FilterBar.tsx` |
| `FilterDrawer.tsx` | `features/search/FilterDrawer.tsx` |
| `CreateListing.tsx` | `features/listings/CreateListing.tsx` |
| `EditListing.tsx` | `features/listings/EditListing.tsx` |
| `ListingDetailPage.tsx` | `features/listings/ListingDetailPage.tsx` |
| `ListingProviderCard.tsx` | `features/listings/ListingProviderCard.tsx` |
| `ServiceCard.tsx` | `features/listings/ServiceCard.tsx` |
| `ServiceCardChat.tsx` | `features/listings/ServiceCardChat.tsx` |
| `ServiceCardEdit.tsx` | `features/listings/ServiceCardEdit.tsx` |
| `MyListingCard.tsx` | `features/listings/MyListingCard.tsx` |
| `MyListings.tsx` | `features/listings/MyListings.tsx` |
| `BookingCard.tsx` | `features/bookings/BookingCard.tsx` |
| `BookingPage.tsx` | `features/bookings/BookingPage.tsx` |
| `MyBookings.tsx` | `features/bookings/MyBookings.tsx` |
| `CalendarPage.tsx` | `features/bookings/CalendarPage.tsx` |
| `CalendarGrid.tsx` | `features/bookings/CalendarGrid.tsx` |
| `WeeklyScheduleModal.tsx` | `features/bookings/WeeklyScheduleModal.tsx` |
| `ExceptionModal.tsx` | `features/bookings/ExceptionModal.tsx` |
| `PaymentReturnPage.tsx` | `features/bookings/PaymentReturnPage.tsx` |
| `ProfilePageContent.tsx` | `features/profile/ProfilePageContent.tsx` |
| `ProfilePageLoadingError.tsx` | `features/profile/ProfilePageLoadingError.tsx` |
| `EditProfileForm.tsx` | `features/profile/EditProfileForm.tsx` |
| `ChatPageView.tsx` | `features/chat/ChatPageView.tsx` |
| `ChatInbox.tsx` | `features/chat/ChatInbox.tsx` |
| `ChatBubble.tsx` | `features/chat/ChatBubble.tsx` |
| `Credentials.tsx` | `features/credentials/Credentials.tsx` |
| `CredentialCard.tsx` | `features/credentials/CredentialCard.tsx` |
| `CredentialDocumentViewer.tsx` | `features/credentials/CredentialDocumentViewer.tsx` |
| `SubmitCredentialModal.tsx` | `features/credentials/SubmitCredentialModal.tsx` |
| `RegisterLayout.tsx` | `features/register/RegisterLayout.tsx` |
| `RegisterRole.tsx` | `features/register/RegisterRole.tsx` |
| `RegisterName.tsx` | `features/register/RegisterName.tsx` |
| `RegisterAddress.tsx` | `features/register/RegisterAddress.tsx` |
| `RegisterPhoto.tsx` | `features/register/RegisterPhoto.tsx` |
| `RegisterAbout.tsx` | `features/register/RegisterAbout.tsx` |
| `RegisterDone.tsx` | `features/register/RegisterDone.tsx` |

⚠️ **Ambiguity — resolve before Task 1:** There is both a root `components/UserCard.tsx` and a `components/search/cards/UserCard.tsx`. Run `grep -r "UserCard" src/routes src/components --include="*.tsx" -l` to find all import sites. If both files are distinct components, place the root one in `common/ui/UserCard.tsx`; if it is search-specific, place it alongside `features/search/UserCard.tsx` (and rename one to avoid collision). The table above assumes they are distinct.

## Import Path Rules

Every file has a depth relative to `src/`. Use these rules when updating imports after each move:

| File location | Prefix to reach `src/` |
|---|---|
| `src/routes/*.tsx` | `../` |
| `src/routes/_search/*.tsx` | `../../` |
| `src/routes/register/*.tsx` | `../../` |
| `src/routes/listings/*.tsx` | `../../` |
| `src/routes/bookings/payment/*.tsx` | `../../../../` |
| `src/__tests__/*.test.tsx` | `../` |
| `src/features/*/*.tsx` | `../../` |
| `src/common/*.tsx` | `../` |
| `src/common/ui/*.tsx` | `../../` |
| `src/common/layout/*.tsx` | `../../` |

Example — `Button` import after Task 1:
- From `src/routes/index.tsx`: `../common/ui/Button`
- From `src/features/listings/EditListing.tsx`: `../../common/ui/Button`
- From `src/__tests__/Button.test.tsx`: `../common/ui/Button`

---

## Task 0: Baseline Verification

**Files:** none (read-only)

- [ ] Run `npx tsc --noEmit` — must exit 0 with no errors
- [ ] Run `npm test` — record the passing test count (expect ~369)
- [ ] Note the result: "Baseline: X tests passing, tsc clean"

---

## Task 1: Move `common/ui/` — Design System Primitives

**Files to create:**
- `src/common/ui/` (12 files: Button, Input, Label, Badge, Textarea, Slider, Switch, Modal, Popover, Logo, MultiSelect, AvatarIcon)

- [ ] **Move files**

```bash
mkdir -p src/common/ui
git mv src/components/Button.tsx src/common/ui/Button.tsx
git mv src/components/Input.tsx src/common/ui/Input.tsx
git mv src/components/Label.tsx src/common/ui/Label.tsx
git mv src/components/Badge.tsx src/common/ui/Badge.tsx
git mv src/components/Textarea.tsx src/common/ui/Textarea.tsx
git mv src/components/Slider.tsx src/common/ui/Slider.tsx
git mv src/components/Switch.tsx src/common/ui/Switch.tsx
git mv src/components/Modal.tsx src/common/ui/Modal.tsx
git mv src/components/Popover.tsx src/common/ui/Popover.tsx
git mv src/components/Logo.tsx src/common/ui/Logo.tsx
git mv src/components/MultiSelect.tsx src/common/ui/MultiSelect.tsx
git mv src/components/AvatarIcon.tsx src/common/ui/AvatarIcon.tsx
```

- [ ] **Fix cross-imports within common/ui**

The moved files may import each other (e.g. a composite component importing Button). Within `src/common/ui/`, all such imports stay `./X` — no path change needed since they moved together.

- [ ] **Fix imports in remaining `src/components/*.tsx` files**

For every file still in `src/components/` that imports one of the 12 moved files, change `from './Button'` (etc.) to `from '../common/ui/Button'`.

Run to find affected files:
```bash
grep -rl "from '\./\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)'" src/components/
```

- [ ] **Fix imports in `src/routes/**/*.tsx`**

Change `from '../components/Button'` → `from '../common/ui/Button'` (adjust depth for nested routes, e.g. `_search/` needs `../../common/ui/Button`).

```bash
grep -rl "components/\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)" src/routes/
```

- [ ] **Fix imports in `src/__tests__/*.test.tsx`**

Change `from '../components/Button'` → `from '../common/ui/Button'` (depth stays `../`).

```bash
grep -rl "components/\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)" src/__tests__/
```

- [ ] **Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move design system primitives to common/ui/"
```

---

## Task 2: Move `common/layout/` — Navigation & Layout Chrome

**Files to create:**
- `src/common/layout/` (6 files: Navbar, MobileNavDrawer, BreadCrumb, Pagination, UserMenu, AccessibilityPanel)

- [ ] **Move files**

```bash
mkdir -p src/common/layout
git mv src/components/Navbar.tsx src/common/layout/Navbar.tsx
git mv src/components/MobileNavDrawer.tsx src/common/layout/MobileNavDrawer.tsx
git mv src/components/BreadCrumb.tsx src/common/layout/BreadCrumb.tsx
git mv src/components/Pagination.tsx src/common/layout/Pagination.tsx
git mv src/components/UserMenu.tsx src/common/layout/UserMenu.tsx
git mv src/components/AccessibilityPanel.tsx src/common/layout/AccessibilityPanel.tsx
```

- [ ] **Fix cross-imports within common/layout**

Files in `common/layout/` that import from `common/ui/` (e.g. Navbar uses Logo, Button): after Task 1 their imports were already updated to `../common/ui/X` (relative from `src/components/`). Now that they sit at `src/common/layout/`, Logo is a peer at `src/common/ui/Logo`, so the correct import becomes `../ui/X`.

Run to find affected files:
```bash
grep -rl "common/ui/" src/common/layout/
```
Change `from '../common/ui/X'` → `from '../ui/X'` in all files under `src/common/layout/`.

- [ ] **Fix imports in remaining `src/components/*.tsx` files**

```bash
grep -rl "from '\./\(Navbar\|MobileNavDrawer\|BreadCrumb\|Pagination\|UserMenu\|AccessibilityPanel\)'" src/components/
```
Change to `from '../common/layout/X'`.

- [ ] **Fix imports in `src/routes/**/*.tsx` and `src/__tests__/`**

```bash
grep -rl "components/\(Navbar\|MobileNavDrawer\|BreadCrumb\|Pagination\|UserMenu\|AccessibilityPanel\)" src/routes/ src/__tests__/
```
Update to `../common/layout/X` (or `../../common/layout/X` for nested routes/test files at depth 2).

- [ ] **Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move navigation/layout components to common/layout/"
```

---

## Task 3: Move `common/` Root + `features/home/` + `features/auth/`

**Files:**
- `src/common/InfoPage.tsx`, `src/common/infoPages.ts`
- `src/features/home/Home.tsx`, `src/features/home/CategoryCard.tsx`
- `src/features/auth/LoginCallback.tsx`

- [ ] **Move files**

```bash
mkdir -p src/common src/features/home src/features/auth
git mv src/components/InfoPage.tsx src/common/InfoPage.tsx
git mv src/components/infoPages.ts src/common/infoPages.ts
git mv src/components/Home.tsx src/features/home/Home.tsx
git mv src/components/CategoryCard.tsx src/features/home/CategoryCard.tsx
git mv src/components/LoginCallback.tsx src/features/auth/LoginCallback.tsx
```

- [ ] **Fix imports inside moved files**

`Home.tsx` — was at `src/components/Home.tsx`, now at `src/features/home/Home.tsx`. Any import like `./Button` must become `../../common/ui/Button`; `./Navbar` → `../../common/layout/Navbar`; `./CategoryCard` → `./CategoryCard` (same folder, unchanged).

`InfoPage.tsx` — was at `src/components/InfoPage.tsx`, now at `src/common/InfoPage.tsx`. Any import like `./Navbar` must become `./layout/Navbar`; `./Button` → `./ui/Button`.

`infoPages.ts` — likely has no component imports (pure data), but verify.

`LoginCallback.tsx` — check for imports like `./Button` → `../../common/ui/Button`.

`CategoryCard.tsx` — check for imports like `./Button` → `../../common/ui/Button`.

- [ ] **Fix callers in `src/routes/`**

Route files that import these components:
- `src/routes/index.tsx`: `from '../components/Home'` → `from '../features/home/Home'`
- `src/routes/login.tsx`: `from '../components/LoginCallback'` → `from '../features/auth/LoginCallback'`
- `src/routes/about.tsx`, `accessibility.tsx`, `contact-us.tsx`, `privacy-policy.tsx`, `terms-of-use.tsx`: `from '../components/InfoPage'` → `from '../common/InfoPage'`; `from '../components/infoPages'` → `from '../common/infoPages'`

- [ ] **Fix callers in `src/__tests__/`**

```bash
grep -rl "components/\(InfoPage\|infoPages\|Home\|CategoryCard\|LoginCallback\)" src/__tests__/
```
Update paths following the depth rule (`../` to reach `src/`).

- [ ] **Verify**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move InfoPage, Home, LoginCallback to common/ and features/"
```

---

## Task 4: Move `features/search/`

**Files:** 9 existing search files — flatten the `pages/` and `cards/` subdirectories.

- [ ] **Move files**

```bash
mkdir -p src/features/search
git mv src/components/search/SearchBar.tsx src/features/search/SearchBar.tsx
git mv src/components/search/searchSchemas.ts src/features/search/searchSchemas.ts
git mv src/components/search/ServiceUserToggle.tsx src/features/search/ServiceUserToggle.tsx
git mv src/components/search/UserTypeFilter.tsx src/features/search/UserTypeFilter.tsx
git mv src/components/search/pages/SearchRootPage.tsx src/features/search/SearchRootPage.tsx
git mv src/components/search/pages/SearchServicesPage.tsx src/features/search/SearchServicesPage.tsx
git mv src/components/search/pages/SearchUsersPage.tsx src/features/search/SearchUsersPage.tsx
git mv src/components/search/cards/UserCard.tsx src/features/search/UserCard.tsx
git mv src/components/search/cards/ProviderServicesSection.tsx src/features/search/ProviderServicesSection.tsx
git mv src/components/FilterBar.tsx src/features/search/FilterBar.tsx
git mv src/components/FilterDrawer.tsx src/features/search/FilterDrawer.tsx
```

- [ ] **Fix imports inside moved files**

Previously a file in `search/pages/SearchServicesPage.tsx` imported siblings like `from '../SearchBar'` or `from '../cards/UserCard'`. After flattening to `features/search/`, all intra-search imports become `from './SearchBar'`, `from './UserCard'`, etc.

Also fix imports of common components — e.g. `from '../../Button'` (old depth from `search/pages/`) → `from '../../common/ui/Button'`.

Key: `SearchServicesPage.tsx` and `SearchUsersPage.tsx` use `getRouteApi` with IDs `'/_search/browse-services'` and `'/_search/browse-users'` — these route ID strings are **not file paths**, do not change them.

- [ ] **Fix callers in `src/routes/_search/`**

```
src/routes/_search/route.tsx:
  '../components/search/pages/SearchRootPage' → '../../features/search/SearchRootPage'

src/routes/_search/browse-services.tsx:
  '../../components/search/pages/SearchServicesPage' → '../../features/search/SearchServicesPage'
  '../../components/search/searchSchemas' → '../../features/search/searchSchemas'

src/routes/_search/browse-users.tsx:
  '../../components/search/pages/SearchUsersPage' → '../../features/search/SearchUsersPage'
```

Note the depth: `_search/` routes are at `src/routes/_search/`, so `../../` reaches `src/`.

- [ ] **Fix callers in `src/__tests__/`**

Files to update: `SearchRootPageFocus.test.tsx`, `SearchServicesPage.test.tsx`, `SearchUsersPage.test.tsx`, `ServiceUserToggle.test.tsx`, `UserTypeFilter.test.tsx`, `searchSchemas.test.ts`, `UserCard.test.tsx`, `ProviderServicesSection.test.tsx`, `FilterBar.test.tsx`, `FilterDrawer.test.tsx`.

Pattern: `from '../components/search/...'` → `from '../features/search/...'` (flatten path, same depth).

- [ ] **Verify**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move search feature to features/search/ (flatten cards/ and pages/)"
```

---

## Task 5: Move `features/listings/`

- [ ] **Move files**

```bash
mkdir -p src/features/listings
git mv src/components/CreateListing.tsx src/features/listings/CreateListing.tsx
git mv src/components/EditListing.tsx src/features/listings/EditListing.tsx
git mv src/components/ListingDetailPage.tsx src/features/listings/ListingDetailPage.tsx
git mv src/components/ListingProviderCard.tsx src/features/listings/ListingProviderCard.tsx
git mv src/components/ServiceCard.tsx src/features/listings/ServiceCard.tsx
git mv src/components/ServiceCardChat.tsx src/features/listings/ServiceCardChat.tsx
git mv src/components/ServiceCardEdit.tsx src/features/listings/ServiceCardEdit.tsx
git mv src/components/MyListingCard.tsx src/features/listings/MyListingCard.tsx
git mv src/components/MyListings.tsx src/features/listings/MyListings.tsx
```

- [ ] **Fix imports inside moved files**

Update any `./Button` → `../../common/ui/Button`, `./Navbar` → `../../common/layout/Navbar`, etc. Intra-listings imports (e.g. `ListingDetailPage` importing `ListingProviderCard`) stay as `./ListingProviderCard` — same folder, no change needed.

Cross-feature imports: if `ListingDetailPage` imports `BookingCard`, that file hasn't moved yet — it's still at `src/components/BookingCard.tsx`. Update to `../bookings/BookingCard` once Task 6 completes, OR temporarily use `../../components/BookingCard` as an intermediate step (tsc will catch it after Task 6).

- [ ] **Fix callers in `src/routes/`**

```
src/routes/create-listing.tsx:
  '../components/CreateListing' → '../features/listings/CreateListing'

src/routes/edit-listing.$listingId.tsx:
  '../components/EditListing' → '../features/listings/EditListing'

src/routes/listings/$listingId.index.tsx:
  '../../components/ListingDetailPage' → '../../features/listings/ListingDetailPage'

src/routes/listings/$listingId_.book.tsx:
  similar depth-2 pattern

src/routes/my-listings.tsx:
  '../components/MyListings' → '../features/listings/MyListings'
```

- [ ] **Fix callers in `src/__tests__/`**

Files: `CreateListingPage.test.tsx`, `EditListingPage.test.tsx`, `ListingDetailPage.test.tsx`, `ListingProviderCard.test.tsx`, `ServiceCard.test.tsx`, `MyListingCard.test.tsx`, `MyListingsPage.test.tsx`.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move listings feature to features/listings/"
```

---

## Task 6: Move `features/bookings/`

- [ ] **Move files**

```bash
mkdir -p src/features/bookings
git mv src/components/BookingCard.tsx src/features/bookings/BookingCard.tsx
git mv src/components/BookingPage.tsx src/features/bookings/BookingPage.tsx
git mv src/components/MyBookings.tsx src/features/bookings/MyBookings.tsx
git mv src/components/CalendarPage.tsx src/features/bookings/CalendarPage.tsx
git mv src/components/CalendarGrid.tsx src/features/bookings/CalendarGrid.tsx
git mv src/components/WeeklyScheduleModal.tsx src/features/bookings/WeeklyScheduleModal.tsx
git mv src/components/ExceptionModal.tsx src/features/bookings/ExceptionModal.tsx
git mv src/components/PaymentReturnPage.tsx src/features/bookings/PaymentReturnPage.tsx
```

- [ ] **Fix imports inside moved files**

Same pattern: `./X` → `../../common/ui/X` for primitives. Intra-bookings siblings (e.g. `CalendarPage` importing `CalendarGrid`) stay as `./CalendarGrid`.

- [ ] **Fix callers in `src/routes/`**

```
src/routes/my-bookings.tsx:
  '../components/MyBookings' → '../features/bookings/MyBookings'

src/routes/calendar.tsx:
  '../components/CalendarPage' → '../features/bookings/CalendarPage'

src/routes/listings/$listingId_.book.tsx:
  '../../components/BookingPage' → '../../features/bookings/BookingPage'

src/routes/bookings/payment/success.tsx:
  '../../../components/PaymentReturnPage' → '../../../../features/bookings/PaymentReturnPage'

src/routes/bookings/payment/cancelled.tsx:
  same pattern as success.tsx
```

- [ ] **Fix callers in `src/__tests__/`**

Files: `CalendarPage.test.tsx`, `CalendarPageArchitecture.test.ts`, `BookingPageArchitecture.test.ts`, `ExceptionModal.test.tsx`, `WeeklyScheduleModal.test.tsx`.

- [ ] **Fix cross-feature imports**: if `ListingDetailPage.tsx` (Task 5) references `BookingCard`, update that import now that BookingCard has landed at `features/bookings/BookingCard`. The correct import from `features/listings/ListingDetailPage.tsx` is `../bookings/BookingCard`.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add -A
git commit -m "refactor: move bookings feature to features/bookings/"
```

---

## Task 7: Move `features/profile/`

- [ ] **Move files**

```bash
mkdir -p src/features/profile
git mv src/components/ProfilePageContent.tsx src/features/profile/ProfilePageContent.tsx
git mv src/components/ProfilePageLoadingError.tsx src/features/profile/ProfilePageLoadingError.tsx
git mv src/components/EditProfileForm.tsx src/features/profile/EditProfileForm.tsx
```

- [ ] **Fix imports inside moved files** — `./X` → `../../common/ui/X` for primitives.

- [ ] **Fix callers in `src/routes/`**

```
src/routes/profile.$userId.tsx:
  '../components/ProfilePageContent' → '../features/profile/ProfilePageContent'
  '../components/ProfilePageLoadingError' → '../features/profile/ProfilePageLoadingError'

src/routes/profile.$userId.edit.tsx:
  '../components/EditProfileForm' → '../features/profile/EditProfileForm'
```

- [ ] **Fix callers in `src/__tests__/`** — grep for any test importing these three files.

- [ ] **Verify** → `npx tsc --noEmit`

- [ ] **Commit** → `git commit -m "refactor: move profile feature to features/profile/"`

---

## Task 8: Move `features/chat/`

- [ ] **Move files**

```bash
mkdir -p src/features/chat
git mv src/components/ChatPageView.tsx src/features/chat/ChatPageView.tsx
git mv src/components/ChatInbox.tsx src/features/chat/ChatInbox.tsx
git mv src/components/ChatBubble.tsx src/features/chat/ChatBubble.tsx
```

- [ ] **Fix imports inside moved files** — same pattern.

- [ ] **Fix callers in `src/routes/chat.tsx`**

```
'../components/ChatPageView' → '../features/chat/ChatPageView'
'../components/ChatInbox' → '../features/chat/ChatInbox'
'../components/ChatBubble' → '../features/chat/ChatBubble'
```

- [ ] **Fix callers in `src/__tests__/`** — grep for chat component imports.

- [ ] **Verify** → `npx tsc --noEmit`

- [ ] **Commit** → `git commit -m "refactor: move chat feature to features/chat/"`

---

## Task 9: Move `features/credentials/`

- [ ] **Move files**

```bash
mkdir -p src/features/credentials
git mv src/components/Credentials.tsx src/features/credentials/Credentials.tsx
git mv src/components/CredentialCard.tsx src/features/credentials/CredentialCard.tsx
git mv src/components/CredentialDocumentViewer.tsx src/features/credentials/CredentialDocumentViewer.tsx
git mv src/components/SubmitCredentialModal.tsx src/features/credentials/SubmitCredentialModal.tsx
```

- [ ] **Fix imports inside moved files** — same pattern.

- [ ] **Fix callers in `src/routes/my-credentials.tsx`**

```
'../components/Credentials' → '../features/credentials/Credentials'
```

- [ ] **Fix callers in `src/__tests__/`**: `CredentialCard.test.tsx`, `CredentialDocumentViewer.test.tsx`, `MyCredentialsPage.test.tsx`, `SubmitCredentialModal.test.tsx`.

- [ ] **Verify** → `npx tsc --noEmit`

- [ ] **Commit** → `git commit -m "refactor: move credentials feature to features/credentials/"`

---

## Task 10: Move `features/register/`

- [ ] **Move files**

```bash
mkdir -p src/features/register
git mv src/components/RegisterLayout.tsx src/features/register/RegisterLayout.tsx
git mv src/components/RegisterRole.tsx src/features/register/RegisterRole.tsx
git mv src/components/RegisterName.tsx src/features/register/RegisterName.tsx
git mv src/components/RegisterAddress.tsx src/features/register/RegisterAddress.tsx
git mv src/components/RegisterPhoto.tsx src/features/register/RegisterPhoto.tsx
git mv src/components/RegisterAbout.tsx src/features/register/RegisterAbout.tsx
git mv src/components/RegisterDone.tsx src/features/register/RegisterDone.tsx
```

- [ ] **Fix imports inside moved files** — `./Navbar` → `../../common/layout/Navbar` (RegisterLayout uses Navbar since register is outside `_app`).

- [ ] **Fix callers in `src/routes/register/`**

```
src/routes/register/route.tsx:
  '../../components/RegisterLayout' → '../../features/register/RegisterLayout'

src/routes/register/role.tsx through done.tsx:
  '../../components/RegisterX' → '../../features/register/RegisterX'
```

- [ ] **Fix callers in `src/__tests__/`**: `RegisterAddress.test.tsx`, `RegisterDone.test.tsx`, `RegisterLayout.test.tsx`, `RegisterName.test.tsx`, `RegisterPhoto.test.tsx`, `RegisterRole.test.tsx`.

- [ ] **Verify** → `npx tsc --noEmit`

- [ ] **Commit** → `git commit -m "refactor: move register flow to features/register/"`

---

## Task 11: Final Verification & Cleanup

- [ ] **Check for leftover files in `src/components/`**

```bash
find src/components -type f | sort
```

Expected: empty (only empty directories remain). If any files appear, they were missed — give them a home before proceeding.

- [ ] **Remove empty directory**

```bash
git rm -r src/components/
```

If git rm reports nothing to remove (no tracked files left), use `rm -rf src/components/` instead.

- [ ] **Update `src/__tests__/components.a11y.test.tsx`**

This file is a broad accessibility test that may import many components. Run:
```bash
grep "from.*components" src/__tests__/components.a11y.test.tsx
```
Update each import to its new path using the table above.

- [ ] **Run full test suite**

```bash
npm test
```

Expected: same passing count as Task 0 baseline, all green.

- [ ] **Smoke test dev server**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:
- `/` — home page loads
- `/browse-services` — search page loads with filters
- `/my-listings` — listings page loads (requires login)
- `/register/role` — registration flow loads with its own Navbar

- [ ] **Final commit**

```bash
git add -A
git commit -m "refactor: remove empty components/ directory after full migration to features/ and common/"
```

---

## Verification Summary

| Check | When | Command | Expected |
|---|---|---|---|
| TypeScript | After each task | `npx tsc --noEmit` | No errors |
| Tests | Task 11 only | `npm test` | Same count as baseline |
| Dev server | Task 11 only | `npm run dev` | App loads, no console errors |
| Route IDs | Throughout | N/A | Never changed — only file paths change |

---

## Note on `_app` Layout Route Plan

The postponed plan at `docs/superpowers/plans/2026-06-26-app-layout-route.md` references import paths like `../../components/Navbar`, `../../components/Footer`, etc. Once this structural refactor is merged, those paths must be updated to `../../common/layout/Navbar` and `../../common/layout/Footer` (Footer doesn't exist yet — it will be created in that plan). Update the `_app` plan before executing it.
