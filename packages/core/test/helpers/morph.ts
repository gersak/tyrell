/**
 * Minimal stand-in for Datastar / idiomorph: attributes become exactly the new
 * node's; children are matched by id (else by tag), morphed recursively and
 * moved into order; unmatched old children go, new ones are inserted.
 */
export function morph(from: Element, markup: string): void {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  morphNode(from, tpl.content.firstElementChild!);
}

function sameNode(a: Node, b: Node): boolean {
  if (a.nodeType !== b.nodeType) return false;
  if (!(a instanceof Element) || !(b instanceof Element)) return true;
  return a.tagName === b.tagName && a.id === b.id;
}

function morphNode(from: Element, to: Element): void {
  for (const a of Array.from(from.attributes)) if (!to.hasAttribute(a.name)) from.removeAttribute(a.name);
  for (const a of Array.from(to.attributes)) if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);

  const pool = Array.from(from.childNodes);
  let cursor: ChildNode | null = from.firstChild;
  for (const next of Array.from(to.childNodes)) {
    const match = pool.find((n) => sameNode(n, next));
    if (!match) {
      from.insertBefore(document.importNode(next, true), cursor);
      continue;
    }
    pool.splice(pool.indexOf(match), 1);
    if (match === cursor) cursor = cursor.nextSibling;
    else from.insertBefore(match, cursor);
    if (match instanceof Element) morphNode(match, next as Element);
    else if (match.textContent !== next.textContent) match.textContent = next.textContent;
  }
  pool.forEach((n) => n.remove());
}
