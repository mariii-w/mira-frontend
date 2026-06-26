# Component Structure Refactor — Implementation Plan (Revised 2026-06-26)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise the flat `src/components/` (59 real files) into `src/features/` (by domain) and `src/common/` (shared primitives + layout chrome), so every component lives next to the domain it belongs to.

**Architecture:** Files move — no component logic changes. Routes in `src/routes/` keep their structure and update import paths. Tests in `src/__tests__/` update import paths only. `src/lib/`, `src/stores/`, `src/hooks/`, `src/api/` are untouched. `routeTree.gen.ts` is auto-generated — never edit it.

**Tech Stack:** React 19, TanStack Router v1 (file-based, Vite plugin), TypeScript, Vitest

## IMPORTANT: Known Differences vs. the Original Plan

Ten files listed in the original plan **do not exist in the codebase** and have been dropped from this plan. They were never implemented. This plan does not create or reference them:
`MobileNavDrawer.tsx`, `ChatPageView.tsx`, `ChatInbox.tsx`, `ChatBubble.tsx`,
`ProfilePageContent.tsx`, `ProfilePageLoadingError.tsx`, `EditProfileForm.tsx`,
`PaymentReturnPage.tsx`, `ServiceCardChat.tsx`, `ServiceCardEdit.tsx`

One file **was added** since the original plan and must be included:
`Footer.tsx` → `common/layout/Footer.tsx`

There is **no root-level `UserCard.tsx`** — only `search/cards/UserCard.tsx` exists. Ambiguity resolved.

Routes are now under `src/routes/_app/` (depth 2 from `src/`), not at the root of `src/routes/`. Import path rules have changed accordingly.

## Global Constraints

- `git mv` every move — preserves git history
- `npx tsc --noEmit` must pass after every task before proceeding
- Do not edit `routeTree.gen.ts` — it regenerates on dev server start
- For cross-feature imports that span tasks: use a temporary `../../components/X` path until the target file's task runs, then update (see Task 4/5 note)

## CI/CD Pipeline (all must pass before push)

The GitLab pipeline runs these in order — all verified locally in Task 9:

| Stage | Command |
|---|---|
| build | `npm run build` |
| test | `npm run test:ci` |
| accessibility-route-check | `npm run check:routes-no-html` |
| accessibility | `npm run test:a11y` |
| lint | `npm run lint` (ESLint) |

---

## Target Structure

```
src/
├── routes/             ← unchanged file structure
├── features/
│   ├── home/           ← Home.tsx, CategoryCard.tsx
│   ├── auth/           ← LoginCallback.tsx
│   ├── search/         ← SearchBar, searchSchemas, ServiceUserToggle, UserTypeFilter,
│   │                      SearchRootPage, SearchServicesPage, SearchUsersPage,
│   │                      UserCard, ProviderServicesSection, FilterBar, FilterDrawer
│   ├── listings/       ← CreateListing, EditListing, ListingDetailPage,
│   │                      ListingProviderCard, ServiceCard, MyListingCard, MyListings
│   ├── bookings/       ← BookingCard, BookingPage, MyBookings, CalendarPage,
│   │                      CalendarGrid, WeeklyScheduleModal, ExceptionModal
│   ├── credentials/    ← Credentials, CredentialCard, CredentialDocumentViewer,
│   │                      SubmitCredentialModal
│   └── register/       ← RegisterLayout, RegisterRole, RegisterName, RegisterAddress,
│                          RegisterPhoto, RegisterAbout, RegisterDone
└── common/
    ├── ui/             ← Button, Input, Label, Badge, Textarea, Slider, Switch,
    │                      Modal, Popover, Logo, MultiSelect, AvatarIcon
    ├── layout/         ← Navbar, Footer, BreadCrumb, Pagination, UserMenu,
    │                      AccessibilityPanel
    └── (root)          ← InfoPage.tsx, infoPages.ts
```

