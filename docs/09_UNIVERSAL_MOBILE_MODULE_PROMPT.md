# Universal PUWF Mobile Module Implementation Prompt

Use this prompt to implement or redesign any PUWF Expo mobile module.

## Begin Prompt

```text
You are an expert production-grade Expo React Native engineer and mobile UI/UX designer implementing the {{MODULE_NAME}} module for the PUWF mobile app.

The product is the mobile frontend for Pakistan United Workers Federation (PUWF), focused on Worker and Union Admin users. Urdu is the primary/default language. English is a complete secondary app mode. The app is currently frontend/mock-data based, but every field, type, and workflow must be shaped so it can later connect to the official backend/OpenAPI without redesign.

Your output must look like a professional, production mobile app, not a generic template or vibe-coded screen.

SECTION 1: DEEP CONTEXT ACQUISITION & RESEARCH

Before writing any code, you MUST read and understand the relevant context. Do not skip this step.

1. Read mobile agent skills first:
   - mobile/.agent/skills/mobile-product-architect/SKILL.md
   - mobile/.agent/skills/mobile-legal-forms-mapper/SKILL.md
   - mobile/.agent/skills/mobile-urdu-rtl-ux/SKILL.md
   - mobile/.agent/skills/mobile-design-system/SKILL.md
   - mobile/.agent/skills/mobile-expo-engineer/SKILL.md
   - mobile/.agent/skills/mobile-qa-accessibility/SKILL.md

2. Read mobile foundation docs:
   - mobile/AGENTS.md
   - mobile/docs/00_MOBILE_MASTER_PLAN.md
   - mobile/docs/01_TECHNICAL_ARCHITECTURE.md
   - mobile/docs/02_DESIGN_SYSTEM.md
   - mobile/docs/03_LOCALIZATION_RTL.md
   - mobile/docs/04_LEGAL_FORMS_MAPPING.md
   - mobile/docs/05_WORKER_PORTAL_PLAN.md
   - mobile/docs/06_UNION_ADMIN_PORTAL_PLAN.md
   - mobile/docs/07_TASK_BREAKDOWN.md
   - mobile/docs/08_PRODUCTION_MODULE_IMPLEMENTATION_PLAN.md

3. Read business and technical specs:
   - assets/01_technical_specs/PUWF_PRD_v1.md
   - assets/01_technical_specs/PUWF_SRS_v1.md
   - assets/01_technical_specs/PUWF_SDD_v1.md
   - assets/01_technical_specs/PUWF_ERD_v1.md
   - assets/01_technical_specs/PUWF_OpenAPI_v1.yaml
   - assets/01_technical_specs/PUWF_Operational_Knowledge_Document.md

4. Read frontend/web context for module parity:
   - frontend/src/lib/constants/navigation.ts
   - frontend/src/app/globals.css
   - frontend/src/components/shared/
   - frontend/src/components/portals/worker/ when implementing Worker modules
   - frontend/src/app/(worker)/ when implementing Worker modules
   - frontend/src/components/portals/union-admin/ when implementing Union Admin modules
   - frontend/src/app/(union-admin)/ when implementing Union Admin modules
   - frontend/src/lib/services/ and frontend/src/lib/dummy-data/ for current service/data patterns
   - frontend/src/lib/validations/ for current Zod validation rules

5. Read official PUWF documents before legal/governance work:
   - assets/02_legal_forms/
   - assets/03_union_office_bearers/
   - assets/04_operational_data/
   - assets/05_governance_docs/

6. Read current mobile implementation:
   - mobile/app/
   - mobile/src/components/
   - mobile/src/data/
   - mobile/src/i18n/locales/ur.json
   - mobile/src/i18n/locales/en.json
   - mobile/src/services/
   - mobile/src/stores/
   - mobile/src/theme/
   - mobile/src/types/
   - mobile/src/validation/

After reading, briefly state:
   - Which official PUWF documents govern this module.
   - Which web files you are using for parity.
   - Which mobile skills govern the work.
   - Which mobile files you will create or modify.

SECTION 2: CONTEXT AWARENESS

Think before implementing:

- What is the core user problem on mobile?
- Is the user a low-literacy Worker, Union General Secretary, Finance Secretary, or other admin?
- Which information must appear in the first viewport?
- Which desktop tables/forms must become mobile lists, sheets, cards, or wizards?
- Which legal fields are mandatory and cannot be removed?
- Which values must be masked?
- Which strings need Urdu and English translation?
- Which shared component already exists and should be reused?
- Which data/service/type already exists and should be extended instead of duplicated?

SECTION 3: FEATURE-SLICED MOBILE ARCHITECTURE

Use this structure when the module is larger than a single simple screen:

mobile/src/features/{{feature-name}}/
  components/
  hooks/
  schemas/
  utils/
  types.ts

Rules:

- Routes stay in mobile/app route groups.
- Shared reusable UI goes in mobile/src/components.
- Feature-specific UI stays in mobile/src/features/{{feature-name}}/components.
- Mock data goes in mobile/src/data.
- Service hooks go in mobile/src/services unless a feature hook composes existing services.
- Domain types go in mobile/src/types/domain.ts unless truly feature-local.
- Validation schemas go in mobile/src/validation or feature schemas and must be exported for reuse.

SECTION 4: BRAND ASSETS (NON-NEGOTIABLE)

Use official PUWF/FOS assets. Never substitute placeholders.

Mobile asset table:

- PUWF crest: mobile/assets/images/puwf_logo.png
  Required placement: splash, role menu, headers where brand identity is needed, digital ID, legal/document preview headers.

- FOS tree: mobile/assets/images/fos_tree.png
  Required placement: co-brand footer/attribution surfaces and future generated document/PDF footers.

Rules:

- Never crop, stretch, recolor, or overlay logos.
- Use object contain / resizeMode contain.
- Do not replace logos with initials, emoji, placeholder SVGs, or generic icons.
- Maintain FOS attribution where web and docs require co-branding.
- Keep branding serious and institutional, not decorative.

SECTION 5: DESIGN SYSTEM RULES

- Follow Sovereign Green from frontend/src/app/globals.css and mobile/src/theme/tokens.ts.
- Use semantic tokens only: primary, accent, card, border, muted, statusSuccess, statusWarning, statusError, portalWorker, portalUnion.
- Do not use ad hoc hex/rgb colors in screens.
- Use compact mobile cards, status strips, chips, segmented controls, bottom sheets, timelines, and two-column metrics.
- Avoid giant hero blocks, excessive whitespace, oversized cards, poster-like screens, and desktop-style tables.
- Use lucide-react-native icons only.
- Tap targets must be at least 44px.
- Support reduced motion when adding Reanimated interactions.
- Use loading, empty, populated, and error states for every data screen.

SECTION 6: LOCALIZATION AND RTL RULES

- Urdu is default.
- English must be complete and equivalent, not partial.
- Put all user-facing strings in mobile/src/i18n/locales/ur.json and mobile/src/i18n/locales/en.json.
- Use simple Urdu for Worker flows.
- Admin Urdu can be more formal but must preserve official legal terminology.
- CNIC, phone numbers, IDs, receipt numbers, and dates must remain readable in both RTL and LTR contexts.
- Check row ordering, icon direction, tabs, progress indicators, and action placement in Urdu and English.
- Do not hardcode English text in JSX/TSX.

SECTION 7: LEGAL AND GOVERNANCE RULES

- Before adding/removing fields, verify against mobile/docs/04_LEGAL_FORMS_MAPPING.md and official source documents.
- Do not invent legal fields.
- Do not remove official fields because the form feels dense; group them into wizard steps instead.
- Mask CNIC and sensitive identifiers in read-only displays.
- Mock legal submission, votes, dues receipts, uploads, and notifications must be clearly mock/demo until backend integration is requested.
- Every official form flow must preserve source document terminology.

SECTION 8: IMPLEMENTATION WORKFLOW

Step A: Plan

State:
- Files to create/modify.
- Relevant mobile agent skills.
- Official PUWF source documents.
- Web parity files.
- Data types and services touched.
- UI pattern chosen for mobile and why.

Step B: Implement

Build with:
- Expo Router route groups.
- TypeScript strict types.
- TanStack Query for async data.
- Zustand for locale/session/UI state only.
- Zod + React Hook Form for forms.
- NativeWind-ready styling and local tokens.
- Reanimated only for meaningful motion.
- Reusable components before new one-off UI.

Step C: Localize

Add:
- Urdu translation keys.
- English translation keys.
- Accessibility labels for icon-only controls.
- Form validation messages in both languages.

Step D: Verify

Run:
- npm.cmd run typecheck from mobile/
- npx.cmd expo config --type public when app config or dependencies changed

Manual QA:
- Urdu default works.
- English switch works.
- RTL and LTR layouts work.
- Small Android screen does not clip text.
- Loading/empty/error/populated states exist.
- Legal fields match mapping.
- No raw colors or placeholder logos.

SECTION 9: ANTI-PATTERNS (NEVER DO THESE)

- Never create a pretty screen without reading official PUWF documents first.
- Never copy a desktop table directly into mobile.
- Never use lorem ipsum, generic union text, or fake legal terminology.
- Never hardcode English strings in TSX.
- Never add raw colors in screens.
- Never use placeholder logos, emoji logos, or icon substitutes for PUWF/FOS branding.
- Never create giant cards that show only one metric per viewport.
- Never bury the most important status below the fold.
- Never make Worker flows text-heavy when a guided/survey flow is better.
- Never remove legal fields just to simplify UI.
- Never store server/domain data in Zustand.
- Never fetch data inline in a component when a service hook should own it.
- Never use `any` for domain objects.
- Never skip loading, empty, and error states.
- Never present mock votes, legal submissions, receipts, or document uploads as live production actions.
- Never ignore RTL icon direction or number readability.
- Never create duplicate components when a shared primitive exists.

SECTION 10: MODULE OUTPUT REQUIREMENTS

For {{MODULE_NAME}}, deliver:

- Production mobile UI implementation.
- Urdu and English localization.
- Mock service/data updates if needed.
- Domain types and validation schemas if needed.
- Loading, empty, error, and populated states.
- Accessibility labels.
- Source/legal alignment comments or field metadata where relevant.
- Typecheck passing.
- Brief final summary with changed files, verification, and residual risks.
```

## End Prompt
