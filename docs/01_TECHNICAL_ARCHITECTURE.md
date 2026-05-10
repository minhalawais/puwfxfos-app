# Technical Architecture

## Stack

- Runtime: Expo SDK 55 with React Native 0.83, React 19.2, and TypeScript.
- Routing: Expo Router with route groups: `(role-select)`, `(auth)`, `(worker)`, `(union-admin)`.
- State: Zustand for session, locale, theme, onboarding progress, and lightweight UI state.
- Server state: TanStack Query, using mock services that mirror the web app's service boundaries.
- Forms: React Hook Form plus Zod.
- Styling: NativeWind-ready class names plus local typed theme tokens.
- Motion: React Native Reanimated for screen and card transitions.
- Device APIs: SecureStore, SplashScreen, Notifications, DocumentPicker, FileSystem, LocalAuthentication.

## Folder Structure

```text
mobile/
  app/
    _layout.tsx
    index.tsx
    (role-select)/
    (auth)/
    (worker)/
    (union-admin)/
  src/
    components/
    data/
    i18n/
    services/
    stores/
    theme/
    types/
    validation/
  docs/
```

## Data Flow

Screens call hooks from `src/services`. Services return mock data with the same domain concepts as the web frontend: worker profile, union profile, dues, grievances, elections, annual returns, office bearers, documents, compliance, and CBA/CoD.

## Backend Integration Later

When backend APIs are ready, replace mock service functions with OpenAPI-backed clients while keeping TanStack Query keys stable. Auth should map to `/auth/login`, `/auth/register/worker`, `/auth/verify-otp`, and `/auth/me` from `assets/01_technical_specs/PUWF_OpenAPI_v1.yaml`.