## Complete File Move Table (59 files)

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
| `Footer.tsx` | `common/layout/Footer.tsx` |
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
| `MyListingCard.tsx` | `features/listings/MyListingCard.tsx` |
| `MyListings.tsx` | `features/listings/MyListings.tsx` |
| `BookingCard.tsx` | `features/bookings/BookingCard.tsx` |
| `BookingPage.tsx` | `features/bookings/BookingPage.tsx` |
| `MyBookings.tsx` | `features/bookings/MyBookings.tsx` |
| `CalendarPage.tsx` | `features/bookings/CalendarPage.tsx` |
| `CalendarGrid.tsx` | `features/bookings/CalendarGrid.tsx` |
| `WeeklyScheduleModal.tsx` | `features/bookings/WeeklyScheduleModal.tsx` |
| `ExceptionModal.tsx` | `features/bookings/ExceptionModal.tsx` |
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

## Import Path Reference (updated for `_app` routing)

| Caller location | Prefix to reach `src/` |
|---|---|
| `src/routes/__root.tsx` | `../` |
| `src/routes/login.tsx` | `../` |
| `src/routes/register/*.tsx` | `../../` |
| `src/routes/_app/*.tsx` | `../../` |
| `src/routes/_app/_search/*.tsx` | `../../../` |
| `src/routes/_app/listings/*.tsx` | `../../../` |
| `src/__tests__/*.test.tsx` | `../` |
| `src/features/*/*.tsx` | `../../` |
| `src/common/*.tsx` | `../` |
| `src/common/ui/*.tsx` | `../../` |
| `src/common/layout/*.tsx` | `../../` |

Example: `Button` after Task 1:
- From `src/routes/_app/styleguide.tsx`: `../../common/ui/Button`
- From `src/features/search/SearchBar.tsx`: `../../common/ui/Button`
- From `src/common/layout/UserMenu.tsx`: `../ui/Button`
- From `src/__tests__/Button.test.tsx`: `../common/ui/Button`

## Critical Edge Cases

### 1. Files outside `src/components/` that import components
These are not being moved but their imports must be updated:

| File | Updated imports needed |
|---|---|
| `src/routes/_app/route.tsx` | `../../components/Navbar` → `../../common/layout/Navbar`; `../../components/Footer` → `../../common/layout/Footer` (Task 2) |
| `src/routes/_app/styleguide.tsx` | Imports 18+ components — each must be updated to correct feature/common path (Tasks 1-5) |
| `src/__tests__/components.a11y.test.tsx` | Imports 44 components — update batch per task (never let it go stale) |
| Architecture tests | Raw source paths change (see Task 6) |

### 2. Cross-feature dependency: SearchServicesPage → ServiceCard

`SearchServicesPage.tsx` (Task 4 → `features/search/`) imports `ServiceCard.tsx` (Task 5 → `features/listings/`).

- At Task 4 time: ServiceCard hasn't moved. Set import to `../../components/ServiceCard` (temporary).
- At Task 5 time: ServiceCard moves. Update SearchServicesPage: `../../components/ServiceCard` → `../listings/ServiceCard`.

### 3. Intra-feature imports in `common/layout/`

When `UserMenu.tsx` and `AccessibilityPanel.tsx` move to `common/layout/`, they import from `common/ui/` (moved in Task 1). The correct path from `src/common/layout/` to `src/common/ui/` is `../ui/X`, NOT `../../common/ui/X`.

- `UserMenu.tsx`: `./Popover` → `../ui/Popover`; `./Button` → `../ui/Button`; `./AvatarIcon` → `../ui/AvatarIcon`
- `AccessibilityPanel.tsx`: `./Popover` → `../ui/Popover`; `./Switch` → `../ui/Switch`; `./Button` → `../ui/Button`

### 4. `RegisterLayout.tsx` imports Navbar and Logo

When `RegisterLayout.tsx` moves to `features/register/`, its imports become:
- `./Logo` → `../../common/ui/Logo`
- `./Navbar` → `../../common/layout/Navbar`

(Register routes stay outside `_app` and need their own Navbar — this is correct.)

### 5. `CalendarPage.tsx` imports `StatusBadge` from `BookingCard`

Both go to `features/bookings/` in the same task. After the move: `./BookingCard`. No cross-task issue.

### 6. Architecture tests import raw source

