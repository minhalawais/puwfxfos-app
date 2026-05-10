# Phase 6 Polish And QA Checklist

## Scope
This checklist validates the PUWF Expo mobile frontend after the final polish pass. It covers Worker, Union Admin, role selection, onboarding, auth, localization, accessibility, mock/legal safety, and Metro readiness.

## Navigation And Density
- Worker bottom tabs show five primary destinations only: Home, ID, Dues, Grievance, More.
- Union Admin bottom tabs show five primary destinations only: Home, Members, Finance, Annual Return, More.
- Hidden secondary routes remain reachable through dashboard quick actions and the More screens.
- No Urdu tab label is clipped on a 360px-wide Android viewport.
- First viewport on dashboards shows identity/status, urgent actions, and compliance or dues signals without oversized hero blocks.

## Localization And RTL
- Urdu is the default app language.
- English mode has equivalent copy for tabs, More screens, mock notices, empty/error/loading states, and accessibility labels.
- Urdu screens mirror horizontal content: text blocks align right and visual/action elements move to the opposite side through RTL-safe helpers.
- CNIC, phone numbers, receipt numbers, IDs, dates, OTP, PUWF, CBA, CoD, EOBI, RTU, and NIRC remain readable in both directions.

## Accessibility
- Icon-only buttons have `accessibilityRole="button"` and localized labels.
- Pressable controls have at least a 44px tap target.
- Disabled mock actions expose disabled accessibility state.
- Loading, empty, and error states expose assistive labels or live-region semantics.
- Text inputs for login, search, grievance description, onboarding, and OTP have accessibility labels.

## Legal And Mock Safety
- Grievance filing clearly states it is frontend/demo and not a real legal complaint.
- Voting clearly states no real vote is cast or stored.
- Dues receipts and remittances clearly state they are not official financial records.
- Annual Return approval/submission/PDF actions are marked mock-only.
- CBA/CoD stage changes, legal escalations, hearing logs, uploads, and downloads remain mock-only.
- CNIC and worker-sensitive identifiers stay masked in read-only displays.

## Verification Commands
- `npm.cmd run typecheck`
- `npx.cmd expo config --type public`
- `npx.cmd expo export --platform android`
- `rg "#[0-9a-fA-F]{3,8}" mobile/app mobile/src/components mobile/src/features`
- `rg "placeholder=\"|title=\"CBA|label=\"CBA" mobile/app mobile/src/components mobile/src/features`

## Manual Smoke Flow
- Role menu: Urdu default, English switch, Worker card, Union Admin card, Help card.
- Worker: onboarding, dashboard, digital ID, dues, grievances, voting, rights, my union, notifications, More.
- Union Admin: login, dashboard, members, office bearers, finance, annual return, elections, CBA/CoD, grievances/legal, documents/compliance, More.
- Small Android viewport: confirm no crowded bottom tabs, clipped Urdu chips, or left-positioned Urdu text blocks.
