# User Role Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add current-backend-page user counts and Everyone/Provider/Consumer filtering to the public users search page.

**Architecture:** Store the selected role in validated route search state. A focused `UserTypeFilter` renders the heading and accessible pressed controls, while `SearchUsersPage` derives current-page counts and filters the already-fetched profiles without issuing another request.

**Tech Stack:** React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Vitest, Testing Library.

**Hard constraint:** Do not stage or commit any file without explicit user permission.

---

### Task 1: Add role URL state

**Files:**
- Modify: `src/components/search/searchSchemas.ts`
- Modify: `src/__tests__/searchSchemas.test.ts`

- [ ] Add failing schema tests proving the users schema defaults to `everyone`, accepts `providers` and `consumers`, and falls back to `everyone` for invalid values.
- [ ] Run `npm test -- --run src/__tests__/searchSchemas.test.ts` and confirm the new assertions fail because `role` is absent.
- [ ] Add `role: z.enum(['everyone', 'providers', 'consumers']).catch('everyone')` and export its inferred role type.
- [ ] Re-run the focused schema test and confirm it passes.

### Task 2: Build the accessible role-filter header

**Files:**
- Create: `src/components/search/UserTypeFilter.tsx`
- Create: `src/__tests__/UserTypeFilter.test.tsx`

- [ ] Add failing component tests for dynamic singular/plural headings, all three current-page counts, provider/consumer dots, active styling, `aria-pressed`, the labelled group, and selection callbacks.
- [ ] Run `npm test -- --run src/__tests__/UserTypeFilter.test.tsx` and confirm failure because the component does not exist.
- [ ] Implement `UserTypeFilter` with props for selected role, provider/consumer counts, and `onChange`; derive the Everyone count as their sum and use the selected count in the heading.
- [ ] Use the established palettes: dark filled active pill, accent provider dot, forest consumer dot, and muted count badges.
- [ ] Re-run the component tests and confirm they pass.

### Task 3: Integrate current-page filtering and pagination

**Files:**
- Modify: `src/components/search/pages/SearchUsersPage.tsx`
- Create: `src/__tests__/SearchUsersPage.test.tsx`

- [ ] Add failing page tests proving counts are derived from the fetched page, selecting Providers updates URL state without another API call, role selection filters cards and updates the heading, search and Next preserve `role`, and a role-empty page retains Next pagination.
- [ ] Run `npm test -- --run src/__tests__/SearchUsersPage.test.tsx` and confirm the new behavior fails.
- [ ] Derive providers with `userType === 'PROVIDER'` and consumers from all remaining profiles; select the rendered list from `search.role`.
- [ ] Preserve `role` in search and cursor navigation; clear only `from` when submitting a new text query or changing role.
- [ ] Render `UserTypeFilter`, role-specific empty text, the filtered cards, and pagination independently from filtered-list length.
- [ ] Re-run the page tests and confirm they pass.

### Task 4: Accessibility and regression verification

**Files:**
- Modify: `src/__tests__/components.a11y.test.tsx`

- [ ] Add `UserTypeFilter` to automated accessibility coverage and run the focused accessibility test.
- [ ] Run `npm test -- --run` and confirm the complete unit/integration suite passes.
- [ ] Run `npm run build` and confirm TypeScript and the production build pass.
- [ ] Inspect `git status --short` and verify all implementation files remain unstaged and uncommitted.
