# Changelog

All notable changes to the Tyrell web components library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-RC18] - 2026-10-27

### Changed (breaking)

- **`ty-select`: `value` is the only selection input.** `<ty-option selected>` no longer selects anything. The select keeps its `value` attribute on the current selection, so a server morph does what the server renders: a different `value` wins, the same one changes nothing, none means no selection. A server that re-renders a select renders `value="…"` with the current selection.
  - Migration: move the selection from the options to the select: `<ty-select value="a,b">`.
- **`ty-select` writes no selection state onto its options.** The check and `aria-selected` come from `option.checked`, a property the select sets, and the option's internals; `ty-option` keeps its own `role="option"`. CSS that targeted `ty-option[selected]` for the selected look no longer matches.
- **`<ty-tag>` is no longer an option inside `ty-select`.** Use `<ty-option>`; rich content, `flavor` and `data-*` still reach `ty-selected-options` chips.
- **`ty-select`'s trigger shows the picked option itself, not a copy.** A closed single select assigns the real `<ty-option>` to its trigger slot, so page CSS still styles it and nothing is added to the select's children. Open, the trigger shows the placeholder, single and multiple alike; the list shows the picks. `ty-option[cloned]` and `slot="selected"` copies are gone.
- **`ty-tag` `selected` is gone** (attribute, property, React prop). It marked tags picked as select options; nothing has read it since tags stopped being options, and it had no look. For a toggle chip use your own class or `flavor`.
- **`ty-select` `align` is gone.** `placement` does it: `align="end"` is `placement="bottom-end"` (it still flips when there's no room below). React: `TySelect` `align` prop removed.
- **`external-search="false"` means off**, like every other boolean attribute. The attribute aliases behind it are gone.

### Added

- **`ty-select` `external-selection`:** the app holds the selection, for lists where hundreds of values can be picked. It marks the options it shows `selected`; a pick fires `change` with `{ value, selected }` for that option and changes nothing in the select, which submits nothing and holds no `value`. Pairs with `external-search`. React: `externalSelection`.

### Fixed

- **`css/*.css` ships minified.** The documented `css/tyrell.css` + `css/tyrell-theme.css` were the commented sources, 21.8 KB gzipped together; now 6.7 KB. Same rules and paths. The sources moved to `src/css/`.
- **`TySelectedOptions` (React) hydrates cleanly.** The element draws its chips as its own children, which SSR hydration found unexpected, so React rebuilt the tree on the client. The wrapper now renders it on the client only: nothing on the server and while hydrating, right away in every other render.
- **`tyrell-react` loads as native Node ESM.** Its relative imports had no `.js` extension, so a server that runs the package unbundled (Next.js Pages Router, Remix, Vite SSR) failed with `ERR_MODULE_NOT_FOUND`.
- **`ty-select` works with React SSR hydration and Replicant.** Its trigger copy was an extra child: React reported a hydration mismatch and re-rendered the whole tree on the client, and Replicant removed the wrong option when the options changed.
- **`ty-select` morphs cleanly.** Nothing the select wrote is left for a morph to strip: the selection, checks, ARIA, a slotted trigger's sizing and the popup position all survive. Options renamed by a morph relabel the trigger and chips.
- **`ty-select` `change` `detail.values` keep click order**, like `.value`; they were sorted.
- **A `ty-select` whose value is a text-only option (`<ty-option>Apple</ty-option>`) no longer loops** rebuilding its trigger clone and freezes the tab.
- **`form.reset()` goes back to the latest markup**, like a native control's `defaultValue`: a `value` the server morphed in or a framework rendered becomes what reset restores, not the one from the first page load. A field's own reflection of the user's edit doesn't count. All form fields. `ty-select` also restores its `value` after picks again.
- **`ty-selected-options` relabels its chips when the options arrive after the value** (a fetch, a morph), follows a `value` set from code, and binds to a `for` picker further down a page that is still loading.
- **`ty-selected-tags` keeps its chips through a server morph** (Datastar patch-elements, htmx/idiomorph). The server's HTML has no chips, since they're drawn in the browser, so a morph that reached the element removed them until the picker's next `change`. It now redraws them right away, before paint, with the same nodes, template and page CSS as before.
- **`ty-input` keeps the user's edit when moved in the DOM.** Removing an edited field and putting it back (drag-to-reorder, moving it into a modal, a morph that reorders siblings) restored the original `value` attribute, and the form submitted the old value. Only the first connect reads the declared value now.
- **`ty-calendar` stays on the month the user navigated to when moved in the DOM**, instead of jumping back to the `year`/`month` attributes. `form.reset()` after a move restores the markup date again, not the last picked one.

## [1.0.0-RC17] - 2026-10-22

### Added

- **Native constraint rules on `ty-input`:** `pattern`, `minlength` / `maxlength` (text types) and `min` / `max` (`number`, `currency`, `percent`, `compact`, against the numeric value). `type="email"` / `"url"` also fail on a malformed value (`typeMismatch`). A failing rule blocks the form, shows in `validity`, and `reportValidity()` writes its message into `error`. Empty values only fail `required`. Messages are the browser's own (in the user's language) for `required`, `min`/`max`, `pattern`, email/url and, once the user has typed, `minlength`; otherwise the length messages are Ty's. `too-short-message` / `too-long-message` (`{minlength}` `{maxlength}` `{length}`) set the length wording and win over the browser's. `min` / `max` are read the way a native number input reads them, so a value it ignores (`" 5 "`, `0x10`) is no rule. React: `pattern`, `minLength`, `maxLength`, `min`, `max`, `tooShortMessage`, `tooLongMessage`.
- **A plain `<form>` validates Ty fields with no code, in any framework.** The browser validates before `submit` fires. Fields with an error line (`ty-input`, `ty-textarea`, `ty-select`, `ty-date-picker`, `ty-radio-group`, `ty-file-upload`) show their message there instead of a browser bubble, on a submit, `reportValidity()` and `checkValidity()` (the field's or its form's); `ty-checkbox`, `ty-switch` and `ty-calendar` keep the bubble. For a check that shows nothing, read `field.validity.valid` or `form.matches(':invalid')`. A submit (a submit button click, Enter in a single-line field, `form.requestSubmit()`) and `form.reportValidity()` focus the first invalid field in form order, like a native form, also in forms inside a shadow root (Lit, Stencil). In a form that mixes error-line fields with bubble fields (`ty-checkbox`, `ty-switch`, native inputs), a later bubble field no longer takes the focus and the bubble from an earlier invalid field; a bubble field that comes first still gets both. Disabled fields and fields that are not shown (`display: none`, `visibility: hidden`, an inactive `ty-wizard` step) are skipped. `checkValidity()` never moves focus, and Enter in a textarea, in a contenteditable or while confirming IME input is not a submit. A field the user edited also shows its message when it loses focus (native `:user-invalid` timing), and a shown message clears as soon as the value is valid. That message waits until the click or tap that moved focus is done, so a Submit, Reset or Cancel button just below the field doesn't move away before the click lands, on touch screens too.
- **`ty-textarea` `minlength` and `maxlength`**, like `ty-input`'s: the `minlength`, `maxlength`, `too-short-message` and `too-long-message` attributes (`{minlength}` `{maxlength}` `{length}`), the `minLength`, `maxLength`, `tooShortMessage` and `tooLongMessage` properties, and the `tooShort` / `tooLong` validity flags. Typing stops at `maxlength`, and once the user has typed, the too-short message is the browser's own. React: `TyTextarea` gets `minLength`, `maxLength`, `tooShortMessage` and `tooLongMessage`.
- **`ty-select` has an error line.** `error` (attribute and property, `''` clears it) shows a message under the field, with `ty-input`'s look and spacing. While it is set, the select takes `ty-input`'s error colors (see Changed) and its trigger gets `aria-invalid` plus `aria-describedby` pointing at the message. Under a compact or `slot="trigger"` select the line wraps at a readable width and starts at the trigger's edge, without widening the host; a slotted trigger gets `aria-invalid` and `aria-description`. React: `TySelect` `error` prop.
- **`ty-date-picker` `native`** (React: `native`). The value, the form value and `change` `detail.value` are wall-clock, like the browser's own inputs: `2026-10-16`, or `2026-10-16T14:30` with `with-time` (seconds only when they're not zero). Without it nothing changes: a UTC instant (with time, the picked moment; date-only, the moment the day starts in the browser's timezone). Toggling `native` or `with-time` at runtime rewrites the value in the new shape, same day and time.
- **`ty-date-picker` has an error line.** `error` (attribute and property; React `error` prop) works like `ty-input`'s, colors included (see Changed): the message goes under the field, and the field is `aria-describedby` the line.
- **React `TyDatePicker`:** `value` also takes epoch milliseconds (a number), and `TyDatePickerEventDetail` now types `localValue`.
- **`ty-calendar` `value` reads what `ty-date-picker` reads:** an ISO instant with `Z` or an offset, `YYYY-MM-DDTHH:mm[:ss]`, and (property) epoch milliseconds or a `Date`; an instant is its local day. So `calendar.value = picker.value` works with no conversion. The calendar's own value, `change` and form value stay `YYYY-MM-DD`. `min` / `max` on `ty-calendar`, `ty-calendar-month`, `ty-calendar-navigation` and `ty-date-picker` also take instants (their local day). React `TyCalendar` `value`: `string | number | Date`.
- **`TyCalendarMonth` (React): `value`, `dayContentFn` and `customCSS` props.** They used to need a ref.
- **React wrapper tests** (`packages/react`, `npm test`): every wrapper on React 19 and 18.
- **`window.tyResizeObserver.getAllSizes()`**, the same as the module's `getAllSizes()` export; `.sizes` still works.

### Fixed

- **`ty-checkbox`, `ty-switch` and `ty-radio` stay centered on the label's first line at every size.** A control bigger than the line (`xl` next to `text-sm`) grew the row and sat a few px below the text's middle. The control is now one line box of the surrounding text tall, and a bigger tick, track or circle overhangs the line instead of pushing the text — in a flex label (`items-start` or `items-center`), inline in text, and next to a wrapping label.
- **The scroll lock holds for pages that scroll their own container.** While a `ty-modal`, `ty-select` list, `ty-date-picker` calendar or `ty-popup` is open, an app's inner scroll area (a full-height layout with an `overflow: auto` main) no longer scrolls by wheel, touch or keys (End, Page Down, Space, arrows); scrolling inside the open one still works. Escape with focus on the page (after a click on the backdrop) now closes the top modal, and `prevent-escape` holds there too.
- **Validation messages on `ty-textarea`, `ty-select`, `ty-date-picker`, `ty-checkbox`, `ty-switch`, `ty-radio-group`, `ty-file-upload` and `ty-calendar` were fixed English text** ("Please fill out this field", "Please select a date", …), whatever the browser's language. They now come from the browser, like `ty-input`'s: the `required` message is what the matching native control says (Safari's switch wording for `ty-switch`, "one or more files" for a `multiple` upload where the browser says so), and `ty-calendar`'s `min` / `max` message is a native date input's.
- **`ty-popup` `openPopup()` while already open fired `open` again** (e.g. called from a click inside its anchor). It now does nothing, and opening during the close animation cancels the close. A popup reopened right after Escape closed it no longer shuts again when the close animation ends, and keeps its scroll lock.
- **Escape closed a `disable-close` `ty-popup`.** Opening left focus on the page, so Escape went to the browser, which closed the dialog. Opening now moves focus into the popup (an `[autofocus]` control in it, else the popup itself), and Escape leaves a `disable-close` popup open. A popup removed from the page on its own now also takes `aria-haspopup` / `aria-expanded` off its trigger.
- **`focus()` did nothing on `ty-radio-group`, `ty-file-upload`, `ty-select`, `ty-date-picker`, `ty-checkbox`, `ty-switch`, `ty-calendar` and `ty-button`** (the host isn't focusable), so a failing field couldn't take focus on submit. Each now focuses its interactive element: the checked (or first) radio, the drop zone, the trigger, the day grid, the inner button. A `ty-select` with a `slot="trigger"` focuses that trigger, or its own field when the trigger can't take focus (a `<span>`). On a disabled `ty-select` or `ty-date-picker`, `focus()` does nothing, like a disabled native control.
- **Empty values submit like native controls.** A single `ty-select` with nothing chosen and an empty `ty-textarea` submit `name=` (for `ty-date-picker`, see Changed); an empty `ty-file-upload` submits one empty file, like `<input type=file>`. `multiple` selects, unchecked checkboxes/switches and unpicked radio groups still submit nothing. Before, an empty `ty-textarea` was left out unless the user had typed and cleared it. A required `ty-file-upload` also shows its message when the user removes the last file.
- **`ty-input` in a form now behaves like a native input.** Enter submits the form (through its default button, or directly when it's the only text field), and an empty field submits `name=` instead of being left out of the form data.
- **`ty-input` and `ty-textarea` lost state when they moved.** A field taken out of the page and put back (a keyed React reorder, a morph that moves it) stopped firing `input` and `change`, and an `error` set while it was out never showed. A moved `ty-textarea` also stopped updating its value, so it failed `required` with text in it, and lost its custom scrollbar. A `ty-input` redraw (an `error` arriving as the user types or submits, for one) dropped the focus border and ring from a focused field and hid a password the user had revealed. Both fields now redraw and listen again when they're put back, and a redraw keeps focus and the revealed password. In Chromium, showing or hiding the password no longer moves the caret to the start.
- **`ty-textarea` listeners got two `input` events per keystroke:** the browser's own, without `detail`, and Ty's a tick later. Only Ty's `{ value, originalEvent }` reaches the host now, right away, as on `ty-input`, so React `onChange` runs once per keystroke.
- **`focus()` on `ty-input` / `ty-textarea` did nothing**, so `reportValidity()` never moved focus to the failing field either. Both now focus their inner field.
- **Start/end icons in `ty-input` and `ty-date-picker` came out dark inside a `.dark` area on a light page.** Their color pointed at a token that doesn't exist (`--ty-color-text-soft`); it's `--ty-text-soft` now. Same kind of fix for the `ty-file-upload` drop-zone backgrounds, `ty-radio-group` text and the `ty-icon` color transition.
- **`<TyModal open>` didn't open on React 19 (and Vue), and `TyOption` `disabled` / `selected` didn't stick.** Those frameworks set the property to `""`, which the setters read as false; `""` now means true.
- **Standalone `ty-calendar-navigation` crashed without `display-month`** ("Invalid month"): function defaults were stored uncalled. It and a standalone `ty-calendar-month` also ignored the page language and were always English. Both now follow the nearest `lang`, and `locale` still wins.
- **`ty-calendar` in forms and with the keyboard.** `required` did nothing; an empty required calendar now blocks the form with the browser's message (`required` property, React `TyCalendar` `required` prop). An invalid calendar blocked a submit without a bubble or focus; the day grid (in the month view, the month grid) now takes the focus and shows the bubble, and Firefox no longer logs "The invalid form control … is not focusable". A click on the weekday names or between cells now focuses the calendar instead of the page, and an arrow key then moves into the day grid. A `<dialog>` that opens on the calendar, a click on its `<label>` and `autofocus` focus the selected day (with none, the day Tab reaches), not the whole calendar with a focus ring around it. Picking a day or pressing a navigation arrow dropped the focus to the page, so the keys stopped working; focus now stays on the picked day or the arrow.
- **Missing short names:** `tyrell-react` had no `Select` / `SelectedOptions`, and the Reagent namespace `tyrell.react` had no `Select`, `SelectedOptions` or `FileUpload` (nor their `Ty…` names). All added.
- **React: `TyTab lazy`, `TyTabs fixed` and `TyStep disabled` treated `"false"` as on**, and `TyStep` rendered `disabled="true"` instead of a bare `disabled`.
- **React 19: `<TyButton form="id">` threw and nothing rendered** ("Cannot set property form … which has only a getter"). React 19 tried to assign `form` as a property, but it's read-only on the element, as on a native button. The wrapper now sets the `form` attribute, so a button outside its form submits or resets that form. `form` is also a typed `TyButton` prop now.
- **A stretched `ty-button` only reacted to clicks on its label area.** In a flex column or a grid cell, or with a `width` / `height` set on it, the element grew but the button inside didn't, so clicks on the rest did nothing (no click event, no submit). The button now fills the element. That changes how some layouts look: a button that is a direct child of a flex column (or a grid cell) now spans the full width. Add `align-self: start` (Tailwind `self-start`) to keep it at its label width. A taller neighbor in a flex or grid row still doesn't make the button taller (`height: auto` on the element lets the row stretch it). A `wide` button keeps its own height, element included, so in a flex column with room to spare it doesn't push what follows down; a height set on a wide button is ignored. An `action` button stays square: a height or a width alone makes a bigger square. `::part(button) { min-height }` replaces the fill, so raise the height with `--ty-button-height` instead (see TY_GUIDE.md, Custom sizing).
- **Properties set before a Ty component loaded were half applied.** When a framework (React 19, Vue, Reagent) or lazy loading set a property on the element before the Ty script ran, the component took the value but didn't write the attribute, and the styles read the attribute. So a `ty-button` with `action`, `wide` or `size` set that way rendered as a plain button at the default size. And later assignments to that property (`value`, `error`, `minLength`, …) were silently ignored. Both now work like any later change, on every Ty element with settable properties: the form fields, `ty-button`, `ty-tag`, `ty-icon`, `ty-copy`, `ty-modal` (an early `open` opens it), `ty-option`, `ty-calendar`, `ty-calendar-month`, `ty-scroll-container` and `ty-resize-observer`. The early value wins over the matching attribute, and `form.reset()` still goes back to the attribute.
- **`setCustomValidity()` on a required, empty `ty-date-picker` threw `NotFoundError`.** Every render (the first one after mount, or a change to `label`, `size`, `placeholder` or `flavor`) replaced the element the field's validity pointed at. The picker now updates it after each render, and no Ty field throws for an outdated one.
- **`form.reset()` now clears validation messages.** Messages a Ty field showed after a submit, a blur after editing, or `reportValidity()` go away on reset, and the field counts as untouched again (leaving it without typing shows nothing). An `error` you set yourself stays, and so does `setCustomValidity()`, like native. A reset button pressed right after editing a field no longer leaves a message on the cleared field.
- **Validation never overwrites or removes an `error` you set.** Leaving the field, a submit, `reportValidity()`, the field becoming valid and `form.reset()` all keep your text; the field still blocks the form while a rule fails. Set `error` to `''` to let validation messages show again. Before, your text was replaced on the next keystroke or removed once the field became valid. Messages that validation wrote itself are still updated and cleared.
- **`ty-textarea`'s required marker now matches `ty-input`'s.** It is the same asterisk with the same size, color and spacing; it used to be a different circle icon.
- **A required, empty `ty-date-picker` showed nothing on submit.** Chrome logged "An invalid form control … is not focusable" and the form just didn't send. The message now shows under the field on a submit, `reportValidity()` and `checkValidity()`, and when the user clears the field. An untouched picker shows nothing on blur.
- **`ty-date-picker` reads every value format, with or without `native`.** `YYYY-MM-DD` is that day. `YYYY-MM-DDTHH:mm[:ss]` is local wall-clock, kept as written even for a time the clocks skip. An ISO instant with `Z` or an offset is its local day and time, kept exactly until the user picks another day or time; before, an instant in the hour repeated when summer time ends moved by an hour on load. A number (property or React) is epoch milliseconds. `2026-02-30` and `24:00` are no value, and a digit string is not read as epoch milliseconds. Years below 100 are kept: `0099-05-05` came out as 1999. `ty-calendar` keeps them too (it writes `year="0099"`), so the picker's calendar opens on that day, also for a value set later from code, instead of staying on the previous month.
- **A time set while `ty-date-picker` is date-only is no longer lost.** Turning `with-time` on afterwards, also in the same React render, shows that time instead of midnight.
- **`ty-date-picker` `.value` before the element is connected is the value it will submit**, not the raw string; `null` when empty.
- **`ty-date-picker` keeps the focus.** Setting or clearing `error` (a form library rendering its error after focusing the field, or `setCustomValidity('')`), a new value, or a clear with the × moved focus to the page body, so the next Tab started from the top. Focus now stays on the field, as in `ty-input`, also after tapping × on a touch screen, and goes back to it after a pick or Escape closes the calendar, also inside `ty-modal`. Enter or Space on the focused × now clears the value instead of opening the calendar.
- **Touch devices: turning `ty-date-picker` `with-time` on or off at runtime switches the native input between date and datetime-local.** Before, it stayed a date input and dropped the value. `min`, `max`, `required` and `disabled` changes now apply there too.
- **Keys reach a `ty-select` list wherever it sits, and Escape closes the innermost popup first.** Arrow keys, Enter and Escape work in a list inside a `ty-modal` or a `ty-popup`, also after the select is moved in the DOM. Escape closes the list and returns focus to the select, then the popup, then the modal. Before, in a modal, the modal swallowed the arrow keys and Enter, and Escape closed the modal while the list stayed open, leaving the page scroll-locked and ignoring clicks. A `ty-popup` also leaves the keys of a calendar or modal open inside it alone: with a `ty-date-picker` in a popup, arrow keys move the day, and the first Escape closes the calendar instead of both.
- **Closing a `ty-modal` closes what is still open inside it.** `hide()`, removing `open` or removing the modal closes an open `ty-select` list, `ty-date-picker` calendar or `ty-popup`, also in content a wrapper component slots into the modal; their `aria-expanded` and scroll lock update at once. A nested `ty-modal`, also a `no-backdrop` one, used to stay open and keep the page scroll-locked; it now closes too and fires its own `close` with reason `'programmatic'`. A modal removed while open and put back (a framework moving it) opens again as it was, without `close` or `open` events. Before, it came back non-modal with the page unlocked, and a `ty-popup` open in it stayed open.
- **`ty-button` is disabled inside `<fieldset disabled>`, like a native button.** It matches `:disabled`, looks disabled, fires no click and doesn't submit or reset. Re-enabling the fieldset or moving the button out restores it, and its own `disabled` property doesn't change.
- **A disabled or loading `ty-button` no longer fires `click` to bubbling listeners**, React `onClick` included. Before, a loading button still let the native click reach page listeners. Capture-phase listeners above the button (`addEventListener(…, true)`, React `onClickCapture`) still see the browser's own click on the way in. A loading button stays focusable and reports `aria-disabled`; Enter or Space on it, and Enter in a `ty-input`, don't submit through it.
- **Clicks that hit the `ty-button` element act like a press on the button.** `tyButton.click()`, a click on a wrapping `<label>`, a press on the host's padding or border, and Testing Library `fireEvent` / `userEvent` on the element fire one cancelable `click` and then submit or reset the form, and fire nothing while disabled or loading. Before, they fired `click` without submitting, even while loading. A real click inside the element that misses the visible button (room a page's `display: flex` adds around it) is no press.
- **A `ty-button` opened its `ty-popup` only with a pointer.** Enter, Space, `tyButton.click()` and a wrapping `<label>` did nothing. They now toggle it, as a native `<button>` does. Enter or Space on a control inside a popup no longer toggles it either: before, that closed a popup on a native `<button>`, and the `ty-tabs` `…` menu stayed open after a tab was picked with the keyboard.
- **Clicks inside a `ty-popup` in a `ty-button` counted as presses of the button.** Each one submitted the button's form, and click listeners (React `onClick` included) got the `ty-button` as the target. They now pass through as the browser's own click, with the real target. The button's own press still submits, so a popup trigger in a form needs `type="button"`.
- **`ty-checkbox` and `ty-switch` in Firefox.** A click on the control inside a `<label>` toggled it twice, so it stayed as it was and fired two `change` events; `ty-radio` click listeners saw two clicks. A submit with a required, unchecked one logged "The invalid form control … is not focusable". Now one click toggles once and nothing is logged. The host now hands focus to the control, so a click on the label text focuses it in every browser, without a focus ring (the ring shows after Tab, Space or Enter), and a disabled one isn't focusable. Two `click()` calls in a row toggle twice, like a native checkbox.
- **`ty-select` search: rows stayed on phones, and `hidden` options didn't stay hidden.** In the mobile dialog, typing changed the "Available" count but every row stayed in the list. The search used `hidden` as its own state, so an option you marked `hidden` could be reached with the arrow keys and picked, and closing the list showed it again. A `hidden` `ty-option` now stays out of the list, the arrow keys, the search and the count, and can still be the value, like `<option hidden>`. The search marks what it leaves out with `filtered-out`.
- **`ty-radio-group` fired only `change` for the arrow keys and Space**, so React `onChange` (and any `input` listener) missed keyboard picks. Every user pick now fires `input` then `change`, like a native radio; Space on the selected radio fires nothing.
- **`tyrell.layout/observe-size-changes!` threw when `tyResizeObserver` was loaded** and only worked when it wasn't; the check was inverted.
- **`ty-file-upload` `placeholder` never showed.** The drop zone always said "Drop files here or click to browse"; it now shows your text, as plain text.
- **`ty-copy` copied twice per click on its icon in Safari** (desktop and iPhone), with two `copy-success` events. Where the clipboard API is refused (plain http), the fallback copy dropped focus to the page, so Enter or Space did nothing next, and could leave a hidden textarea behind. One click is one copy, and focus stays on the button.
- **Missing color tokens.** With `tyrell-theme.css`, `.ty-border-neutral` (and its `hover:` / `focus:` forms) had no `--ty-border-neutral` and took the text color. With `tyrell-colors-static.css`, `+` and `-` solid buttons went transparent on hover and press, and `--ty-bg-neutral-strong` / `--ty-bg-neutral-faint` were missing.
- **In the CDN build (`dist/tyrell.js`), the `ty-tabs` marker grew in from nothing after the tabs had been hidden.** The minifier dropped the layout read that snaps it.

### Changed

- **`dev.gersak/tyrell` depends on `cljs-bean` only.** It no longer pulls in `tyrell-icons-lucide`, Replicant, Clojure or ClojureScript; nothing in the library used Replicant, and you bring your own Clojure and ClojureScript. **Migration:** if you require `tyrell.lucide`, add `dev.gersak/tyrell-icons-lucide` (or `dev.gersak/tyrell-icons` for every set); `:exclusions` for it can go. If your app relied on Replicant coming through Tyrell, add `no.cjohansen/replicant`.
- **New default primary in light mode:** `tyrell-theme.css` seeds `--ty-primary-hue: 243`, `--ty-primary-chroma: 0.105` and `--ty-primary-l-factor: 0.9` (were 252 / 0.08 / 0.96). Dark mode keeps 226 / 0.065.
- **Ty no longer patches every form's `requestSubmit()` / `reportValidity()`.** Only a form holding a Ty field with an error line gets its own wrappers (so script calls focus the first invalid field), and they are removed when the last such field leaves the form. `HTMLFormElement.prototype` is untouched.
- **Breaking: an `error` always shows the danger look, whatever the flavor.** This covers `ty-input` and the new `error` on `ty-select` and `ty-date-picker`. While it is set, the field looks like `flavor="danger"` on a red-tinted background in every state, `+`/`-` shades and custom flavors included, and the date-picker's calendar opens in danger. When the error clears, your flavor's look comes back. The `flavor` attribute and property keep what you set: `ty-input` no longer writes `flavor="danger"` (RC16 did), so a `[flavor="danger"]` selector or a `flavor === 'danger'` check no longer matches a field that only has an error. Page-level `--input-accent*`, `--select-accent*` and `--date-picker-accent*` overrides apply to an error as they do to `flavor="danger"`. A disabled field keeps the disabled look, without the tint. A page rule keyed on your flavor (`ty-input[flavor="brand"] { --input-accent: … }`) still beats the error look; add `:not([error]:not([error=""]))` to it to let the error show. RC16's flavor mix-ups around `error` are gone too: a field left `flavor="neutral"` after the error cleared, and an author's flavor lost when `error` came first in the markup.
- **`ty-selected-options` chips are the option itself.** The default chip clones the option's content, so a rich option (icon, title, detail) makes a rich chip; it used to flatten it to text ("FreeOne project…"). `label` on the option still gives a plain-text chip, and a `<template>` child still replaces the chip entirely.
- **Breaking: `ty-modal` zooms the page behind by default.** `backdrop-zoom` is gone; set `no-zoom` (`noZoom`, React `noZoom`) to keep the page still. Apps with `position: fixed` headers or sidebars want `no-zoom`: a scaled `<body>` becomes their containing block. A `no-backdrop` modal never zooms the page.
- **`no-backdrop` on `ty-modal` is a modal without the dim.** The page behind isn't usable, focus stays in the modal, and a click anywhere outside or Escape closes it (unless `prevent-outside-click` / `prevent-escape`). Before, it was non-modal: the page stayed live and only a thin ring around the panel closed it.
- **Breaking: an empty `ty-date-picker` now submits `name=`**, like `<input type=date>`. Before, it was left out of the form data, so a backend that checks for a missing key (`request.form.get('d') is None`) or parses whatever is present now gets an empty string.
- **Breaking: `preventDefault()` on a `ty-button` click now cancels its submit/reset.** Click listeners run before the form action, like native, so a listener that changes form state is seen by the submit. Before, the submit ran first and the click event couldn't be cancelled.
- **Breaking (React): `TyButton` no longer fakes a `submit` event.** On top of `ty-button`'s own submit, the wrapper fired a second, fake `submit` that the browser doesn't validate, so `onSubmit` ran twice and an invalid form still reached it. `ty-button` submits through `form.requestSubmit()`: one submit per press, only when the form is valid, with the button's `name` / `value` in the form data, and `onSubmit` gets the browser's real event. `onClick` + `e.preventDefault()` now cancels the submit.
- **A required `ty-select` shows its message under the field, not in a browser bubble.** On a submit, `reportValidity()` or `checkValidity()` the browser's message for a native `<select>` goes into the error line, and a submit focuses the select's trigger. A user change that leaves it empty, the built-in × included, shows the message right away, and picking a value clears it. `clear()` from code still fires `change` but shows no message.
- **`ty-date-picker` scroll-lock ids are per picker.** `isLockedBy()` and `getActiveLocks()` see `date-picker-<n>`, not `date-picker-<element id>`; pickers without an `id` used to share one.
- **Removed dead `pill` icon-only CSS.** The `:has()` rules could never match. Use `action pill` for a round icon button.

### Documentation

- **TY_GUIDE's `ty-checkbox` listed an `error` attribute, a default slot for the label and size `md`.** It has neither, and its size defaults to `sm`; wrap it in a `<label>`. The React guide's form example passed the label as a child too.
- **TY_GUIDE still listed `ty-tooltip` `light` and `info`**, which RC16 removed. There is no `info` flavor; React `TyOption`'s `flavor` type no longer lists it.
- **Docs site:** the icons guide and several demos ran off the side on phones, and the modal page's "last close reason" flipped back to the previous reason when the page was scrolled. The "On this page" rail no longer lists headings from inside demos.

## [1.0.0-RC16] - 2026-10-13

### Added

- **`no-backdrop` on `ty-modal`** (#8). The backdrop is the default; `no-backdrop` turns it off. React: `noBackdrop`.
- **Lazy tabs.** A `lazy` `ty-tab` with no content fires `ty-tab-load` (`{ id, index }`, on the tab; it doesn't bubble, so nested lazy tabs don't trigger each other) when it's shown, never for the tab shown first. It shows a spinner (the `setLoaderSvg()` one) or `slot="loading"` until content arrives, with `aria-busy` on the panel. `loadFailed()` shows `slot="error"` (default "Couldn't load.") with a Retry button (`::part(retry)`); Retry, or showing the tab again, fires `ty-tab-load` again. Content that goes away (a morph with the server's empty tab) loads again. React: `TyTab` gets `lazy` and `onTabLoad`.
- **`tyrell.icons.build/extract`: ship only the icons a JVM backend uses.** ClojureScript drops unused icon defs in `:advanced`; the JVM has no such pass, so an uberjar carried every set. `clj -X:icons` (alias with `dev.gersak/tyrell-icons`, `clj-kondo/clj-kondo` and `:exec-fn tyrell.icons.build/extract`) uses clj-kondo's analysis to find the icon vars the JVM side of your code uses, follows renamed defs, and writes trimmed copies of the same namespaces to `gen-icons/`. Put that dir on the production classpath instead of the icon jars; requires and call sites don't change. `:include` adds names the scan can't see, `:svg-dir` also writes `.svg` files for file-including template engines, and unknown names are listed. With `:registry app.icons/registry` (your name → SVG map) and `:js-out`, it also writes a static `icons.js` that registers those names with `window.tyIcons`: one cached file for every page, so templates use `name="…"` without a Node build.
- **React wrappers caught up with the elements:** `TySelect` gets `selectedLabel`, `availableLabel` and `noOptionsMessage`; `TyButton` gets `muted`.
- **`ty-select` mobile dialog: pinned selection strip + accordion.** The selected chips and the option list are two sections, exactly one open at a time. New `selected-label` (default "Selected") and `available-label` (default "Available") set their headings; the count is appended.
- **`--ty-calendar-width`**: set it on `ty-calendar` or any ancestor and both the navigation bar and the day grid follow it. The `width` attribute still wins.
- **`ty-button` exposes `::part(button)`** so outside sizing (e.g. `min-height`) lands on the control instead of growing a dead strip around it.
- **Native constraint-validation API on every form field.** `checkValidity()`, `reportValidity()`, `setCustomValidity()`, `validity`, `validationMessage` and `willValidate` now exist on `ty-input`, `ty-textarea`, `ty-select`, `ty-date-picker`, `ty-checkbox`, `ty-switch`, `ty-radio-group`, `ty-file-upload` and `ty-calendar`, so you can validate one field (or a wizard step) without submitting. Components report their own state through a shared controller that keeps it apart from your custom error, so `setCustomValidity()` survives the next keystroke's re-validation. `reportValidity()` writes the message into the field's `error` display when it has one and clears it once the field is valid; fields without one (checkbox, switch, select, date-picker, calendar) show the browser bubble.
- **Month/year view in `ty-calendar` (and the `ty-date-picker` popup).** The navigation title is now a button (`.nav-title`, `aria-expanded`) that swaps the day grid for a 3 × 4 month grid of the displayed year. Its arrows step years, months outside `min`/`max` are disabled, the selected month shares the selected day's fill, and the current month gets the today dot. Picking a month returns to the day grid and emits `navigate`. The month grid takes the day grid's height, so the popup doesn't jump.
- **Calendar keyboard: Page Up / Page Down** step a month (a year in the month view), **Shift + Page Up / Down** step a year, **Escape** in the month view goes back to days and stops there, so a surrounding date-picker popup stays open.
- **`view` property on `ty-calendar-navigation`** (`days` | `months`) and a `view-toggle` event from its title.

### Fixed

- **`ty-option` rows rewrapped when selected or highlighted.** The checkmark now always reserves its width, and the highlight no longer changes the font weight.
- **`ty-tabs` broke when a server morph re-rendered it (Datastar `patch-elements`, htmx/idiomorph).** Its size and position lived in the host's `style` attribute and its panels' visibility and ARIA in attributes on each `ty-tab`, so a morph from server HTML wiped them: the element fell back to 400px, panels went blank or all showed at once, and `data-preserve-attr` could only protect the host. Size now lives in a per-instance stylesheet in the shadow root, panel visibility in a shadow rule, and the panel role/name on an element inside each `ty-tab`'s shadow root; the host and its children keep exactly the attributes the server rendered. A morph that drops `active` keeps the current tab instead of desyncing on the next resize.
- **`ty-tab-change` missed or misreported changes.** Adding a tab and activating it in one go (what a morph does), activating an unknown id, or removing the shown tab switched tabs without an event, and `previousId` echoed the old attribute (`null`, or an id that never showed). It now fires whenever the shown tab changes, and `previousId` is the tab that was shown.
- **Hidden `ty-tab` panels were focusable.** Tab from the active tab button walked into invisible panels and scrolled the carousel out of line. Inactive panels are now `inert` immediately and `visibility: hidden` once their fade ends.
- **The "…" overflow trigger sat inside the `tablist`** (axe: aria-required-children). The tablist is now the scrolling strip only.
- **A nested `ty-tabs` with a custom marker hid the outer one's default marker.**
- **Moving a `ty-tabs` (re-inserting it) stopped it reacting to resizes**, and a moved `ty-tab` lost its custom scrollbar.
- **Nested `ty-tabs` picked up the outer one's panels** (`ty-tab` lookup wasn't limited to direct children).
- **The first click after load snapped the tab marker instead of gliding**, while an early `active` correction from the app still slid the carousel in from tab 0. Now user clicks always animate and the first app correction snaps marker, carousel and fade.

- **`tyrell.material.two-tone` couldn't be required.** Clojure maps the namespace to `two_tone.cljc`, but the file was `two-tone.cljc`. Renamed, and the generator now writes the munged name.
- **`tyrell.router` (ClojureScript) rendered blank pages for some URLs.** An in-page anchor on a normal route (`/components/select#api`, any `<a href="#section">`) matched no route, so nothing rendered; a path whose routes all carry a hash (`/welcome` with only `#top`, `#event-booking`) did the same; and route matching ignored segment boundaries, so `/componentsfoo` counted as `/components`. Anchors now stay on their page, hash-only paths redirect to their best hash route (`:landing` priority, then tree order), unknown paths go to the landing route, and redirects replace the history entry so Back doesn't bounce. Paths below a route (`/users/123`) still stay put for apps that read dynamic segments. New router unit tests: `clojure -M:test && node target/test/router-test.js` in `packages/cljs`.
- **Scrolling a phone page over an inline `ty-calendar` picked a day and stopped the scroll.** Days were selected on `pointerdown`, so a finger drag that started on a day selected it, and the re-render that followed cancelled the page scroll. Days now select on `click`, which fires for taps only; Enter/Space are unchanged.
- **`ty-tabs` swiping the tab strip switched tabs.** Tabs activated on `pointerdown`, so a finger drag that started on a tab to scroll the strip also opened that tab. The same `preventDefault()` cancelled focus on mouse click, so arrow keys did nothing right after clicking a tab. Tabs now activate on `click`, which the browser fires for taps and clicks but not for scroll drags; Enter/Space still activate, and a clicked tab keeps focus.
- **`ty-radio-group` with an initial `value` broke when created from markup strings** (`innerHTML`, template clones: Lit, Vue, htmx swaps). Elements upgrade in tree order, so the group's first sync ran while its radios weren't `ty-radio` yet. That threw on the roving-tabindex call, and the `checked`/`size`/`flavor` writes turned into own properties that shadowed the radios' accessors after upgrade. The group now only syncs upgraded radios; each radio re-syncs the group when it connects.
- **`ty-copy` value turned dark inside a dark block on a light page.** The value used `color: inherit`, so it took the surrounding page color instead of the field's own. It now uses `--ty-input-color` like `ty-input`, so it follows the theme scope it sits in.
- **Icon subpath imports failed for Heroicons, Material and Font Awesome.** The `exports` map pointed `./icons/heroicons/*` (and the other two) at files without `.js`, so `import … from 'tyrell-components/icons/heroicons/outline'` threw `ERR_MODULE_NOT_FOUND` in Node ESM. Both `…/outline` and `…/outline.js` now resolve, with types.
- **`ty-date-picker` `required` didn't block form submission.** It drew the asterisk but never reported `valueMissing`, so an empty required picker submitted. It now does, like the other fields.
- **`ty-popup` entrance barely animated, so a springy `--ty-popup-ease` did nothing visible.** The prep pose (scale .96 + 6px slide) was itself transitioned and `.open` landed one frame later, so the entrance ran from ~scale(1) to scale(1). The prep pose now applies instantly and is committed before `.open`. New `--ty-popup-scale` (default `.96`) sets the starting scale; a lower value gives a spring room to overshoot. Closing now waits for the actual transition duration instead of a fixed 200ms, so a longer `--ty-popup-duration` isn't cut off on exit.
- **`ty-select` ignored `required`, `label`, `disabled` and `compact` changed after first render.** The shadow DOM is built once, so toggling `required` never added the asterisk and toggling `disabled` left the trigger focusable. A `syncFieldChrome()` step now patches label, required marker, disabled/tabindex/aria state and compact class on every render. Validity was already correct.
- **`ty-button` submit value leaked into later submissions.** A named submit button set its `name=value` on the form and never cleared it, so pressing "Save draft" and then "Publish" sent `intent=draft&intent=publish`. The value is now set only for the submission it triggers (like a native submitter) and cleared right after `requestSubmit()`.
- **Field text was dim in dark mode (`tyrell-theme.css`).** `--ty-input-color` came from the neutral ink ramp, which dark mode scales by `--ty-neutral-l-factor` (0.8), so typed text sat at L 0.58, dimmer than the field's own label, and the placeholder at L 0.37 on an L 0.18 surface. Both now ride the text ladder like the static palette: `--ty-input-color: var(--ty-text)`, `--ty-input-placeholder: var(--ty-text-faint)`. Applies to every field that uses these tokens.
- **`ty-file-upload` `required` didn't block submission.** It drew the asterisk but never reported validity, so an empty required upload submitted anyway. It now sets `valueMissing` ("Please select a file") while no file is listed, like `ty-input` and `ty-textarea`, and re-checks when `required`/`disabled` change or the list changes.
- **`ty-copy` rendered its value as HTML.** The value went into `innerHTML` unescaped, so copying a snippet like `<ty-button>` displayed a live element instead of the text, and an untrusted value could inject markup. It's now escaped and always shown as text; what's copied is unchanged.
- **`ty-copy format="code"` looked like plain text.** The value reset set `font-family: inherit` on the `<code>` too. Code values now use `--ty-font-mono` at 93% of the field font.
- **`ty-checkbox` sat 2px high next to its label.** The box was exactly the icon height (16px at md), so top-aligned beside a 20px text line its tick centered above the text. The box is now one line box tall (`min-height: 1lh`, `1.25em` fallback) with the tick centered, so it lines up with the first line of any label it sits in.
- **`ty-switch` got the same line-box alignment.** The track was top-aligned beside its label (a 16px `sm` track against a 20px line); the switch container is now `inline-flex`, one line box tall, track centered.
- **`ty-radio-group` keyboard focus.** Arrow keys moved the selection but not the focus: `next.focus()` targeted the radio host, which isn't focusable (its `role="radio"` element is in the shadow root). `ty-radio.focus()` now focuses that element.
- **`ty-radio-group` had one Tab stop per radio.** Every radio was `tabindex="0"`. The group now keeps a roving tab stop (WAI-ARIA radio group): only the checked radio, or the first enabled one, is in the Tab order, and it follows the selection.
- **`ty-radio-group` `required` didn't block submission.** It drew the asterisk but never reported validity. It now sets `valueMissing` ("Please select an option") while nothing is selected.
- **`ty-tooltip` couldn't be dismissed with Escape.** WCAG 1.4.13 asks that hover/focus content be dismissible without moving the pointer or focus. An open tooltip now listens for Escape (capture phase, only while open) and hides.
- **`ty-tabs` keyboard users couldn't reach other tabs.** The tab buttons use a roving tabindex (only the active one is tabbable) but had no arrow-key handling. ← / → now move to the previous / next enabled tab (wrapping) and activate it, Home / End jump to the first / last; focus follows. Disabled tabs are skipped.
- **`ty-wizard` indicators went stale when a step's attributes changed.** The child observer only watched added/removed steps, so changing a `ty-step`'s `status`, `label`, `description` or `disabled` didn't re-render the indicator strip — e.g. a step fixed from `status="error"` and marked completed still showed the error ✕ when a framework updated the wizard before the step. The observer now also watches those attributes on direct `ty-step` children.
- **`ty-scroll-container` `scroll-anchoring` jumped on prepends.** The compensation was measured from on-screen geometry, so an item straddling the top edge only counted its above-the-fold part, and a batch prepend taller than the current `scrollTop` ("load 12 older rows") was mostly skipped because `scrollTop` hadn't moved yet. It's now positional: the unbroken run of newly added children at the top of the content is added back to `scrollTop` in full, so the first visible item stays put.
- **`ty-calendar` `form.reset()` restored the wrong date.** Every pick rewrites the `year`/`month`/`day` attributes, so a reset landed on the last pick. The calendar now captures its markup value on connect and `formResetCallback()` reverts to it.
- **`ty-date-picker` `.value` stayed on raw input.** A malformed value, or a reset back to the attribute value, left the property holding the raw string while the form submitted the normalized one. The property now heals to the normalized value (or `null`).
- **`ty-date-picker` popup ignored `min`/`max` changes while open.** They were only forwarded to the inner calendar when the popup was rebuilt; they now sync live, like `flavor`.
- **`ty-calendar-month` could lose the roving focus slot to a transient pick.** With min/max and value synced in separate steps, a render with no selection yet committed an arbitrary day as the focus target and the real selection never reclaimed it.
- **`ty-tabs` deferred work (rAF, resize) used stale active-tab values.** It now re-reads the active tab from the DOM when it runs.
- **`ty-copy` could copy a value that changed mid-copy.** The value is read once per copy, for both the clipboard and the event detail.

### Changed

- **Default-on features are switched off with `no-*` presence attributes; the old on/off attributes are gone.** Frameworks render `false` by dropping the attribute, so a `default: true` boolean could never be turned off from them, and `"false"` strings were the only way. Breaking:
  - `ty-modal`: `backdrop` → `no-backdrop` (`noBackdrop`); `close-on-escape` / `close-on-outside-click` (deprecated since TC48) → `prevent-escape` / `prevent-outside-click`.
  - `ty-select`, `ty-date-picker`: `clearable` / `not-clearable` → `no-clear` (`noClear`).
  - `ty-tag`: `pill` / `not-pill` → `no-pill` (`noPill`).
  - `ty-scroll-container`: `shadow` / `shadow="false"` → `no-shadow` (`noShadow`).
  - React: `backdrop`, `closeOnEscape`, `closeOnOutsideClick`, `clearable`, `notPill` and `shadow` props → `noBackdrop`, `preventEscape`, `preventOutsideClick`, `noClear`, `noPill`, `noShadow`.
- **`ty-tabs`:** `width`/`height` attributes now beat page CSS; without them page CSS sizes the element (previously the 400px default was written inline and nothing outside could change it). `width="50%"` is now 50%, not 100%. The undocumented `--tabs-width`, `--tabs-height`, `--tabs-page-width`, `--active-index` and `--buttons-height` are gone. Panels no longer get `role`, `aria-labelledby`, `tabindex` or inline `opacity`/`pointer-events` attributes, so `ty-tab[role=tabpanel]` selectors stop matching (use `ty-tab[data-active="true"]` or `activeTab`); `getByRole('tabpanel')` still finds the shadow panel. An `active` set from code or a morph takes effect one microtask later (clicks and keys stay synchronous), and an `active` correction after connect now reports `previousId` as the tab that was showing instead of `null`. New read-only `activeTab` property.

- **Clojars icons split into one jar per set.** `dev.gersak/tyrell-icons-lucide`, `-heroicons`, `-material` and `-fontawesome`; `dev.gersak/tyrell-icons` is now an umbrella that depends on all four. `dev.gersak/tyrell` depends on Lucide only (~0.7 MB instead of ~10 MB), so it no longer drags every set onto JVM classpaths. **Migration:** if you use Heroicons, Material or Font Awesome through `dev.gersak/tyrell`, add `dev.gersak/tyrell-icons` (or the set you need); `:exclusions` should now name `dev.gersak/tyrell-icons-lucide`.

- **BREAKING: `ty-calendar` `show-navigation` → `hide-navigation`.** Navigation is on by default, so the attribute is now the opt-out, a bare presence attribute like `disabled`: `<ty-calendar hide-navigation>`. `show-navigation="false"` no longer does anything. Property: `hideNavigation`. React: `hideNavigation` prop.
- **BREAKING: `ty-select` `searchable="auto|true|false"` → `not-searchable`.** The search row still appears automatically for 8+ options; `not-searchable` (bare attribute) is the only opt-out. There's no way to force it on for short lists anymore. `external-search` and `allow-create` keep it on regardless. React: `notSearchable` prop.
- **BREAKING: `ty-textarea` fires `change` on blur, like a native textarea.** It fired `change` together with `input` on every keystroke, and a second pair on the native change. Now `input` fires per edit and `change` once on blur, only if the value differs from when focus arrived (tracked by the component, so programmatic edits count too). Listen to `input` for live state.
- **BREAKING: `ty-wizard` redesign — inline rail, content-sized panels.**
  - **Rail:** 24px indicators sit beside their labels, with connectors that fill as steps complete (the header is ~56px, was ~110px). Only the active step, or one in error, shows its description.
  - **One accent:** completed is solid ink with a check (`--ty-wizard-completed-accent` now defaults to the strong text color, was green), active is a primary ring on a tint, pending a faint ring, error a danger ring with "!". Active/error numbers are nudged toward the text color and clear 4.5:1 in both modes.
  - **Surface:** one surface, hairline divider, no shadow by default (`--ty-wizard-shadow: none`, header and panels transparent).
  - **`height` sizes the panels only; unset, panels size to the tallest step, so the wizard doesn't jump between steps.** It used to be the total height (default 700px) with the header carved out of it, so small values clipped the header. The step panel reads `--ty-wizard-panel-height`; `--ty-wizard-indicators-height` is gone.
  - **Narrow containers:** when the labels don't fit, the rail collapses to "Step N of M · Label" over a segment bar (measured, no attribute). Vertical wizards collapse under 360px.
  - **`orientation="vertical"` works:** rail on the left with vertical connectors. It was accepted but rendered horizontally.
  - **Panels still slide like `ty-tabs`,** now driven by CSS (`--ty-wizard-active-index`) instead of measured pixel offsets, so no ResizeObserver is needed for `%` widths. Off-screen steps become `visibility: hidden` once the slide ends, so they leave the tab order.
  - **Parts:** `progress-line` is gone (connectors are pseudo-elements, so the tablist owns only tabs); the segment bar is `::part(progress)`. `indicators-wrapper`, `step-circle` and `panels-container` remain.
  - **Revisiting a finished step shows it as active** (active now wins over completed), with its connector still filled.
  - **Keyboard:** Enter/Space on an indicator now fires `ty-wizard-step-change`; it only listened for `pointerdown`.
  - **Screen readers:** each indicator announces "step N of M" and its state.
- **BREAKING: `ty-tooltip` uses the standard flavors.** It had its own set — `dark` (default), `light`, `info` — and rendered semantic flavors on the translucent `--ty-bg-*` tints, which went unreadable over busy content (the popover floats over anything). Now: `neutral` (default) is the fixed dark chip on `--ty-tooltip-bg/-color/-border`; `primary`, `success`, `danger`, `warning` and custom flavors are solid fills on the solid-button tokens (`--ty-solid-X`, `-fg`, with `+` → `-strong`, `-` → `-soft`). `dark` stays as an alias for `neutral`; `light` and `info` are removed. The popover lives in `<body>`, so custom-flavor tokens must be defined at `:root`. `TyTooltip` (React) types updated.
- **`ty-radio` unchecked ring is visible, and radios align with their label.** The ring used `--ty-input-border` (the soft border, ~1.2:1 in dark mode); it's now 45% of body text like the unchecked checkbox tick, brightening on hover (`--radio-ring-off`, `--radio-ring-off-hover`). The radio is one line box tall with the circle centered, like `ty-checkbox`.
- **`ty-checkbox` states are legible.** It stays "just the tick", but unchecked was the flavor's soft tone at 35% opacity (~1.8:1 in dark mode) and the neutral checked tick was the same gray as unchecked. Now: unchecked is a neutral tick at 45% of body text for every flavor (~3:1 in both modes); checked and mixed use the flavor's strong tone (neutral: body text) at full opacity; hover shows a soft pill and brightens the unchecked tick. Flavor rules no longer set `--checkbox-color-off`; new `--checkbox-color-off-hover` and `--checkbox-hover-bg`. The `-` tone now means the base color.
- **BREAKING: the « / » year buttons are gone from the day view.** `.nav-year-prev` / `.nav-year-next` now exist only in the month view. Years are reached through the title, or Shift + Page Up / Down. The header is title-left (month bold, year soft, caret) with bordered ‹ › on the right.
- **Selected day is a solid fill on the solid-button tokens** (`--ty-solid-{flavor}`, `-hover`, `-fg`) instead of a soft tint with an accent border. Hover darkens the fill and keeps the shape — the border no longer disappears. Override order: `--ty-calendar-selected-bg` → `--ty-calendar-accent` → `flavor` → primary. `--ty-calendar-accent` now recolours the whole selected day, not just a ring.
- **Day hover is `--ty-bg-neutral`** (was `-soft`, nearly invisible) with medium-weight text; today keeps its accent colour on hover.
- **Today gets a dot under the number** (built-in day content only — cells rendered by `dayContentFn` are untouched; built-in cells carry a new `default-content` class).
- **Other-month days recede**: `color-mix(in oklab, var(--ty-text-faint) 65%, transparent)` at rest, soft text plus the hover background on hover (the old `opacity: 0.7` on hover, which faded them further, is removed). The fixed `--ty-calendar-other-month-color` values are removed from `tyrell.css`; the token remains as an override. This is deliberately below 4.5:1 — they are secondary context and stay clickable — and `test/a11y.test.ts` exempts exactly these cells from `color-contrast`.
- **Weekday header is title case** (`Mon`, not `MON`).
- **Disabled days and months (outside `min`/`max`) are legible and struck through.** They were `--ty-color-neutral-faint` at `opacity: 0.35`, which vanished into the background in dark mode, so the range couldn't be read. Now `--ty-text-faint` at `0.7` with a soft `line-through`, distinct from adjacent-month days. `--ty-calendar-disabled-color` / `-opacity` still override.
- **`ty-date-picker` time footer**: the single `HH:mm` field with caret juggling is replaced by two numeric fields (hours, minutes). Two digits complete a field, a first digit that can't start a valid value completes it at once, a completed hour hands over to minutes, Arrow Up/Down step with wrap, Left/Right and Backspace cross between them. A summary line shows the formatted date and time plus the local ISO value. `change` still fires with `source: 'time-change'`.


### Documentation

- **Datastar is a first-class tab on every component page.** It used to be a hand-written stub, often with the content replaced by `…`; it's now printed from the same description as the HTML, React, Reagent and Replicant tabs, plus `:datastar/…` bindings, and all 21 snippets were run against Datastar RC.8 in a browser. Idioms the run established, now also in `DATASTAR_TY_GUIDE.md`: `data-bind` works on input, textarea, select and radio-group; checkbox and switch need `data-attr:checked` + `evt.detail.checked` (`data-bind` binds `value` there); date pickers should read `evt.detail.localValue`, since `value` is a UTC timestamp that displays a day early east of UTC.
- **Code boxes no longer cut lines off.** Snippets wrap attributes once a line won't fit, closing tags get their own line, and the horizontal scrollbar is visible when a narrow window still needs it.

## [1.0.0-TC53] - 2026-09-02

### Added

- **One size ladder for every field — `styles/field-size.ts`.** Each field component used to carry its own height/padding/font table, so "the same size" meant something slightly different on each of them. There is now a single set of `--ty-field-*` custom properties per rung, and every field consumes them: heights are **28 / 32 / 36 / 40 / 44px** for xs → xl, with padding, font size, line box, label type scale, label gap, in-field control box and icon size all stepping together. Narrow viewports drop `lg` and `xl` one rung each (640px and 480px breakpoints) — same ladder, no component-specific overrides. Covered by `e2e/field-size-ladder.spec.ts`, which asserts input, copy, select and date-picker share a height and a label scale at every rung.

- **`DEFAULT_SIZE` in `types/common.ts`.** The default `size` for field components is declared once instead of repeated in ten components.

- **`value` attribute on `ty-calendar`.** The component observed `year`/`month`/`day` but not `value`, so `<ty-calendar value="2026-07-15">` was silently ignored and the calendar rendered the current month. The `.value` property setter already handled everything; the attribute now routes into it. This also unblocks `<TyCalendar value="…" />` in tyrell-react, which passes `value` as an attribute.

- **`display-year` / `display-month` attributes on `ty-calendar-month`.** The year/month API was properties-only. `ty-calendar` drives its child by property, which hid it — but standalone use, the documentation site's own examples, and tyrell-react's `TyCalendarMonth` (which maps `displayYear`/`displayMonth` onto exactly these attribute names) all set attributes, and all silently rendered today's month instead. Invalid values are ignored rather than throwing.

- **Size showcases for `ty-select` and `ty-radio-group`** on the documentation site. Every other ladder component demonstrated xs → xl; these two demonstrated none.

### Changed

- **BREAKING: the default `size` for every field component moves from `md` to `sm`.** Affects `ty-button`, `ty-checkbox`, `ty-radio`, `ty-radio-group`, `ty-copy`, `ty-date-picker`, `ty-input`, `ty-select`, `ty-switch`, `ty-tag` and `ty-textarea`. A field left without a `size` attribute is now 32px tall rather than 36px. Set `size="md"` explicitly to keep the old dimensions. Calendar components are unaffected — they use their own `CalendarSize` scale.

- **BREAKING (types): `TyInput`, `TySelect` and `TyDatePicker` in tyrell-react accept the full ladder.** Their `size` prop was typed `'sm' | 'md' | 'lg'` and documented as "fields come in exactly three; legacy xs/xl map to sm/lg" — no such mapping exists, and the underlying components have always supported all five rungs. Now `'xs' | 'sm' | 'md' | 'lg' | 'xl'`.

- **Input borders in dark mode are drawn from the border family, not the neutral ink ramp.** `--ty-input-border` / `--ty-input-border-hover` aliased `--ty-color-neutral-faint` / `-soft`, which are multiplied by `--ty-neutral-l-factor` (`0.8` in dark). That put the resting border at L 0.24 against an L 0.18 input surface — **half** the separation light mode gets (0.88 on 1.00). The border ladder is exempt from that factor by design. Dark now takes it one rung harder than light (`--ty-border` at rest, `--ty-border-bold` on hover) because a small L delta at the dark end of the scale reads much weaker than the same delta mid-scale. **Light mode rest is byte-identical; light hover moves L 0.72 → 0.76.**

### Fixed

- **Label and error text were misaligned with the value they describe — by 1px, on every field, at every size.** The value sits inside the wrapper's 1px border *plus* `--ty-field-pad-x`; the label and error message sit outside that box and only ever cleared the padding. Two hardcoded insets, one missing a term. There is now a single `--ty-field-outer-pad-x` in the ladder (`calc(var(--ty-field-pad-x) + 1px)`) that all outside-the-box text uses, so it resolves per rung and cannot drift again. Verified at 0px delta across `ty-input`, `ty-copy`, `ty-select`, `ty-date-picker` and `ty-textarea` at all five sizes.

- **`ty-textarea` kept a second, parallel size table that had drifted from the ladder.** Its horizontal padding was `10px` at `xs` where the ladder says `8px` (a 2px label/value stagger), and its error message was pinned at a hardcoded `12px`, off the ladder entirely. Horizontal padding now reads `--ty-field-pad-x` in all eleven rules, including the container- and media-query step-downs. Vertical padding and min-heights are unchanged — a multi-line box legitimately needs its own.

- **The narrow-viewport step-down didn't carry the whole rung.** `lg`/`xl` dropped their height, padding, font and leading below 640px/480px but kept `--ty-field-control` at the original rung. That variable sizes the in-field button box, which drives the wrapper's content height — so `ty-copy` at `xl` rendered **38px** on a phone while every other field rendered 36. `--ty-field-control` and `--ty-field-icon` now step down with everything else.

### Documentation

- The site's chrome identity colour is specified as a finished OKLCH swatch per mode (`oklch(0.69 0.15 42.1)` light, `oklch(0.71 0.13 42.2)` dark), with the seeds solved back through the primary formula and the derivation written down next to them.
- Nine component API tables still documented the `size` default as `md`.
- Removed the table-of-contents' left rule, which ran from the header down to wherever the TOC happened to end and had no counterpart on the left sidebar.
- The desktop header no longer repeats the current page's title — the sidebar already highlights it. The component breadcrumb stays (it shows depth the sidebar doesn't), and the plain title still renders on mobile, where the navigation is hidden.

## [1.0.0-TC52] - 2026-08-26

### Added

- **`fixed` on `ty-tabs` — Material's "fixed tabs": the bar is divided equally between the tabs instead of scrolling them.** The default (scrollable) mode gives every button a `min-width: 120px` floor, so five short labels claim 600px whether they need it or not, and a 595px bar overflows for no good reason. `<ty-tabs fixed>` drops the floor, gives each button an equal share, and skips overflow entirely — no scrolling, no edge fades, no "…" jump menu. Labels ellipsize if squeezed — plain text labels are now wrapped in a `<span class="tab-label">` inside the button to make that possible (the ellipsis rule applies only in `fixed` mode; slotted `label-{id}` content is untouched). Suits **2–5** tabs — equal shares only read as tabs while each share fits its label, so past that everything ellipsizes and the scrollable default is the right tool. Leave it off when the tab set is open-ended or user-generated. Exposed on tyrell-react's `TyTabs` as the presence boolean `fixed`.

### Changed

- **BREAKING: the scrollable tab-button floor drops from `min-width: 120px` to `72px`, now overridable as `--ty-tab-min-width`.** 120px is Material's *fixed*-tab figure (90dp mobile / 160dp desktop); for **scrollable** tabs the recommended floor is 72dp, and using the fixed-tab number on a scrolling bar manufactured overflow — five short labels claimed 600px whether they needed it or not, so a 595px bar scrolled for no reason. Equal-width rhythm is what the new `fixed` attribute is for. **Visual change:** scrollable tab bars get narrower, label-dependent buttons; some bars that scrolled will now fit outright. Set `--ty-tab-min-width: 120px` to keep the old look.

- **BREAKING: `ty-tabs`' transition tokens are namespaced.** `--transition-duration` / `--transition-easing` were generic enough that any ancestor setting them for its own purposes silently retimed the tabs — and the marker glide, the carousel slide and `ty-tab`'s panel fade all read them. They are now `--ty-tabs-transition-duration` / `--ty-tabs-transition-easing`, matching the `--ty-wizard-transition-*` precedent. Rename any override; the defaults (300ms / `ease-in-out`) are unchanged. The unreleased `--tabs-separator` is likewise `--ty-tabs-separator`.

### Removed

- **A dead `ty-tabs` style rule.** `.marker-wrapper:has(::slotted([slot="marker"])) .default-marker` never reached the CSSOM — pseudo-elements are invalid inside `:has()`, so the parser dropped the whole rule. Hiding the default marker when one is slotted was, and remains, handled in JS.

### Fixed

- **Scrollable `ty-tabs` no longer squeeze their buttons or ellipsize their labels.** Tab buttons are flex items and had the default `flex-shrink: 1`, so a narrow bar collapsed them toward the `min-width` floor — "Overview" became "Over…" — *before* the strip ever overflowed. That inverts the contract: a scrollable tab is never narrower than its label, and hiding text the user could simply scroll to helps no one. Buttons are now `flex-shrink: 0`, so they keep their natural width (floored at `--ty-tab-min-width`) and the strip scrolls, as the mode always promised. Label ellipsis is scoped to `fixed`, which is the mode that genuinely squeezes. Previously masked by the 120px floor, which most labels fit inside.

- **`ty-tabs` no longer jerks the strip backwards when you activate a tab.** Changing `active` ran a full render, which rebuilds the buttons and the "…" trigger. Taking the trigger out momentarily widens the strip, so the browser clamps `scrollLeft` down by the trigger's width (~52px) — and putting the trigger back does not undo that. The ensure-visible glide then animated forward from the wrong place, reading as a twitch on every click near the end of the bar. Which tab is active says nothing about how wide the tabs are, so activation now updates in place — marker, ARIA, panels, the "…" menu's active mark and the scroll — with no rebuild and no overflow re-measure. Structural changes still re-render via the existing childList observer. `updateOverflow` also saves and restores `scrollLeft` around its own trigger churn, for the resize path.

- **`ty-tabs` no longer shows the "…" jump menu when the tabs overflow by less than the trigger costs.** The trigger is ~52px of the bar, taken out of the scrollable strip. It appeared on *any* overflow, so a 5px sliver — five short tabs against a 595px bar, where `min-width: 120px` alone makes 600px of content — summoned a control that hid another 52px, turning a barely-clipped last tab into a genuinely hidden one. The trigger's real footprint is now measured after it renders and it is backed out when the overflow was smaller than that. Large overflows keep the jump menu.

- **The tab strip's edge fade never veils more than is actually hidden.** `--fade-left/right` were a flat 28px whenever any scroll distance remained, so a 5px overflow was covered by a 28px gradient — the hint obscured five times what it was hinting at. Both are now `min(28px, distance remaining)`.

## [1.0.0-TC51] - 2026-08-26

### Added

- **`--tabs-separator` on `ty-tabs`** — the color of the line between the tab bar and the panel, defaulting to `--ty-border`. Set it to `transparent` to drop the line entirely, which is what you usually want alongside a custom `slot="marker"` that already carries the active state.

### Changed

- **`ty-tabs` with `placement="bottom"` draws the active marker on the *top* edge of the tab bar.** The marker used to stay pinned to the bottom of the button, leaving it stranded at the far edge of the screen with the whole bar between it and the panel it marks. It now sits against the content edge in both placements — top tabs underline, bottom tabs overline. A slotted `<div slot="marker">` fills the marker wrapper and is unaffected.

- **`ty-tabs` only clips its tab strip when the tabs actually overflow.** The strip carries `overflow-x: auto` so tabs can scroll, which (per spec) forces vertical clipping too, and its edge-fade `mask-image` clips as well — together they cut off anything a custom `slot="marker"` painted outside its box, most visibly a `box-shadow` glow. When every tab fits there is nothing to scroll, so the strip now drops both. Overflow detection moved from `scrollWidth` to the buttons' own extent, since an unclipped element has no scrolling box and `scrollWidth` would just echo `clientWidth`. Clipping remains the pre-measurement default, so overflowing tabs still can't spill on first render.

- **The default `ty-tabs` active marker is 3px tall** (was 2px) — it reads as a deliberate indicator rather than a second border now that it overlaps the separator line.

- **The `ty-tabs` separator line is now a pseudo-element, so the active marker sits *on* it rather than beside it.** The line was `border-bottom` on the button bar — a border lives outside the strip's box, so the absolutely-positioned marker could only ever stop just above it, reading as two stacked lines. It's now `.tab-buttons::after` with the strip lifted above it. `::part(buttons-container)` no longer carries a border; a consumer who overrode `border-bottom`/`border-top` there to restyle or remove the separator should target the `::after` instead.

### Fixed

- **A `slot="label-{id}"` element nested inside a `ty-tab` no longer blanks that tab's button.** Rich labels must be *direct children of `ty-tabs`* — a slot in the shadow root can only be filled by a direct child of its host, so a nested one never renders. Detection used a descendant query, so it found the nested element, switched the button into slot mode, and produced an empty button (the element itself stayed invisible too — `ty-tab` exposes only an unnamed slot). Detection is now scoped to direct children, so a misplaced label falls back to the `label` attribute instead of vanishing.

## [1.0.0-RC14] - 2026-08-24

Promotion of the TC48–TC50 test-candidate line to the release-candidate channel (npm `latest`). All changes below under TC48, TC49 and TC50 ship in this version; nothing new beyond them. Highlights: modal/select/popup event fixes, brand→primary theme flatten, native form-reset fidelity, enter motion for all floating surfaces, placement flush contract, `prevent-escape` / `prevent-outside-click`.

## [1.0.0-TC50] - 2026-08-20

### Added

- **`preventEscape` / `preventOutsideClick` props on tyrell-react's `TyModal`.** TC49 added the attributes to the core component but the React wrapper never exposed them — React users had no idiomatic path to the new API. Presence semantics: the bare attribute is rendered only when the prop is true. The deprecated `closeOnEscape` / `closeOnOutsideClick` props keep working and now carry `@deprecated` JSDoc (as do the core element's property mirrors), so IDEs flag the migration.

## [1.0.0-TC49] - 2026-08-20

### Added

- **`prevent-escape` / `prevent-outside-click` on `ty-modal` — presence booleans that guard the close paths.** Closing on ESC and backdrop click is the default, so the switch names the *deviation*, HTML-style: `<ty-modal prevent-outside-click>`. Property mirrors `preventEscape` / `preventOutsideClick` take real booleans (true sets the attribute, false removes it, like native `disabled`). A fully guarded modal has no built-in ✕ — consumers must render their own keyboard-reachable close control (WCAG 2.1.2).

### Fixed

- **Guarded modals no longer force-close on a second consecutive ESC.** Browsers allow only one close request to be canceled (the CloseWatcher anti-trap); the second ESC bypassed `cancel` and closed the modal with `reason: "native"`. With ESC-close disabled the modal now consumes the Escape keydown, so no close request is ever generated. The Android back gesture deliberately remains force-closable as the last-resort escape hatch.

### Deprecated

- **`close-on-escape` / `close-on-outside-click` attributes (and the `closeOnEscape` / `closeOnOutsideClick` properties).** Still fully working — `prevent-*` wins when both forms are present — but string-valued booleans (`"false"`) were the root of a whole bug class and these will be removed in a future release. Migrate: `close-on-escape="false"` → `prevent-escape`; `close-on-outside-click="false"` → `prevent-outside-click`.

## [1.0.0-TC48] - 2026-08-20

### Changed

- **The default primary seed moved from `--ty-primary-hue: 285` / `--ty-primary-chroma: 0.1` to `252` / `0.08` (light), `226` / `0.065` (dark).** Anyone consuming `tyrell-theme.css` without setting their own seeds gets a different default violet — a two-line override (`--ty-primary-hue`, `--ty-primary-chroma`) restores the old look.

- **`--ty-brand-hue` / `--ty-brand-chroma` are gone — renamed to `--ty-primary-hue` / `--ty-primary-chroma`, and every semantic flavor's chroma is now a literal number instead of a multiplier on it.** "Brand" and "primary" were two names circling the same knob: in the shipped default, `--ty-brand-hue` only ever drove primary (semantic hues are fixed constants, surface tint defaults to 0, neutral is achromatic), while the `calc(var(--ty-brand-chroma) * N)` coupling on success/warning/danger was overridden with a *different* multiplier by core light, core dark, the docs-site chrome, and the docs-site playground — every consumer already treated the "shared" dial as a fiction. Flattened: every flavor (primary/success/warning/danger) is now one standalone hue + one standalone chroma, matching how neutral already worked.

  **Migration:**

  | Old | New |
  |---|---|
  | `--ty-brand-hue` | `--ty-primary-hue` |
  | `--ty-brand-chroma` | `--ty-primary-chroma` |
  | `--ty-success-chroma: calc(var(--ty-brand-chroma) * 1.08)` (light) / `* 1.42` (dark) | `--ty-success-chroma: 0.086` (light) / `0.092` (dark) |
  | `--ty-warning-chroma: calc(var(--ty-brand-chroma) * 2.22)` (light) / `* 3` (dark) | `--ty-warning-chroma: 0.178` (light) / `0.195` (dark) |
  | `--ty-danger-chroma: calc(var(--ty-brand-chroma) * 1.68)` (light) / `* 1.56` (dark) | `--ty-danger-chroma: 0.134` (light) / `0.101` (dark) |

  `--ty-{flavor}-seed` (full color override, any flavor) is unaffected. Anyone who only ever touched `--ty-brand-hue` for a one-line rebrand just renames it; anyone who pinned a semantic chroma multiplier moves to the literal number. The Theming page playground's per-flavor "chroma × brand" sliders are now plain absolute chroma sliders.

- **`--ty-bg-{flavor}` moved from a lightness formula to an alpha composite.** Previously each background tint had its own `--ty-l-bg-{base,bold,soft}` lightness stop and `--ty-c-bg-{base,bold,soft}-mult` chroma multiplier, computed the same way as the ink track: `L = l-stop × l-factor`. That formula is only well-behaved mid-scale — the bg stops sit at the *ends* of the L range (0.92–0.98 light, 0.19–0.26 dark), so a flavor with `l-factor` far from 1 either clamped to the page background (tint disappeared) or collapsed to a mid-tone fill (no longer read as a background at all).

  `--ty-bg-{flavor}` is now `oklch(from var(--ty-color-{flavor}) l c h / var(--ty-a-bg-{base,bold,soft}))` — the flavor's own mid-scale ink, composited at low alpha over whatever surface it sits on. The ink stays in the gamut-widest part of the L range regardless of `l-factor`, direction (lighten vs. darken) is automatic per surface instead of requiring a hand-picked absolute lightness, and the tint now correctly adapts to any surface level (content, elevated, floating), not just a single nominal one.

  **Removed:** `--ty-l-bg-base`, `--ty-l-bg-bold`, `--ty-l-bg-soft`, `--ty-c-bg-base-mult`, `--ty-c-bg-bold-mult`, `--ty-c-bg-soft-mult` (both modes). **Added:** `--ty-a-bg-base` (9% light / 13% dark), `--ty-a-bg-bold` (17% / 22%), `--ty-a-bg-soft` (4% / 7%). A custom flavor pack's `--ty-bg-X` lines need the same swap — see the flavor pack builder on the Theming page for the current template. **Visual change:** background tints render slightly differently (generally cleaner at extreme `l-factor` values); anyone who pinned the removed `--ty-l-bg-*`/`--ty-c-bg-*-mult` dials directly needs to move that override to the corresponding `--ty-a-bg-*` alpha instead.

### Added

- **Enter motion for every floating surface, on one shared recipe.** `ty-select`, `ty-date-picker` and `ty-popup` enter with a fade + `scale(0.96)` + 6px directional slide from the anchor side, driven by two tokens: `--ty-popup-duration` (180ms) and `--ty-popup-ease` (slight-overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)`). `ty-tooltip` gets a calmer variant (120ms fade + 4px slide, no overshoot, `--ty-tooltip-duration`). `ty-modal`'s panel now zooms in (`scale(0.93)` + fade) in sync with its backdrop. Under the hood select/date-picker use `@starting-style` — CSS transitions never start on an element that was `display:none` the previous frame, which is why **ty-select had never animated at all**: `showModal()` and the open class land in the same frame, and the single-select skin additionally disabled the inner panel's transition in favor of a dialog fade that could never run.

- **`backdrop-zoom` attribute on `ty-modal` (opt-in).** While open, the page body scales to 0.99 (Vaul-style); the modal itself renders in the top layer and is unaffected. Derived state — nested modals keep it, last one out clears it. Caveat: a scaled `<body>` becomes the containing block for `position: fixed` descendants; apps with fixed chrome should skip it.

### Fixed

- **`-start`/`-end` placements now align the VISIBLE surface, not the shadow-room wrapper.** `ty-popup`'s dialog carries a 16px transparent wrap; cross-axis alignment ignored it on `top-*`/`bottom-*` (panel 16px off-flush) and had the compensation sign flipped on `left-*`/`right-*` (32px off). Tooltip was already flush (no wrap) — popup and tooltip now share one geometry contract, pinned by e2e: 8px gap on the chosen side, aligned edges exactly flush, bare side centered. Also: `ty-select`'s trigger→popup gap went 4px → 8px, matching date-picker and popup.

- **Native form fidelity (from the 2026-08-19 audit).** `form.reset()` now restores every form control to its attribute-declared default (native `defaultValue`/`defaultChecked` semantics) — previously checkboxes/switches stayed toggled, inputs reset to `''` instead of their `value` attribute, and resetting a form **wiped the `value` of every `ty-radio`** in a group (the base class reset the wrong property on non-form children). Also fixed: re-enabling a disabled `ty-radio-group` re-enables its radios; `ty-file-upload` applies its `accept` filter to drag-and-drop (the picker dialog was the only thing filtering) and unnamed uploads are excluded from `FormData` like native inputs; `ty-tabs`/`ty-wizard` render dynamically added `ty-tab`/`ty-step` children (light DOM is now observed); `ty-resize-observer` migrates its registry entry on id rename; `ty-selected-tags` stamps text-only `<template>`s; `parseNumericValue` treats a repeated separator as thousands grouping (`"1.234.567"` → 1234567) while a lone separator stays decimal.

- **Placements gain cross-axis alignment — `ty-popup`, `ty-tooltip`, `ty-select` and `ty-date-picker` now share one 12-value vocabulary.** A placement is a **side** plus an optional **alignment**: the bare side centers on the anchor, `-start` puts the leading edges flush, `-end` the trailing edges. For `top`/`bottom` that axis is horizontal (`bottom-start` = below, left edges flush); for `left`/`right` it is vertical (`left-start` = to the left, top edges flush). All twelve combinations are valid.

  The `Placement` type already declared all twelve, but nothing honored them. `popup.ts` and `tooltip.ts` each hand-wrote a four-entry fallback chain matching only the bare sides, so `placement="top-start"` typechecked, fell through the `if`-chain to the default, and was silently discarded. Replaced both with a shared `preferenceChain()` (`utils/positioning.ts`).

  **Fallback flips before it re-aligns.** When a placement overflows it is the *side* axis that ran out of room, and re-aligning on the same side cannot change the fit — `bottom-start` and `bottom-end` need identical vertical space. So the requested alignment is carried across the flip first (`left-start` → `right-start`, still top-aligned), and only then are other alignments tried, perpendicular axis last. This also preserves the historic chains exactly: every bare side still degrades straight to its opposite as the very next candidate, so existing markup cannot shift on overflow. Locked by regression test.

- **`ty-date-picker` gets a `placement` attribute; `ty-select`'s `align` gains `center`.** The date picker previously had no positioning control at all — the calendar was always start-anchored below/above with no way to influence it. Dropdowns only live above or below their trigger, so both components accept `bottom*`/`top*` directly and degrade `left-*`/`right-*` to auto-side while keeping the alignment. Implemented via a new `side` option and `center` alignment on `computeAnchoredPosition()`, plus `placementToAnchored()` to translate a `Placement` into that engine's inputs. `ty-select`'s existing `align` keeps working standalone; `placement` takes precedence when both are set.

### Fixed

- **`left-start` and `right-start` were dead values — identical to bare `left`/`right`.** Both were configured `vertical: 'center'` in the `placements` table, and `VerticalAlign` had no `'start'` member to express anything else, so neither could ever top-align. Meanwhile `calculatePlacement()` already contained a working start-alignment branch that was unreachable — nothing ever set `vertical` to something outside `'center'`/`'end'`. Added `'start'` to the union, pointed both entries at it, and gave that branch the same `containerPadding` inset its `end` sibling already had so the two alignments are symmetric about the anchor. **Visual change:** markup using `left-start`/`right-start` moves from centered to top-aligned. Use bare `left`/`right` for the old centered behavior.

- **`ty-icon` rendered as an oval inside shrink-wrapping wrappers (regression in TC46).** TC46 changed `:host` from `display: flex` to `inline-flex` so an icon placed inline in running text would not force a line break. As an *inline* box the icon generates a line box in its parent, so any wrapper that shrink-wraps it — a `.rounded-full` badge, a chip — inherits the parent's `line-height` strut instead of hugging the icon: a 12px icon in a 24px-line-height badge measured **22×34 instead of 22×22**. Badges are far more common than icons in running text, so this reverts to `display: flex` (and restores the `:host([slot])` inline-flex rule). The inline-in-text case is solved correctly on the consumer side instead — make the *text wrapper* `inline-flex`, which makes the icon a flex item. Documented in the CSS so it is not "fixed" again the same way.

- **Every component rendered in a different typeface than the page.** Component styles used four inconsistent approaches to `font-family`: `var(--ty-font-sans)` (×13), a hardcoded `system-ui, sans-serif` (×3), `inherit` (×3), and nothing at all. Since `--ty-font-sans` resolves to a *system* stack, a consumer setting their own body font got Tyrell components in the system font regardless — contradicting the library's "typography stays yours" contract. All 19 declarations are now `inherit`.

  Additionally, `font-family: inherit` on `:host` does **not** reach native form controls inside the shadow root: the UA stylesheet sets a font on `button`/`input`/`textarea`, and that beats inheritance. So `ty-button`'s inner `<button>` had always rendered in the system font even when the host resolved correctly. Explicit `font-family: inherit` added to the native `button`, `input`, `textarea` and both select search inputs.

- **`secondary` was still advertised in the React package.** All 14 `tyrell-react` components declared `type BuiltinFlavor = 'primary' | 'secondary' | …`, so TypeScript accepted and autocompleted a flavor removed from the core in TC37 — it silently degraded to `neutral` at runtime, meaning the published `.d.ts` misrepresented the API. Stripped from all 14 and from the dead union documented in `packages/core/src/README.md`.

- **Solid auto-contrast put white text on `warning+` in both modes — below AA, and the worse of the two choices.** `--ty-solid-fg-threshold` shipped at `0.62`, described in the source as the "~0.58-0.62 sRGB break-even." Measured in a browser at stock dials, the L at which black and white give *equal* WCAG contrast is **0.553** (success) / 0.564 (neutral) / 0.569 (warning) / 0.570 (primary) / **0.578** (danger) — so `0.62` sat above every flavor's real crossover and biased the decision toward white for any fill in the 0.55–0.62 band.

  `warning+` is the one built-in fill that lands there, and it failed in both modes: light (L 0.588) took white at **4.23:1** where black gives 4.97, dark (L 0.604) took white at **3.95:1** where black gives 5.31. Threshold retuned to `0.57`. Swept across all 30 fills (15 × light/dark): AA failures **2 → 0**, worst case **3.95:1 → 4.83:1**, and only `warning+` flips — the other 28 foregrounds are unchanged.

  The 0.025 hue spread means one global dial can't be exactly right for every hue, but the previous error was ~0.05 in the *same* direction for all five flavors, so per-hue thresholds would add 15 tokens to buy nothing a retune doesn't. The window where every fill gets the better color is `(0.544, 0.588]`.

  **Visual change:** `flavor="warning+"` now renders black label text instead of white, in both modes. Pin `--ty-solid-warning-strong-fg: white` to keep the old look, or set `--ty-solid-fg-threshold: 1` to force white everywhere. Same value applied to `ty-wizard`'s step circles, which carried their own `0.6` fallback for the brand-layer-not-loaded case.

  Regression-locked by `test/solid-contrast.test.ts`, which asserts the *invariant* (every fill's computed foreground clears AA **and** beats the alternative) rather than the dial — so retuning the L-curve or rebranding stays free, and only an actually-unreadable button fails.

## [1.0.0-TC46] - 2026-08-11

### Changed

- **Published package is 13% smaller — 5.02 MB → 4.65 MB packed, 25.8 MB → 23.7 MB unpacked, 359 → 181 files.** Three separate causes, only one of which was comments:

  **Sourcemaps were dead weight.** `lib/**/*.map` (~2 MB) shipped via the `files` field but referenced `../../src/*.ts`, which is never published, with no `sourcesContent` embedded — consumers could not resolve them under any circumstance. `sourceMap` and `declarationMap` are now off for the published build.

  **`tsc` was keeping comments.** Unlike the CDN bundle (Terser, `format.comments: false`) the NPM `lib/` build had no `removeComments`, so every source comment shipped. Now a two-pass build: `tsconfig.lib.json` emits `.js` with `removeComments`, and a new `tsconfig.lib.dts.json` emits declarations **with** JSDoc intact, so consumer hover documentation is unaffected. (`tsconfig.lib.json` also had duplicate `outDir` and `declarationMap` keys; cleaned up.)

  **CSS comments were shipping in the CDN bundle.** Component styles are CSS inside template literals, which makes those comments *string data* — Terser never stripped them. Removing them took 15 KB off `dist/tyrell.js` (now 343 KB / 76.8 KB gzipped).

- **Redundant comments removed across the source tree** — 139 files, 4,623 deletions, ~142 KB. Targeted duplicated file-header feature lists and `@example` blocks (already in `guides/TY_GUIDE.md` and the docs site), pure restatement, `// ====` banner rules, dead commented-out code, and stale `PORTED FROM:` / `(Phase N)` scaffolding. Rationale comments were preserved; the emitted `.js` for all 59 non-style modules is byte-identical to the previous build, and the 26 style modules differ only in removed CSS comments. Several stale comments were corrected in passing — `scroll-lock.ts` claimed `position: fixed` when the implementation uses `overflow: hidden` on `<html>`, and `input.ts` had a `/* No gap by default */` note directly above `gap: 0.5rem`.

### Known issues

- `ty-icon` renders as an oval inside shrink-wrapping wrappers such as `.rounded-full` badges. Fixed in TC47.

## [1.0.0-TC45] - 2026-08-08

### Added

- **`ty-select` gets an `align` attribute for horizontal popup anchoring.** The popup already auto-flips vertically (below/above, whichever has more room) via the shared `computeAnchoredPosition()` engine, but horizontally it was hardcoded to the trigger's left edge — fine for a full-width field, but wrong for a `slot="trigger"` custom trigger positioned near the right edge of its container (e.g. a toolbar icon button), where the popup would grow rightward off past the trigger instead of hugging it. `align="start"` (default, unchanged behavior) anchors the trigger's left edge; `align="end"` anchors its right edge — either way still clamped into the viewport. Implemented as a new `align` option on `computeAnchoredPosition()` (`utils/positioning.ts`), shared with `ty-date-picker`'s positioning engine though not yet exposed there. Also added to the React wrapper (`TySelectProps.align`).

- **`ty-select` gets a public `clear()` method and a `clearable` attribute.** `clear()` empties the selection programmatically and fires `change` (`action: 'clear'`) — added for `slot="trigger"` consumers whose fully custom trigger chrome hides any built-in field, so they can wire their own clear icon's click handler (e.g. a `ty-button` end-slot icon) directly to it. No-op if nothing is selected, same convention the existing `deselectValue()` already follows. `clearable` (boolean, default `true` — matches `ty-date-picker`) renders a built-in × button in the default field and `compact` skins once something is selected; it's automatically absent under `slot="trigger"` — the button lives in the trigger slot's fallback content, the same mechanism that already hides the chevron there, not a special case — and is suppressed while `disabled`/`readonly`. Use `not-clearable` to opt out. The `"clear"` `change`-event action was already a defined type member but dead code (never dispatched) until now; `TySelectEventDetail.action`'s missing `'create'` value was also fixed while touching that type. Also added to the React wrapper (`TySelectProps.clearable`), plus a typed `TySelectElement` ref interface exposing `clear()`.

  Caught along the way: `.select-stub` is `flex-wrap: wrap`, and `.dropdown-placeholder` (the joined-labels/selected-text element) used `flex: 1 1 auto` — `flex-wrap`'s line-assignment uses each item's *hypothetical* (pre-shrink) size, which for `flex-basis: auto` on `white-space: nowrap` text is its full untruncated content width, not its visually-truncated width. With only the absolutely-positioned chevron as a sibling this never surfaced; adding `.select-clear` as a real flex sibling exposed it — a long multi-select value would push the clear button onto a second line, growing the field's height, even though the text was already truncating with an ellipsis and there was visibly room. Fixed by giving the field skin's placeholder `flex-basis: 0%` instead of `auto` (truncation behavior is identical; only the wrap-line-fit calculation changes). The `.compact` skin needed the opposite treatment — it deliberately relies on `flex-basis: auto` for its own content-hugging sizing (`flex-grow: 0`, so with a `0%` basis and no way to grow back out, its text collapsed to zero width) — so it now sets `flex: 0 1 auto` explicitly rather than inheriting the field skin's basis.

- **`ty-date-picker` gets a public `clear()` method, for parity with `ty-select`.** Its existing `clearable` button (already shipped) called a private `clearValue()` — no way to trigger it except by clicking that exact button. `clear()` is a thin public wrapper around the same logic: clears the value and fires `change` (`detail.source: 'clear'`), same as clicking the button. Also added the React wrapper's typed `TyDatePickerElement` ref interface exposing `clear()`, and documented `clearable` and the `change` event payload in `TY_GUIDE.md` — both were previously undocumented there despite `clearable` already existing.

## [1.0.0-TC44] - 2026-08-07

### Fixed

- **`ty-select`'s fused search-header + options panel had a mismatched border and background in dark mode.** The popup is built as one seamless card: a search-input header sits directly on top of the options list, borders/backgrounds meeting at the seam with no divider. The base panel border was already fixed (TC41) to use `--ty-floating-border`/`--ty-surface-floating` instead of `--ty-input-border`/`--ty-input-bg` — deliberately faint tokens tuned for resting form fields, not floating panels — but four spots in `select.ts` (the header's own outer border/background, and the options panel's outer-facing top edge whenever it's exposed: search hidden, or `position-above`) and one in `select-base.ts` (the loading-state panel) never got that fix. In dark mode `--ty-input-border`'s L (~0.24–0.30) sits close enough to the panel's own background that the affected edge read as missing entirely, and the header's `--ty-input-bg` background was visibly darker than the options list below it. All five now consistently use `--ty-floating-border`/`--ty-surface-floating`, matching the rest of the panel — the actual `<input>` element itself correctly keeps `--ty-input-bg`/`--ty-input-border` for its own inset field look. Verified live: border color and background are now uniform across the whole panel in both the search-visible and search-hidden layouts, light and dark.

## [1.0.0-TC43] - 2026-08-07

### Changed

- **BREAKING: `tyrell.css` no longer hardcodes any color tokens.** Every `--ty-color-*`, `--ty-bg-{flavor}-*`, `--ty-border-*`, `--ty-surface-*`, `--ty-text-*`, `--ty-input-{color}-*` and `--ty-solid-*` custom property tyrell.css used to define directly (light `html {}` + dark `html.dark`/`[data-theme="dark"]`) moved to a new file, `tyrell-colors-static.css`. Reason: `tyrell-theme.css`, loaded after `tyrell.css` in every documented setup, already redefines every one of those same token names via its OKLCH formulas and always won the cascade by source order — so the hardcoded block was 100% dead weight in the normal "load both" path, and showed up in DevTools as a wall of struck-through declarations under every color property. `tyrell.css` alone now has zero color tokens — pair it with `tyrell-theme.css` (dynamic, recommended) or the new `tyrell-colors-static.css` (static, no theme engine) for colors. Every published example and guide that loaded `tyrell.css` alone now also loads `tyrell-theme.css`; see CSS_GUIDE.md → Color Customization.

## [1.0.0-TC42] - 2026-08-07

### Added

Solid, outlined, and ghost buttons all got a pass — more restrained default weight, tactile-but-quiet solid depth, and consistent interaction/emphasis rules across all three appearances and both modes. Summary of the final, locked design:

- **Mode-flipped typography weight dials — bold is now opt-in.** `ty-button` hardcoded `font-weight: 590` (semibold) and `ty-tag` 510, heavier than every comparable library (Material/Shoelace/Radix buttons: 500) and doubly wrong in dark mode, where light-on-dark text optically blooms and reads even heavier. Two new semantic dials in `tyrell.css`, consumed by the components and themable at any scope: `--ty-weight-action` (buttons; 510 light / **400 dark**) and `--ty-weight-label` (tags; 440 light / 400 dark). The old look is one line away (`--ty-weight-action: var(--ty-font-semibold)`). Registered as typed numbers in the theme layer, so with a variable font the text weight **crossfades during theme transitions** along with the colors. The tag's internal count badge stays semibold (a 400-weight number at xs size in a badge loses legibility).

- **Solid buttons get depth chrome — a fill-derived border and drop shadow, both optional and both quiet by default.** Previously flat fills with `border: none`. Now a 1px border derives from the tone's *resting* fill via relative color (`oklch(from …)`) — resting, not current, so on hover/active the fill steps up while the border stays put and visibly rises toward it, rather than the two moving together. Scaled by `--ty-button-depth` (default `0.35`; `0` = pixel-flat, border color matches the fill exactly with geometry unchanged). Offset direction/magnitude is `--ty-button-border-l`, mode-flipped and tuned per surface: colored solids get **no border at all in dark mode** (`0` — their own hue/saturation already separates them from the page) and a subtle darkening in light (`-0.08`); neutral has no hue to lean on, so it gets its own stronger dial, `--ty-button-border-l-neutral` (`-0.25` light / `0.5` dark), giving dark ink a real lit edge against a near-black canvas. (An earlier pass also added a top-edge sheen — `inset 0 1px 0` highlight — scaled by the same depth dial; removed entirely, it read as a distracting bright line rather than a subtle highlight.) Direct escape hatches outrank the derivation: `--ty-solid-border-color` pins the border to any color, `--ty-solid-border-width` changes thickness. Internals: solid state/tone rules assign two private variables, `--_solid-bg` (current fill, swapped by hover/active) and `--_solid-rest` (resting fill only, untouched by state rules) — the border formula reads the latter. Browsers without relative color simply drop the chrome and render flat, as before.

- **`neutral+` is full-contrast ink — the monochrome max-emphasis CTA (Geist/shadcn-style) — in every appearance.** Near-black in light mode, **inverted white ink with black text in dark mode**, via an absolute dial rather than an "anchor + offset" nudge: `--ty-l-solid-neutral-strong` (`0.15` light / `0.88` dark). Auto-contrast flips the foreground for free, and the inversion animates through theme transitions like every other dial. Outlined and ghost `neutral+` read the *same* ink dial — unlike every other flavor, where each appearance reads its own `-strong` text token — so all three appearances agree on what "+" means for neutral specifically; base/soft neutral (all appearances) stay on the regular per-flavor text ladder, which is what actually needs to invert per mode for page-contrast legibility (the ink ramp doesn't, by design — pointing weaker tones at it makes them illegible). `button.muted` follows the same split. Hover/active on `neutral+` move *toward mid-lightness* (fill-relative: `sign(0.5 − l) × |dial|`) rather than in the mode's fixed direction, since at an L extreme the normal directional dials clip into the ceiling/floor and vanish.

- **Warning solid buttons no longer go brown in light mode — per-flavor solid anchor lift.** The solid tone ladder's "darker = stronger" is false for the yellow family: darkened hue-75 is brown, so light-mode `warning+` rendered mud and base sat exactly on the auto-contrast threshold. New per-flavor data dials `--ty-{flavor}-solid-l` add to the base fill's L before tones/hover/active derive; warning gets `+0.1` in light (`0` dark — dim fills don't brown out there). Result ladder: soft pale amber → base vivid orange → strong deep orange, black text throughout, all AAA contrast — the same special-casing Material applies to amber, expressed as one data dial. Other flavors default to `0` (no change), but the dial is there for any flavor that needs it.

- **Dark-mode solid hover/active offsets raised** (`--ty-solid-hover-l` `0.04 → 0.07`, `--ty-solid-active-l` `0.08 → 0.11`; light mode unchanged). Small L deltas at the dark end of an emissive screen read much weaker than the same delta mid-scale — hover on dark fills (worst on `-` tones, which rest another 0.1 lower) was barely perceptible.

- **Outlined and ghost buttons now escalate to peak emphasis on hover/active/focus, regardless of starting tone.** Previously `-`/base/`+` were static at rest — hover only tinted the background. Now `:hover`/`:active`/`:focus-visible` always resolve text (and, for outlined, border) to the `-strong` tier: soft and base both rise to the same peak color on interaction; `+` is already there at rest, so it's a no-op. Composes with `muted`'s own reveal-on-interaction mechanism rather than fighting it — a pressed muted button lands on the same escalated color as a pressed plain button of the same flavor.

### Fixed

- **`ty-select` opened with two simultaneous focus rings.** The stub's deliberate open-state ring (added TC-era to match `ty-input`'s `.focused` escalation) applied whenever the popup was open — but the popup's search row auto-focuses on open and carries its own real `:focus` ring, so searchable selects showed both at once and read as two focused controls. The stub's ring is now suppressed while the search input genuinely holds focus (`:not(:has(.dropdown-search-input:focus))`); selects whose popup has no search row keep the stub ring exactly as before. The `custom-trigger` skin is explicitly excluded from the rule so its unconditional no-ring reset isn't out-specificity'd.
- **`ty-select`'s popup panel border was nearly invisible in dark mode.** The panel reused `--ty-input-border` — the deliberately-faint *resting-state form-field* border, designed to escalate on hover/focus — as its edge against arbitrary page content, where nothing ever escalates it. Switched to the tokens actually designed for floating panels: `--ty-surface-floating` + `--ty-floating-border`.

- **`ty-select`'s `slot="trigger"` hit area extended well past the visible trigger.** The internal `.select-stub.custom-trigger` rule set `display: inline-block` but never overrode the inherited `width: 100%` from the base `.select-stub` rule — unlike its `.compact` sibling right above it, which correctly sets both. `inline-block` + `width: 100%` still spans the full row, so the cursor showed as a pointer, and clicks landed on, and opened the popup from, empty space well past the actual slotted trigger content. Added the missing `width: auto`. Verified live: the internal stub now sizes to exactly the slotted content (was 558px for a 102px button, now 102px); a click 200px past the visible trigger no longer opens the popup, a click on the trigger itself still does.

## [1.0.0-TC41] - 2026-08-06

### Fixed

- **`.ty-theme-switching` (TC40) didn't actually reach `ty-*` components.** Its suppression rule was a universal selector (`.ty-theme-switching *`) in a document-level stylesheet — Shadow DOM style encapsulation blocks that from ever matching inside a component's own shadow root, so every `ty-tag`, `ty-input`, `ty-button`, `ty-switch`, etc. kept running its local hover-transition through every theme swap, completely unaffected by TC40's fix. Confirmed live: with `.ty-theme-switching` present, `ty-tag` and `ty-input`'s internal elements still reported `transitionDuration: 0.15s` and fired `transitionrun` events. Fixed with the mechanism that actually crosses that boundary: `.ty-theme-switching` now also sets an inheriting custom property, `--ty-local-transition: none` — custom properties inherit through Shadow DOM by default, so this reaches every component for free. Every component's own local transition (`ty-button`, `ty-input`, `ty-textarea`, `ty-radio`, `ty-switch`, `ty-tabs`, `ty-checkbox`, `ty-copy`, `ty-file-upload`, `ty-calendar-month`, `ty-calendar-navigation`, `ty-date-picker`, `ty-wizard`/`ty-step`, `ty-scroll-container`'s scrollbar) now routes its existing duration/easing through `var(--ty-local-transition, <original value>)` — a fallback, so nothing changes outside a theme switch. Four shared tokens already used by several components (`--ty-transition-all`, `--ty-transition-colors`, `--ty-transition-shadow`, `--ty-transition-transform`, defined once in `tyrell.css`) got the same treatment centrally, covering `ty-tag`, `ty-option`, `ty-modal`, and several `ty-select` internals without touching those files individually. Re-verified: the same repro that showed 0 suppressed events on `ty-tag`/`ty-input` in TC40 now shows 0 `transitionrun` events during the switch and correct restoration (`0s` mid-switch → `0.15s` after) for both.

## [1.0.0-TC40] - 2026-08-06

### Added

- **`.ty-theme-switching` opt-in escape hatch for smooth theme toggles.** Interactive components (`ty-button`, `ty-input`, `ty-switch`, `ty-tabs`, …) each carry their own short hover/focus transition (~0.15–0.2s on `background-color`/`border-color`/`color`), which CSS also fires on any non-interactive value change — so a theme switch retriggered all of them at once, racing the coordinated 0.45s dial crossfade at a different speed on every element. Measured on our own docs site: a single theme toggle fired ~1,548 separate `transitionrun` events with finish times scattered across a 449ms window, which read as jitter rather than one smooth wash. Add `ty-theme-switching` to whatever you toggle (`<html>` or a scoped `[data-ty-theme]` root) for the duration of the switch to silence local transitions on its descendants only — the dial crossfade itself is untouched. Purely additive; needs a few lines of JS around the toggle (documented in CSS_GUIDE.md → Animated theme transitions). Applied to our own docs site's theme toggle: same swap now fires 193 events (mostly the legitimate dial properties themselves) with finish times inside a 184ms window.

## [1.0.0-TC39] - 2026-08-06

Headline: **`ty-select` gets a real `display`** (fixes a `ty-selected-tags` layout bug), and the chip display is renamed to **`ty-selected-options`** (old tag kept forever).

### Fixed

- **`ty-select` never declared `:host { display }`**, so it defaulted to the browser's `display: inline` for every skin (default field, `compact`, `slot="trigger"`). Inline boxes ignore vertical margin entirely, which is why pairing a select with `ty-selected-options`/`ty-selected-tags` below it (the documented pattern) rendered the chips flush against the select instead of the intended gap — not a symptom of the earlier label-gap fix, a separate pre-existing bug that just became visible. Now `:host { display: block; width: 100% }`, matching `ty-input`'s existing convention; `:host([compact]) { display: inline-block; width: auto }` keeps the documented "content-hugging toolbar trigger" skin actually content-hugging. Verified: margin-driven gaps now render (was 0px, now the declared value), compact still sizes to its own label, and an input+label sits flush in the same row as a select+label.
- **The picker's popup could visually collide with its own out-of-band chip row.** `ty-select`'s popup is intentionally independently sized/positioned from the trigger (documented), so when it's wider or narrower than the chip row beneath it, part of that row stayed visible, peeking out beside or through the open popup. `ty-selected-options`/`ty-selected-tags` now listens for the picker's `open`/`close` events (already emitted by `ty-select`) and hides itself for the duration — cheaper and more correct than trying to out-z-index or reflow around an overlay whose footprint it doesn't control.

### Changed

- **`ty-selected-tags` renamed to `ty-selected-options`.** The old name described the chip primitive it happens to render with (`ty-tag`); the new one describes what drives it — a picker's selected `ty-option`s — matching how the rest of the library names things. `ty-selected-tags` is re-registered as a subclass and kept working indefinitely (same convention as `ty-modal`/`ty-dialog`); the JS class `TySelectedTags` (core and React packages) is likewise kept as an alias export of `TySelectedOptions`. No migration required — this is additive, not a removal.

## [1.0.0-TC38] - 2026-08-06

Headline: **`tyrell-brand.css` renamed to `tyrell-theme.css`** (BREAKING path change), and the static `tyrell.css` fallback path is now correct-by-default instead of quietly shipping pre-TC35 contrast bugs.

### Changed (BREAKING)

- **`packages/core/css/tyrell-brand.css` renamed to `tyrell-theme.css`.** "Brand" undersold what the file does since TC35–37 — it's the auto-contrast engine, the seed-ingestion engine, the named/scoped-theme engine, and the animated-transition engine, not a cosmetic color skin. "Theme" is also the term every comparable library (Radix, Material, Web Awesome) already uses for this concept. `--ty-brand-hue`/`--ty-brand-chroma` and the rest of the Tier 1 seed *variable names* are unchanged — only the file path moved. Consumers on a pinned CDN URL for a prior TC version are unaffected (those releases keep serving the old filename); anyone updating to this version needs to update their `<link>`/`import` path. Updated everywhere in this repo: build scripts, e2e fixture, all framework guides, README, and the docs-site symlink.

### Fixed

- **`tyrell.css` alone (no theme engine loaded) no longer ships broken contrast.** This was worse than a missing enhancement: the single `--ty-solid-{flavor}-fg` per flavor was already wrong for success/danger/warning at *base* tone in both modes (as low as 1.58:1, no customization required to trigger it — the exact bug class TC35 fixed, still live in the fallback path), and `tone-plus`/`tone-minus` buttons had **no fg token at all**, which resolves to CSS's `initial` value rather than failing safe — measured as black text on a dark navy `primary+` fill. Added the missing per-tone `-soft-fg`/`-strong-fg` tokens and corrected the existing base tokens; every one of the 29 static solid fills hand-verified against both black and white, worst case now 4.66:1. `tyrell-theme.css`'s computed auto-contrast is unaffected and still wins by source order when loaded.

### Docs

- **Every "load Tyrell" snippet across the guides, README, and framework docs now shows `tyrell-theme.css` alongside `tyrell.css` by default** — 17 files. `README.md`'s prior framing ("Opt-in — load only if you want to retint") was actively wrong given what's gated behind that file; rewritten to state the trade-off honestly. `tyrell.css`-only remains fully supported and correct (per the fix above) for consumers who deliberately want the static-color, older-browser-compatible path.
- **Docs site's own GitHub Pages CDN template** (`packages/cljs/resources/index.html.template`) still linked `tyrell-brand.css` and set a dead `--ty-secondary-offset` seed override — both leftover from before this rename/removal. Fixed so the published docs site (gersak.github.io/tyrell) loads correctly on this and future releases.

## [1.0.0-TC37] - 2026-08-06

Headline: **flavors and themes become user-declarable axes** — `secondary` removed (BREAKING), color seed ingestion (`--ty-primary-seed: #hex`), named/scoped themes via `[data-ty-theme]`, animated theme transitions, and a flavor-pack template giving custom flavors full engine parity.

### Removed (BREAKING)

- **The `secondary` flavor** — from the brand engine, the base stylesheet (tokens + `ty-text-secondary*`/`ty-bg-secondary*`/`ty-border-secondary`/selection utilities), and the components' built-in `FLAVORS` list. The built-in set is now semantic-only: `primary` / `success` / `danger` / `warning` / `neutral`. Rationale: secondary was the only non-semantic built-in — an aesthetic slot defined as `brand + 60°` that most projects had to re-tune anyway. Markup using `flavor="secondary"` degrades gracefully to neutral; a real second accent is one flavor pack away (see below). Verified surgical: 21 tokens removed, zero other computed-token changes vs TC36.

### Added

- **Named + scoped themes** — a theme is a dial pack: any class/attribute that overrides SECTION 1 dials (`html.love { --ty-brand-hue: 340 }`). New `[data-ty-theme]` scope selector makes the engine recompute all derived tokens on that element, so a subtree can carry its own full theme — including dark-inside-light via `<div data-ty-theme class="dark">`. `dark` is now just the built-in reference theme pack.
- **Color seed ingestion — the engine now accepts colors, not just numbers.** Every flavor resolves one seed color (`--ty-{flavor}-seed: <any color>`); ramp formulas read the seed's chroma + hue channels via relative color syntax, while every shade's lightness still comes from the mode-flipped L-curve. The number dials remain the default (the seed falls back to a color constructed from them — verified 0 pixel differences at defaults, both modes). The ingestion rule is explicit: a seed's lightness is discarded by design — shade placement is the curve's job, which is what makes dark mode, `+`/`-` tones, the input state ladder and auto-contrast correct for ANY seed, light or dark (verified with a dark seed `#76467c`: dark-mode emphasis direction correct, solid fg 8.7:1). This replaces the `color-mix()` approximation as the custom-flavor path: the flavor pack template, the Theming page's pack builder (now name + one color) and the CSS System brand showcase all run the same seed-ingestion engine — the showcase's hand-tuned `color-mix()` ramp (which inverted emphasis in dark mode) is gone. Browser floor for the brand layer rises to relative-color support (Chrome 119 / Safari 16.4 / Firefox 128).
- **Animated theme transitions** — all 63 brand-layer dials are now registered via `@property` as typed numbers, which makes them interpolable: switching mode (`html.dark`) or applying any theme pack no longer snaps — every derived color (buttons, borders, surfaces, text, focus rings) crossfades through OKLCH space, frame by frame, with zero JS. Tune or disable with `--ty-theme-transition` (default `0.45s`; set `0s` to opt out); reduced-motion users never get the animation; browsers without `@property` simply snap as before. Enabled by converting the last per-mode absolutes (surface ladder, `--ty-solid-neutral`, bg-neutral extremes, focus-ring alpha) into numeric dials — which also deleted the dark data block entirely: dark mode is now *purely* dial overrides. Verified: 0 pixel differences vs TC36 at rest in both modes; mid-transition frames measured strictly between endpoints for both mode toggles and brand-hue changes.
- **Theming playground is now a theme builder** — the export panel emits either `:root` overrides (as before) or a **named theme pack** (`.my-theme { … }`, usable on `<html>` or any `[data-ty-theme]` subtree), and a new **Flavor pack builder** section generates the full flavor-pack template live from a name + two seeds, applying it to the page as you drag so the preview row (solid/outlined/ghost buttons, tones, tag, input — auto-contrast included) is the real engine at work.
- **Flavor pack template** (CSS_GUIDE → Custom Flavors) — the per-flavor formula block published as a copy-paste template. A custom flavor declared this way gets full engine parity: shared L-curve (equal perceived weight with built-ins per shade), saturation curve, dark mode via the same dial flips with **no dark block of its own**, solid interaction states, auto-contrast foregrounds, and theme-scope support. Verified end-to-end from the documented text: light AA 5.5–7.2:1, dark 7.0–13.4:1, scoped recompute working.

### Fixed

- **Solid buttons: tone-aware hover/active fills** — the `-hover`/`-active` states always derived from the *base* fill, so hovering a `flavor-` (tone-minus) button abandoned its soft fill and jumped ~0.14 L darker while keeping the soft tone's (black) text — black-on-dark, unreadable. Tone-plus/-minus states now nudge their **own** fill by the same `±0.04/0.08` interaction dials via relative color (no new tokens; packs and custom flavors get it automatically). Text color deliberately stays pinned to the tone's rest fill through interaction — re-deriving per state was measured to flicker black↔white when a nudge crossed the fg threshold (worst measured state ≥ 4.5:1 either way; stable text wins).
- **`ty-input`: hover no longer overrides focus** — `.input-wrapper:hover` out-ranked `.focused` by specificity, so hovering a focused unflavored input swapped its primary focus border for the dimmer neutral hover border (ring stayed, border dimmed — read as a glitch). Gated with `:not(.focused)`, matching `ty-date-picker`'s existing `:hover:not(.open)` pattern.
- **`ty-select`: label→field gap now matches `ty-input`** — `.select-container` carried a `gap: 0.25rem` that stacked on the shared label's `margin-bottom: 6px` (flex gaps don't collapse with margins), making select fields 4px taller with a visibly looser label. Removed; select/input/date-picker now measure pixel-identical (6px gap, 63px total).

