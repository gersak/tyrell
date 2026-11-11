# Tyrell plugin for Claude Code

Gets Claude to use Tyrell the intended way in every project that has it, with no per-project setup.

- **Session start** (and after `/clear` or compaction): finds Tyrell — the installed npm package (also what shadow-cljs installs for `dev.gersak/tyrell`), a `package.json` / `deps.edn` entry, or a `tyrell-components@<version>` CDN pin in the source — and puts the rules card for that version into context. Says so when a newer release exists, so Claude tells you instead of hand-rolling a component your version lacks.
- **End of each turn:** checks the UI files changed in that turn for hand-rolled controls (`.btn`, `.pill`, `.seg`, native `<button>`/`<select>`/`<dialog>`…), Tailwind and raw colors, removed API (`ty-dropdown`, the `info` flavor) and namespace icon imports, and hands what it finds back to Claude once. A line with `tyrell-ignore` on it is skipped.

## Install

```
/plugin marketplace add gersak/tyrell
/plugin install tyrell@tyrell
```

## Notes

- The card comes from the installed package's `AGENTS.md`. Without one (CDN pins, versions before the card shipped) it is fetched for your version from jsDelivr, then unpkg, else the newest published card, and cached in `~/.cache/tyrell-agents`. Only the package name and a version are sent. `TYRELL_AGENTS_OFFLINE=1` turns the network off.
- If your `CLAUDE.md` already imports `@node_modules/tyrell-components/AGENTS.md`, the card isn't added twice.
- In a project that deliberately doesn't use Tyrell components, disable the plugin there: `/plugin disable tyrell@tyrell`.
- Doesn't run in Tyrell's own repo: the card is for apps that use Tyrell.