After the moves:
- `BookingPageArchitecture.test.ts`: `../components/BookingPage.tsx?raw` → `../features/bookings/BookingPage.tsx?raw`; `../components/BookingCard.tsx?raw` → `../features/bookings/BookingCard.tsx?raw`
- `CalendarPageArchitecture.test.ts`: `../components/CalendarPage.tsx?raw` → `../features/bookings/CalendarPage.tsx?raw`

The architecture test regexes for API import depth (e.g. `/from ['"]\.\.\/\.\.\/api\/mira['"]/`) check the route files (not component files), so those do NOT change here.

---

## Task 0: Baseline Verification

- [ ] Run `npx tsc --noEmit` — must exit 0
- [ ] Run `npm run test:ci` — record passing count (expect 353)
- [ ] Run `npm run test:a11y` — record passing count (expect 106)
- [ ] Note: "Baseline: X unit tests, Y a11y tests, tsc clean"

---

## Task 1: Move `common/ui/` — Design System Primitives

**Files (12):** Button, Input, Label, Badge, Textarea, Slider, Switch, Modal, Popover, Logo, MultiSelect, AvatarIcon

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

- [ ] **Fix cross-imports within `common/ui/`** — these files don't import each other (all primitives), so no changes needed inside the moved files.

- [ ] **Fix imports in remaining `src/components/*.tsx` files**

Pattern: `from './Button'` → `from '../common/ui/Button'` (and same for all 12 moved names).

Files affected (grep to confirm): `AccessibilityPanel.tsx`, `CalendarPage.tsx`, `CreateListing.tsx`, `Credentials.tsx`, `CredentialCard.tsx`, `CredentialDocumentViewer.tsx`, `EditListing.tsx`, `ExceptionModal.tsx`, `FilterBar.tsx`, `FilterDrawer.tsx`, `ListingDetailPage.tsx`, `ListingProviderCard.tsx`, `MyBookings.tsx`, `MyListingCard.tsx`, `MyListings.tsx`, `RegisterAbout.tsx`, `RegisterAddress.tsx`, `RegisterDone.tsx`, `RegisterLayout.tsx`, `RegisterName.tsx`, `RegisterPhoto.tsx`, `RegisterRole.tsx`, `SubmitCredentialModal.tsx`, `UserMenu.tsx`, `WeeklyScheduleModal.tsx`, and the entire `search/` subdirectory.

```bash
grep -rl "from '\./\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)'" src/components/
```

For each hit: replace `from './X'` with `from '../common/ui/X'`.

For `search/pages/*.tsx` and `search/cards/*.tsx` which import from `'../../Button'` etc.: leave these as-is — they move in Task 4 and their imports are fixed then.

- [ ] **Fix imports in `src/routes/**/*.tsx`**

Key files:
- `src/routes/_app/styleguide.tsx` — imports Logo, Button, Label, Input, Textarea, Badge, AvatarIcon (and others): `../../components/X` → `../../common/ui/X`
- Other routes: check with grep

```bash
grep -rl "components/\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)" src/routes/
```

- [ ] **Fix imports in `src/__tests__/*.test.tsx`**

```bash
grep -rl "components/\(Button\|Input\|Label\|Badge\|Textarea\|Slider\|Switch\|Modal\|Popover\|Logo\|MultiSelect\|AvatarIcon\)" src/__tests__/
```

Pattern: `from '../components/X'` → `from '../common/ui/X'`

Files affected: `Button.test.tsx`, `Input.test.tsx`, `Textarea.test.tsx`, `Slider.test.tsx`, `MultiSelect.test.tsx`, and `components.a11y.test.tsx` (bulk update its imports for these 12 components).

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 2: Move `common/layout/` — Navigation & Layout Chrome

**Files (6):** Navbar, Footer, BreadCrumb, Pagination, UserMenu, AccessibilityPanel

Note: `MobileNavDrawer.tsx` does NOT exist — it is not included.

- [ ] **Move files**

```bash
mkdir -p src/common/layout
git mv src/components/Navbar.tsx src/common/layout/Navbar.tsx
git mv src/components/Footer.tsx src/common/layout/Footer.tsx
git mv src/components/BreadCrumb.tsx src/common/layout/BreadCrumb.tsx
git mv src/components/Pagination.tsx src/common/layout/Pagination.tsx
git mv src/components/UserMenu.tsx src/common/layout/UserMenu.tsx
git mv src/components/AccessibilityPanel.tsx src/common/layout/AccessibilityPanel.tsx
```

