const accessorCache = new WeakMap<Function, string[]>()

/** Every settable accessor of the class chain, up to HTMLElement. */
function settableAccessors(ctor: Function): string[] {
  let names = accessorCache.get(ctor)
  if (!names) {
    const set = new Set<string>()
    for (let proto = ctor.prototype; proto && proto !== HTMLElement.prototype; proto = Object.getPrototypeOf(proto)) {
      for (const [name, d] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (d.set) set.add(name)
      }
    }
    names = [...set]
    accessorCache.set(ctor, names)
  }
  return names
}

/** Early values liftProperties() took off, waiting for upgradeProperties(). */
const lifted = new WeakMap<HTMLElement, [string, unknown][]>()

/** Read and delete the own values that shadow settable accessors. */
function takeOwn(el: HTMLElement): [string, unknown][] {
  const taken: [string, unknown][] = []
  for (const name of settableAccessors(el.constructor)) {
    if (!Object.prototype.hasOwnProperty.call(el, name)) continue
    taken.push([name, (el as any)[name]])
    delete (el as any)[name]
  }
  return taken
}

/**
 * For a component whose attributeChangedCallback assigns through its own
 * accessors: call it in the constructor. While an element upgrades, the
 * attribute callbacks run before connectedCallback and would overwrite the
 * early values (an own property takes the assignment); taken off here, they
 * reach the setters in upgradeProperties() instead, after the attributes.
 */
export function liftProperties(el: HTMLElement): void {
  const taken = takeOwn(el)
  if (taken.length) lifted.set(el, taken)
}

/**
 * Properties set before the element upgraded (a framework rendering it
 * before its definition loaded, a lazily defined element) are own data
 * properties that shadow the class accessors, so later assignments would
 * never reach a setter. Standard "upgrade property" pattern: read the own
 * value, delete it, assign it again through the accessor. Covers every
 * settable accessor on the prototype chain (value, checked, open, error,
 * minLength, …). TyComponent does this itself; a component extending
 * HTMLElement directly calls it at the start of connectedCallback.
 * A value its setter rejects is reported, not thrown: connectedCallback
 * goes on, as it would for an attribute with a bad value.
 */
export function upgradeProperties(el: HTMLElement): void {
  const early = [...(lifted.get(el) ?? []), ...takeOwn(el)]
  lifted.delete(el)
  for (const [name, value] of early) {
    if (value === undefined) continue
    try {
      ;(el as any)[name] = value
    } catch (e) {
      reportError(e)
    }
  }
}
