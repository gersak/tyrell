#!/usr/bin/env bash
# publish.sh — publish TC (test candidate) or RC (release candidate)
#
# Usage:
#   ./scripts/publish.sh tc        # publish next TC, e.g. 1.0.0-TC4
#   ./scripts/publish.sh rc        # publish next RC, e.g. 1.0.0-RC8
#   ./scripts/publish.sh tc --dry  # show what would happen, publish nothing

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
  const prefix = '$BASE_VERSION-$TYPE_UPPER';
  const nums = versions
    .filter(v => v.startsWith(prefix))
    .map(v => parseInt(v.slice(prefix.length), 10))
    .filter(n => Number.isFinite(n));
  console.log(nums.length > 0 ? Math.max(...nums) : 0);
} catch(e) {
  console.log(0);
}
")

NEXT_NUM=$(( LAST_NUM + 1 ))
NEW_VERSION="$BASE_VERSION-$TYPE_UPPER$NEXT_NUM"

if [[ "$LAST_NUM" -eq 0 ]]; then
  info "Last $TYPE_UPPER   : (none published)"
else
  info "Last $TYPE_UPPER   : $BASE_VERSION-$TYPE_UPPER$LAST_NUM"
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

# build.clj — replace all occurrences of the old version string
OLD_VERSION=$(node -p "
const { execSync } = require('child_process');
const raw = execSync('npm view $NPM_PACKAGE versions --json 2>/dev/null').toString().trim();
const versions = JSON.parse(raw);
const prefix = '$BASE_VERSION-$TYPE_UPPER';
const nums = versions
  .filter(v => v.startsWith(prefix))
  .map(v => parseInt(v.slice(prefix.length), 10))
  .filter(n => Number.isFinite(n));
const last = nums.length > 0 ? Math.max(...nums) : null;
// Also check the current value in build.clj
const fs = require('fs');
const clj = fs.readFileSync('$CLJS_DIR/build.clj', 'utf8');
const m = clj.match(/\"\d+\.\d+\.\d+-[A-Z]+\d+\"/g);
console.log(m ? m[0].replace(/\"/g, '') : '');
")

sed -i "s/\"$OLD_VERSION\"/\"$NEW_VERSION\"/g" "$CLJS_DIR/build.clj"
success "packages/cljs/build.clj  ($OLD_VERSION → $NEW_VERSION)"

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