- [ ] **Fix cross-imports within `common/layout/`**

These files import from `common/ui/` (already moved in Task 1). From inside `src/common/layout/`, the correct path to `src/common/ui/` is `../ui/X`:

`UserMenu.tsx`:
- `../common/ui/Popover` → `../ui/Popover`; `../common/ui/Button` → `../ui/Button`; `../common/ui/AvatarIcon` → `../ui/AvatarIcon`

`AccessibilityPanel.tsx`:
- `../common/ui/Popover` → `../ui/Popover`; `../common/ui/Switch` → `../ui/Switch`; `../common/ui/Button` → `../ui/Button`

`Navbar.tsx`: `from '../common/ui/Logo'` → `from '../ui/Logo'`

`Footer.tsx`: `from '../common/ui/Logo'` → `from '../ui/Logo'`

- [ ] **Fix imports in remaining `src/components/*.tsx`**

`RegisterLayout.tsx` currently imports `from './Navbar'` → `from '../common/layout/Navbar'`.

```bash
grep -rl "from '\./\(Navbar\|Footer\|BreadCrumb\|Pagination\|UserMenu\|AccessibilityPanel\)'" src/components/
```

- [ ] **Fix imports in `src/routes/**/*.tsx`**

Critical files:
- `src/routes/_app/route.tsx`: `../../components/Navbar` → `../../common/layout/Navbar`; `../../components/Footer` → `../../common/layout/Footer`
- `src/routes/_app/styleguide.tsx`: `../../components/AccessibilityPanel` → `../../common/layout/AccessibilityPanel`; `../../components/Pagination` → `../../common/layout/Pagination`; `../../components/BreadCrumb` → `../../common/layout/BreadCrumb`; `../../components/UserMenu` → `../../common/layout/UserMenu`

```bash
grep -rl "components/\(Navbar\|Footer\|BreadCrumb\|Pagination\|UserMenu\|AccessibilityPanel\)" src/routes/
```

- [ ] **Fix imports in `src/__tests__/`**

`HomeFooter.test.tsx`: `from '../components/Footer'` → `from '../common/layout/Footer'`

`components.a11y.test.tsx`: update Navbar, Pagination, BreadCrumb, UserMenu, AccessibilityPanel imports to `../common/layout/X`.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 3: Move `common/` root + `features/home/` + `features/auth/`

**Files (5):** InfoPage.tsx, infoPages.ts, Home.tsx, CategoryCard.tsx, LoginCallback.tsx

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

`Home.tsx` (now `features/home/`):
- `../common/ui/Button` (set in Task 1) — now at depth `features/home/`, so stays as `../../common/ui/Button` ✓
- `./CategoryCard` → `./CategoryCard` (same dir) ✓
- `./ServiceCard` — not moved yet → `../../components/ServiceCard` (TEMPORARY — fix in Task 5)
- `../stores/accessibility` → `../../stores/accessibility`, etc.

`CategoryCard.tsx` (now `features/home/`):
- `'../lib/cn'` → `'../../lib/cn'`

`InfoPage.tsx` (now `common/`):
- `from "./infoPages"` → `from "./infoPages"` (same dir, no change)

`LoginCallback.tsx` (now `features/auth/`): check and fix lib/stores imports.

- [ ] **Fix callers in `src/routes/`**

```
src/routes/_app/index.tsx: '../../components/Home' → '../../features/home/Home'
src/routes/login.tsx: '../components/LoginCallback' → '../features/auth/LoginCallback'
src/routes/_app/about.tsx, accessibility.tsx, contact-us.tsx, privacy-policy.tsx, terms-of-use.tsx:
  '../../components/InfoPage' → '../../common/InfoPage'
  '../../components/infoPages' → '../../common/infoPages'
```

- [ ] **Fix callers in `src/__tests__/`**

`InfoPage.test.tsx`: `from '../components/InfoPage'` → `from '../common/InfoPage'`; `from '../components/infoPages'` → `from '../common/infoPages'`

`components.a11y.test.tsx`: update Home, LoginCallback, CategoryCard, InfoPage imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 4: Move `features/search/`

