# Search toggle focus loss across browse-services / browse-users

## Problem

`ServiceUserToggle` (Services ⇄ Users) is rendered independently inside
`src/routes/_search/browse-services.tsx` and `src/routes/_search/browse-users.tsx`,
which are two separate TanStack Router file routes. Flipping the switch calls
`navigate()` to the other route, which unmounts the old route component (and its
toggle) and mounts a fresh one. The browser drops focus to `<body>` because the
focused DOM node was destroyed — keyboard and screen-reader users lose their
place every time they switch tabs.

No router-level focus or scroll restoration is configured (`src/router.tsx` is a
bare `createRouter({ routeTree })`).

## Goals

- Keyboard/screen-reader focus stays on the toggle after switching between
  Services and Users (it's the toggle's own row, treated like a tab control,
  not a full page navigation).
- Fix structurally: the toggle's DOM node should not unmount across the switch,
  so focus survives natively with no custom focus-restoration code.
- Each page keeps full, concrete ownership of what "commit a search" means for
  itself. No shared/parametrized helper that branches on which page is active.
- Add a visible focus ring to the toggle while we're in this code (currently
  missing entirely).

## Non-goals

- Moving focus to the new page's heading (the standard SPA route-change
  convention) — rejected in favor of tab-like behavior, since Services/Users
  is conceptually one control flipping between two views of the same search.
- Deduplicating the breadcrumb row or filter-chip row between the two pages.
  They aren't part of the focus problem and don't share a clean boundary (the
  filter-chips row only exists on the services side).
- Touching `FilterBar`/`FilterDrawer`/pagination/breadcrumb logic.

## Architecture

Add a pathless layout route `src/routes/_search.tsx`, sibling to the existing
`src/routes/_search/` directory. It owns only what's genuinely shared and
route-agnostic:

- `<Navbar/>`
- `<main id="main-content">` wrapper
- The toggle, in its own row
- `<Outlet/>`

`browse-services.tsx` and `browse-users.tsx` keep everything else exactly as
it is today — `SearchBar`, `pendingQuery`/`pendingCity`/`pendingRadius`,
`commitSearch`, `commitFilters`, `prevCursors`, breadcrumbs, filters, results,
pagination. They no longer render `<Navbar/>` or the toggle.

This was originally going to also lift the search bar into the layout (so the
toggle and search bar would stay visually paired in one shared row), with
page-owned builder functions feeding it. That was dropped: `pendingRadius` on
`browse-services` turned out to already be shared, in today's code, between
the `SearchBar` location popover *and* the `FilterBar`/`FilterDrawer` distance
slider (`distanceKm={pendingRadius}` / `onDistanceChange={setPendingRadius}`).
Moving `SearchBar` (and its state) into the layout would have meant pulling
that shared state across the layout/page boundary too, via a context just to
get it back down to `FilterBar`/`FilterDrawer` — solving one cross-tree
problem by creating another. The search bar, with its embedded
location/radius controls, is page-specific in a way the toggle isn't:
`browse-services` and `browse-users` each have what's conceptually a
different search bar. Keeping it page-owned avoids the problem entirely.

The breadcrumb row is, for the same reason as before, **not** lifted — it
shares a flex row with services-only active-filter chips that has no
equivalent on `browse-users`. No portals are introduced anywhere in this
change.

## State & data flow

There isn't much left here. The toggle's `checked` state is derived directly
from the current route (`location.pathname === '/browse-users'`), read via
`useRouterState` in the layout — no local state needed. Its `onCheckedChange`
navigates to the other route, preserving `q` and resetting the fields that
don't exist on the destination route's schema (mirrors today's two
`onCheckedChange` handlers exactly, just relocated). That's the entire
contents of the layout component: routing, not business logic.

Every page keeps its full, untouched ownership of `pendingQuery`,
`pendingCity`, `pendingRadius`, `commitSearch`, `commitFilters`, and
`prevCursors` (including today's imperative `setPrevCursors([])` resets) —
none of that changes, because none of it ever crosses the layout/page
boundary now.

## Accessibility fix (bundled)

`ServiceUserToggle`'s `Switch.Root` has no `focus-visible` styling at all
today, on either page — tabbing to it shows no visible indicator. Add a focus
ring matching the existing convention used elsewhere in the app (e.g.
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
focus-visible:ring-offset-1`, as seen in `src/routes/styleguide.tsx`). Bundled
here because restoring focus is meaningless to sighted keyboard users if the
focused state is invisible.

## Testing

- `src/__tests__/ServiceUserToggle.test.tsx` — unaffected. The component
  itself doesn't change, only where it's mounted.
- `src/__tests__/SearchPage.test.tsx` — checked: it renders `<BrowseServicesPage/>`
  standalone and mocks `Navbar` and the router, but never asserts on the
  toggle or the search bar. Should keep passing unchanged; drop the now-unused
  `Navbar` mock as part of the cleanup. There is currently no equivalent test
  file for `BrowseUsersPage`; adding one is not required by this change.
- New integration test: mount the real router (memory history, both routes
  registered) under `_search.tsx`, flip the toggle, and assert focus is still
  on the toggle (or the equivalent control) after the route change. This is
  the regression test that actually proves the bug is fixed, rather than
  trusting the architecture to imply it.

## Alternatives considered

1. **Router history-state "refocus me" signal.** Keep the toggle remounting,
   but pass `state: { focusToggle: true }` on `navigate()` and refocus via a
   ref on mount, reading the signal through `useRouterState`. Smallest patch,
   mirrors the existing `Modal.tsx`/`Popover.tsx` focus-restore idiom. Rejected
   in favor of the structural fix to avoid leaving the underlying unmount/remount
   in place and to pick up the header-markup deduplication for free.
2. **`sessionStorage` flag** instead of router state for the same idea. Same
   shape as (1) but using global mutable state outside React's data flow for
   no benefit over the router's built-in history state. Rejected for the same
   reason as (1), and weaker than (1) on its own terms.
