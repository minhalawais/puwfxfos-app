# PUWF Mobile

Expo React Native frontend for the PUWF platform. The first mobile scope covers Worker and Union Admin portals with Urdu-first localization, full English switching, Sovereign Green branding, and mock data aligned to the existing web app and PUWF legal/governance assets.

## Structure

- `app/`: Expo Router route groups for role selection, worker, union admin, and auth.
- `src/components/`: shared mobile UI primitives.
- `src/data/`: frontend mock data for demos and API parity.
- `src/i18n/`: Urdu and English translation files.
- `src/services/`: mock service layer mirroring future backend contracts.
- `src/stores/`: locale/session state.
- `src/theme/`: design tokens and spacing rules.
- `docs/`: product, architecture, design, localization, legal mapping, and task plans.

## Local Setup

```bash
cd mobile
npm install
npm run start
```

Use `npm run typecheck` before merging feature work once dependencies are installed.