**Files (11):** SearchBar, searchSchemas, ServiceUserToggle, UserTypeFilter, SearchRootPage, SearchServicesPage, SearchUsersPage, UserCard, ProviderServicesSection, FilterBar, FilterDrawer

Flattens `search/pages/` and `search/cards/` into a single flat directory.

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
rmdir src/components/search/pages src/components/search/cards src/components/search
```

- [ ] **Fix imports inside moved files**

All intra-search imports flatten to `./X` (no more `../`, `../../`, `../cards/`):

- `SearchBar.tsx`: `../Button` → `../../common/ui/Button`; `../Label` → `../../common/ui/Label`; `../Input` → `../../common/ui/Input`; `../Slider` → `../../common/ui/Slider`
- `SearchRootPage.tsx`: `../ServiceUserToggle.tsx` → `./ServiceUserToggle`
- `SearchServicesPage.tsx`:
  - `../SearchBar.tsx` → `./SearchBar`
  - `../../FilterBar.tsx` → `./FilterBar`
  - `../../ServiceCard.tsx` → **`../../components/ServiceCard` (TEMPORARY — fix in Task 5)**
  - `../../BreadCrumb.tsx` → `../../common/layout/BreadCrumb`
  - `../../Pagination.tsx` → `../../common/layout/Pagination`
  - `../../FilterDrawer.tsx` → `./FilterDrawer`
  - `../../../api/mira` → `../../api/mira`
  - `../searchSchemas.ts` → `./searchSchemas`
  - `../../../api/model` → `../../api/model`
- `SearchUsersPage.tsx`:
  - `../SearchBar.tsx` → `./SearchBar`
  - `../../BreadCrumb.tsx` → `../../common/layout/BreadCrumb`
  - `../../Pagination.tsx` → `../../common/layout/Pagination`
  - `../cards/UserCard.tsx` → `./UserCard`
  - `../UserTypeFilter.tsx` → `./UserTypeFilter`
  - `../../../stores/accessibility.ts` → `../../stores/accessibility`
  - `../../../api/mira.ts` → `../../api/mira`
  - `../searchSchemas.ts` → `./searchSchemas`
  - `../../../api/model` → `../../api/model`
- `UserCard.tsx`: `../../AvatarIcon` → `../../common/ui/AvatarIcon`; `../../../lib/mediaUrl` → `../../lib/mediaUrl`
- `FilterDrawer.tsx`: `from './FilterBar'` → same dir ✓; `from '../common/ui/Button'` → `from '../../common/ui/Button'`

- [ ] **Fix callers in `src/routes/_app/_search/`**

All at depth 3 from `src/`, prefix `../../../`:
```
route.tsx: '../../../components/search/pages/SearchRootPage' → '../../../features/search/SearchRootPage'
browse-services.tsx: '../../../components/search/pages/SearchServicesPage' → '../../../features/search/SearchServicesPage'
                     '../../../components/search/searchSchemas' → '../../../features/search/searchSchemas'
browse-users.tsx: '../../../components/search/pages/SearchUsersPage' → '../../../features/search/SearchUsersPage'
                  '../../../components/search/searchSchemas' → '../../../features/search/searchSchemas'