### Docs

- **Button page "Custom Flavors" demo taught the wrong tool** — it defined flavors via the `--ty-button-*` per-instance overrides (chosen for solid), which leak into every appearance: the outlined example rendered invisible white-on-transparent text at rest and turned fully solid on hover (`--ty-button-bg-hover` is top of outlined's hover chain too). The demo now defines flavors through the appearance-aware token layer (`--ty-solid-X*` for solid, `--ty-color-X` + `--ty-bg-X-soft` for outlined/ghost) and the prose explains the instance-override vs token distinction, plus the one-line `--ty-X-seed` path when the brand layer is loaded.

## [1.0.0-TC36] - 2026-08-05

Headline: **brand-layer restructure** — formulas declared once (dark mode keeps only hand-tuned data), text/borders finally engine-wired, and greys decoupled from the brand.

### Changed

- **Neutral is achromatic by default** — `--ty-neutral-hue`/`--ty-neutral-chroma` are now `0`/`0` instead of tracking the brand seeds (`brand-hue` / `brand-chroma × 0.04`). Greys — text hierarchy, borders, neutral buttons, muted buttons, dividers — no longer drift when the brand is re-hued. Opt back in to brand-warmed greys with `--ty-neutral-hue: var(--ty-brand-hue); --ty-neutral-chroma: calc(var(--ty-brand-chroma) * 0.04)`.
- **`--ty-text-*` and surface borders now go through the brand engine** — the 5-stop text ladder (`--ty-text-strong/bold/base/soft/faint`) and `--ty-content/elevated/floating-border` were hardcoded Tailwind hexes in tyrell.css that a rebrand never touched. New Tier 3 dials (`--ty-l-text-*`, `--ty-l-border-*`) hold their measured lightness; the brand layer overrides the hexes like every other token. Visible shift: text loses Tailwind's cool blue cast (max ~17/255 per channel) and follows the neutral seeds — pure grey at the new defaults.

- **Generic borders are their own family** — `--ty-border`/`-strong`/`-bold`/`-soft`/`-faint` no longer alias the neutral text ramp; they compute from a dedicated L ladder (`--ty-l-border-*`, per-mode values preserving the exact colors the aliases produced — verified 0 pixel diffs). Consequence: tuning the text emphasis curve or `--ty-neutral-l-factor` no longer moves app borders, and borders are tunable without touching text. Per-flavor accent borders (`--ty-border-{flavor}`) intentionally remain ink aliases.

### Internal

- **`tyrell-brand.css` dark-mode formula mirror deleted (~250 lines)** — SECTION 2 formulas are now declared once at `html:root` (out-ranking tyrell.css's light tokens by specificity and its `html.dark` hexes by source order), and the `html.dark` block holds only genuine per-mode data: the surface ladder, focus-ring alpha, the `--ty-bg-neutral-strong/-faint` pins, and the `--ty-solid-neutral` ink pin. Verified byte-equivalent before the neutral change: 323 computed tokens × 2 modes, zero differences.

## [1.0.0-TC35] - 2026-08-05

Headline: **auto-contrast solid foregrounds** — solid button text is now derived from its own fill's lightness instead of being hardcoded `white`, closing a contrast hole that affected every `flavor-` button out of the box. Also new: `muted` on `ty-button`.

### Added

- **`muted` attribute on `ty-button`** — suppresses the flavor color at rest (the button renders in neutral tokens) and reveals it on interaction. Hover reveal is gated behind `@media (hover: hover) and (pointer: fine)` so touch devices, which have no hover, aren't left with a permanently grey button; `:active` and `:focus-visible` reveal unconditionally, so a tap still shows the real color on press. Works across all three appearances (`solid`/`outlined`/`ghost`) and honors `+`/`-` tones via `--ty-*-neutral-strong`/`-soft`. Orthogonal to `flavor` and `appearance` — it's a separate axis, not a fourth appearance.
- **Auto-contrast foreground tokens** — `--ty-solid-{flavor}-fg` is now computed rather than literal, and gains per-tone siblings `--ty-solid-{flavor}-soft-fg` / `-strong-fg`. Each derives black or white from the lightness of the fill it actually sits on, using the same `oklch(from …)` relative-color syntax the solid fills already use:

  ```css
  --ty-solid-primary-soft-fg: oklch(from var(--ty-solid-primary-soft)
                                    clamp(0, (var(--ty-solid-fg-threshold) - l) * 1000, 1) 0 0);
  ```

  One token per *fill*, not per flavor: `base` / `-soft` / `-strong` sit at three different lightnesses, so each needs its own decision.
- **`--ty-solid-fg-threshold`** (default `0.6`) — the lightness crossover at which foregrounds flip from white to black. Raise it to prefer white, lower it to prefer black, or set it to `1` to restore the old fixed-white behavior globally.

### Fixed

- **Every `flavor-` (tone-minus) solid button failed WCAG AA** — `--ty-solid-soft-l: 0.1` lightens the fill for the `-` tone, but the foreground was pinned to `white`, so contrast collapsed. Measured across 6 flavors × 3 tones × 8 brand hues, 48 of 144 combinations fell below 4.5:1 (worst: `warning-` at **2.53:1**) — on the shipped defaults, with no rebranding involved. Now 0 of 144 fail, in both light and dark; worst case 4.61:1. The `.tone-plus`/`.tone-minus` button rules also set `color` now, not just `background`.
- **`ty-wizard` step circles failed WCAG AA in dark mode** (completed 3.48:1, active 3.79:1, error 3.93:1) — the circles paint `--ty-wizard-{state}-accent` (which defaults to `--ty-color-{flavor}`) but took their text color from `--ty-solid-{flavor}-fg`. Those two coincide in light mode but diverge by 0.25 L in dark, where `--ty-solid-l` dims solid fills against the dark canvas — so white text sat on a fill 0.25 lighter than the one the color was chosen for. Each circle now derives its foreground from the accent it actually paints (6.04 / 5.54 / 5.34:1 in dark; light unchanged).

### Changed

- **Solid button text is no longer always white.** On pale fills — the `-` tone, high `--ty-l-*` curves, light brand hues — labels now render black. This is the intended fix, but it is a visible change for anyone who was relying on white. Opt out per flavor with `--ty-solid-primary-fg: white`, or globally with `--ty-solid-fg-threshold: 1`.

### Docs

- **Docs site moved to Tailwind v4** (`@tailwindcss/browser@4`, replacing the v3 Play CDN). v3 declared its internal `--tw-*` state vars on `*, ::before, ::after`, so DevTools repeated that block once per ancestor when inspecting any element; v4 registers them via `@property` instead (its universal-selector fallback is gated behind an `@supports` that only matches engines without `@property` support). Visible `--tw-*` on a given element dropped from 51 to 11. Site-only — the Tyrell library itself has no Tailwind dependency.
- `TY_GUIDE.md` documents `muted`; `CSS_GUIDE.md` gains an "Auto-contrast foregrounds" section covering the threshold dial and the opt-out paths.

## [1.0.0-TC34] - 2026-07-22

Headline: **`ty-select` mobile-mode fixes** — stale hidden options, focus/keyboard, and external-search results not appearing.

### Fixed

- **Mobile options stayed hidden after a previous search, on open** — `openDropdown()` (desktop) has always defensively re-shown the options area on every open ("may have been hidden from previous search"); `openMobileModal()` had no equivalent. Added the mobile-appropriate reset (`updateTagVisibility` unhides every option on open, matching desktop's intent via the mechanism mobile actually uses — per-option `hidden` attribute rather than desktop's container-level `display:none`).
- **Mobile search input's focus was racing `showModal()`'s own native focus algorithm** — a manual `searchInput.focus()` call right after `showModal()` lost the race; `document.activeElement` ended up back on the host element, so keystrokes weren't reaching the input at all despite it looking focused. Replaced with the `autofocus` HTML attribute, which `showModal()` itself honors as part of its spec'd focusing steps — no race, and it correctly falls through to the close button when search is hidden.
- **`external-search` results never appeared on mobile after typing** — `.mobile-available-section[data-empty="true"] slot { display: none }` hides the *entire* options slot, not just the empty-state message, and only `updateMobileSelectedState()` (which sets `data-empty`) recomputes it. Internal filtering already called that; `external-search` bypasses internal filtering entirely and only the `MutationObserver` watching for consumer-driven `ty-option` swaps was left to catch a change — and it never called `updateMobileSelectedState()`. Result: the consumer's new options were genuinely in the DOM, correctly slotted, just invisible. Fixed by having the observer refresh mobile state too.

## [1.0.0-TC33] - 2026-07-21

Headline: **New brand default** — `--ty-brand-hue`/`--ty-brand-chroma` now `45`/`0.125` (amber/orange) instead of `230`/`0.12` (indigo).

### Changed

- **`tyrell-brand.css` default brand seed changed** from hue `230` / chroma `0.12` to hue `45` / chroma `0.125`. Anyone not overriding `--ty-brand-hue`/`--ty-brand-chroma` themselves will see their primary/neutral/surface colors shift on upgrade. Docs site's own OKLCH playground default (`theming.cljs` `default-seeds`, `packages/cljs/public/index.html`) synced to match.

## [1.0.0-TC32] - 2026-07-21

Headline: **`ty-select` chrome fixes** — font-family, height, and custom-trigger outline.

### Fixed

- **`ty-select` / `ty-date-picker` labels (and other unstyled shadow-DOM text) ignored `--ty-font-sans`** — neither component's `:host` pinned `font-family`, so text silently inherited whatever font the host page happened to be using instead of the library's own token, unlike `ty-input` which already pinned it. Both now set `font-family: var(--ty-font-sans)` on `:host`, matching `ty-input`.
- **`ty-select` with a custom trigger (`slot="trigger"`) still showed the default field outline** — `setupTriggerSlot()` toggled a `custom-trigger` class on `.select-stub` when a consumer slotted their own trigger content, but no CSS ever consumed that class, so the default border/background/padding and the open/focus ring (`box-shadow: 0 0 0 3px ...`) kept wrapping the custom content regardless. `.select-stub.custom-trigger` now goes fully bare (no border, background, padding, or ring) in every state, as originally intended.

## [1.0.0-TC31] - 2026-07-20

Headline: **flavors everywhere** — custom flavors and `+`/`-` tones, previously a `ty-button`/`ty-tag` exclusive, now work on every flavored component. Also: field and button sizing reworked onto one shared height scale.

### Added

- **Custom flavors + `+`/`-` tones for all flavored components** — `ty-switch`, `ty-radio`/`ty-radio-group`, `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, and `ty-calendar`/`ty-calendar-month` now use the same mechanism as `ty-button`/`ty-tag`: any identifier is a valid `flavor`, themed from your `--ty-color-X` (and where relevant `--ty-bg-X` / `--ty-border-X`) tokens, with missing tokens degrading to neutral. `+`/`-` shade suffixes map to `-strong`/`-soft` tokens.
- **Per-instance color override vars on each component** — flavor colors funnel through local vars (`--switch-track`, `--radio-color`, `--checkbox-color[-off]`, `--input-accent[-bold]`/`--input-ring`, `--select-accent[-bold]`/`--select-ring`, `--date-picker-accent[-bold]`/`--date-picker-ring`, `--copy-color[-hover]`/`--copy-bg-hover`, `--calendar-month-accent`/`-selected-bg`/`-selected-color`/`-selected-hover-bg`), so e.g. `ty-switch[flavor="brand"] { --switch-track: … }` page rules recolor a single instance. See CSS_GUIDE.md → Per-Component Color Overrides.
- **`ty-select` gets an open-state focus ring** — matching `ty-input`'s `.focused` treatment (bolder border + a 3px 15%-alpha ring in the flavor color), the field previously had zero visual escalation when the dropdown opened.
- **`ty-copy` flavor actually renders** — the documented `flavor` attribute previously had no CSS behind it; it now colors the copy button, its hover, and the wrapper hover tint.
- **`ty-select` gained a `flavor` attribute** — previously had none (no error/danger coloring existed for it at all); now colors the field border + hover like `ty-input`, same built-ins/tones/custom-flavor support.
- **`ty-calendar` / `ty-calendar-month` gained a `flavor` attribute** — colors the selected day and today's number; `ty-calendar` forwards its flavor to the nested `ty-calendar-month` only (navigation arrows stay neutral chrome). `ty-date-picker` forwards its own flavor to the popup calendar it opens, so the two match automatically with no new API.

### Fixed

- **`ty-tooltip` no longer gets stuck on a stale flavor** — the popover element is created once and cached; a flavor change made while the tooltip was closed was silently dropped (`attributeChangedCallback` only restyled `if (name === 'flavor' && this._open)`). It now restyles on every flavor change regardless of visibility.
- **`ty-date-picker`'s popup calendar no longer gets stuck on a stale flavor** — `render()` only rebuilds (and re-forwards `flavor`) while the dialog is closed; changing the flavor while the popup is already open previously left it showing whatever flavor was active when it was opened. `updateDisplay()` (the open-dialog partial-update path) now also syncs `flavor` onto the existing `ty-calendar`.
- **Several icons/badges were hardcoded to primary regardless of the component's own flavor** — `ty-select`'s loading spinner and compact-mode count badge, `ty-date-picker`'s calendar trigger icon, and `ty-input`'s password-reveal focus outline all ignored `flavor` and always rendered primary-colored (or, for the calendar icon, a neutral tone that tracks the brand hue and so visually reads as a washed-out primary on the default theme). All four now follow the component's own accent, matching `ty-copy`'s icon (which already did).
- **`ty-checkbox`'s focus ring was hardcoded to `--ty-color-primary`** regardless of flavor — now matches the checked-state color via a new `--checkbox-ring` var.
- **`ty-date-picker`'s clear-button hover was silently unstyled** — it referenced `--ty-color-negative` / `--ty-bg-negative-faint`, neither of which exists as a token; fixed to `--ty-color-danger` / `--ty-bg-danger-soft` (clear stays neutral at rest and always warns danger-red on hover — a destructive utility action, not the field's own flavor).
- **`ty-select`'s compact-mode count badge referenced `--ty-text-primary`**, a nonexistent token, for its text color (silently fell back to unstyled inherited black) — fixed alongside making it follow flavor.
- **`ty-select` rendered 3-4px taller than `ty-input`/`ty-date-picker` at the same `size`** — the `.select-stub` size rules carried vertical padding (`0.375rem`/`0.5rem`) that stacked on top of `min-height` instead of being absorbed by the stub's `align-items: center`; zeroed, matching `ty-input`'s existing zero-vertical-padding approach. Fields now measure pixel-identical at every size.

### Changed

- **Unknown flavors no longer coerce** — components previously rewrote unknown flavors to a default (`primary`/`neutral`/`dark`) with a console warning. Any plain identifier now passes through as a custom flavor; syntactically invalid values fall back to the default look silently. Matches the existing `ty-button`/`ty-tag` behavior.
- **`ty-tooltip` flavor colors are token-derived** — the per-flavor switch statement collapsed to one formula (`--ty-bg-X` / `--ty-color-X-strong` / `--ty-border-X`); `dark`/`light`/`info` stay hand-tuned, and the default `dark` look routes through the documented `--ty-tooltip-bg`/`--ty-tooltip-color` escape hatch again (it previously clobbered it). Minor normalization: `success` tooltips now use `--ty-bg-success` like every other flavor (was `-bold`).
- **`ty-input` secondary/warning flavors gained hover states**; flavor CSS is generated from one formula, so all built-ins behave identically.
- **Flavored field borders follow the neutral emphasis ladder** — a flavored `ty-input`/`ty-select`/`ty-date-picker` previously rested on the full-strength flavor color, leaving no visible difference between rest, hover, and focus. Fields now rest on the flavor's `-soft` shade and escalate to the full color on hover/focus (+ ring), mirroring neutral's faint→soft→focus progression; `+`/`-` tones shift the whole ladder. The `--ty-input-{success,danger,warning}-border` tokens now alias the `-soft` shades accordingly.
- React wrappers: `flavor` prop types widened to accept `+`/`-` shades and custom flavor strings (`TySwitch`, `TyRadio`, `TyRadioGroup`, `TyCheckbox`, `TyInput`, `TySelect`, `TyCopy`, `TyDatePicker`, `TyTooltip`, `TyTag`, `TyCalendar`, `TyCalendarMonth`).
- **Field size ladder collapsed from five sizes to three** — `ty-input`/`ty-select`/`ty-date-picker` now come in exactly `sm`/`md`/`lg` (32/36/40px) via `--ty-size-{sm,md,lg}`, always the same height across all three field components at a given size. Legacy `xs`/`xl` attribute values still work but coerce to `sm`/`lg`.
- **`ty-button`'s size ladder now shares a scale with fields instead of running independently underneath them** — `xs`–`xl` is 24/28/32/36/40px, and the top three steps land exactly on the field ladder (button `md` = field `sm`, `lg` = field `md`, `xl` = field `lg`), so a button and a field of the paired size sit flush, same height, in a row. `xs`/`sm` remain button-only steps (compact toolbars, icon actions).

## [1.0.0-TC30] - 2026-07-10

Headline: **React 18 `className` fix** — utility classes on every `tyrell-react` wrapper now actually apply.

### Fixed

- **`className` on React wrappers did nothing under React 18** — React lowercases `className` on custom elements into a literal `classname=""` attribute no CSS matches, so host-level utility classes (layout, sizing — most visible on `TyScrollContainer`) were silently dropped. All 25 wrappers now normalize props through `hostProps()`, re-passing `className` as `class` (verbatim pass-through; harmless on React 19).

## [1.0.0-RC12] - 2026-07-10

`latest`-channel promotion of the TC27–TC29 line (npm `tyrell-components` + `tyrell-react`), and the first matching **Clojars release**: `dev.gersak/tyrell` and `dev.gersak/tyrell-icons` `1.0.0-RC12` — `tyrell.react` no longer references the removed `TyDropdown`/`TyMultiselect` exports (RC11 fails to compile against tyrell-react ≥ TC27).

## [1.0.0-TC29] - 2026-07-10

Headline: **date-picker & calendar restyle** — ghost day cells, one strong element (the selected day), proper time inputs — plus custom flavors for `ty-tag`/`ty-button` and the docs/guides purge of the removed components.

### Added

- **Custom flavors for `ty-tag` and `ty-button`** — any identifier works as a `flavor`: the component generates the same token wiring built-in flavors get, pointed at your design tokens (`--ty-bg-X`, `--ty-color-X`, `--ty-solid-X`, …). Buttons degrade to `neutral` when tokens are missing instead of rendering invisible. Injected as a shadow stylesheet, so page-level `ty-tag[flavor="X"] { --tag-bg: … }` overrides still win. Flavor CSS is generated per flavor/appearance from one formula (completes the generator that partially shipped in TC28).

### Changed

- **Calendar day grid restyle** (`ty-calendar-month`, and therefore `ty-calendar` / `ty-date-picker`): day cells are ghost cells — no border boxes; hover is a soft neutral rounded pill; the selected day is the single filled element; **today** is an accent-colored semibold number (no background slab — never collides with hover, selected pill wins when today is picked); weekends are undifferentiated by default (theme back via `--ty-calendar-weekend-color`); weekday headers muted; day numbers use tabular numerals. All `--ty-calendar-*` theming hooks kept — only defaults changed.
- **Date-picker time section**: gray slab replaced by a transparent row with a hairline separator; hour/minute inputs are now proper mini-fields (border, input background, focus ring, tabular digits).
- **Docs & guides**: every reference to the removed `ty-dropdown`/`ty-multiselect` purged from README, all guides, and agent instructions (TYCOMPONENT_GUIDE's case study rewritten around the real `TySelect` API).

### Fixed

- **`ty-calendar-navigation` at `md` (the default size) had zero padding** — only `sm`/`lg` defined the size CSS variables, so `padding: var(--nav-padding)` collapsed to nothing and the month/year header sat flush against the popup's top edge. `md` now has its own block (`0.5rem 0.75rem` padding, `2rem` buttons, `280px` default width), aligned with the month grid.

## [1.0.0-TC28] - 2026-07-10

Headline: **card-style `ty-select` popup search** — a detached bordered field with the `ty-input` focus ring instead of the fused search header. (Published mid-stream; the calendar restyle and nav-padding fix that were staged alongside landed in TC29.)

### Changed

- **`ty-select` popup search**: the fused search header is now a detached bordered field inside the panel — its own rounded border and `ty-input`-style focus ring, whitespace instead of a divider line, magnifier inside the field.
- Groundwork for generated per-flavor button CSS (completed in TC29).

## [1.0.0-TC27] - 2026-07-10

Headline: **`ty-dropdown` and `ty-multiselect` removed** (deprecated in TC26) — the bundle drops ~18%, and `ty-select` gets the visual polish pass: a real check icon on selected options and card-style list rows.

### Removed

- **`ty-dropdown` and `ty-multiselect`**: components, `tyrell-components/dropdown` + `/multiselect` subpath exports, React wrappers (`TyDropdown`, `TyMultiselect` and aliases), ClojureScript `tyrell.react` defs, docs pages, and tests. Migration guide lives on the select docs page (`ty-select` = single by default, `multiple` for multi, chips out-of-band via `ty-selected-tags`). Minified CDN bundle: 74 kB gzip.

### Changed — ty-select popup

- **Selection tick is now the lucide `check` icon** rendered inside `ty-option` (right-aligned, primary color) — replaces the text-glyph "✓" overlay ty-select stamped on selected options. Hidden on the clone displayed in the trigger field. Works everywhere `ty-option` renders.
- **Card-style option list**: rows are inset from the panel edges with rounded corners; hover and keyboard highlight use the neutral surface (`--ty-bg-neutral-soft`) instead of primary — selection stays expressed by the check + bolder text, not a background slab.

### Fixed

- **`ty-tabs` marker no longer glides in from the top-left corner** on first display. The active-tab marker's position transition also ran on its very first positioning — and on the first re-measure after rendering hidden (modals, drawers, toggled panels), where it had been "positioned" at 0,0 with zero-size rects. The marker now snaps (no animation) when it was never positioned or currently has zero rendered size; tab-to-tab switching still animates.

## [1.0.0-TC26] - 2026-07-09

Headline: **`ty-select` — the select control that replaces `ty-dropdown` and `ty-multiselect`.** Single select by default with a form-field look matching `ty-input`; one attribute each for multi-select and the compact toolbar skin; rich options display intact in the field. Both legacy components are deprecated (kept for compatibility, no new features) — all site demos and framework guides migrated.

### Added — ty-select

- **`multiple`** — native `<select multiple>` semantics. Absent = single select: scalar `value`, picking replaces the selection and closes the popup, one FormData entry. Present = toggle selection, popup stays open, repeated `name=` entries (HTMX-ready).
- **`compact`** — content-hugging trigger for toolbars/filter bars instead of the default full-width field. Single shows the selected label; multiple shows placeholder + count badge.
- **`searchable`** — popup search row on demand: `auto` (default) shows it only for 8+ options — short lists open as pure option menus; `searchable`/`"true"` always, `"false"` never; `external-search` always (the input is its mechanism). Magnifier icon in the search row.
- **Rich selected display (single)** — the selected option is cloned into the trigger (`slot="selected"` + `cloned`, same mechanism as ty-dropdown), so rich HTML options (icons, prices, flags) display intact.
- **`label` attribute on `ty-option`** — native `<option label>` semantics: clean display text for multi-select field summaries and `ty-selected-tags` chips when option content is rich HTML. Honored by ty-select display, `change` `items`, and chip templates.
- **`start` / `end` slots** — field adornments (icons, badges), same convention as ty-input; `end` sits before the chevron. Works in the compact skin.
- **`change` detail `value`** — scalar for single select, array for multiple; `values` always the array form.
- **Subpath exports** — `tyrell-components/select` and `tyrell-components/selected-tags`.
- **React wrappers** — `TySelect` + `TySelectedTags` (typed props, array value coercion, React-18 property bridge); `TyOption` gains typed `label` and `flavor` props.

### Added — ty-input password reveal

- `type="password"` renders a built-in eye / eye-off toggle after the end slot. Toggles the native input's type only — component `type`, form value, and API unchanged. `aria-pressed`/`aria-label` swap; focus stays in the field.

### Added — ty-checkbox

- **Redesigned as a single tick** — full flavor color when checked, faint when unchecked, dash + mid-opacity when `indeterminate` (new attribute, native semantics: visual/ARIA only, clicking resolves to checked), grayscale when disabled.

### Added — calendar bounds

- **`min` / `max`** (ISO dates) on `ty-calendar`, `ty-calendar-month`, `ty-calendar-navigation`, and `ty-date-picker` (incl. the native mobile input). Out-of-bounds days are disabled and don't emit; navigation clamps — year jumps land ON the bound month. Out-of-bounds programmatic selections set `rangeUnderflow`/`rangeOverflow` constraint validity. Set cross-wise on two calendars for period pickers.

### Fixed

- **Label-click delegation** for `ty-checkbox`, `ty-switch`, and `ty-radio`: the click handler now lives on the host, so the documented `<label><ty-checkbox></ty-checkbox> text</label>` pattern actually toggles/selects. Previously label-text clicks did nothing (the synthetic click never reached the shadow-internal listener).
- **Reconnect death**: checkbox/switch/radio moved in the DOM lost their listeners permanently; they re-arm on reconnect.
- **Parse-order init bugs** (plain-HTML/SSR pages): `ty-radio-group` initial `value` now marks the matching radio (children announce on connect); `ty-selected-tags` `<template>` chips now stamp when the template is parsed after the element connects, and initial picker values render as chips (observes the picker's `selected` attributes).
- **ty-select popup positioning** with hundreds of options: the height estimate used the uncapped content height and blindly flipped the popup above the field (clipping off-screen); now capped, and when neither side fits it takes the side with more room.
- **ty-select loading panel** styling: continues the fused one-panel silhouette instead of floating as a detached card with a see-through gap.
- **`ty-calendar` standalone import**: side-effect imports register its child elements (type-only imports left `ty-calendar-navigation`/`ty-calendar-month` undefined for `tyrell-components/calendar` consumers).

### Changed

- **Monochrome surfaces by default** — `tyrell-brand.css` surfaces no longer tint toward brand; new `--ty-surface-chroma` knob (default `0`) restores the warmth if wanted. Default `--ty-brand-chroma` lowered `0.2` → `0.12`.
- **Softer input borders** — `--ty-input-border`/`-hover` one step fainter in both the base and brand layers.
- Aliases: `ty-modal` also registered as **`ty-dialog`**, `ty-copy` as **`ty-copy-field`** (same class; React exports `TyDialog`/`TyCopyField`).

## [1.0.0-RC10] - 2026-06-02

Headline: **OKLCH brand layer**. Drop `tyrell-brand.css` in next to `tyrell.css`, set 1–2 CSS variables, and the entire library rebrands coherently in light and dark mode. The 186 hexes in `tyrell.css` stay untouched — the new layer overrides them via the cascade. Companion site demo at `/docs/theming` lets you drag sliders and copy a ready-to-paste `:root` snippet.

### Added — Brand layer (`packages/core/css/tyrell-brand.css`)

A single opt-in CSS file. Load AFTER `tyrell.css`. Five-tier customisation surface:

1. **Seeds** — `--ty-brand-hue`, `--ty-brand-chroma`. The two primary knobs. Drive primary, secondary, neutral, surfaces, inputs, solid-button fills, focus rings.
2. **Per-flavor hue anchors** — `--ty-success-hue` (default 145°), `--ty-warning-hue` (75°), `--ty-danger-hue` (25°). Semantic colors stay green/orange/red across brand changes by default; override to retint.
3. **L-curve** — five variables (`--ty-l-strong / -bold / -base / -soft / -faint`) plus three bg L-stops shape the emphasis ladder. `:root` is tuned for light mode; `html.dark` redefines with inverted values.
4. **Saturation curve** — five per-shade chroma multipliers (`--ty-c-strong-mult / -bold-mult / -base-mult / -soft-mult / -faint-mult`) plus three bg multipliers reshape the per-shade saturation.
5. **Secondary rotation** — `--ty-secondary-offset` (default 60°) — secondary rotates from brand by this angle. Set to 30 for a close sibling, 120 for triadic, 180 for complement. Or detach entirely via explicit `--ty-secondary-hue`.

Every other flavor's chroma defaults to `calc(var(--ty-brand-chroma) * <ratio>)` (success ×1.08, warning ×1.15, danger ×1.31) so a single chroma slider scales every flavor's saturation proportionally while preserving the emphasis hierarchy. Pin any flavor with a literal `--ty-{flavor}-chroma: 0.14`.

### Added — Modal `beforeclose` event

- **Cancellable `beforeclose` event on `<ty-modal>`** — fires before the modal closes. Consumers can call `event.preventDefault()` to abort and render their own confirm UI for unsaved-state flows. Detail carries `reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'`.
- **`.hide({ force: true })`** on the modal's imperative API — bypasses the cancellable event. Use after your own confirm UI captures consent.
- **`onBeforeClose` React prop** on `<TyModal>` — same target-guarded pattern as `onOpen`/`onClose`.

### Added — Version banners

- `tyrell-components` and `tyrell-react` each log their loaded version once on first import: `[tyrell-components] v1.0.0-RC10`. Programmatic access via `window.tyVersion` / `window.tyReactVersion` and the new `VERSION` named export from each package.

### Changed (breaking) — `mild` → `bold` rename

The second-strongest emphasis token's internal name changed: `--ty-color-{flavor}-mild` is now `--ty-color-{flavor}-bold`. The word "mild" fought its position in the emphasis ladder (it was *more* emphatic than base, not less). The new ladder reads cleanly: `strong > bold > base > soft > faint`. Same applies to `--ty-bg-*` and related tokens. **The public `+`/`-` class suffixes are unchanged** — only the internal token names changed, so most consumers see no breakage.

### Removed (breaking) — `protected` attribute on `<ty-modal>`

The native `confirm()` fallback was inflexible and ugly. New consumers should listen for the cancellable `beforeclose` event (above) and render their own confirm UI.

```html
<!-- before -->
<ty-modal protected>…</ty-modal>

<!-- after — for the same native-confirm behavior -->
<ty-modal onbeforeclose="if (!confirm('Discard?')) event.preventDefault();">…</ty-modal>
```

### Removed (breaking) — `accent` flavor

`--ty-color-accent-*`, `--ty-bg-accent-*`, `--ty-border-accent-*` tokens and `.ty-text-accent` / `.ty-bg-accent` / etc. utility classes are gone. Accent was visually identical to primary after the brand-layer rewrite; the duplicate namespace added noise. Migrate to `primary` (29 site files migrated as part of this change).

### Fixed — Brand-coherence

Every component now follows the brand layer for color. Hardcoded `rgba`/hex values that previously ignored brand changes are routed through `var(--ty-color-…)` or `color-mix(in oklab, var(--ty-color-…), transparent)`:

- **Focus rings** on `<ty-input>` (6 sites) and `<ty-date-picker>` (5 sites) — previously hardcoded to the original Tyrell blue/violet/green/red/amber rgbas. Now `color-mix(var(--ty-color-{flavor}) 10%, transparent)` in light mode, 15% in dark.
- **`--ty-input-shadow-focus`** — was hardcoded `rgba(59, 130, 246, 0.1)`. Now routes through `color-mix(var(--ty-color-primary), transparent)`.
- **`<ty-tooltip>`** default flavor — was `#1f2937` literal. Now `var(--ty-color-neutral-strong)` so tooltips invert cleanly with theme.
- **Custom scrollbar** thumb/track — was `rgba(0,0,0,…)`. Now `color-mix(var(--ty-color-neutral-bold), transparent)` at varying opacity per state.
- **`<ty-scroll-container>` edge shadows** — same treatment.
- **`<ty-date-picker>` surface shadow** — routes to `var(--ty-shadow-lg)`.
- **Solid neutral button** was a washy mid-grey at L_base. Now routes to `--ty-color-neutral-strong` (light) / `--ty-color-neutral-faint` (dark) — a dark-grey "default action" button in both modes.

### Fixed — Modal & popup event leaks

- **Core modal `dialog.onclose` guarded** with `event.target === dialog`. Child popups (`<ty-dropdown>`, `<ty-multiselect>`, `<ty-date-picker>`) dispatch their own bubbling `close` events; without the guard, the modal's internal `<dialog>` element treated those as its own close signal and closed the parent modal whenever a child popup inside it closed.
- **React wrapper event-bubble leak.** `TyModal` / `TyPopup` / `TyDatePicker` listeners for `open`/`close` fired on bubbled events from child popups (e.g., a `<TyDropdown>` inside a modal closing would trigger the modal's `onClose`, causing the modal to actually close). All three wrappers now guard with `event.target === element`. Companion fix to the core-layer guard above.

### Fixed — Dark mode brand layer

`tyrell-brand.css` `html.dark` block now explicitly re-declares the color/bg/border tokens it computes from the L-curve. Previously `tyrell.css`'s `html.dark` definitions out-ranked `:root` brand-layer definitions on selector specificity (0,1,1 vs 0,1,0), so the brand-hue slider did nothing in dark mode.

### Fixed — Ghost token references

- `tooltip.ts` referenced `--ty-color-info` (no `info` flavor exists in Tyrell) — the info-flavor variant was removed entirely.
- `tag.ts` referenced `--ty-border-mildstrong` (a typo for a token that never existed) — replaced with `--ty-border`.

### Fixed — React boolean props (controlled-state workflow)

All 24 React wrappers migrated to a shared `useBooleanProperty` helper that fixes two long-standing bugs in how boolean props are bridged to the underlying custom element:

1. **`"false"` was treated as truthy.** Passing `disabled="false"` / `open="false"` (or any non-empty string) was coerced to `true`. The helper now correctly maps `"false"` and `"0"` to `false`.
2. **`true → false` flips didn't propagate on React 18.** React 18 removes the attribute when a boolean prop flips to `false`, but custom-element JS-property state can lag behind. The helper imperatively syncs the JS property in `useEffect` so the element actually reflects the new value.

Net effect: **controlled state via props now works correctly across the board.** The biggest practical consequence is the modal/popup workflow:

```tsx
// This pattern was unreliable before — modal could refuse to close.
const [open, setOpen] = useState(false);
<TyModal open={open} onClose={() => setOpen(false)}>…</TyModal>
<button onClick={() => setOpen(true)}>Open</button>
<button onClick={() => setOpen(false)}>Close</button>
```

Parent state owns `open`. Flip it `false` and the modal closes. Same applies to `<TyPopup open>`, `<TyDatePicker open>`, and every other wrapper with boolean props (`disabled`, `required`, `clearable`, `loading`, `readonly`, `multiline`, `spin`, `pulse`, and modal close-on-* flags).

For modals that need a confirm-before-close gate, combine this with the new `onBeforeClose` prop and `.hide({force: true})` imperative escape hatch (see "Added — Modal beforeclose event" above).

### Internal — Wizard CSS

Per-component CSS variable count dropped from 43 to 20; hardcoded literals from 11 to 4 (the four remaining are pure geometry — header padding, progress height, circle size, border width). Removed per-state `-bg` / `-color` indirection; step circles read accent variables directly. Routed radius / shadow / transitions through global scale tokens (`--ty-radius-lg`, `--ty-shadow-md`, `--ty-transition-duration`). Replaced legacy `--ty-text-*` references with brand-coherent `--ty-color-neutral-*` so wizard labels retint with brand. `color-mix` switched from `in srgb` to `in oklab`.

### Internal — Site polish

- Surface-demo borders softened: outer `ty-canvas` no longer has a border (it's the page surface, not a card); inner `ty-content` uses `ty-border-soft` instead of `ty-border`. Hierarchy reads from surface tones, not heavy lines.
- Site header and right-sidebar (TOC) borders moved from `ty-border-strong` / `ty-border` to `ty-border-soft`.
- CSS Guide architecture section refreshed to reflect 180+ tokens, 6 flavors × 5 emphasis levels (was "7 colors × 5 variants"), and the brand-layer story.
- New interactive Theming playground at `/docs/theming` — drag sliders, watch every component on the page retint live, copy a paste-ready `:root` snippet.

---

## [1.0.0-RC9] - 2026-05-13

### Wizard CSS variable system

`ty-wizard` now exposes a complete `--ty-wizard-*` token family for theming without touching Shadow DOM internals.

**Accent aliases** — one variable per state, each falling back to a semantic Tyrell color:

```css
--ty-wizard-active-accent:    var(--ty-color-primary)
--ty-wizard-completed-accent: var(--ty-color-success)
--ty-wizard-error-accent:     var(--ty-color-danger)
--ty-wizard-pending-accent:   var(--ty-color-neutral)
```

Flip all "active" chrome to your brand color with a single variable:
```css
ty-wizard { --ty-wizard-active-accent: #6366f1; }
```

**Fine-grained tokens** — per-state circle colors, border, text, glow shadows, and layout:

```css
/* Container */
--ty-wizard-bg, --ty-wizard-border, --ty-wizard-radius, --ty-wizard-shadow

/* Per state: completed / active / pending / error */
--ty-wizard-completed-bg, --ty-wizard-completed-border, --ty-wizard-completed-text
--ty-wizard-completed-glow  /* color-mix(…accent 10%, transparent) */
/* …active, pending, error follow the same pattern */

/* Progress line */
--ty-wizard-line-bg, --ty-wizard-line-completed-bg

/* Indicators bar */
--ty-wizard-indicators-bg, --ty-wizard-indicators-border

/* Step labels */
--ty-wizard-label-active, --ty-wizard-label-completed
--ty-wizard-label-pending, --ty-wizard-label-error

/* Transitions */
--ty-wizard-transition-duration, --ty-wizard-transition-easing
```

Width and height are set by the `width`/`height` attributes — they are not public theming tokens.

---

### Dropdown & Multiselect — loading state

`ty-dropdown` and `ty-multiselect` now show a loading overlay while an async search is in flight. Set `loading` (boolean attribute) to activate.

**Default slot fallback:** a spinner + "Searching…" label, matching the options popup visually (same background, border, radius, shadow).

**Custom content:** override via `slot="loading"`:
```html
<ty-dropdown loading>
  <span slot="loading">Fetching results…</span>
  …
</ty-dropdown>
```

**CSS variables** for the loading overlay:
```css
--ty-loader-bg, --ty-loader-border, --ty-loader-radius, --ty-loader-shadow
```

---

### Dropdown — external-search selection recovery

`ty-dropdown` now attaches a `MutationObserver` to its light-DOM children. When a consumer replaces `ty-option` children (the standard external-search refresh pattern), the component re-establishes the visual selection for the current value automatically — no extra code required. The observer is torn down on disconnect.

---

### Mobile fixes

- `ty-dropdown` — fixed fullscreen mobile mode layout regressions
- `ty-multiselect` — fixed tag rendering and selection management in mobile fullscreen mode

---

## [1.0.0-RC6] - 2026-05-05

### Version scheme

NPM packages (`tyrell-components`, `tyrell-react`) move from the `TC*` to the `RC*` scheme to align with the Clojars release cadence. RC6 is the first coordinated cross-registry release; older `TC7`–`TC11` versions remain on NPM but are superseded.

### React 18 prop-to-property bridging

`tyrell-react` wrappers now use a single `needsPropertyBridge` helper (`packages/react/src/utils/react-version.ts`) to gate the imperative property-sync `useEffect` that exists to work around React 18's unreliable prop-to-property bridging on custom elements. On React 19+ the gate short-circuits and React's native bridging takes over; the workaround stays active on React 18 with no behavior change.

The same gating was applied to seven affected wrappers: `TyDropdown`, `TyInput`, `TyTextarea`, `TyDatePicker`, `TyMultiselect`, `TyCheckbox`, `TyCalendar`.

**Bug fix:** `TySwitch` and `TyRadio` previously had no property bridging at all, so flipping `checked={true}` → `checked={false}` could leave the visual state stuck under React 18. They now mirror the `TyCheckbox` pattern (gated on `needsPropertyBridge`).

## [1.0.0-TC8] - 2026-05-04

### `ty-icon` slot mode

`ty-icon` now accepts an SVG (or any element) as a light-DOM child. When children are present, the registry/`name=` fallback is hidden automatically — the slotted content renders instead. The size scale, animations (`spin`/`pulse`/`tempo`), and `::slotted(ty-icon)` sizing contract used by `ty-button`/`ty-input`/`ty-dropdown`/`ty-date-picker`/`ty-tag` slots all keep working unchanged because they target the `<ty-icon>` host element.

This is the recommended pattern for server-rendered HTML stacks (HTMX, Datastar, Flask, Django, Rails, Phoenix, PHP) that already produce inline SVG via template partials. No client-side icon registration, no fetch, no FOUC, no CORS:

```html
<ty-icon size="lg">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
</ty-icon>

<ty-button size="lg" flavor="primary">
  <ty-icon slot="start">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
  </ty-icon>
  Save
</ty-button>

<ty-icon spin>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>
</ty-icon>
```

Existing `name=` registry usage is unchanged. When both are provided (slotted SVG and `name=`), the slotted SVG wins per standard slot semantics.

---

## [1.0.0-TC6] - 2026-05-01

### 💥 Breaking Changes

#### `delay` attribute renamed to `debounce`

The `delay` attribute on input-style components has been renamed to `debounce` to align with industry-standard terminology (lodash, RxJS, Material UI, etc.) and to clearly distinguish it from single-shot hover delays.

Affected components:
- `ty-input` — `delay` → `debounce`
- `ty-dropdown` — `delay` → `debounce`
- `ty-multiselect` — `delay` → `debounce`

React props renamed accordingly (`TyInput`, `TyDropdown`, `TyMultiselect`).

**Not affected:**
- `ty-tooltip` — keeps its `delay` attribute (semantically a single-shot show-delay, not a debounce of rapid events)
- `ty-resize-observer` — already used `debounce`

**Migration:**

```html
<!-- Before -->
<ty-input delay="300" placeholder="Search..."></ty-input>
<ty-dropdown delay="500" not-searchable></ty-dropdown>
<ty-multiselect delay="150" external-search></ty-multiselect>

<!-- After -->
<ty-input debounce="300" placeholder="Search..."></ty-input>
<ty-dropdown debounce="500" not-searchable></ty-dropdown>
<ty-multiselect debounce="150" external-search></ty-multiselect>
```

```tsx
// React — before
<TyInput delay={300} />
<TyDropdown delay={500} notSearchable />
<TyMultiselect delay={150} externalSearch />

// React — after
<TyInput debounce={300} />
<TyDropdown debounce={500} notSearchable />
<TyMultiselect debounce={150} externalSearch />
```

---

## [1.0.0-RC4] - 2026-03-25

### New Components

4 new web components added (19 → 23 total):

- **`ty-wizard`** + **`ty-step`** — Multi-step stepper with progress line, step indicators, completion tracking, and horizontal/vertical orientation. Carousel-based navigation between steps.
- **`ty-scroll-container`** — Scroll wrapper with edge shadow indicators showing there's more content above/below. Custom scrollbar styling, configurable max-height, horizontal overflow support.
- **`ty-resize-observer`** — Self-observing utility element that tracks its own dimensions in a global registry (`window.tyResizeObserver`). Used by `tyrell.layout` for container-aware responsive layouts.

All 4 components include React wrappers in `tyrell-react`.

### Mobile Enhancements

- **Calendar** — Fullscreen mobile calendar with touch-optimized scrolling, merged from `feature/mobile-calendar` branch
- **Dropdown** — Mobile fullscreen mode with improved touch interactions
- **Multiselect** — Mobile fullscreen mode matching dropdown behavior
- **Numeric inputs** — Mobile support for currency, percent, and compact input types
- **Buttons** — `wide` attribute for full-width mobile-friendly buttons, responsive size guidelines

### Documentation Overhaul

Complete restructuring of all documentation into `guides/` folder.

#### Added
- **`guides/clj/ROUTING_GUIDE.md`** - Standalone tyrell.router guide (extracted from Replicant guide)
  - Full API: `link`, `navigate!`, `rendered?`, `init!`, query params
  - Authorization with roles/permissions, automatic landing redirects
  - Framework-agnostic — works with any ClojureScript library
- **`guides/clj/I18N_GUIDE.md`** - Internationalization guide for tyrell.i18n
  - Keyword-based and string-based translations
  - Number formatting (currency, percent, compact) via Intl.NumberFormat
  - Date/time formatting (presets, relative time) via Intl.DateTimeFormat
  - Async loading from URLs (EDN/JSON), Locale protocol
- **`guides/clj/LAYOUT_GUIDE.md`** - Responsive layout guide for tyrell.layout
  - Container-aware breakpoints (vs CSS media queries)
  - `with-window`, `with-container`, `with-resize-observer` macros
  - Breakpoint queries, responsive values, grid helpers, aspect ratio
- **`guides/DATASTAR_TY_GUIDE.md`** - Datastar + Tyrell guide (moved from root)

#### Changed
- **All guides moved to `guides/`** with subdirectories:
  - `guides/` — general (TY_GUIDE, CSS_GUIDE, DATASTAR_TY_GUIDE)
  - `guides/js/` — JavaScript/React (REACT_TY_GUIDE)
  - `guides/clj/` — ClojureScript (REPLICANT_TY, ROUTING, I18N, LAYOUT, COMPONENT, CODE_SPLITTING)
- **CSS_GUIDE.md** rewritten — pure class reference, surfaces vs backgrounds distinction, dark mode toggle examples, color customization with `:root.dark`
- **REPLICANT_TY_GUIDE.md** rewritten
  - Removed: state management, folder structure, philosophy sections, routing (moved to own guide), performance tips, testing patterns
  - Added: `^js` type hints on all event handlers, event detail table for every component, per-component event examples, slot examples (start/end)
- **REACT_TY_GUIDE.md** cleaned — removed philosophy sections, added slot examples
- **DATASTAR_TY_GUIDE.md** cleaned — removed philosophy sections, added slot examples
- **TY_GUIDE.md** cleaned — removed "Rules" philosophy framing, kept component reference
- **CLAUDE.md** updated with grouped guide references

#### Removed
- **`packages/cljs/CLJS_GUIDE.cljs`** (2223 lines) — superseded by individual guides in `guides/clj/`
- State management sections from all guides
- Folder structure sections from all guides
- "Golden Rule" / philosophy sections from all guides
- Performance tips, testing patterns, common pitfalls sections

### Fixed

- **`ensureStyles` duplicate stylesheet accumulation** — `ensureStyles()` appended a stylesheet reference on every call, even if already adopted. Components calling it from `render()` (tabs, calendar, dropdown, wizard, modal, etc.) accumulated duplicate `adoptedStyleSheets` on every property change. Added `includes()` guard to prevent duplicates.

---

## [0.3.1] - 2026-02-XX

### ✨ Added

#### Documentation

- **COMPONENT_GUIDE.md** - Guide for building Web Components with `tyrell.shim`
  - Replicant, UIx, and Reagent integration examples
  - Shadow DOM styling with `defstyles` macro
  - Form participation patterns
  - Properties vs Attributes handling
  - Hot reload support for development

- **CODE_SPLITTING.md** - Guide for shadow-cljs code splitting
  - Module configuration for lazy loading
  - Lazy component wrapper patterns
  - Preloading strategies
  - Bundle analysis tips

#### ClojureScript Package

- **`tyrell.context` namespace** - Restored for calendar component locale support
  - `*locale*` dynamic var for locale binding

### Changed

#### README Improvements

- **Landing README** completely rewritten
  - ClojureScript-focused with UIx and Replicant examples
  - Accurate `tyrell.router` API documentation (using `link`, `navigate!`, `rendered?`)
  - Accurate `tyrell.i18n` examples with `tyrell.i18n.number` and `tyrell.i18n.time` namespaces
  - Added "Build Your Own Components" section showcasing `tyrell.shim`
  - Added prominent link to live demo at https://gersak.github.io/tyrell
  - Removed "Work in Progress" messaging
  - Added links to Vanilla JS and React guides at top

- **packages/cljs/README.md** updated
  - Added component building examples with `tyrell.shim`
  - Updated event handling syntax to use `(.. % -detail -value)`

### Fixed

#### cljdoc Analysis

- **Fixed cljdoc-analyzer failure** - `tyrell.components.core` namespace not found
  - Moved `ty/core.cljs` from `src/ty/` to `components/ty/`
  - This file required component namespaces not included in library JAR

- **Fixed deps.edn paths**
  - Corrected `:ty-lib` alias path from `"src/clj"` to `"src"`
  - Added `"components"` to `:dev` alias extra-paths

- **Added missing dependency**
  - Added `dev.gersak/timing {:mvn/version "0.7.0"}` to `:dev` alias

---

## [0.2.0] - 2024-01-XX

### 🎉 Major Release - TypeScript Migration Complete

This is a **major milestone release** that represents a complete rewrite of the Tyrell component library in TypeScript while maintaining the powerful ClojureScript infrastructure for advanced features.

---

## ✨ Added

### TypeScript Components (NEW!)

- **Complete TypeScript port** of all 19 web components to `packages/core/src/components/`
  - `button.ts` - Button component with flavor and size variants
  - `calendar.ts` - Full calendar orchestration with year/month/day navigation
  - `calendar-month.ts` - Month view component with custom day rendering
  - `calendar-navigation.ts` - Calendar navigation controls
  - `checkbox.ts` - Checkbox form control
  - `copy.ts` - Copy-to-clipboard component
  - `date-picker.ts` - Date picker with calendar integration
  - `dropdown.ts` - Desktop and mobile dropdown with search
  - `icon.ts` - Icon component with registry support
  - `input.ts` - Text input with formatting and validation
  - `modal.ts` - Modal dialog with backdrop and focus trapping
  - `multiselect.ts` - Multi-selection dropdown with tags
  - `option.ts` - Option component for dropdowns
  - `popup.ts` - Popup positioning component
  - `tab.ts` - Individual tab component (NEW in this release!)
  - `tabs.ts` - Tab container component (NEW in this release!)
  - `tag.ts` - Tag/badge component for multiselect
  - `textarea.ts` - Multi-line text input
  - `tooltip.ts` - Tooltip component

### TyComponent Base Class Architecture

- **New `TyComponent` base class** (`packages/core/src/base/ty-component.ts`)
  - Unified property/attribute lifecycle management
  - Declarative property configuration
  - Automatic type coercion (string, boolean, number, object, array)
  - Property validation and custom coercion functions
  - Property aliases support (e.g., `not-searchable`, `not-clearable`)
  - Smart rendering - only triggers when visual properties change
  - Built-in ElementInternals support for form association
  - Framework compatibility (React, Vue, Reagent property capture)

- **PropertyManager** utility (`packages/core/src/utils/property-manager.ts`)
  - Centralized property storage and lifecycle
  - Type-safe property access
  - Change tracking and validation
  - Event emission for property changes

### Icon Registry System

- **Icon registry** (`packages/core/src/utils/icon-registry.ts`)
  - Centralized icon storage with Map-based architecture
  - Support for custom SVG icon registration
  - Tree-shakeable icon imports
  - Global `window.ty` API for easy integration
  - Icon watcher system for dynamic updates

- **window.ty API** for script tag usage:
  ```javascript
  window.tyrell.icons.register({ iconName: '<svg>...</svg>' })
  window.tyrell.icons.get('iconName')
  window.tyrell.icons.has('iconName')
  window.tyrell.icons.list()
  window.tyrell.version // '0.2.0'
  ```

### Build System & Tooling

- **Vite configuration** improvements
  - `vite.config.ts` - Main build configuration
  - `vite.config.dev.ts` - Development server (port 3000)
  - `vite.config.cdn.ts` - CDN build optimization
  - HMR (Hot Module Reload) for development
  - Source maps for debugging
  - Terser minification for production

### Documentation & Examples

- **Updated React example** (`examples/react-nextjs/`)
  - Icon registration pattern with new icon system
  - TypeScript integration examples
  - Dashboard example page

- **New icons example page** showing icon registration patterns

- **Updated Reagent example** (`examples/reagent/`)
  - Integration with TypeScript components
  - ClojureScript wrapper usage patterns

- **Updated HTMX-Flask example** with new icon loading

### ClojureScript Components Package

- **New `packages/cljs/` structure** with organized component wrappers
  - Separated ClojureScript wrappers from TypeScript implementation
  - Build configuration for ClojureScript package
  - Component-specific styling organization

---

## 🔄 Changed

### Architecture Changes

- **Migrated from ClojureScript to TypeScript** for all UI components
  - Maintained ClojureScript infrastructure for routing, i18n, and site
  - Components now in `packages/core/src/` instead of `lib/ty/components/`
  - TypeScript provides better type safety and broader ecosystem compatibility

- **Dropdown component** major improvements
  - Implemented on top of TyComponent base class
  - Better separation of desktop and mobile implementations
  - Improved search functionality
  - Enhanced keyboard navigation
  - Better styling and visual feedback

- **Multiselect component** refactored
  - Adjusted to TyComponent implementation
  - Improved tag rendering and management
  - Better mobile experience
  - Enhanced clear functionality

- **Calendar component** enhancements
  - Better state management
  - Improved locale support (130+ languages)
  - Enhanced navigation controls
  - Better date formatting

### Mobile Experience

- **Improved mobile implementations** across components
  - Better dropdown mobile menu UX
  - Modal improvements for mobile viewports
  - Touch-friendly interactions
  - Responsive layout adjustments

### Styling System

- **Dropdown styling** improvements
  - Better visual hierarchy
  - Improved focus states
  - Enhanced hover effects
  - Consistent with design system

- **Tabs component styling** (`TABS_STYLING.md` documentation)
  - Comprehensive styling guide for tabs
  - CSS customization patterns

### Documentation Site

- **Site package updates** for compatibility with TypeScript components
  - Fixed integration issues
  - Updated component demos
  - Improved code examples
  - Better documentation structure

### Build & Distribution

- **NPM package structure** optimized
  - Better tree-shaking support
  - Smaller bundle sizes
  - Clearer entry points
  - Improved TypeScript definitions

---

## 🐛 Fixed

- **Highlight rendering** in dropdown components
- **Replicant integration** issues with site
- **Icon loading errors** in various contexts
- **Mobile menu** display issues in dropdown
- **Only odd tabs rendering** bug (weird edge case!)
- **Form integration** improvements for all form components
- **Keyboard navigation** edge cases in dropdowns
- **Focus management** in modal and popup components
- **Clear button** functionality in searchable dropdowns

---

## 💥 Breaking Changes

### Import Paths Changed

**Before (v0.1.x - ClojureScript)**:
```clojure
(ns my-app
  (:require [tyrell.components.button :as button]))
```

**After (v0.2.0 - TypeScript)**:
```typescript
import { TyButton } from 'tyrell-components'
// or
import 'tyrell-components/css/tyrell.css'
```

### Icon System Changed

**Before**: Icons were built-in and automatically available

**After**: Icons must be registered explicitly:
```typescript
import { check, heart } from 'tyrell-components/icons/lucide'
import { registerIcons } from 'tyrell-components/icons/registry'

registerIcons({ check, heart })
```

**OR** using the global API:
```html
<script>
  window.tyrell.icons.register({
    'check': '<svg>...</svg>',
    'heart': '<svg>...</svg>'
  })
</script>
```

### Component Property Changes

Some components now use **TyComponent base class** with unified property handling:
- Properties now have declarative configuration
- Validation and coercion are automatic
- Attribute aliases (e.g., `not-searchable`) are supported
- Form association is built-in for form controls

### Package Structure

- TypeScript components moved to `packages/core/`
- ClojureScript wrappers moved to `packages/cljs/`
- Root `package.json` removed (monorepo structure)

---

## 📚 Documentation Added

- **`BUILDING_WITH_TYCOMPONENT.md`** - Comprehensive guide for building components with TyComponent base class
- **`CSS_GUIDE.md`** - Tyrell CSS system usage guide (Tyrell for colors, Tailwind for everything else)
- **`TYPESCRIPT_DEV_GUIDE.md`** - Development workflow for TypeScript components
- **`PROJECT_SUMMARY.md`** - Updated with TypeScript architecture details
- **`packages/cljs/README.md`** - ClojureScript package documentation
- **`packages/cljs/components/ty/components/TABS_STYLING.md`** - Tabs styling guide

---

## 🚀 Migration Guide

### For ClojureScript Projects

If you were using v0.1.x ClojureScript components:

1. **Install the new package**:
   ```clojure
   ;; deps.edn
   {:deps {dev.gersak/tyrell {:mvn/version "0.2.0"}}}
   ```

2. **Components still work** via ClojureScript wrappers in `packages/cljs/`
3. **Icon registration** now required (see Icon System changes above)

### For New TypeScript Projects

1. **Install via NPM**:
   ```bash
   npm install tyrell-components
   ```

2. **Import components**:
   ```typescript
   import 'tyrell-components/css/tyrell.css'
   import { TyButton, TyDropdown } from 'tyrell-components'
   ```

3. **Register icons** you need:
   ```typescript
   import { check, heart } from 'tyrell-components/icons/lucide'
   import { registerIcons } from 'tyrell-components/icons/registry'
   
   registerIcons({ check, heart })
   ```

### For React Projects

See updated example in `examples/react-nextjs/`:
- Use components directly as custom elements
- Register icons at app startup
- TypeScript definitions included for full type safety

### For Vanilla JS / HTMX

Use the global `window.ty` API:
```html
<script src="https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js"></script>
<script>
  window.tyrell.icons.register({ /* your icons */ })
</script>
```

---

## 🎯 Version 0.2.0 Goals Achieved

✅ **Complete TypeScript migration** - All 19 components ported
✅ **TyComponent architecture** - Unified, maintainable base class
✅ **Icon registry system** - Flexible, tree-shakeable, easy to use
✅ **Framework compatibility** - Works with React, Vue, Reagent, vanilla JS
✅ **Production ready** - Published to NPM as `tyrell-components`
✅ **Improved mobile UX** - Better dropdown and modal experiences
✅ **Comprehensive docs** - Guides for building, styling, and using components
✅ **Zero runtime dependencies** - Pure web standards

---

## 🔮 Future Plans (v0.3.0+)

- Additional components (data table, file upload, progress indicators)
- Enhanced a11y (accessibility) features
- More icon library integrations
- Performance optimizations
- Additional framework adapters
- Component testing utilities

---

## 📦 Package Information

- **NPM Package**: `tyrell-components` v1.0.0-rc.4
- **Clojars Package**: `dev.gersak/tyrell` v1.0.0-RC4
- **License**: MIT
- **TypeScript**: ✅ Full type definitions included
- **Framework Support**: React, Vue, Reagent, HTMX, Vanilla JS

---

## 🙏 Acknowledgments

This release represents a significant architectural evolution while maintaining backward compatibility through ClojureScript wrappers. Thank you to everyone who contributed feedback and tested the alpha versions!

---

**For detailed component documentation, visit the documentation site or check the README files in each package.**
