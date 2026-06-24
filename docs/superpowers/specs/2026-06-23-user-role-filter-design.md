# User Role Filter Design

**Date:** 2026-06-23
**Status:** Approved for planning

## Goal

Add the user-count and role-filter section from the supplied reference to the public users search page without changing the backend API.

## Scope and limitation

The public-profiles endpoint exposes cursor pagination but no global total, role filter, or role counts. Therefore all displayed counts and filtering apply only to the currently fetched backend page. They must not be presented as global search-result totals.

Sorting and backend changes are out of scope.

## URL state

Extend the users search schema with a `role` parameter whose values are:

- `everyone` (default)
- `providers`
- `consumers`

The selected role remains active when the user submits a text search or moves through cursor pages. Text searches still reset the cursor to the first backend page.

## Components

Create a focused `UserTypeFilter` component under `components/search`. It receives the current-page counts, selected role, and a selection callback. It renders:

- a dynamic result heading;
- the existing “Showing public profiles” subtitle;
- an accessible group of three pressed buttons: Everyone, Providers, and Consumers;
- a count badge inside each button.

The role palettes follow the existing user-card treatment: violet for providers and green for consumers. The active pill uses the dark filled treatment shown in the reference.

`SearchUsersPage` remains responsible for fetching, cursor history, URL navigation, deriving counts, and filtering the current page before rendering cards.

## Data flow

After a backend page loads:

1. Count every returned profile for Everyone.
2. Count `userType === "PROVIDER"` as providers.
3. Count every non-provider profile as a consumer, matching the existing `UserCard` role treatment.
4. Filter the returned profiles according to the selected URL role.
5. Render a role-specific heading using the visible count, for example `7 providers`, with correct singular wording for a count of one.

Changing the role updates only the URL and rendered list; it does not send another backend request. Moving Next or Previous retains the role and fetches the requested cursor page, after which counts are recalculated for that page.

## States and pagination

- While loading, retain a neutral `Users` heading and the existing loading indicator.
- On fetch failure, retain the existing error treatment.
- When the backend page itself is empty, show the existing `No users found.` state.
- When the selected role has no matches on a non-empty backend page, show `No providers on this page.` or `No consumers on this page.`
- Keep cursor pagination visible in the role-empty state so users can continue to another backend page.

## Accessibility

The pills form a labelled group. Each pill is a native button with `aria-pressed` reflecting selection. Visible labels and counts remain available to assistive technology, focus styling follows the Users-page violet variant, and role-specific dots are decorative.

## Testing

Add tests for:

- URL-schema defaults and accepted role values;
- current-page role counts;
- dynamic heading text for each selection;
- pressed-state semantics and URL navigation;
- preserving role through search and cursor navigation;
- filtering rendered cards without another API request;
- role-empty state with pagination still available;
- automated accessibility coverage for the new filter component.