```

`src/routes/_app/styleguide.tsx`:
```
'../../components/search/SearchBar' → '../../features/search/SearchBar'
'../../components/search/ServiceUserToggle' → '../../features/search/ServiceUserToggle'
```

- [ ] **Fix callers in `src/__tests__/`**

All `../components/search/X`, `../components/search/cards/X`, `../components/search/pages/X` → `../features/search/X`:
`SearchUsersPage.test.tsx`, `SearchServicesPage.test.tsx`, `ServiceUserToggle.test.tsx`, `UserTypeFilter.test.tsx`, `searchSchemas.test.ts`, `UserCard.test.tsx`, `ProviderServicesSection.test.tsx`, `FilterBar.test.tsx`, `FilterDrawer.test.tsx`.

`components.a11y.test.tsx`: update SearchBar, ServiceUserToggle, UserTypeFilter, UserCard, FilterBar, FilterDrawer imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 5: Move `features/listings/`

**Files (7):** CreateListing, EditListing, ListingDetailPage, ListingProviderCard, ServiceCard, MyListingCard, MyListings

Note: `ServiceCardChat.tsx` and `ServiceCardEdit.tsx` do NOT exist and are not included.

- [ ] **Move files**

```bash
mkdir -p src/features/listings
git mv src/components/CreateListing.tsx src/features/listings/CreateListing.tsx
git mv src/components/EditListing.tsx src/features/listings/EditListing.tsx
git mv src/components/ListingDetailPage.tsx src/features/listings/ListingDetailPage.tsx
git mv src/components/ListingProviderCard.tsx src/features/listings/ListingProviderCard.tsx
git mv src/components/ServiceCard.tsx src/features/listings/ServiceCard.tsx
git mv src/components/MyListingCard.tsx src/features/listings/MyListingCard.tsx
git mv src/components/MyListings.tsx src/features/listings/MyListings.tsx
```

- [ ] **Fix imports inside moved files**

`CreateListing.tsx`:
- `../common/ui/Button`, `../common/ui/Input`, etc. → `../../common/ui/X` (depth corrects at `features/listings/`)
- `../api/mira` → `../../api/mira`; `../lib/authFetch` → `../../lib/authFetch`; `../stores/auth` → `../../stores/auth`

`ListingDetailPage.tsx`:
- `../common/layout/BreadCrumb` → `../../common/layout/BreadCrumb`
- `./ListingProviderCard` → `./ListingProviderCard` (same dir) ✓
- `../lib/mediaUrl` → `../../lib/mediaUrl`

`ListingProviderCard.tsx`:
- `../common/ui/AvatarIcon`, `../common/ui/Badge`, `../common/ui/Button` → `../../common/ui/X`

`ServiceCard.tsx`:
- `../common/ui/Badge`, `../common/ui/AvatarIcon` → `../../common/ui/X`

`MyListingCard.tsx`:
- `../common/ui/Button` → `../../common/ui/Button`; `../lib/mediaUrl` → `../../lib/mediaUrl`

`MyListings.tsx`:
- `../common/ui/Button` → `../../common/ui/Button`; `./MyListingCard` ✓

`EditListing.tsx`:
- `../common/ui/Button`, `../common/ui/Input`, etc. → `../../common/ui/X`
- `../common/ui/Modal` → `../../common/ui/Modal`
- `./ServiceCard` ✓; `./ListingDetailPage` ✓

- [ ] **CROSS-FEATURE FIX: Update SearchServicesPage**

```
src/features/search/SearchServicesPage.tsx:
  '../../components/ServiceCard' → '../listings/ServiceCard'
```

- [ ] **CROSS-FEATURE FIX: Update `features/home/Home.tsx`**

```
src/features/home/Home.tsx:
  '../../components/ServiceCard' → '../listings/ServiceCard'
```

- [ ] **Fix callers in `src/routes/`**

```
src/routes/_app/create-listing.tsx: '../../components/CreateListing' → '../../features/listings/CreateListing'
src/routes/_app/edit-listing.$listingId.tsx: '../../components/EditListing' → '../../features/listings/EditListing'
src/routes/_app/listings/$listingId.index.tsx: '../../../components/ListingDetailPage' → '../../../features/listings/ListingDetailPage'
src/routes/_app/my-listings.tsx: '../../components/MyListings' → '../../features/listings/MyListings'
                                  '../../components/MyListingCard' → '../../features/listings/MyListingCard'
src/routes/_app/styleguide.tsx: '../../components/ServiceCard' → '../../features/listings/ServiceCard'
```

- [ ] **Fix callers in `src/__tests__/`**

`CreateListingPage.test.tsx`, `EditListingPage.test.tsx`, `ListingDetailPage.test.tsx`, `ListingProviderCard.test.tsx`, `ServiceCard.test.tsx`, `MyListingCard.test.tsx`, `MyListingsPage.test.tsx`.

`components.a11y.test.tsx`: update CreateListing, EditListing, ListingDetailPage, ListingProviderCard, ServiceCard, MyListingCard, MyListings imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 6: Move `features/bookings/`

**Files (7):** BookingCard, BookingPage, MyBookings, CalendarPage, CalendarGrid, WeeklyScheduleModal, ExceptionModal

Note: `PaymentReturnPage.tsx` does NOT exist and is not included.

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
```

