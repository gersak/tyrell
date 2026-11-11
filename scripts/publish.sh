#!/usr/bin/env bash
# publish.sh — publish TC (test candidate) or RC (release candidate)
#
# Usage:
#   ./scripts/publish.sh tc        # publish next TC, e.g. 1.0.0-tc.62
#   ./scripts/publish.sh rc        # publish next RC, e.g. 1.0.0-rc.21
#   ./scripts/publish.sh tc --dry  # show what would happen, publish nothing
#
# Versions are lowercase and dotted (1.0.0-rc.21) so semver compares the
# number numerically; the old 1.0.0-TC9 style sorted TC9 above TC61.
# Numbering continues from the highest published number in either style.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORE_DIR="$REPO_ROOT/packages/core"
REACT_DIR="$REPO_ROOT/packages/react"
CLJS_DIR="$REPO_ROOT/packages/cljs"

# ── args ──────────────────────────────────────────────────────────────────────

TYPE="${1:-}"
DRY=false
if [[ "${2:-}" == "--dry" ]]; then DRY=true; fi

if [[ "$TYPE" != "tc" && "$TYPE" != "rc" ]]; then
  echo "Usage: ./scripts/publish.sh <tc|rc> [--dry]"
  echo ""
  echo "  tc   Test Candidate  — tag: test  — docs: no"
  echo "  rc   Release Candidate — tag: next — docs: yes"
  exit 1
fi

TYPE_UPPER="${TYPE^^}"   # TC or RC
NPM_TAG="$( [[ "$TYPE" == "tc" ]] && echo "test" || echo "next" )"

# ── helpers ───────────────────────────────────────────────────────────────────

info()    { echo "  $*"; }
success() { echo "✅ $*"; }
warn()    { echo "⚠️  $*"; }
step()    { echo ""; echo "── $* ──────────────────────────────────────"; }
dry()     { echo "   [dry] $*"; }

# ── base version from core package.json ───────────────────────────────────────

BASE_VERSION=$(node -p "require('$CORE_DIR/package.json').version.split('-')[0]")
NPM_PACKAGE="tyrell-components"

step "Detecting next $TYPE_UPPER version"
info "Base version : $BASE_VERSION"
info "NPM package  : $NPM_PACKAGE"

# Query NPM for all published versions, find highest TC/RC number for this base
LAST_NUM=$(node -e "
const { execSync } = require('child_process');
try {
  const raw = execSync('npm view $NPM_PACKAGE versions --json 2>/dev/null').toString().trim();
  const versions = JSON.parse(raw);
  // 1.0.0-TC61 (old) and 1.0.0-tc.62 (new) both count
  const re = new RegExp('^' + '$BASE_VERSION'.replace(/\./g, '\\\\.') + '-$TYPE\\\\.?(\\\\d+)$', 'i');
  const nums = versions
    .map(v => (v.match(re) || [])[1])
    .filter(Boolean)
    .map(Number);
  console.log(nums.length > 0 ? Math.max(...nums) : 0);
} catch(e) {
  console.log(0);
}
")

NEXT_NUM=$(( LAST_NUM + 1 ))
NEW_VERSION="$BASE_VERSION-$TYPE.$NEXT_NUM"

if [[ "$LAST_NUM" -eq 0 ]]; then
  info "Last $TYPE_UPPER   : (none published)"
else
  info "Last $TYPE_UPPER   : number $LAST_NUM"
fi
info "New version  : $NEW_VERSION"
info "NPM tag      : $NPM_TAG"

if $DRY; then
  echo ""
  warn "Dry run — stopping here. Run without --dry to publish."
  exit 0
fi

echo ""
read -r -p "Publish $NEW_VERSION as $TYPE_UPPER? [y/N] " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# ── update versions ───────────────────────────────────────────────────────────

step "Updating versions to $NEW_VERSION"

# core package.json
node -e "
const fs = require('fs');
const path = '$CORE_DIR/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
"
success "packages/core/package.json"

# react package.json
node -e "
const fs = require('fs');
const path = '$REACT_DIR/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
"
success "packages/react/package.json"

# build.clj (both defs) and the jar's deps.cljs npm pin — shadow-cljs installs
# that exact tyrell-components (and its AGENTS.md) for ClojureScript users.
# Node instead of sed -i, which differs between GNU and BSD/macOS.
node -e "
const fs = require('fs');
const re = /\"\d+\.\d+\.\d+-[A-Za-z]+\.?\d+\"/g;
for (const f of ['$CLJS_DIR/build.clj', '$CLJS_DIR/resources/tyrell/deps.cljs']) {
  const src = fs.readFileSync(f, 'utf8');
  const old = (src.match(re) || [''])[0].replace(/\"/g, '');
  fs.writeFileSync(f, src.replace(re, '\"$NEW_VERSION\"'));
  console.log('  ' + f.replace('$REPO_ROOT/', '') + '  (' + old + ' → $NEW_VERSION)');
}
"
success "packages/cljs/build.clj + resources/tyrell/deps.cljs"

# ── publish tyrell-components (core) ─────────────────────────────────────────

step "Publishing tyrell-components@$NEW_VERSION (NPM tag: $NPM_TAG)"
cd "$CORE_DIR"
npm publish --access public --tag "$NPM_TAG"
success "tyrell-components@$NEW_VERSION published"

# ── publish tyrell-react ──────────────────────────────────────────────────────

step "Publishing tyrell-react@$NEW_VERSION (NPM tag: $NPM_TAG)"
cd "$REACT_DIR"
npm publish --access public --tag "$NPM_TAG"
success "tyrell-react@$NEW_VERSION published"

# ── deploy Clojars (if credentials available) ─────────────────────────────────

step "Clojars deployment"
if [[ -n "${CLOJARS_USERNAME:-}" && -n "${CLOJARS_PASSWORD:-}" ]]; then
  cd "$CLJS_DIR"
  clj -T:build deploy-all
  success "dev.gersak/tyrell and dev.gersak/tyrell-icons deployed"
else
  warn "CLOJARS_USERNAME / CLOJARS_PASSWORD not set — skipping Clojars"
  info "To deploy manually: cd packages/cljs && clj -T:build deploy-all"
fi

# ── build & commit docs (RC only) ────────────────────────────────────────────

if [[ "$TYPE" == "rc" ]]; then
  step "Building GitHub Pages docs"

  info "Waiting 90s for CDN propagation..."
  sleep 90

  cd "$CLJS_DIR"
  clj -T:build github-pages
  success "docs/ built"

  echo ""
  info "Docs are ready. Commit and push when satisfied:"
  info "  git add docs/ packages/core/package.json packages/react/package.json packages/cljs/build.clj"
  info "  git commit -m 'Release $NEW_VERSION'"
  info "  git push origin master"
else
  echo ""
  info "TC complete — no docs build (RC only)."
  info "Version files updated but not committed. Commit when ready:"
  info "  git add packages/core/package.json packages/react/package.json packages/cljs/build.clj"
  info "  git commit -m 'Bump to $NEW_VERSION'"
fi

echo ""
success "Done — $NEW_VERSION published as $TYPE_UPPER"
