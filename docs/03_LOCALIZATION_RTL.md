# Localization And RTL

## Language Policy

- Default locale is Urdu (`ur`).
- English (`en`) is a complete full-app mode.
- Do not mix English helper text into Urdu flows unless it is an official acronym or field name such as CNIC, EOBI, CBA, or PUWF.

## RTL Strategy

- Use `I18nManager` only through the app locale store.
- Use logical layout helpers from `src/theme/layout.ts`.
- Icons that imply direction must mirror in RTL when needed.
- Lists, cards, and tab bars must preserve reading order.

## Content Style

- Urdu worker copy should be simple, direct, and conversational.
- Union admin copy can be more technical but should preserve official terms.
- Legal and governance fields must follow the labels documented in `04_LEGAL_FORMS_MAPPING.md`.

## QA Checklist

- Verify role menu, onboarding, worker dashboard, union dashboard, forms, and bottom tabs in both Urdu and English.
- Verify no clipped Nastaliq text on small Android screens.
- Verify numbers, CNIC, phone, and IDs remain legible in both directions.

