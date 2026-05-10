# PUWF Mobile Production Module Implementation Plan

This plan turns the current Expo mobile foundation into a production-grade Worker and Union Admin app. It is based on the web module map, mobile route scaffold, mobile agent skills, `frontend/src/app/globals.css`, `assets/01_technical_specs`, and official PUWF documents in `assets/02_legal_forms`, `assets/03_union_office_bearers`, `assets/04_operational_data`, and `assets/05_governance_docs`.

## Context Review Summary

The mobile app must serve two primary groups:

- Worker: low-literacy, Urdu-first, budget Android-first, focused on identity, rights, dues, grievance filing, voting, union information, and notifications.
- Union Admin: General Secretary, Finance Secretary, office staff, and office bearers managing member records, dues, annual returns, elections, CBA/CoD, legal/grievance work, documents, and compliance.

The web app already exposes these module families:

- Worker: dashboard, profile, digital ID, grievances, dues, voting, rights, my union, notifications.
- Union Admin: dashboard, members, office bearers, dues, annual return, compliance, documents, governance, notifications, elections, CBA, grievances, legal, settings.

The mobile app must not copy desktop layouts. Mobile must translate the intent into compact cards, bottom tabs, action sheets, wizards, segmented controls, searchable lists, and status timelines.

## Official PUWF Source Alignment

Use these source groups as authority:

- `assets/02_legal_forms`: Form C, Form A, Form A Schedule 1, Annual Return, Election Schedule-1, NGC Nomination Form, Resolution, Khalfiya Biyan, Members List.
- `assets/03_union_office_bearers`: regional office-bearer structures and designation patterns.
- `assets/04_operational_data`: affiliated union lists, LWMC worker list, affiliation packet, member and union examples.
- `assets/05_governance_docs`: Constitution, CBA certificate/order, Charter of Demand, settlement/staff agreements, election list, severance scheme examples.
- `assets/01_technical_specs`: structured product, SRS, ERD, OpenAPI, and operational knowledge.

Some extracted Markdown from PDFs has OCR noise. Treat the PDFs and official document names as legal-fidelity anchors, and use PRD/SRS/ERD/OpenAPI plus current web code as structured field truth.

## Global Mobile Architecture Rules

- Feature-sliced structure: group module UI, hooks, schemas, and helpers by feature when the module grows beyond one route file.
- Shared primitives first: reuse `mobile/src/components` before creating new visual patterns.
- Services stay mock-first: `mobile/src/services` owns data hooks, backed by `mobile/src/data`.
- Types are shared: extend `mobile/src/types/domain.ts` before duplicating module-specific shapes.
- Forms use Zod and React Hook Form; official legal fields must be mapped in `04_LEGAL_FORMS_MAPPING.md`.
- Localization is mandatory: every user-facing string goes to `ur.json` and `en.json`.
- Design tokens are mandatory: no raw colors outside token files.
- All data screens must include loading, empty, populated, and error states.
- Sensitive fields must be masked in display views: CNIC, phone, government identifiers, internal document references.

## Mobile Design Pattern Library

Use these patterns consistently:

- Command header: compact logo/title/status row, language switch, optional notification/action icon.
- Status strip: one-row summary of the most important operational state.
- Metric grid: two-column compact metric cards, never giant KPI hero blocks.
- Action rail: horizontal quick actions with icons for common tasks.
- Mobile registry list: searchable list with filter chips and bottom sheet detail.
- Legal wizard: one logical section per step, progress indicator, autosave note, source document reference.
- Timeline: grievances, CBA, elections, annual return, and compliance use event timelines.
- Evidence card: document upload placeholder, source, expiry, owner, status, and next action.
- Bottom tabs: Worker core actions; Union Admin uses tabs for high-frequency operations plus in-screen module shortcuts.

## Worker Portal Modules

### 1. Worker Launch And Onboarding

Source alignment: PRD worker persona, Form C, Members List, LWMC worker list, Worker web profile/onboarding patterns.

Mobile UX:

- Start after splash at role menu with Urdu-first cards such as `کیا آپ فیکٹری ورکر ہیں؟`.
- First-time worker gets one question per screen with progress and skip-safe copy.
- Use large selection cards, voice-note placeholders, CNIC/mobile entry, and clear privacy reassurance.
- Store progress locally in session/onboarding store.

Core fields:

- Worker status, union membership status, CNIC, mobile, name, father name, city, province, employer, establishment, designation, department, union, grievance urgency, language preference.

Tasks:

- Build feature slice `src/features/worker-onboarding` when flow exceeds current route file.
- Add translated question bank in Urdu and English.
- Add Zod schema for each step and combined onboarding payload.
- Add resume/clear draft actions.
- Add final route decision: Worker dashboard, grievance filing, rights library, or union lookup.