- [ ] **Fix imports inside moved files**

`CalendarPage.tsx`:
- `./CalendarGrid` ✓; `./BookingCard` (StatusBadge) ✓
- `../common/ui/Button` → `../../common/ui/Button`

`MyBookings.tsx`:
- `./BookingCard` ✓

`BookingPage.tsx`:
- `../common/ui/Button` → `../../common/ui/Button`; `../api/mira` → `../../api/mira`

`WeeklyScheduleModal.tsx`, `ExceptionModal.tsx`:
- `../common/ui/Modal` → `../../common/ui/Modal`; `../common/ui/Button` → `../../common/ui/Button`
- `../api/model` → `../../api/model`

- [ ] **Fix callers in `src/routes/`**

```
src/routes/_app/my-bookings.tsx: '../../components/MyBookings' → '../../features/bookings/MyBookings'
                                  '../../components/BookingCard' (types) → '../../features/bookings/BookingCard'
src/routes/_app/calendar.tsx: '../../components/CalendarPage' → '../../features/bookings/CalendarPage'
src/routes/_app/listings/$listingId_.book.tsx: '../../../components/BookingPage' → '../../../features/bookings/BookingPage'
src/routes/_app/styleguide.tsx: '../../components/BookingCard' → '../../features/bookings/BookingCard'
                                  '../../components/CalendarGrid' → '../../features/bookings/CalendarGrid'
```

- [ ] **Fix callers in `src/__tests__/`**

`CalendarPage.test.tsx`, `ExceptionModal.test.tsx`, `WeeklyScheduleModal.test.tsx`.

`BookingPageArchitecture.test.ts`:
- `"../components/BookingPage.tsx?raw"` → `"../features/bookings/BookingPage.tsx?raw"`
- `"../components/BookingCard.tsx?raw"` → `"../features/bookings/BookingCard.tsx?raw"`

`CalendarPageArchitecture.test.ts`:
- `"../components/CalendarPage.tsx?raw"` → `"../features/bookings/CalendarPage.tsx?raw"`

`components.a11y.test.tsx`: update BookingCard, BookingPage, MyBookings, CalendarPage, CalendarGrid, WeeklyScheduleModal, ExceptionModal imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 7: Move `features/credentials/`

**Files (4):** Credentials, CredentialCard, CredentialDocumentViewer, SubmitCredentialModal

- [ ] **Move files**

```bash
mkdir -p src/features/credentials
git mv src/components/Credentials.tsx src/features/credentials/Credentials.tsx
git mv src/components/CredentialCard.tsx src/features/credentials/CredentialCard.tsx
git mv src/components/CredentialDocumentViewer.tsx src/features/credentials/CredentialDocumentViewer.tsx
git mv src/components/SubmitCredentialModal.tsx src/features/credentials/SubmitCredentialModal.tsx
```

- [ ] **Fix imports inside moved files**

`CredentialCard.tsx`:
- `./CredentialDocumentViewer` ✓
- `../common/ui/Switch` → `../../common/ui/Switch`; `../common/ui/Button` → `../../common/ui/Button`

`CredentialDocumentViewer.tsx`:
- `../common/ui/Modal` → `../../common/ui/Modal`
- `../lib/credentialEvidenceMedia` → `../../lib/credentialEvidenceMedia`

`SubmitCredentialModal.tsx`:
- `../common/ui/Modal` → `../../common/ui/Modal`; `../common/ui/Button` → `../../common/ui/Button`

`Credentials.tsx`:
- `../common/ui/Button` → `../../common/ui/Button`; `./CredentialCard` ✓

- [ ] **Fix callers in `src/routes/`**

```
src/routes/_app/my-credentials.tsx: '../../components/Credentials' → '../../features/credentials/Credentials'
                                     '../../components/SubmitCredentialModal' → '../../features/credentials/SubmitCredentialModal'
```

- [ ] **Fix callers in `src/__tests__/`**

`CredentialCard.test.tsx`, `CredentialDocumentViewer.test.tsx`, `MyCredentialsPage.test.tsx`, `SubmitCredentialModal.test.tsx`.

