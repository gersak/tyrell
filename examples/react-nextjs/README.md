# Tyrell + React + Next.js example

A Next.js 16 (App Router) app using `tyrell-components` and `tyrell-react` **1.0.0-TC59**, with Tailwind for layout.

## Run it

```bash
cd examples/react-nextjs
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start        # http://localhost:3000  (PORT=3010 npm run start for another port)
```

`npm run type-check` runs `tsc --noEmit`.

## Pages

| Page | What it shows |
|---|---|
| `/examples/contact-form` | A plain `<form>` with no validation code: `required`, `type="email"`, `pattern`, `minLength`/`maxLength` on the fields, `onSubmit` reading `FormData`, a server-side error through `error`, `loading` on the button, reset. |
| `/examples/settings` | `TySwitch` toggles, tooltips, an account form validated on Save with `form.reportValidity()`, a guarded modal (`preventOutsideClick` + `preventEscape`). |
| `/examples/multiselect` | Multiple select with built-in and external search, and rich options shown with a trigger button + `TySelectedOptions`. |
| `/examples/tabs` | Controlled `TyTabs`, bottom placement, lazy tabs (`lazy` + `onTabLoad`, `loadFailed()` + Retry). |
| `/examples/date-picker` | `TyDatePicker` in many configurations, plus `TyCalendarMonth` with `value`, `onDayClick` and `dayContentFn`. |
| `/examples/dashboard` | `TyCalendar` with custom day content, tags, stats. |
| `/examples/modal-popups` | Popups and selects inside a modal (close-event regression page). |
| `/components/buttons`, `/examples/icons`, `/theme`, `/installation` | Buttons, the icon registry, theming, setup notes. |
| `/examples/fixes-test`, `/examples/checked-bridge-test` | Regression pages for wrapper fixes (not in the sidebar). |

## How it's wired

- **Registering the elements.** `tyrell-components` defines classes that extend `HTMLElement`, which doesn't exist on the server. `components/TyRegistry.tsx` imports it inside `useEffect`, so it only runs in the browser. Elements rendered before that upgrade when it finishes.
- **CSS.** `app/layout.tsx` imports `tyrell-components/css/tyrell.css` and `tyrell-theme.css` from the installed package, and `app/globals.css` (Tailwind, processed by Next's PostCSS).
- **Icons.** `lib/icons.ts` imports only the Lucide icons the app uses from `tyrell-components/icons/lucide` and registers them with `window.tyIcons.register`.
- **Forms.** Put fields in a real `<form>`; the browser validates before `submit` fires, so `onSubmit` only runs with valid data. Failing fields show their message under the field and the first one takes focus. `TyButton` without a `type` submits its form (see the note below).

## Known issue (tyrell-react TC57)

`<TyButton type="submit">` also dispatches its own `submit` event on the form, which skips validation and runs `onSubmit` a second time. Leave `type` off: `ty-button` already submits its form, with validation. The pages here do that.