Acceptance criteria:

- Urdu is default and all questions have full English equivalents.
- Every answer path reaches a valid next screen.
- CNIC and mobile validation errors are localized.
- Small Android screens show one complete question without clipped text.

### 2. Worker Dashboard

Source alignment: web Worker dashboard, PRD KPIs, worker rights/governance priorities.

Mobile UX:

- First viewport must show identity, dues status, active grievance, upcoming vote, and social security status.
- Use compact identity strip, two-column metrics, and quick actions.
- No marketing hero or oversized banner.

Tasks:

- Add dashboard data hook with loading/error/empty states.
- Add quick action cards for ID, dues, grievance, vote, rights, and union contact.
- Add priority notification strip for urgent grievance/election/dues events.

Acceptance criteria:

- Worker can understand membership status in under 5 seconds.
- Dashboard shows the next best action.
- All action cards have accessibility labels.

### 3. Worker Digital ID

Source alignment: Form C membership, worker web digital ID, PUWF branding.

Mobile UX:

- PUWF-branded card with worker photo placeholder, membership ID, union name, designation, masked CNIC, status chip, QR placeholder, and offline availability label.
- Keep card printable/screenshot-safe without exposing full CNIC.

Tasks:

- Create reusable `DigitalIdCard` component.
- Add offline preview state and QR placeholder.
- Add copy/download mock actions.

Acceptance criteria:

- PUWF logo appears without cropping or recoloring.
- CNIC is masked by default.
- ID card remains readable in Urdu and English.

### 4. Worker Dues

Source alignment: PRD finance transparency, Annual Return income/dues sections, web dues module.

Mobile UX:

- Ledger summary at top: paid/current, outstanding months, last receipt, employer deduction status.
- Monthly rows use status chips and receipt action.

Tasks:

- Add dues ledger states: paid, overdue, waived, pending employer remittance.
- Add receipt detail sheet.
- Add explanatory copy for employer deduction versus union receipt.

Acceptance criteria:

- Worker sees current dues status in first viewport.
- Receipts are mock-marked and not presented as legal proof until backend is live.

### 5. Worker Grievances

Source alignment: PRD grievance SLA, SRS legal/grievance module, web grievance form, legal case escalation.

Mobile UX:

- Guided filing with category cards, urgency, employer/department, description, voice-note placeholder, attachments, anonymity/retaliation reassurance, and confirmation.
- Tracking view uses SLA timeline and status history.

Tasks:

- Add grievance filing wizard and schema.
- Add category mapping: wages, termination, harassment, safety, dues dispute, social security, other.
- Add voice-note and document placeholders.
- Add timeline component for submitted cases.

Acceptance criteria:

- Worker can file a mock grievance in Urdu without long text entry.
- Each grievance displays status, SLA, handler/union status, and next step.

### 6. Worker Voting

Source alignment: Election Schedule-1, NGC Nomination Form, election list, web voting module.

Mobile UX:

- Election availability card, voter eligibility, candidates, OTP-gated mock vote, confirmation state, result state after close.
- Use audit-safe language; no real vote is cast in frontend mock mode.

Tasks:

- Add election status model: upcoming, nomination, voting open, closed, results published.
- Add candidate card with position, manifesto summary, eligibility note.
- Add OTP mock step and confirmation screen.

Acceptance criteria:

- User cannot “vote” unless election is open and eligible in mock state.
- UI clearly labels mock/demo state.

### 7. Worker Rights Library

Source alignment: Constitution, PRD rights access, governance docs, worker public knowledge-base patterns.

Mobile UX:

- Searchable Urdu-first topics with categories: wages, union rights, safety, EOBI/social security, termination, CBA/CoD, grievance process.
- Use short cards and “what to do next” actions.

Tasks:

- Add localized topic content.
- Add search/filter.
- Add related action links to grievance, union contact, and documents.

Acceptance criteria:

- Worker can find a relevant rights topic within two taps/search.
- Content is plain-language Urdu and complete English.

### 8. Worker My Union

Source alignment: National List of Affiliated Unions, office-bearer docs, CBA certificate/order.

Mobile UX:

- Union profile card with registration/affiliation status, office address, office bearers, CBA status, documents, and contact actions.

Tasks:

- Add office-bearer compact list.
- Add document status cards for CBA, constitution, notices, annual return summary.
- Add contact actions as placeholders.

Acceptance criteria:

- Worker can identify union leadership and CBA status.
- Data aligns with union mock service and official terminology.

### 9. Worker Notifications

Source alignment: web notification module, PRD communications.

Mobile UX:

- Grouped notices: grievance, dues, election, rights, union notice.
- Use unread chips and clear action labels.

Tasks:

- Add notification categories and read/unread state.
- Add deep links to relevant module routes.

Acceptance criteria:

- Notifications are localized and route to the correct module.

## Union Admin Portal Modules

### 1. Union Admin Dashboard

Source alignment: web union command center, PRD/SRS union admin persona.

Mobile UX:

- Dense operational dashboard: members, dues health, compliance deadlines, active grievances, CBA/election status, urgent notices.
- First viewport shows risks and next actions.

Tasks:

- Add priority risk strip.
- Add quick actions for member intake, grievance update, dues entry, annual return, election schedule, CBA update.
- Add mini timeline for deadlines.

Acceptance criteria:

- General Secretary can identify the top compliance risk immediately.
- Dashboard links to every Union Admin module.

### 2. Member Registry

Source alignment: Form C, Members List, LWMC worker list, web member table/profile/form.

Mobile UX:

- Searchable mobile list with filters for membership status, dues status, Form C completion, election readiness, NADRA/EOBI verification.
- Detail opens in bottom sheet.
- Create/edit flow uses Form C-aligned wizard.

Tasks:

- Add feature slice `src/features/union-members`.
- Add member list, filters, profile sheet, create/edit wizard.
- Add Form C legal source metadata per step.
- Add CNIC duplicate warning placeholder.

Acceptance criteria:

- All Form C required fields are represented.
- List remains usable on small screens.
- Member profile exposes dues, documents, election readiness, and status actions.

### 3. Office Bearers

Source alignment: Form A Schedule 1, regional office-bearer docs, Constitution governance language.

Mobile UX:

- Designation cards grouped by executive body, regional context, term status, outsider flag, and warnings.
- Show 25% outsider warning when threshold approaches.

Tasks:

- Add create/edit office-bearer wizard.
- Add term date and designation history.
- Add outsider ratio calculation.
- Add documents/evidence placeholder.

Acceptance criteria:

- Office-bearer list shows designation, name, term, status, outsider flag.
- Warnings are visible but not alarmist.

### 4. Dues And Finance

Source alignment: Annual Return income/expense sections, PRD financial transparency, web dues/finance modules.

Mobile UX:

- Dues ledger, employer remittance tracking, receipts, welfare claim entry, compact charts.
- Use segmented tabs: Dues, Remittance, Receipts, Welfare, Summary.

Tasks:

- Add dues entry form with member/month/status.
- Add employer remittance card and reconciliation status.
- Add finance summary for annual return prefill.

Acceptance criteria:

- Finance Secretary can see overdue dues and remittance gaps.
- Data can feed Annual Return mock summary.

### 5. Annual Return

Source alignment: Annual Return, Form L/J concept in specs, web annual return wizard.

Mobile UX:

- Step wizard: union identity, membership movement, income, expenses, assets/liabilities, office bearers, documents, GS review, FS review, submission preview.
- Display source document reference at each step.

Tasks:

- Expand annual return schema.
- Add autosave draft state.
- Add approval states: draft, GS review, FS review, ready, submitted, returned.
- Add PDF/export placeholder.

Acceptance criteria:

- Required legal sections from mapping are represented.
- Wizard is dense but readable and does not become one giant form.

### 6. Elections

Source alignment: Election Schedule-1, NGC Nomination Form, election list, web elections module.

Mobile UX:

- Election timeline, schedule form, nominations, candidate scrutiny, voter list summary, polling state, results.

Tasks:

- Add schedule wizard with dates and presiding officer fields.
- Add nomination form with candidate, nominator, seconder, position, CNIC validation.
- Add voter list summary and election-readiness metrics.
- Add result publication mock flow.

Acceptance criteria:

- Election schedule fields match web and legal mapping.
- Candidate and voter states are audit-safe.

### 7. CBA And Charter Of Demand

Source alignment: CBA Certificate & Order, Charter Of Demand, CoD July 2022, Staff Agreement.

Mobile UX:

- CBA certificate status, expiry countdown, establishment, issuer, order date, document status.
- CoD workflow stages: draft, submitted, management response, negotiation, conciliation, settlement/MoS.

Tasks:

- Add CBA record detail sheet.
- Add CoD demand list builder.
- Add negotiation timeline and settlement document placeholder.

Acceptance criteria:

- CBA expiry and legal status are visible in first viewport.
- CoD flow uses official bargaining terminology.

### 8. Grievances And Legal

Source alignment: PRD grievance/legal module, web grievance admin and legal case modules.

Mobile UX:

- Queue by urgency, SLA, worker, category, assigned handler.
- Detail sheet with status updates, internal notes, escalation to legal, hearing logs.

