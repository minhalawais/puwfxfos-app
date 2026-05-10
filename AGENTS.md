# PUWF Mobile Agent Rules

This Expo app is the Urdu-first mobile frontend for PUWF worker and union-admin workflows. It mirrors the current web app's domain model and frontend-only maturity, while staying optimized for small screens and low-literacy users.

## Non-Negotiables

- Keep Urdu as the default language and English as a complete alternate mode.
- Keep every screen RTL/LTR safe; use logical layout helpers from `src/theme/layout.ts`.
- Use theme tokens from `src/theme/tokens.ts`; do not introduce ad hoc colors.
- Keep mobile screens dense but readable. Avoid oversized hero sections, decorative marketing layouts, and nested cards.
- Align legal forms and labels to `mobile/docs/04_LEGAL_FORMS_MAPPING.md` before adding or removing fields.
- Use mock services under `src/services` until backend integration is explicitly requested.
- Prefer `lucide-react-native` icons, `expo-router`, TanStack Query, Zustand, Zod, and React Hook Form.
- Add loading, empty, and error states for every new data-driven screen.

## Current Scope

- Fully in scope: Worker portal, Union Admin portal, role selection, onboarding, localization, design system, mock data.
- Future scope: PUWF Admin and Government regulator portals.

## Design Standard

The app should feel like a serious union operations tool, not a generic template. Use compact dashboards, status strips, segmented sections, bottom tabs, professional icons, measured animation, and strong PUWF branding.

