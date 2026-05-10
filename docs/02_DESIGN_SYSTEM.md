# Mobile Design System

## Visual Direction

The app uses a sovereign green institutional theme with warm amber accents, inherited from the web app's `frontend/src/app/globals.css`. UI should be serious, compact, trustworthy, and operational.

## Token Families

- `primary`: deep PUWF green for navigation, active tabs, key actions.
- `accent`: warm amber for priority highlights and key deadlines.
- `surface`: soft green-tinted app background.
- `card`: white elevated panels with thin borders.
- `statusSuccess`, `statusWarning`, `statusError`, `statusInfo`, `statusPending`: semantic operational states.
- `portalWorker`: blue-green identity for worker surfaces.
- `portalUnion`: teal identity for union-admin surfaces.

## Layout Rules

- Mobile cards use 8px radius or less unless they are identity cards.
- Show maximum useful information per screen without cramping: status strips, two-column metrics, compact lists, and sticky bottom tabs.
- Avoid marketing hero layouts inside authenticated portals.
- Use icon buttons for repeated actions and text buttons only for commands that need words.
- Every icon-only control needs an accessibility label.

## Typography

- Urdu screens use Nastaliq-compatible font loading when available; fallback must remain readable.
- English screens use a clean sans-serif.
- Do not scale type by viewport width. Use fixed semantic sizes.

## Motion

- Use small screen entrance transitions, section reveals, progress step transitions, and button feedback.
- Avoid decorative motion that distracts from operations.