Tasks:

- Add queue filters.
- Add assignment/status update forms.
- Add legal escalation form with court/forum type.
- Add hearing log timeline.

Acceptance criteria:

- Admin can triage urgent grievances quickly.
- Worker-sensitive information is masked where appropriate.

### 9. Documents And Compliance

Source alignment: official legal forms, affiliation packet, Constitution, annual return, CBA, election documents.

Mobile UX:

- DMS list with document type, owner, status, expiry, evidence link, upload placeholder.
- Compliance snapshot grouped by annual return, office-bearer term, CBA expiry, election, dues/remittance, legal evidence.

Tasks:

- Add document category filters.
- Add upload placeholder using Expo Document Picker.
- Add compliance obligation cards with source and deadline.
- Add expiry and missing-evidence warnings.

Acceptance criteria:

- Every compliance warning links to evidence or next action.
- Document labels match official PUWF terminology.

### 10. Governance, Notifications, Settings

Source alignment: Constitution, office-bearer docs, web governance/notifications/settings modules.

Mobile UX:

- Governance registry: resolutions, meeting records, constitution, office-bearer decisions.
- Notifications workspace for union notices.
- Settings for language, local auth, mock session, union profile basics.

Tasks:

- Add governance document categories.
- Add notice composer mock.
- Add session/language/local auth settings.

Acceptance criteria:

- Governance items connect back to legal documents.
- Settings do not expose unsafe backend assumptions.

## Phase-By-Phase Production Plan

### Phase 0: Documentation And Source Audit

Tasks:

- Keep `mobile/docs` updated for every module.
- Verify official PUWF source references for each legal workflow.
- Maintain `mobile/.agent/skills` and require relevant skills before implementation.
- Build a module parity matrix from web routes to mobile routes.

Acceptance criteria:

- Every module has source docs, web references, mobile route, data type, service hook, and QA checklist.

### Phase 1: Foundation Hardening

Tasks:

- Finalize feature-sliced folder conventions.
- Add shared primitives: list row, bottom sheet, legal stepper, search/filter bar, timeline, evidence card, empty/loading/error state.
- Add font loading plan for Urdu/Nastaliq.
- Add theme parity notes between OKLCH web tokens and mobile hex/runtime tokens.
- Add RTL-safe layout utilities across all shared primitives.

Acceptance criteria:

- New modules can be built without creating one-off cards or hardcoded colors.

### Phase 2: Role Menu, Auth, Localization, Onboarding

Tasks:

- Polish splash and role-selection cards with PUWF/FOS branding.
- Build complete Worker onboarding question bank.
- Build Union Admin login mock with language switch and local auth placeholder.
- Add route guards/session state.

Acceptance criteria:

- App starts in Urdu, switches fully to English, and routes users correctly.

### Phase 3: Worker Portal Production Pass

Tasks:

- Rebuild Worker screens using shared mobile patterns.
- Add missing Worker profile module if needed for web parity.
- Add guided grievance filing, rights search, digital ID card, voting mock, dues receipts, union profile, notifications.

Acceptance criteria:

- Worker portal is complete in frontend/mock mode and usable on small Android screens.

### Phase 4: Union Admin Core Registry

Tasks:

- Build production member registry and Form C wizard.
- Build office-bearer module with Form A Schedule 1 alignment.
- Build dashboard risk center and documents/compliance snapshot.

Acceptance criteria:

- Union Admin can manage member and office-bearer records from mobile mock flows.

### Phase 5: Union Admin Operations

Tasks:

- Build dues/remittance/finance.
- Build annual return wizard.
- Build elections schedule/nomination/results.
- Build CBA/CoD.
- Build grievances/legal queue and hearing logs.

Acceptance criteria:

- All high-value union operations exist in mobile frontend and map back to legal docs.

### Phase 6: Polish, QA, And Demo Readiness

Tasks:

- Add Reanimated transitions and reduced-motion handling.
- Add accessibility labels, focus/touch target checks, RTL/LTR QA.
- Add loading/empty/error states across all modules.
- Add demo walkthrough data and script.
- Run typecheck and Expo config checks.

Acceptance criteria:

- App is ready for stakeholder demo and future backend integration.

## Production Readiness Checklist

- Uses relevant mobile agent skills.
- Reads official PUWF sources before legal/governance changes.
- Preserves Urdu default and complete English mode.
- Uses reusable components and feature slices.
- Uses tokens only; no one-off colors.
- Uses compact mobile UI patterns, not desktop copy-paste.
- Provides loading, empty, populated, and error states.
- Masks sensitive values in display views.
- Includes accessibility labels and >=44px touch targets.
- Runs `npm.cmd run typecheck`.