`components.a11y.test.tsx`: update CredentialCard, CredentialDocumentViewer, SubmitCredentialModal, Credentials imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 8: Move `features/register/`

**Files (7):** RegisterLayout, RegisterRole, RegisterName, RegisterAddress, RegisterPhoto, RegisterAbout, RegisterDone

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

- [ ] **Fix imports inside moved files**

`RegisterLayout.tsx`:
- `../common/ui/Logo` → `../../common/ui/Logo`
- `../common/layout/Navbar` → `../../common/layout/Navbar`
- `../stores/auth` → `../../stores/auth`

`RegisterName.tsx`, `RegisterAddress.tsx`, `RegisterAbout.tsx`:
- `../common/ui/Button`, `../common/ui/Input`, `../common/ui/Label` → `../../common/ui/X`

`RegisterDone.tsx`:
- `../common/ui/AvatarIcon`, `../common/ui/Button` → `../../common/ui/X`
- `../lib/mediaUrl` → `../../lib/mediaUrl`

`RegisterPhoto.tsx`:
- `../common/ui/Button` → `../../common/ui/Button`

- [ ] **Fix callers in `src/routes/register/`**

All register routes at depth 2 from `src/`, prefix `../../`:
```
route.tsx: '../../components/RegisterLayout' → '../../features/register/RegisterLayout'
role.tsx: '../../components/RegisterRole' → '../../features/register/RegisterRole'
name.tsx: '../../components/RegisterName' → '../../features/register/RegisterName'
address.tsx: '../../components/RegisterAddress' → '../../features/register/RegisterAddress'
photo.tsx: '../../components/RegisterPhoto' → '../../features/register/RegisterPhoto'
about.tsx: '../../components/RegisterAbout' → '../../features/register/RegisterAbout'
done.tsx: '../../components/RegisterDone' → '../../features/register/RegisterDone'
```

- [ ] **Fix callers in `src/__tests__/`**

`RegisterAddress.test.tsx`, `RegisterDone.test.tsx`, `RegisterLayout.test.tsx`, `RegisterName.test.tsx`, `RegisterPhoto.test.tsx`, `RegisterRole.test.tsx`.

`components.a11y.test.tsx`: update all Register* imports.

- [ ] **Verify**

```bash
npx tsc --noEmit
```

---

## Task 9: Final Verification & Cleanup

- [ ] **Check for leftover files in `src/components/`**

```bash
find src/components -type f | sort
```

Expected: empty. If any files remain, investigate — they were not in the move table.

- [ ] **Remove empty directory**

Only if `find src/components -type f` returns nothing:
```bash
git rm -r src/components/
```

If git rm fails (no tracked files left), use `rmdir` recursively.

- [ ] **Run full unit test suite**

```bash
npm run test:ci
```

Expected: same count as Task 0 baseline (353 tests), all passing.

- [ ] **Run a11y tests**

```bash
npm run test:a11y
```

Expected: same count as Task 0 baseline (106 tests), all passing.

- [ ] **Run ESLint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Run routes HTML check**

```bash
npm run check:routes-no-html
```

Expected: exits 0 (component moves don't affect route file structure, but verify).

- [ ] **Build**

```bash
npm run build
```

No errors. `routeTree.gen.ts` regenerates automatically.

- [ ] **Smoke test dev server**

```bash
npm run dev
```

Open browser:
- `/` — home page loads, Navbar and Footer visible
- `/browse-services` — search page loads
- `/my-listings` — listings (login required)
- `/register/role` — register flow loads with its Navbar
- `/login` — login callback page loads

---

## Verification Summary

| Check | When | Command | Expected |
|---|---|---|---|
| TypeScript | After every task | `npx tsc --noEmit` | No errors |
| Unit tests | Task 9 only | `npm run test:ci` | 353 tests |
| A11y tests | Task 9 only | `npm run test:a11y` | 106 tests |
| ESLint | Task 9 only | `npm run lint` | No errors |
| Routes HTML check | Task 9 only | `npm run check:routes-no-html` | Exits 0 |
| Build | Task 9 only | `npm run build` | Clean output |
| Dev server | Task 9 only | `npm run dev` | App loads |
