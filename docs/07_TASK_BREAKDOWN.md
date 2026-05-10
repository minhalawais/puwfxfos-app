# Task Breakdown

For production module-level implementation, use `mobile/docs/08_PRODUCTION_MODULE_IMPLEMENTATION_PLAN.md` and the reusable agent prompt in `mobile/docs/09_UNIVERSAL_MOBILE_MODULE_PROMPT.md`.

## Phase 0: Documentation

- Create mobile documentation set and `AGENTS.md`.
- Define mobile app map, legal mapping, design tokens, and agent skills.
- Acceptance: every future implementer can understand scope, stack, and legal field requirements without opening the web app first.

## Phase 1: Expo Foundation

- Scaffold Expo Router project under `mobile/`.
- Configure TypeScript, app config, NativeWind-ready Babel setup, splash assets, and theme tokens.
- Add localization store, session store, shared UI primitives, and mock services.
- Acceptance: app can render role menu from `app/index.tsx`.

## Phase 2: Auth, Role Menu, Onboarding

- Build splash-to-role-menu flow.
- Build language switching and first-time worker survey.
- Build mock union-admin login and session routing.
- Acceptance: role paths route correctly and preserve selected locale.

## Phase 3: Worker Portal

- Build dashboard, digital ID, dues, grievances, voting, rights, my union, notifications.
- Add loading/empty/error states to all query screens.
- Acceptance: all worker tabs render meaningful mock data in Urdu and English.

## Phase 4: Union Admin Core

- Build dashboard, member registry, member detail, office bearers, documents, compliance snapshot.
- Acceptance: union admin can scan key operational status from one screen and open core lists.

## Phase 5: Union Admin Operations

- Build finance, annual return, elections, CBA/CoD, grievances/legal.
- Acceptance: all legal/governance workflow screens reflect mapped fields and statuses.

## Phase 6: Polish And QA

- Add accessibility labels, RTL QA, dense layout tuning, motion polish, and device checks.
- Acceptance: no clipped labels on 360px Android width, no ad hoc colors, and all primary flows have loading/empty/error states.
